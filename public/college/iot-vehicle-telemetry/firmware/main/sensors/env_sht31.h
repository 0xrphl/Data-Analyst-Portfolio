/**
 * env_sht31.h
 * Sensirion SHT31-DIS Instrumentation Driver, NVS Calibration & Psychrometric Engine
 *
 * Hardware & Metrology Architecture:
 *  - Right Header Pin 9 (SDA = GPIO 40) & Pin 10 (SCL = GPIO 39).
 *  - Dedicated Open-Drain Microsecond I2C Master (~100 kHz) isolating Bus 2 from
 *    ESP32-S3's 2 hardware I2C controllers (Wire IO1/IO2 BMI160 & Wire1 IO42/IO41 DS3231).
 *  - Detaches default JTAG IOMUX (MTDO/MTCK) on GPIO 40 & 39 via gpio_reset_pin().
 *  - 9-clock stuck-bus recovery, clock-stretching wait, 0x44/0x45 scan & pin-swap detection.
 *  - Non-blocking 1 Hz High-Repeatability Single-Shot (0x2400, 18 ms window, <0.02C self-heat).
 *  - Dual Sensirion CRC-8 (Poly 0x31, Init 0xFF) + NVS 1-pt/2-pt calibration + Magnus Dew Point/VPD.
 */
#ifndef ENV_SHT31_H
#define ENV_SHT31_H

#include "../config.h"
#include <Preferences.h>
#include <driver/gpio.h>
#include <math.h>

#define SHT31_CMD_MEAS_HIGHREP_NOSTRETCH  0x2400
#define SHT31_CMD_READ_STATUS             0xF32D
#define SHT31_CMD_CLEAR_STATUS            0x3041
#define SHT31_CMD_SOFT_RESET              0x30A2
#define SHT31_CMD_BREAK_PERIODIC          0x3093
#define SHT31_CMD_HEATER_ENABLE           0x306D
#define SHT31_CMD_HEATER_DISABLE          0x3066

struct Sht31Calibration {
    float tempSlope       = 1.0000f;
    float tempOffset      = 0.0000f;
    float humSlope        = 1.0000f;
    float humOffset       = 0.0000f;
    bool  psychroCoupling = false;
    uint32_t calCount     = 0;
};

class ShtSoftI2C {
public:
    void configurePins(uint8_t sdaPin, uint8_t sclPin, uint8_t halfPeriodUs = 5) {
        _sda = sdaPin;
        _scl = sclPin;
        _halfUs = halfPeriodUs;
        gpio_reset_pin((gpio_num_t)_sda);
        gpio_reset_pin((gpio_num_t)_scl);
        releaseSda();
        releaseScl();
        delayMicroseconds(20);
    }

    bool isSdaHigh() const { return digitalRead(_sda) == HIGH; }
    bool isSclHigh() const { return digitalRead(_scl) == HIGH; }
    uint8_t sdaPin() const { return _sda; }
    uint8_t sclPin() const { return _scl; }

    void busClear() {
        releaseSda();
        releaseScl();
        delayMicroseconds(10);
        if (!isSdaHigh()) {
            for (int i = 0; i < 9; i++) {
                driveSclLow();
                delayMicroseconds(_halfUs * 2);
                releaseSclWait();
                delayMicroseconds(_halfUs * 2);
                if (isSdaHigh()) break;
            }
        }
        stopCond();
    }

    bool probe(uint8_t addr7) {
        startCond();
        bool ack = writeByte((uint8_t)((addr7 << 1) | 0x00));
        stopCond();
        return ack;
    }

    bool writeCommand16(uint8_t addr7, uint16_t cmd) {
        startCond();
        bool ok = writeByte((uint8_t)((addr7 << 1) | 0x00)) &&
                  writeByte((uint8_t)((cmd >> 8) & 0xFF)) &&
                  writeByte((uint8_t)(cmd & 0xFF));
        stopCond();
        return ok;
    }

