/**
 * sht31_gps_cal_test.ino
 * Dedicated Bench & Field Calibration / Raw Diagnostics Suite
 * Target: LilyGO T-SIM7672G V1.1 (ESP32-S3-WROOM-1 MCN16R8)
 *
 * Interactive USB Serial Commands (115200 baud):
 *  - STATUS          : Print full instrumentation & psychrometric summary
 *  - CAL <T> <RH>    : Apply & save 1-point reference calibration (e.g. `CAL 24.50 67.2`)
 *  - RESETCAL        : Reset SHT31 NVS calibration to factory (slope=1.0, offset=0.0)
 *  - HEATER          : Run 1.5s SHT31 internal heater plausibility test
 *  - AGPS            : Trigger SIM767x Assisted-GPS ephemeris download
 *  - COLD / WARM     : Cold or Warm restart GNSS engine
 *  - AT+<cmd>        : Forward any raw AT command directly to SIM767x modem
 */

#include "../../../config.h"
#include "../../../sensors/imu_bmi160.h"
#include "../../../sensors/rtc_ds3231.h"
#include "../../../sensors/env_sht31.h"
#include "../../../sensors/temp_ds18b20.h"
#include "../../../sensors/power_ina22x.h"
#include "../../../sensors/sd_logger.h"
#include "../../../sensors/gps_sim7672.h"
#include "../../../sensors/power_18650.h"
#include "../../self_test.h"
#include "../../../calibration/calibration_manager.h"
#include "../../../local_dashboard/telemetry_sync.h"

static KartTelemetry state;
ImuBmi160          imu;
RtcDs3231          rtc;
EnvSht31           sht31;
TempDs18b20        ds18;
PowerIna22x        ina48v;
SdLogger           sdCard;
GpsSim7672         gpsModem;
Power18650         battery;
SelfTestEngine     selfTest;
CalibrationManager calMgr;
TelemetrySync      netSync;

static unsigned long lastPollMs = 0;
static unsigned long lastGpsMs  = 0;

void printSerialReport() {
    const Sht31Calibration &c = sht31.getCalibration();
    USB_OUT.println(F("--------------------------------------------------------------------------"));
    USB_OUT.printf("[TIME/PWR] %s | VBAT=%u mV (%.3f V) | Wi-Fi='%s' (%d dBm)\n",
                   state.isoTimestamp, state.vbatMv, state.vbatV, state.wifiSsid, (int)state.rssi);
    USB_OUT.printf("[SHT31   ] Ready=%d Addr=0x%02X | Raw=%.2fC / %.2f%%RH | Cal=%.2fC / %.2f%%RH\n",
                   state.shtReady ? 1 : 0, state.shtAddr,
                   state.shtTempRawC, state.shtHumRawRh, state.shtTempC, state.shtHumRh);
    USB_OUT.printf("[PSYCHRO ] Dew=%.2fC | VPD=%.3f kPa | AbsHum=%.2f g/m3 | Margin=%.2fC | CRC=%lu/%lu\n",
                   state.dewPointC, state.vpdKpa, state.absHumGm3, state.condMarginC,
                   (unsigned long)state.shtCrcOk, (unsigned long)state.shtCrcErr);
    USB_OUT.printf("[THERMAL ] SHT31=%.2fC | DS3231=%.2fC | BMI160=%.1fC | Cal(Ts=%.4f,To=%+.3f,Hs=%.4f,Ho=%+.2f)\n",
                   state.shtTempC, state.rtcTempC, state.gyroTempC,
                   c.tempSlope, c.tempOffset, c.humSlope, c.humOffset);
    USB_OUT.printf("[GNSS/GPS] Modem=%d Fix=%uD | Sats=%u (View:%u SNR:%udBHz) | Lat=%.6f Lon=%.6f Alt=%.1fm\n",
                   state.modemAwake ? 1 : 0, state.gpsFix, state.satellites, state.satsInView, state.maxCn0DbHz,
                   state.lat, state.lon, state.altM);
    USB_OUT.printf("[PLACE   ] HDOP=%.1f | Dist to UTP=%.1fm | PlaceCode=%u (1=UTP, 2=Pereira, 0=NoFix)\n",
                   state.hdop, state.utpDistanceM, state.placeConfirmed);
}

