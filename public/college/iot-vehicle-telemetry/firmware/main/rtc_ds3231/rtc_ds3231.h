/**
 * rtc_ds3231.h
 * DS3231 Precision TCXO Real-Time Clock (0x68) + AT24C32 32Kbit EEPROM (0x57)
 */
#ifndef RTC_DS3231_H
#define RTC_DS3231_H

#include "../config.h"
#include <Wire.h>
#include <Preferences.h>
#include <driver/gpio.h>
#include <time.h>

#define DS3231_ADDR         0x68
#define AT24C32_ADDR        0x57
#define DS3231_REG_TIME     0x00
#define DS3231_REG_CONTROL  0x0E
#define DS3231_REG_STATUS   0x0F
#define DS3231_REG_AGING    0x10
#define DS3231_REG_TEMP     0x11

class RtcDs3231 {
public:
    bool begin(KartTelemetry &t) {
        loadNvsCalibration();

        // Detach ESP32-S3 default JTAG MTMS/MTDI IOMUX on GPIO 42 & GPIO 41 before Wire1 init
        gpio_reset_pin((gpio_num_t)DS3231_SDA_PIN);
        gpio_reset_pin((gpio_num_t)DS3231_SCL_PIN);
        pinMode(DS3231_SDA_PIN, INPUT_PULLUP);
        pinMode(DS3231_SCL_PIN, INPUT_PULLUP);
        delay(10);

        _ready = false;
        Wire1.begin(DS3231_SDA_PIN, DS3231_SCL_PIN, 100000);
        if (verifyGenuineDs3231(&Wire1)) {
            _bus = &Wire1;
            _ready = true;
            USB_OUT.printf("[DS3231] Genuine TCXO RTC verified on Wire1 (SDA=%d, SCL=%d)\n", DS3231_SDA_PIN, DS3231_SCL_PIN);
        } else {
            Wire1.end();
            Wire1.begin(DS3231_SCL_PIN, DS3231_SDA_PIN, 100000);
            if (verifyGenuineDs3231(&Wire1)) {
                _bus = &Wire1;
                _ready = true;
                USB_OUT.println(F("[DS3231] Genuine TCXO RTC verified on Wire1 (SWAPPED SDA=41, SCL=42)"));
            } else {
                Wire1.end();
                Wire1.begin(DS3231_SDA_PIN, DS3231_SCL_PIN, 100000);
                // Do NOT mistake BMI160 (0x68 on Wire IO1/IO2) for DS3231! Require AT24C32 (0x57) + non-BMI160 BCD regs
                if (probeBus(&Wire, AT24C32_ADDR) && verifyGenuineDs3231(&Wire)) {
                    _bus = &Wire;
                    _ready = true;
                    USB_OUT.println(F("[DS3231] Found on shared Wire0 (AT24C32 0x57 verified)"));
                } else {
                    _ready = false;
                    USB_OUT.println(F("[DS3231] No ACK on IO42/IO41 -> using ESP32 internal RTC + NTP UTC fallback"));
                }
            }
        }

        // Persistent boot counter across BOTH NVS and AT24C32 EEPROM (never overwrites existing SD CSVs!)
        Preferences prefs;
        uint32_t nvsBoot = 0;
        if (prefs.begin("kart_boot", false)) {
            nvsBoot = prefs.getUInt("boot_cnt", 0);
            prefs.end();
        }
        uint32_t eepBoot = _ready ? readBootCounter() : 0;
        t.bootCount = ((nvsBoot > eepBoot) ? nvsBoot : eepBoot) + 1;
        if (prefs.begin("kart_boot", false)) {
            prefs.putUInt("boot_cnt", t.bootCount);
            prefs.end();
        }

        if (_ready) {
            uint8_t status = readReg(DS3231_REG_STATUS);
            _osfWasSet = ((status & 0x80) != 0);
            if (_osfWasSet) writeReg(DS3231_REG_STATUS, status & ~0x80);
            t.rtcAgingReg = (int8_t)readReg(DS3231_REG_AGING);
            writeBootCounter(t.bootCount);
        }

        t.rtcReady = _ready;
        t.rtcDriftPpm = _driftPpm;
        update(t);
        return _ready;
    }

