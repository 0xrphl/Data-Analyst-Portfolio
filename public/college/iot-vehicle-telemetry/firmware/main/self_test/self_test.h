/**
 * self_test.h
 * Parametric Hardware & Connectivity Self-Test Registry (BIST)
 *
 * Designed so new future sensors can be added in 1 line using:
 *   selfTest.registerSensor("sensor_key", testCallbackFunction);
 *
 * Automatically tests and generates JSON status for:
 *  1) Wi-Fi Station & Local WebSocket Server
 *  2) 4G LTE Movistar SIM7672G & Multi-GNSS Engine
 *  3) Bosch BMI160 6-DOF Gyroscope & Accelerometer + Die Temp
 *  4) 18650 Battery Module ADC (Volts & mV, no %)
 *  5) DS3231 TCXO Battery Clock + AT24C32 EEPROM
 *  6) 32GB MicroSD Card SPI Logger
 */
#ifndef SELF_TEST_H
#define SELF_TEST_H

#include "../config.h"
#include <WiFi.h>
#include <Wire.h>

#define MAX_PARAMETRIC_TESTS 16

typedef bool (*SensorTestFn)(const KartTelemetry &t, String &detailOut);

struct ParametricTestEntry {
    const char *key;
    SensorTestFn fn;
};

class SelfTestEngine {
public:
    SelfTestEngine() : _count(0) {
        // Register all 10 SOTA kart & instrumentation subsystems
        registerSensor("wifi",          testWifi);
        registerSensor("4g_lte",        test4gLte);
        registerSensor("gnss_gps",      testGnssGps);
        registerSensor("ina_48v_dc",    testIna48vDc);
        registerSensor("sht31_env",     testSht31Env);
        registerSensor("ds18b20_probe", testDs18b20);
        registerSensor("gyro_bmi160",   testGyroBmi160);
        registerSensor("battery_18650", testBattery18650);
        registerSensor("rtc_ds3231",    testRtcDs3231);
        registerSensor("sd_32gb",       testSd32Gb);
    }

    // Add any future sensor test function here (e.g. hall_rpm, brake_pressure, motor_temp)
    bool registerSensor(const char *sensorKey, SensorTestFn fn) {
        if (_count >= MAX_PARAMETRIC_TESTS) return false;
        _tests[_count].key = sensorKey;
        _tests[_count].fn  = fn;
        _count++;
        return true;
    }

    // Runs all registered tests and populates a JSON object string for Supabase `test` column & live WebSocket
    String runAllToJson(const KartTelemetry &t) {
        String json = "{";
        int passed = 0;

        for (int i = 0; i < _count; i++) {
            String detail = "";
            bool ok = _tests[i].fn(t, detail);
            if (ok) passed++;

            json += "\"";
            json += _tests[i].key;
            json += "\":{\"ok\":";
            json += (ok ? "true" : "false");
            json += ",\"info\":\"";
            json += detail;
            json += "\"},";
        }

        json += "\"summary\":{\"passed\":" + String(passed) + ",\"total\":" + String(_count) + "}}";
        _lastReportJson = json;
        return json;
    }

    const String& getLastReportJson() const { return _lastReportJson; }

    // --- Built-in Parametric Test Callbacks ---

    static bool testWifi(const KartTelemetry &t, String &detailOut) {
        if (WiFi.status() == WL_CONNECTED) {
            detailOut = String(t.wifiSsid) + " " + WiFi.localIP().toString() + " (" + String(WiFi.RSSI()) + "dBm)";
            return true;
        }
        detailOut = "AP Mode (192.168.4.1)";
        return false;
    }

    static bool test4gLte(const KartTelemetry &t, String &detailOut) {
        if (!t.modemAwake) {
            detailOut = "NO_MODEM_UART (Check 18650 switch)";
            return false;
        }
        detailOut = String("Modem OK CSQ:") + String(t.lteCsq) + " CEREG:" + String(t.lteRegStatus);
        return true;
    }

