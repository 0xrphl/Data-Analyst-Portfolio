/**
 * ina22x_48v_cal_test.ino
 * Dedicated Bench Testing & Calibration Suite for TI INA226 (16-Bit) / INA228 (20-Bit 85V)
 * Target: LilyGO T-SIM7672G V1.1 (Left Header: VCC=3V3, GND=GND, SDA=GPIO 6, SCL=GPIO 7)
 *
 * Interactive USB Serial Commands (115200 baud):
 *  - STATUS              : Print 48V DC Bus Voltage, Shunt mV, Current A, Power W, Energy Wh & Chip ID
 *  - SCAN                : Re-scan GPIO 6/7 I2C bus (0x40..0x4F) and identify INA226 vs INA228
 *  - ZERO                : Zero-current tare (0.000 A) with traction load disconnected
 *  - SHUNT <ohms>        : Set shunt resistor in Ohms (e.g. `SHUNT 0.100` or `SHUNT 0.00075`)
 *  - DIV <ratio>         : Set VBUS divider ratio (`DIV 1.0` for INA228 85V, `DIV 2.0` for 2:1 divider on INA226)
 *  - CALV <volts>        : Calibrate 48V Bus Voltage against reference multimeter (e.g. `CALV 51.42`)
 *  - CALI <amps>         : Calibrate Current scale against clamp ammeter (e.g. `CALI 12.50`)
 *  - INVERT              : Toggle shunt current polarity (IN+ / IN-)
 *  - RESETENERGY         : Reset Wh & Ah accumulators to 0
 *  - FACTORY             : Restore factory INA22x calibration defaults
 */

#include "../main/config.h"
#include "../main/power_ina22x/power_ina22x.h"
#include "../main/sd_logger/sd_logger.h"
#include "../main/rtc_ds3231/rtc_ds3231.h"
#include "../main/calibration/ina22x_48v_cal/ina22x_48v_cal.h"

static KartTelemetry state;
PowerIna22x         ina48v;
RtcDs3231           rtc;
SdLogger            sdCard;
Ina22x48vCalibrator inaCal;

static unsigned long lastPrintMs = 0;

void printInaStatus() {
    const Ina48vCalibration &c = ina48v.getCalibration();
    USB_OUT.printf("[%s 0x%02X] RawV=%.3fV (Div=%.2fx) | 48V_Bus=%.3f V | Shunt=%.4f mV | I=%.3f A | P=%.2f W | E=%.3f Wh (%.3f Ah) | Rsh=%.5f Ohm\n",
                   ina48v.chipName(), state.inaAddr, state.inaRawBusV, c.vbusDividerRatio,
                   state.inaBusV, state.inaShuntMv, state.inaCurrentA, state.inaPowerW,
                   state.inaEnergyWh, state.inaChargeAh, c.shuntOhms);
}

void handleCmd(String cmd) {
    cmd.trim();
    if (cmd.length() == 0) return;
    if (cmd.equalsIgnoreCase("STATUS")) {
        printInaStatus();
    } else if (cmd.equalsIgnoreCase("SCAN")) {
        ina48v.begin(state);
        USB_OUT.println(ina48v.buildCalibrationJson(state));
    } else if (cmd.equalsIgnoreCase("ZERO")) {
        USB_OUT.println(inaCal.zeroCurrentTare(ina48v, state, sdCard));
    } else if (cmd.startsWith("SHUNT ") || cmd.startsWith("shunt ")) {
        float r = cmd.substring(6).toFloat();
        const Ina48vCalibration &c = ina48v.getCalibration();
        USB_OUT.println(inaCal.configureShuntAndDivider(r, c.vbusDividerRatio, c.invertCurrent, ina48v, state, sdCard));
    } else if (cmd.startsWith("DIV ") || cmd.startsWith("div ")) {
        float d = cmd.substring(4).toFloat();
        const Ina48vCalibration &c = ina48v.getCalibration();
        USB_OUT.println(inaCal.configureShuntAndDivider(c.shuntOhms, d, c.invertCurrent, ina48v, state, sdCard));
    } else if (cmd.startsWith("CALV ") || cmd.startsWith("calv ")) {
        float rv = cmd.substring(5).toFloat();
        USB_OUT.println(inaCal.calibrateReferenceMultimeter(rv, NAN, ina48v, state, sdCard));
    } else if (cmd.startsWith("CALI ") || cmd.startsWith("cali ")) {
        float ra = cmd.substring(5).toFloat();
        USB_OUT.println(inaCal.calibrateReferenceMultimeter(NAN, ra, ina48v, state, sdCard));
    } else if (cmd.equalsIgnoreCase("INVERT")) {
        const Ina48vCalibration &c = ina48v.getCalibration();
        USB_OUT.println(inaCal.configureShuntAndDivider(c.shuntOhms, c.vbusDividerRatio, !c.invertCurrent, ina48v, state, sdCard));
    } else if (cmd.equalsIgnoreCase("RESETENERGY")) {
        USB_OUT.println(inaCal.resetEnergyAccumulators(ina48v, state));
    } else if (cmd.equalsIgnoreCase("FACTORY")) {
        USB_OUT.println(inaCal.resetFactoryCalibration(ina48v, state, sdCard));
    }
}

void setup() {
    pinMode(BOARD_LED_PIN, OUTPUT);
    digitalWrite(BOARD_LED_PIN, LOW);
    Serial.begin(115200);
    Serial.setTxTimeoutMs(0);
#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1) && (!defined(ARDUINO_USB_CDC_ON_BOOT) || (ARDUINO_USB_CDC_ON_BOOT == 0))
    USBSerial.begin(115200);
    USBSerial.setTxTimeoutMs(0);
#endif
    delay(800);

    USB_OUT.println(F("\n=== TI INA226 / INA228 48V DC TRACTION BATTERY CALIBRATION SUITE ==="));
    USB_OUT.println(F("Wiring: VCC->3V3 (Left Pin 1), GND->GND (Left Pin 2), SDA->GPIO 6, SCL->GPIO 7"));
    rtc.begin(state);
    sdCard.begin(state);
    ina48v.begin(state);
    USB_OUT.println(ina48v.buildCalibrationJson(state));
}

void loop() {
    rtc.update(state);
    ina48v.update(state);
    if (USB_OUT.available()) {
        handleCmd(USB_OUT.readStringUntil('\n'));
    }
    unsigned long now = millis();
    if (now - lastPrintMs >= 1000) {
        lastPrintMs = now;
        printInaStatus();
    }
}