    void update(KartTelemetry &t) {
        t.uptimeMs = millis();
        t.rtcReady = _ready;

        if (!_ready && (t.uptimeMs - _lastRetryMs >= 5000)) {
            _lastRetryMs = t.uptimeMs;
            if (verifyGenuineDs3231(&Wire1)) {
                _bus = &Wire1;
                _ready = true;
                t.rtcReady = true;
            }
        }

        if (!_ready) {
            struct tm timeinfo;
            time_t nowSec = time(nullptr);
            if (nowSec > 1700000000 && gmtime_r(&nowSec, &timeinfo)) {
                t.ntpSynced = true;
                snprintf(t.isoTimestamp, sizeof(t.isoTimestamp),
                         "%04d-%02d-%02dT%02d:%02d:%02dZ",
                         timeinfo.tm_year + 1900, timeinfo.tm_mon + 1, timeinfo.tm_mday,
                         timeinfo.tm_hour, timeinfo.tm_min, timeinfo.tm_sec);
            } else {
                uint32_t totalSec = t.uptimeMs / 1000;
                snprintf(t.isoTimestamp, sizeof(t.isoTimestamp), "2026-11-13T%02u:%02u:%02uZ",
                         (uint8_t)((totalSec / 3600) % 24), (uint8_t)((totalSec / 60) % 60), (uint8_t)(totalSec % 60));
            }
            t.rtcTempC = t.shtReady ? t.shtTempC : 0.0f;
            return;
        }

        uint8_t buf[7];
        if (readBytes(DS3231_ADDR, DS3231_REG_TIME, buf, 7)) {
            uint8_t sec   = bcd2dec(buf[0] & 0x7F);
            uint8_t min   = bcd2dec(buf[1] & 0x7F);
            uint8_t hour  = bcd2dec(buf[2] & 0x3F);
            uint8_t day   = bcd2dec(buf[4] & 0x3F);
            uint8_t month = bcd2dec(buf[5] & 0x1F);
            uint16_t year = 2000 + bcd2dec(buf[6]);
            if (year < 2025 || year > 2035) {
                time_t nowSec = time(nullptr);
                struct tm ti;
                if (nowSec > 1700000000 && gmtime_r(&nowSec, &ti)) {
                    setUtcDateTime((uint16_t)(ti.tm_year + 1900), (uint8_t)(ti.tm_mon + 1), (uint8_t)ti.tm_mday,
                                   (uint8_t)ti.tm_hour, (uint8_t)ti.tm_min, (uint8_t)ti.tm_sec);
                    year = ti.tm_year + 1900; month = ti.tm_mon + 1; day = ti.tm_mday;
                    hour = ti.tm_hour; min = ti.tm_min; sec = ti.tm_sec;
                } else {
                    year = 2026; month = 11; day = 13;
                }
            }
            snprintf(t.isoTimestamp, sizeof(t.isoTimestamp),
                     "%04u-%02u-%02uT%02u:%02u:%02uZ", year, month, day, hour, min, sec);
        } else {
            _ready = false;
            t.rtcReady = false;
            return;
        }

        uint8_t tBuf[2];
        if (readBytes(DS3231_ADDR, DS3231_REG_TEMP, tBuf, 2)) {
            int8_t msb = (int8_t)tBuf[0];
            uint8_t frac = (tBuf[1] >> 6) & 0x03;
            t.rtcTempC = ((float)msb + ((float)frac * 0.25f)) + _tempOffsetC;
        }
    }

    bool setUtcDateTime(uint16_t year, uint8_t month, uint8_t day, uint8_t hour, uint8_t min, uint8_t sec) {
        if (!_ready || year < 2025) return false;
        uint8_t buf[7] = {
            dec2bcd(sec), dec2bcd(min), dec2bcd(hour), 1,
            dec2bcd(day), dec2bcd(month), dec2bcd((uint8_t)(year % 100))
        };
        _bus->beginTransmission(DS3231_ADDR);
        _bus->write(DS3231_REG_TIME);
        for (int i = 0; i < 7; i++) _bus->write(buf[i]);
        bool ok = (_bus->endTransmission() == 0);
        if (ok) {
            uint8_t st = readReg(DS3231_REG_STATUS);
            writeReg(DS3231_REG_STATUS, st & ~0x80);
        }
        return ok;
    }

    void syncFromGps(uint16_t year, uint8_t month, uint8_t day, uint8_t hour, uint8_t min, uint8_t sec) {
        if (_gpsSynced || year < 2025) return;
        if (_ready) setUtcDateTime(year, month, day, hour, min, sec);
        _gpsSynced = true;
    }

    bool setAgingOffsetLsb(int8_t agingLsb, float tempOffsetC, KartTelemetry &t) {
        _tempOffsetC = tempOffsetC;
        saveNvsCalibration(agingLsb, tempOffsetC, _driftPpm);
        if (_ready) {
            writeReg(DS3231_REG_AGING, (uint8_t)agingLsb);
            t.rtcAgingReg = (int8_t)readReg(DS3231_REG_AGING);
            return true;
        }
        t.rtcAgingReg = agingLsb;
        return false;
    }

    void recordDriftMeasurement(float measuredPpm, KartTelemetry &t) {
        _driftPpm = measuredPpm;
        t.rtcDriftPpm = measuredPpm;
        saveNvsCalibration(t.rtcAgingReg, _tempOffsetC, _driftPpm);
    }

    bool isReady() const { return _ready; }
    bool wasOsfSet() const { return _osfWasSet; }
    float getTempOffsetC() const { return _tempOffsetC; }
    float getDriftPpm() const { return _driftPpm; }