    bool readBytes(uint8_t addr7, uint8_t *buf, size_t len) {
        startCond();
        if (!writeByte((uint8_t)((addr7 << 1) | 0x01))) {
            stopCond();
            return false;
        }
        for (size_t i = 0; i < len; i++) {
            buf[i] = readByte(i + 1 < len);
        }
        stopCond();
        return true;
    }

private:
    uint8_t _sda = SHT31_SDA_PIN;
    uint8_t _scl = SHT31_SCL_PIN;
    uint8_t _halfUs = 5;

    inline void releaseSda()  { pinMode(_sda, INPUT_PULLUP); }
    inline void driveSdaLow() { digitalWrite(_sda, LOW); pinMode(_sda, OUTPUT); }
    inline void releaseScl()  { pinMode(_scl, INPUT_PULLUP); }
    inline void driveSclLow() { digitalWrite(_scl, LOW); pinMode(_scl, OUTPUT); }

    inline bool releaseSclWait(uint32_t timeoutUs = 3000) {
        releaseScl();
        uint32_t t0 = micros();
        while (digitalRead(_scl) == LOW) {
            if ((micros() - t0) > timeoutUs) return false;
        }
        return true;
    }

    void startCond() {
        releaseSda(); releaseSclWait(); delayMicroseconds(_halfUs);
        driveSdaLow(); delayMicroseconds(_halfUs);
        driveSclLow(); delayMicroseconds(_halfUs);
    }

    void stopCond() {
        driveSdaLow(); delayMicroseconds(_halfUs);
        releaseSclWait(); delayMicroseconds(_halfUs);
        releaseSda(); delayMicroseconds(_halfUs);
    }

    bool writeByte(uint8_t val) {
        for (int bit = 7; bit >= 0; bit--) {
            if (val & (1 << bit)) releaseSda(); else driveSdaLow();
            delayMicroseconds(_halfUs);
            if (!releaseSclWait()) return false;
            delayMicroseconds(_halfUs);
            driveSclLow();
        }
        releaseSda();
        delayMicroseconds(_halfUs);
        if (!releaseSclWait()) return false;
        bool ack = (digitalRead(_sda) == LOW);
        delayMicroseconds(_halfUs);
        driveSclLow();
        return ack;
    }

    uint8_t readByte(bool sendAck) {
        uint8_t val = 0;
        releaseSda();
        for (int bit = 7; bit >= 0; bit--) {
            delayMicroseconds(_halfUs);
            releaseSclWait();
            if (digitalRead(_sda) == HIGH) val |= (uint8_t)(1 << bit);
            delayMicroseconds(_halfUs);
            driveSclLow();
        }
        if (sendAck) driveSdaLow(); else releaseSda();
        delayMicroseconds(_halfUs);
        releaseSclWait();
        delayMicroseconds(_halfUs);
        driveSclLow();
        releaseSda();
        return val;
    }
};