    static bool testGnssGps(const KartTelemetry &t, String &detailOut) {
        if (!t.modemAwake || !t.gnssPowered) {
            detailOut = "GNSS_OFF";
            return false;
        }
        if (t.gpsFix >= 2) {
            const char *place = (t.placeConfirmed == 1) ? "UTP" : (t.placeConfirmed == 2 ? "PEREIRA" : "LOCK");
            detailOut = String(t.gpsFix) + "D Fix " + String(t.satellites) + "SV HDOP:" + String(t.hdop, 1) + " " + place;
            return true;
        }
        detailOut = String("Scanning View:") + String(t.satsInView) + "SV SNR:" + String(t.maxCn0DbHz) + "dBHz";
        return true;
    }

    static bool testIna48vDc(const KartTelemetry &t, String &detailOut) {
        if (!t.inaReady) {
            detailOut = "NO_I2C_ACK (SDA=6,SCL=7)";
            return false;
        }
        const char *chip = (t.inaChipType == 2) ? "INA228" : "INA226";
        char buf[90];
        snprintf(buf, sizeof(buf), "%s 0x%02X %.2fV %.2fA %.1fW",
                 chip, t.inaAddr, t.inaBusV, t.inaCurrentA, t.inaPowerW);
        detailOut = String(buf);
        return true;
    }

    static bool testSht31Env(const KartTelemetry &t, String &detailOut) {
        if (!t.shtReady || t.shtCrcOk == 0) {
            detailOut = "NO_I2C_ACK (SDA=40,SCL=39)";
            return false;
        }
        char buf[80];
        snprintf(buf, sizeof(buf), "0x%02X %.2fC %.1f%%RH Dew:%.1fC CRC:%lu",
                 t.shtAddr, t.shtTempC, t.shtHumRh, t.dewPointC, (unsigned long)t.shtCrcOk);
        detailOut = String(buf);
        return true;
    }

    static bool testDs18b20(const KartTelemetry &t, String &detailOut) {
        if (!t.ds18Ready || t.ds18Count == 0) {
            detailOut = "NO_PROBE (Wire DATA+4.7k to IO15/6/7/16/8)";
            return false;
        }
        char buf[84];
        if (t.ds18MotorPresent) {
            snprintf(buf, sizeof(buf), "IO%u (%u probes) Ctrl:%.2fC Mot:%.2fC",
                     t.ds18Pin, t.ds18Count, t.ds18CtrlC, t.ds18MotorC);
        } else {
            snprintf(buf, sizeof(buf), "IO%u Ctrl:%.2fC CRC:%lu",
                     t.ds18Pin, t.ds18CtrlC, (unsigned long)t.ds18CrcOk);
        }
        detailOut = String(buf);
        return true;
    }

    static bool testGyroBmi160(const KartTelemetry &t, String &detailOut) {
        Wire.beginTransmission(0x68);
        bool ack68 = (Wire.endTransmission() == 0);
        Wire.beginTransmission(0x69);
        bool ack69 = (Wire.endTransmission() == 0);
        bool ok = (ack68 || ack69);
        detailOut = ok
            ? ("0x" + String(ack68 ? "68" : "69") + " " + String(t.gyroTempC, 1) + "C")
            : "NO_I2C_ACK";
        return ok;
    }

    static bool testBattery18650(const KartTelemetry &t, String &detailOut) {
        bool seated = (t.vbatMv >= 2500);
        detailOut = String(t.vbatMv) + "mV (" + String(t.vbatV, 3) + "V)";
        return seated;
    }

    static bool testRtcDs3231(const KartTelemetry &t, String &detailOut) {
        if (t.rtcReady) {
            detailOut = String(t.isoTimestamp) + " (" + String(t.rtcTempC, 2) + "C Aging:" + String(t.rtcAgingReg) + ")";
            return true;
        }
        detailOut = String("NO_ACK_IO42_41 (") + (t.ntpSynced ? "NTP:" : "UPTIME:") + String(t.isoTimestamp) + ")";
        return false;
    }

    static bool testSd32Gb(const KartTelemetry &t, String &detailOut) {
        detailOut = t.sdMounted ? (String(t.sdLogKb) + "KB Logged") : "NO_CARD";
        return t.sdMounted;
    }

private:
    ParametricTestEntry _tests[MAX_PARAMETRIC_TESTS];
    int _count;
    String _lastReportJson = "{}";
};

#endif
