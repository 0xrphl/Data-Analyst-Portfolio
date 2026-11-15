/**
 * main.ino
 * SOTA IoT Electric Delta-Kart Master Firmware
 * Hardware:
 *  - LilyGO T-SIM7672G V1.1 (ESP32-S3-WROOM-1 MCN16R8)
 *  - Bosch BMI160 6-DOF IMU (SDA=IO1, SCL=IO2 @ 400kHz)
 *  - DS3231 TCXO RTC + AT24C32 EEPROM (SDA=IO42, SCL=IO41 @ 400kHz)
 *  - 32GB MicroSD Blackbox Logger (CS=13, MOSI=14, SCK=21, MISO=47)
 *  - 18650 Battery Voltage Monitor in V & mV (IO4) + Solar (IO5)
 *  - SIM7672G Built-in Multi-GNSS (GPS/GLONASS/Galileo/BeiDou) + 4G LTE (220MB Plan Saver)
 *
 * Modular Architecture:
 *  - config.h
 *  - imu_bmi160/imu_bmi160.h
 *  - rtc_ds3231/rtc_ds3231.h
 *  - gps_sim7672/gps_sim7672.h
 *  - sd_logger/sd_logger.h
 *  - power_18650/power_18650.h
 *  - telemetry_sync/telemetry_sync.h
 */

#include "config.h"
#include "sensors/imu_bmi160.h"
#include "sensors/rtc_ds3231.h"
#include "sensors/env_sht31.h"
#include "sensors/temp_ds18b20.h"
#include "sensors/power_ina22x.h"
#include "sensors/gps_sim7672.h"
#include "sensors/sd_logger.h"
#include "sensors/power_18650.h"
#include "boot_test/self_test.h"
#include "calibration/calibration_manager.h"
#include "local_dashboard/telemetry_sync.h"

static KartTelemetry state;

ImuBmi160          imu;
RtcDs3231          rtc;
EnvSht31           sht31;
TempDs18b20        ds18;
PowerIna22x        ina48v;
GpsSim7672         gpsModem;
SdLogger           sdCard;
Power18650         battery;
SelfTestEngine     selfTest;
CalibrationManager calMgr;
TelemetrySync      netSync;

static unsigned long lastImuMs = 0;
static unsigned long lastGpsMs = 0;
static unsigned long lastSdMs  = 0;

void setup() {
    pinMode(BOARD_LED_PIN, OUTPUT);
    digitalWrite(BOARD_LED_PIN, HIGH);

    Serial.begin(115200);
    Serial.setTxTimeoutMs(0); // Non-blocking Native USB CDC so loop() never stalls if Serial Monitor closes
#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1) && (!defined(ARDUINO_USB_CDC_ON_BOOT) || (ARDUINO_USB_CDC_ON_BOOT == 0))
    USBSerial.begin(115200);
    USBSerial.setTxTimeoutMs(0);
#endif
    delay(800);

    USB_OUT.println(F("\n=========================================================================="));
    USB_OUT.println(F("  SOTA ELECTRIC DELTA-KART TELEMETRY & INSTRUMENTATION NODE"));
    USB_OUT.println(F("  LilyGO T-SIM7672G V1.1 | BMI160 | DS3231 | SHT31 (IO40/39) | GNSS | LTE"));
    USB_OUT.println(F("=========================================================================="));

    // 1. Initialize 18650 Battery & Solar ADC (Volts & mV only)
    battery.begin();
    battery.update(state);
    USB_OUT.printf("[18650] VBAT: %u mV (%.3f V) | Solar: %u mV\n", state.vbatMv, state.vbatV, state.solarMv);

    // 2. Initialize Bosch BMI160 6-DOF IMU (Wire0: SDA=IO1, SCL=IO2 @ 400kHz)
    imu.begin();
    imu.update(state);

    // 3. Initialize DS3231 Precision RTC + AT24C32 EEPROM (Wire1: SDA=IO42, SCL=IO41)
    rtc.begin(state);

    // 4. Initialize Sensirion SHT31-DIS Temp & Humidity + NVS Calibration (Bus2: SDA=IO40, SCL=IO39)
    sht31.begin(state);

    // 5. Initialize Dallas/Maxim DS18B20 1-Wire Probe(s) (Free Left Hdr pins IO15,16,8)
    ds18.begin(state);

    // 6. Initialize TI INA226 / INA228 48V DC Traction Pack Monitor (Left Hdr: SDA=IO6, SCL=IO7)
    ina48v.begin(state);

    // 7. Initialize 32GB MicroSD Blackbox Logger
    sdCard.begin(state);

    // 8. Initialize SIM7670G / SIM7672G 4G LTE + Multi-GNSS Engine
    gpsModem.begin(state);

    // 9. Initialize Multi-Sensor Calibration Manager + Dual AP_STA Wi-Fi + Local IP Portal
    calMgr.begin();
    netSync.begin(state, sht31, ds18, ina48v, imu, rtc, sdCard, gpsModem, selfTest, calMgr);
    rtc.update(state);

    // 10. Run 10-Sensor Parametric Boot Self-Test (Wi-Fi, 4G, GNSS, INA22x 48V, SHT31, DS18B20, BMI160, 18650, DS3231, 32GB SD)
    String testReportJson = selfTest.runAllToJson(state);
    USB_OUT.print(F("[SELF-TEST JSON] "));
    USB_OUT.println(testReportJson);

    // 11. Register Boot Session, 10-Sensor BIST & Full 6-Sensor Calibration JSON in Supabase `kart_sessions`
    String allCalJson = calMgr.buildAllCalibrationsJson(rtc, imu, sht31, ds18, ina48v, state);
    netSync.registerCloudSession(state, testReportJson, allCalJson, gpsModem);
}

void loop() {
    netSync.loop(state);
    sht31.update(state);
    ds18.update(state);
    ina48v.update(state);
    unsigned long now = millis();

    // 1. High-Frequency 30 Hz IMU & Local WebSocket Telemetry Loop (Every 33 ms)
    if (now - lastImuMs >= 33) {
        lastImuMs = now;

        imu.update(state);
        battery.update(state);
        rtc.update(state);

        char jsonBuf[960];
        netSync.broadcastLocal(state, jsonBuf, sizeof(jsonBuf));

        // 2. Log to 32GB MicroSD Card at 5 Hz (Every 200 ms) - preserves all CSVs
        if (now - lastSdMs >= 200) {
            lastSdMs = now;
            sdCard.logRecord(state, jsonBuf);
        }

        // 3. Adaptive Supabase Cloud Sync (every 4s active/test window, 30s idle)
        if (netSync.syncToSupabaseIfDue(state, gpsModem)) {
            imu.resetWindowPeak(state);
        }
    }

    // 4. Poll Multi-GNSS Satellite Position & UTP Place Confirmation (Every 1000 ms = 1 Hz)
    if (now - lastGpsMs >= 1000) {
        lastGpsMs = now;
        gpsModem.poll(state, rtc);
        calMgr.gpsCal.pushLiveFixIfValid(state);
    }
}