class EnvSht31 {
public:
    bool begin(KartTelemetry &t) {
        loadCalibration();

        _i2c.configurePins(SHT31_SDA_PIN, SHT31_SCL_PIN, 5);
        _sdaIdleHigh = _i2c.isSdaHigh();
        _sclIdleHigh = _i2c.isSclHigh();
        _i2c.busClear();

        _pinsSwapped = false;
        _addr = detectSensorOnCurrentPins();

        // Auto-recovery if jumper wires on GPIO 40 & 39 were swapped
        if (_addr == 0) {
            _i2c.configurePins(SHT31_SCL_PIN, SHT31_SDA_PIN, 5);
            _i2c.busClear();
            uint8_t swapAddr = detectSensorOnCurrentPins();
            if (swapAddr != 0) {
                _addr = swapAddr;
                _pinsSwapped = true;
                USB_OUT.printf("[SHT31] Detected at 0x%02X with SWAPPED pins (SDA=%u, SCL=%u)!\n",
                               _addr, _i2c.sdaPin(), _i2c.sclPin());
            } else {
                _i2c.configurePins(SHT31_SDA_PIN, SHT31_SCL_PIN, 5);
            }
        }

        if (_addr == 0) {
            _ready = false;
            t.shtReady = false;
            USB_OUT.printf("[SHT31] No ACK on SDA=%d / SCL=%d (Idle: IO40=%s, IO39=%s)\n",
                           SHT31_SDA_PIN, SHT31_SCL_PIN,
                           _sdaIdleHigh ? "HIGH" : "LOW",
                           _sclIdleHigh ? "HIGH" : "LOW");
            return false;
        }

        _i2c.writeCommand16(_addr, SHT31_CMD_BREAK_PERIODIC);
        delay(2);
        _i2c.writeCommand16(_addr, SHT31_CMD_SOFT_RESET);
        delay(3);
        _i2c.writeCommand16(_addr, SHT31_CMD_CLEAR_STATUS);
        delay(1);
        _i2c.writeCommand16(_addr, SHT31_CMD_HEATER_DISABLE);
        delay(2);

        uint16_t stReg = 0xFFFF;
        readStatusRegister(stReg);

        _ready = true;
        t.shtReady = true;
        t.shtAddr = _addr;
        t.shtPinsSwapped = _pinsSwapped;
        t.shtStatusReg = stReg;
        t.shtHeaterOn = ((stReg & (1 << 13)) != 0);

        if (blockingReadOnce(t)) {
            USB_OUT.printf("[SHT31] Ready 0x%02X (SDA=%u, SCL=%u) | Raw: %.2fC / %.2f%%RH | Cal: %.2fC / %.2f%%RH | Dew: %.2fC\n",
                           _addr, _i2c.sdaPin(), _i2c.sclPin(),
                           t.shtTempRawC, t.shtHumRawRh,
                           t.shtTempC, t.shtHumRh, t.dewPointC);
        }
        return true;
    }

    void update(KartTelemetry &t) {
        unsigned long now = millis();
        if (!_ready) {
            if (now - _lastRetryMs >= 3000) {
                _lastRetryMs = now;
                begin(t);
            }
            return;
        }

        if (!_waitingConversion) {
            if (now - _lastSampleMs >= 500) {
                if (_i2c.writeCommand16(_addr, SHT31_CMD_MEAS_HIGHREP_NOSTRETCH)) {
                    _waitingConversion = true;
                    _triggerMs = now;
                } else if (++_consecErrors >= 3) {
                    _ready = false; t.shtReady = false; _consecErrors = 0;
                }
            }
        } else if (now - _triggerMs >= 18) {
            _waitingConversion = false;
            _lastSampleMs = now;
            uint8_t rx[6] = {0};
            if (_i2c.readBytes(_addr, rx, 6)) {
                processRawFrame(rx, t);
                _consecErrors = 0;
            } else if (++_consecErrors >= 3) {
                _ready = false; t.shtReady = false; _consecErrors = 0;
            }
        }
    }

    bool blockingReadOnce(KartTelemetry &t) {
        if (!_ready) return false;
        if (!_i2c.writeCommand16(_addr, SHT31_CMD_MEAS_HIGHREP_NOSTRETCH)) return false;
        delay(18);
        uint8_t rx[6] = {0};
        if (!_i2c.readBytes(_addr, rx, 6)) return false;
        return processRawFrame(rx, t);
    }

    bool readStatusRegister(uint16_t &statusOut) {
        if (_addr == 0 || !_i2c.writeCommand16(_addr, SHT31_CMD_READ_STATUS)) return false;
        delayMicroseconds(500);
        uint8_t rx[3] = {0};
        if (!_i2c.readBytes(_addr, rx, 3)) return false;
        if (sensirionCrc8(rx, 2) != rx[2]) return false;
        statusOut = (uint16_t)((rx[0] << 8) | rx[1]);
        return true;
    }