    uint32_t readUnixEpoch() {
        if (!_ready) return (uint32_t)time(nullptr);
        uint8_t buf[7];
        if (!readBytes(DS3231_ADDR, DS3231_REG_TIME, buf, 7)) return 0;
        struct tm ti = {};
        ti.tm_sec  = bcd2dec(buf[0] & 0x7F);
        ti.tm_min  = bcd2dec(buf[1] & 0x7F);
        ti.tm_hour = bcd2dec(buf[2] & 0x3F);
        ti.tm_mday = bcd2dec(buf[4] & 0x3F);
        ti.tm_mon  = bcd2dec(buf[5] & 0x1F) - 1;
        ti.tm_year = (2000 + bcd2dec(buf[6])) - 1900;
        return (uint32_t)mktime(&ti);
    }

private:
    TwoWire *_bus = &Wire1;
    bool _ready = false;
    bool _gpsSynced = false;
    bool _osfWasSet = false;
    unsigned long _lastRetryMs = 0;
    float _tempOffsetC = 0.0f;
    float _driftPpm = 0.0f;

    static uint8_t bcd2dec(uint8_t v) { return ((v / 16) * 10) + (v % 16); }
    static uint8_t dec2bcd(uint8_t v) { return ((v / 10) * 16) + (v % 10); }

    // Distinguishes genuine DS3231 (valid BCD seconds 0x00..0x59) from Bosch BMI160 (Reg 0x00 CHIP_ID = 0xD1/0xD8)!
    bool verifyGenuineDs3231(TwoWire *w) {
        if (!probeBus(w, DS3231_ADDR)) return false;
        w->beginTransmission(DS3231_ADDR);
        w->write(0x00);
        if (w->endTransmission(false) != 0) return false;
        if (w->requestFrom((uint8_t)DS3231_ADDR, (uint8_t)3) != 3) return false;
        uint8_t r0 = w->read();
        uint8_t r1 = w->read();
        uint8_t r2 = w->read();
        if (r0 == 0xD1 || r0 == 0xD8) return false; // That is Bosch BMI160 CHIP_ID!
        // Valid BCD check on seconds (bits 6..4 <= 5, bits 3..0 <= 9) and minutes
        if (((r0 & 0x70) >> 4) > 5 || (r0 & 0x0F) > 9) return false;
        if (((r1 & 0x70) >> 4) > 5 || (r1 & 0x0F) > 9) return false;
        (void)r2;
        return true;
    }

    void loadNvsCalibration() {
        Preferences p;
        if (p.begin("rtc_cal", true)) {
            _tempOffsetC = p.getFloat("t_off", 0.0f);
            _driftPpm    = p.getFloat("ppm",   0.0f);
            p.end();
        }
    }

    void saveNvsCalibration(int8_t aging, float tOff, float ppm) {
        Preferences p;
        if (p.begin("rtc_cal", false)) {
            p.putChar("aging", aging);
            p.putFloat("t_off", tOff);
            p.putFloat("ppm", ppm);
            p.end();
        }
    }

    bool probeBus(TwoWire *w, uint8_t addr) {
        w->beginTransmission(addr);
        return (w->endTransmission() == 0);
    }

    uint8_t readReg(uint8_t reg) {
        uint8_t v = 0;
        readBytes(DS3231_ADDR, reg, &v, 1);
        return v;
    }

    void writeReg(uint8_t reg, uint8_t v) {
        _bus->beginTransmission(DS3231_ADDR);
        _bus->write(reg);
        _bus->write(v);
        _bus->endTransmission();
    }

    bool readBytes(uint8_t dev, uint8_t reg, uint8_t *buf, size_t len) {
        _bus->beginTransmission(dev);
        _bus->write(reg);
        if (_bus->endTransmission(false) != 0) return false;
        if (_bus->requestFrom(dev, (uint8_t)len) != len) return false;
        for (size_t i = 0; i < len; i++) buf[i] = _bus->read();
        return true;
    }

    uint32_t readBootCounter() {
        if (!probeBus(_bus, AT24C32_ADDR)) return 0;
        _bus->beginTransmission(AT24C32_ADDR);
        _bus->write(0x00);
        _bus->write(0x00);
        if (_bus->endTransmission(false) != 0) return 0;
        if (_bus->requestFrom((uint8_t)AT24C32_ADDR, (uint8_t)5) != 5) return 0;
        if (_bus->read() != 0xA5) return 0;
        uint32_t val = 0;
        for (int i = 0; i < 4; i++) val = (val << 8) | _bus->read();
        return val;
    }

    void writeBootCounter(uint32_t val) {
        if (!probeBus(_bus, AT24C32_ADDR)) return;
        _bus->beginTransmission(AT24C32_ADDR);
        _bus->write(0x00);
        _bus->write(0x00);
        _bus->write(0xA5);
        _bus->write((val >> 24) & 0xFF);
        _bus->write((val >> 16) & 0xFF);
        _bus->write((val >> 8) & 0xFF);
        _bus->write(val & 0xFF);
        _bus->endTransmission();
        delay(10);
    }
};

#endif