void handleSerialCommand(String cmd) {
    cmd.trim();
    if (cmd.length() == 0) return;

    if (cmd.equalsIgnoreCase("STATUS")) {
        printSerialReport();
    } else if (cmd.startsWith("CAL ") || cmd.startsWith("cal ")) {
        String args = cmd.substring(4);
        args.trim();
        int sp = args.indexOf(' ');
        if (sp > 0) {
            float rt = args.substring(0, sp).toFloat();
            float rh = args.substring(sp + 1).toFloat();
            sht31.applyOnePointCalibration(rt, rh, state);
            USB_OUT.println(sht31.buildCalibrationJson(state));
        } else {
            USB_OUT.println(F("Usage: CAL <refTempC> <refHumRh>  (e.g. CAL 24.50 68.0)"));
        }
    } else if (cmd.equalsIgnoreCase("RESETCAL")) {
        sht31.resetCalibration(state);
        USB_OUT.println(F("[CAL] Factory calibration restored."));
    } else if (cmd.equalsIgnoreCase("HEATER")) {
        USB_OUT.println(F("[SHT31] Running 1.5s internal heater plausibility test..."));
        USB_OUT.println(sht31.runHeaterPlausibilityTest(state));
    } else if (cmd.equalsIgnoreCase("AGPS")) {
        USB_OUT.printf("[GNSS] Assisted-GPS result: %s\n", gpsModem.triggerAgps() ? "OK" : "FAIL");
    } else if (cmd.equalsIgnoreCase("COLD")) {
        gpsModem.restartGnss(0);
        USB_OUT.println(F("[GNSS] Cold restart issued."));
    } else if (cmd.equalsIgnoreCase("WARM")) {
        gpsModem.restartGnss(1);
        USB_OUT.println(F("[GNSS] Warm restart issued."));
    } else if (cmd.startsWith("AT") || cmd.startsWith("at")) {
        SerialAT.println(cmd);
        unsigned long t0 = millis();
        while (millis() - t0 < 1200) {
            while (SerialAT.available()) USB_OUT.write(SerialAT.read());
            delay(2);
        }
    }
}

void setup() {
    pinMode(BOARD_LED_PIN, OUTPUT);
    digitalWrite(BOARD_LED_PIN, HIGH);

    Serial.begin(115200);
    Serial.setTxTimeoutMs(0);
#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1) && (!defined(ARDUINO_USB_CDC_ON_BOOT) || (ARDUINO_USB_CDC_ON_BOOT == 0))
    USBSerial.begin(115200);
    USBSerial.setTxTimeoutMs(0);
#endif
    delay(900);

    USB_OUT.println(F("\n=== SHT31 + MULTI-GNSS BENCH CALIBRATION & DIAGNOSTIC SUITE ==="));
    battery.begin();
    battery.update(state);
    imu.begin();
    imu.update(state);
    rtc.begin(state);
    sht31.begin(state);
    ds18.begin(state);
    ina48v.begin(state);
    sdCard.begin(state);
    gpsModem.begin(state);
    calMgr.begin();
    netSync.begin(state, sht31, ds18, ina48v, imu, rtc, sdCard, gpsModem, selfTest, calMgr);

    USB_OUT.println(selfTest.runAllToJson(state));
    printSerialReport();
}

void loop() {
    netSync.loop(state);
    sht31.update(state);
    ds18.update(state);
    ina48v.update(state);

    if (USB_OUT.available()) {
        handleSerialCommand(USB_OUT.readStringUntil('\n'));
    }

    unsigned long now = millis();
    if (now - lastPollMs >= 200) {
        lastPollMs = now;
        imu.update(state);
        battery.update(state);
        rtc.update(state);
        char jsonBuf[768];
        netSync.broadcastLocal(state, jsonBuf, sizeof(jsonBuf));
    }

    if (now - lastGpsMs >= 1500) {
        lastGpsMs = now;
        gpsModem.poll(state, rtc);
    }
}