    String runHeaterPlausibilityTest(KartTelemetry &t) {
        if (!_ready && !begin(t)) {
            return "{\"ok\":false,\"error\":\"SHT31_NOT_CONNECTED\"}";
        }
        _waitingConversion = false;
        blockingReadOnce(t);
        float t0 = t.shtTempRawC, h0 = t.shtHumRawRh;

        _i2c.writeCommand16(_addr, SHT31_CMD_HEATER_ENABLE);
        uint16_t stOn = 0;
        delay(5);
        readStatusRegister(stOn);
        delay(1500);

        blockingReadOnce(t);
        float t1 = t.shtTempRawC, h1 = t.shtHumRawRh;

        _i2c.writeCommand16(_addr, SHT31_CMD_HEATER_DISABLE);
        delay(5);
        uint16_t stOff = 0;
        readStatusRegister(stOff);
        t.shtStatusReg = stOff;
        t.shtHeaterOn = ((stOff & (1 << 13)) != 0);

        float dT = t1 - t0, dRh = h1 - h0;
        bool bitOk = ((stOn & (1 << 13)) != 0) && ((stOff & (1 << 13)) == 0);
        bool ok = bitOk && (dT >= 0.30f);

        char buf[260];
        snprintf(buf, sizeof(buf),
                 "{\"ok\":%s,\"heater_bit_ok\":%s,\"t_before\":%.2f,\"t_after\":%.2f,\"delta_t\":%.2f,"
                 "\"rh_before\":%.2f,\"rh_after\":%.2f,\"delta_rh\":%.2f}",
                 ok ? "true" : "false", bitOk ? "true" : "false", t0, t1, dT, h0, h1, dRh);
        return String(buf);
    }

    const Sht31Calibration& getCalibration() const { return _cal; }

    void applyOnePointCalibration(float refTempC, float refHumRh, KartTelemetry &t) {
        if (!isnan(refTempC) && refTempC > -40.0f && refTempC < 125.0f) {
            _cal.tempOffset = refTempC - (_cal.tempSlope * t.shtTempRawC);
        }
        if (!isnan(refHumRh) && refHumRh >= 0.0f && refHumRh <= 100.0f) {
            _cal.humOffset = refHumRh - (_cal.humSlope * t.shtHumRawRh);
        }
        _cal.calCount++;
        saveCalibration();
        recomputeDerived(t);
    }

    bool applyTwoPointCalibration(float rawT1, float refT1, float rawT2, float refT2,
                                  float rawH1, float refH1, float rawH2, float refH2,
                                  KartTelemetry &t) {
        bool updated = false;
        if (fabs(rawT2 - rawT1) >= 0.5f) {
            _cal.tempSlope  = (refT2 - refT1) / (rawT2 - rawT1);
            _cal.tempOffset = refT1 - (_cal.tempSlope * rawT1);
            updated = true;
        }
        if (fabs(rawH2 - rawH1) >= 2.0f) {
            _cal.humSlope  = (refH2 - refH1) / (rawH2 - rawH1);
            _cal.humOffset = refH1 - (_cal.humSlope * rawH1);
            updated = true;
        }
        if (updated) {
            _cal.calCount++;
            saveCalibration();
            recomputeDerived(t);
        }
        return updated;
    }

    void setManualCoefficients(float tSlope, float tOffset, float hSlope, float hOffset, bool psychroCouple, KartTelemetry &t) {
        if (tSlope > 0.5f && tSlope < 1.5f) _cal.tempSlope = tSlope;
        if (tOffset > -25.0f && tOffset < 25.0f) _cal.tempOffset = tOffset;
        if (hSlope > 0.5f && hSlope < 1.5f) _cal.humSlope = hSlope;
        if (hOffset > -50.0f && hOffset < 50.0f) _cal.humOffset = hOffset;
        _cal.psychroCoupling = psychroCouple;
        _cal.calCount++;
        saveCalibration();
        recomputeDerived(t);
    }

    void resetCalibration(KartTelemetry &t) {
        _cal = Sht31Calibration{};
        saveCalibration();
        recomputeDerived(t);
    }

    String buildCalibrationJson(const KartTelemetry &t) const {
        char buf[384];
        snprintf(buf, sizeof(buf),
                 "{\"sht_ready\":%s,\"addr\":\"0x%02X\",\"sda_pin\":%u,\"scl_pin\":%u,"
                 "\"pins_swapped\":%s,\"sda_idle_high\":%s,\"scl_idle_high\":%s,"
                 "\"temp_slope\":%.5f,\"temp_offset\":%.4f,\"hum_slope\":%.5f,\"hum_offset\":%.4f,"
                 "\"psychro_coupling\":%s,\"cal_count\":%lu,"
                 "\"delta_vs_rtc_c\":%.2f,\"delta_vs_bmi_c\":%.2f}",
                 _ready ? "true" : "false", _addr, _i2c.sdaPin(), _i2c.sclPin(),
                 _pinsSwapped ? "true" : "false",
                 _sdaIdleHigh ? "true" : "false", _sclIdleHigh ? "true" : "false",
                 _cal.tempSlope, _cal.tempOffset, _cal.humSlope, _cal.humOffset,
                 _cal.psychroCoupling ? "true" : "false",
                 (unsigned long)_cal.calCount,
                 t.shtTempC - t.rtcTempC, t.shtTempC - t.gyroTempC);
        return String(buf);
    }

    bool isReady() const { return _ready; }
    uint8_t getAddress() const { return _addr; }
    bool isSdaIdleHigh() const { return _sdaIdleHigh; }
    bool isSclIdleHigh() const { return _sclIdleHigh; }

    static uint8_t sensirionCrc8(const uint8_t *data, size_t len) {
        uint8_t crc = 0xFF;
        for (size_t i = 0; i < len; i++) {
            crc ^= data[i];
            for (uint8_t bit = 0; bit < 8; bit++) {
                crc = (crc & 0x80) ? (uint8_t)((crc << 1) ^ 0x31) : (uint8_t)(crc << 1);
            }
        }
        return crc;
    }

private:
    ShtSoftI2C _i2c;
    Sht31Calibration _cal;
    uint8_t _addr = 0;
    bool _ready = false;
    bool _pinsSwapped = false;
    bool _sdaIdleHigh = false;
    bool _sclIdleHigh = false;
    bool _waitingConversion = false;
    uint8_t _consecErrors = 0;
    unsigned long _triggerMs = 0;
    unsigned long _lastSampleMs = 0;
    unsigned long _lastRetryMs = 0;

    static const uint8_t STAT_WIN = 30;
    float _tHist[STAT_WIN] = {0};
    float _hHist[STAT_WIN] = {0};
    uint8_t _histIdx = 0;
    uint8_t _histCount = 0;

    uint8_t detectSensorOnCurrentPins() {
        const uint8_t candidates[2] = { SHT31_ADDR_DEFAULT, SHT31_ADDR_ALT };
        for (int i = 0; i < 2; i++) {
            if (_i2c.probe(candidates[i])) return candidates[i];
        }
        return 0;
    }

    void loadCalibration() {
        Preferences prefs;
        if (prefs.begin("sht31_cal", true)) {
            _cal.tempSlope       = prefs.getFloat("t_slope", 1.0000f);
            _cal.tempOffset      = prefs.getFloat("t_off",   0.0000f);
            _cal.humSlope        = prefs.getFloat("h_slope", 1.0000f);
            _cal.humOffset       = prefs.getFloat("h_off",   0.0000f);
            _cal.psychroCoupling = prefs.getBool("psy_cpl",  false);
            _cal.calCount        = prefs.getUInt("cal_cnt",  0);
            prefs.end();
        }
    }

    void saveCalibration() {
        Preferences prefs;
        if (prefs.begin("sht31_cal", false)) {
            prefs.putFloat("t_slope", _cal.tempSlope);
            prefs.putFloat("t_off",   _cal.tempOffset);
            prefs.putFloat("h_slope", _cal.humSlope);
            prefs.putFloat("h_off",   _cal.humOffset);
            prefs.putBool("psy_cpl",  _cal.psychroCoupling);
            prefs.putUInt("cal_cnt",  _cal.calCount);
            prefs.end();
        }
    }

    static float satVaporPressureKpa(float tempC) {
        return 0.61094f * expf((17.625f * tempC) / (243.04f + tempC));
    }

    bool processRawFrame(const uint8_t rx[6], KartTelemetry &t) {
        if (sensirionCrc8(&rx[0], 2) != rx[2] || sensirionCrc8(&rx[3], 2) != rx[5]) {
            t.shtCrcErr++;
            return false;
        }
        t.shtCrcOk++;

        uint16_t rawSt  = (uint16_t)((rx[0] << 8) | rx[1]);
        uint16_t rawSrh = (uint16_t)((rx[3] << 8) | rx[4]);

        // Exact Sensirion SHT31-DIS Datasheet Transfer Equations (Section 4.13)
        t.shtTempRawC = -45.0f + 175.0f * ((float)rawSt / 65535.0f);
        t.shtHumRawRh = 100.0f * ((float)rawSrh / 65535.0f);

        recomputeDerived(t);
        pushWindowStats(t);
        return true;
    }

    void recomputeDerived(KartTelemetry &t) {
        float tCal = (_cal.tempSlope * t.shtTempRawC) + _cal.tempOffset;
        float hCal = (_cal.humSlope  * t.shtHumRawRh) + _cal.humOffset;

        if (_cal.psychroCoupling && fabs(tCal - t.shtTempRawC) > 0.01f) {
            float esRaw = satVaporPressureKpa(t.shtTempRawC);
            float esCal = satVaporPressureKpa(tCal);
            if (esCal > 0.001f) hCal *= (esRaw / esCal);
        }

        if (hCal < 0.0f)   hCal = 0.0f;
        if (hCal > 100.0f) hCal = 100.0f;

        t.shtTempC = tCal;
        t.shtHumRh = hCal;

        float rhSafe = (hCal < 0.1f) ? 0.1f : hCal;
        float esKpa  = satVaporPressureKpa(tCal);
        float eaKpa  = esKpa * (rhSafe / 100.0f);
        float vpd    = esKpa - eaKpa;
        if (vpd < 0.0f) vpd = 0.0f;

        float gamma = logf(rhSafe / 100.0f) + ((17.625f * tCal) / (243.04f + tCal));
        float dewC  = (243.04f * gamma) / (17.625f - gamma);
        float absHum = (2166.79f * eaKpa) / (tCal + 273.15f);

        t.dewPointC   = dewC;
        t.vpdKpa      = vpd;
        t.absHumGm3   = absHum;
        t.condMarginC = tCal - dewC;
    }

    void pushWindowStats(KartTelemetry &t) {
        uint8_t oldestIdx = (_histCount < STAT_WIN) ? 0 : _histIdx;
        float oldestTemp = (_histCount > 0) ? _tHist[oldestIdx] : t.shtTempC;

        _tHist[_histIdx] = t.shtTempC;
        _hHist[_histIdx] = t.shtHumRh;
        _histIdx = (_histIdx + 1) % STAT_WIN;
        if (_histCount < STAT_WIN) _histCount++;

        if (_histCount >= 3) {
            float meanT = 0.0f, meanH = 0.0f;
            for (uint8_t i = 0; i < _histCount; i++) { meanT += _tHist[i]; meanH += _hHist[i]; }
            meanT /= (float)_histCount;
            meanH /= (float)_histCount;

            float varT = 0.0f, varH = 0.0f;
            for (uint8_t i = 0; i < _histCount; i++) {
                float dt = _tHist[i] - meanT, dh = _hHist[i] - meanH;
                varT += dt * dt; varH += dh * dh;
            }
            t.shtNoiseTempC = sqrtf(varT / (float)(_histCount - 1));
            t.shtNoiseHumRh = sqrtf(varH / (float)(_histCount - 1));

            float spanMin = (float)(_histCount - 1) / 60.0f;
            if (spanMin > 0.01f) t.shtDriftCPerMin = (t.shtTempC - oldestTemp) / spanMin;
            t.shtSettled = (_histCount >= 10) && (fabs(t.shtDriftCPerMin) <= 0.15f);
        }
    }
};

#endif
