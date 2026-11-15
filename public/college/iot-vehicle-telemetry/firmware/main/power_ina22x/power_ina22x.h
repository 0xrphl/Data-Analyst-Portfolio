/**
 * power_ina22x.h
 * Texas Instruments INA226 (16-Bit) & INA228 (20-Bit 85V) Precision 48V DC Bus Monitor
 * Connected on Left Header: VCC=3V3 (Pin 1), GND=GND (Pin 2), SDA=GPIO 6 (Pin 6), SCL=GPIO 7 (Pin 7)
 */
#ifndef POWER_INA22X_H
#define POWER_INA22X_H

#include "../config.h"
#include <Preferences.h>
#include <driver/gpio.h>
#include <math.h>

struct Ina48vCalibration {
    float shuntOhms        = INA22X_DEFAULT_SHUNT_OHM;
    float vbusDividerRatio = 1.0000f; // 1.0 for INA228 (85V direct), 2.0 if 2:1 divider used on INA226
    float vbusScale        = 1.0000f;
    float vbusOffsetV      = 0.0000f;
    float currScale        = 1.0000f;
    float currOffsetA      = 0.0000f; // Zero-load current tare (A)
    bool  invertCurrent    = false;
    uint32_t calCount      = 0;
};

class InaSoftI2C {
public:
    void begin(uint8_t sdaPin, uint8_t sclPin, uint8_t halfUs = 5) {
        _sda = sdaPin; _scl = sclPin; _halfUs = halfUs;
        gpio_reset_pin((gpio_num_t)_sda);
        gpio_reset_pin((gpio_num_t)_scl);
        releaseSda(); releaseScl();
        delayMicroseconds(20);
    }

    uint8_t sdaPin() const { return _sda; }
    uint8_t sclPin() const { return _scl; }
    bool isSdaHigh() const { return digitalRead(_sda) == HIGH; }
    bool isSclHigh() const { return digitalRead(_scl) == HIGH; }

    void busClear() {
        releaseSda(); releaseScl(); delayMicroseconds(10);
        if (!isSdaHigh()) {
            for (int i = 0; i < 9; i++) {
                driveSclLow(); delayMicroseconds(_halfUs * 2);
                releaseSclWait(); delayMicroseconds(_halfUs * 2);
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

    bool writeReg16(uint8_t addr7, uint8_t reg, uint16_t val) {
        startCond();
        bool ok = writeByte((uint8_t)((addr7 << 1) | 0x00)) &&
                  writeByte(reg) &&
                  writeByte((uint8_t)((val >> 8) & 0xFF)) &&
                  writeByte((uint8_t)(val & 0xFF));
        stopCond();
        return ok;
    }

    bool readRegBytes(uint8_t addr7, uint8_t reg, uint8_t *buf, size_t len) {
        startCond();
        if (!writeByte((uint8_t)((addr7 << 1) | 0x00)) || !writeByte(reg)) {
            stopCond(); return false;
        }
        startCond();
        if (!writeByte((uint8_t)((addr7 << 1) | 0x01))) {
            stopCond(); return false;
        }
        for (size_t i = 0; i < len; i++) buf[i] = readByte(i + 1 < len);
        stopCond();
        return true;
    }

    bool readReg16(uint8_t addr7, uint8_t reg, uint16_t &out) {
        uint8_t b[2] = {0};
        if (!readRegBytes(addr7, reg, b, 2)) return false;
        out = (uint16_t)((b[0] << 8) | b[1]);
        return true;
    }

private:
    uint8_t _sda = INA22X_SDA_PIN, _scl = INA22X_SCL_PIN, _halfUs = 5;

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

class PowerIna22x {
public:
    bool begin(KartTelemetry &t) {
        loadCalibration();

        _i2c.begin(INA22X_SDA_PIN, INA22X_SCL_PIN, 5);
        _sdaIdleHigh = _i2c.isSdaHigh();
        _sclIdleHigh = _i2c.isSclHigh();
        _i2c.busClear();

        _pinsSwapped = false;
        _chipType = 0;
        _addr = detectInaOnCurrentPins(_chipType);

        if (_addr == 0) {
            _i2c.begin(INA22X_SCL_PIN, INA22X_SDA_PIN, 5);
            _i2c.busClear();
            uint8_t swapChip = 0;
            uint8_t swapAddr = detectInaOnCurrentPins(swapChip);
            if (swapAddr != 0) {
                _addr = swapAddr;
                _chipType = swapChip;
                _pinsSwapped = true;
                USB_OUT.printf("[INA22x] Found %s at 0x%02X with SWAPPED pins (SDA=%u, SCL=%u)\n",
                               chipName(), _addr, _i2c.sdaPin(), _i2c.sclPin());
            } else {
                _i2c.begin(INA22X_SDA_PIN, INA22X_SCL_PIN, 5);
            }
        }

        if (_addr == 0) {
            _ready = false;
            t.inaReady = false;
            t.inaChipType = 0;
            USB_OUT.printf("[INA22x] No INA226/INA228 ACK on SDA=%d / SCL=%d (Idle: IO6=%s, IO7=%s)\n",
                           INA22X_SDA_PIN, INA22X_SCL_PIN,
                           _sdaIdleHigh ? "HIGH" : "LOW", _sclIdleHigh ? "HIGH" : "LOW");
            return false;
        }

        if (_chipType == 2) {
            // TI INA228 (20-bit, 85V): +/-163.84mV range, Continuous Bus+Shunt+Temp, 1.052ms, 16x avg
            _i2c.writeReg16(_addr, 0x00, 0x0000);
            _i2c.writeReg16(_addr, 0x01, 0xFB6A);
        } else {
            // TI INA226 (16-bit, 36V): 16x avg, 1.1ms Vbus, 1.1ms Vshunt, Continuous
            _i2c.writeReg16(_addr, 0x00, 0x4527);
        }
        delay(20);

        _ready = true;
        _lastIntegMs = millis();
        t.inaReady = true;
        t.inaAddr = _addr;
        t.inaChipType = _chipType;
        t.inaPinsSwapped = _pinsSwapped;

        sampleNow(t);
        USB_OUT.printf("[%s] Ready at 0x%02X (SDA=%u, SCL=%u) | 48V Bus=%.3fV | Shunt=%.3fmV | I=%.3fA | P=%.2fW\n",
                       chipName(), _addr, _i2c.sdaPin(), _i2c.sclPin(),
                       t.inaBusV, t.inaShuntMv, t.inaCurrentA, t.inaPowerW);
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
        if (now - _lastSampleMs >= 50) {
            _lastSampleMs = now;
            if (!sampleNow(t)) {
                if (++_errCount >= 4) { _ready = false; t.inaReady = false; _errCount = 0; }
            } else {
                _errCount = 0;
            }
        }
    }

    const char* chipName() const {
        return (_chipType == 2) ? "INA228" : ((_chipType == 1) ? "INA226" : "NONE");
    }

    const Ina48vCalibration& getCalibration() const { return _cal; }

    void zeroCurrentOffset(KartTelemetry &t) {
        sampleNow(t);
        float rawI = computeUnbiasedCurrentA();
        _cal.currOffsetA = -(_cal.currScale * rawI);
        _cal.calCount++;
        saveCalibration();
        recomputeDerived(t, 0.0f);
    }

    void setShuntAndDivider(float shuntOhms, float dividerRatio, bool invertCurr, KartTelemetry &t) {
        if (shuntOhms >= 0.0001f && shuntOhms <= 10.0f) _cal.shuntOhms = shuntOhms;
        if (dividerRatio >= 0.5f && dividerRatio <= 20.0f) _cal.vbusDividerRatio = dividerRatio;
        _cal.invertCurrent = invertCurr;
        _cal.calCount++;
        saveCalibration();
        recomputeDerived(t, 0.0f);
    }

    void applyMultimeterReference(float refBusV, float refCurrentA, KartTelemetry &t) {
        sampleNow(t);
        float scaledRawV = _rawBusV * _cal.vbusDividerRatio;
        if (!isnan(refBusV) && refBusV > 1.0f && scaledRawV > 0.5f) {
            _cal.vbusScale   = refBusV / scaledRawV;
            _cal.vbusOffsetV = 0.0f;
        }
        if (!isnan(refCurrentA) && fabs(refCurrentA) > 0.05f) {
            float rawI = computeUnbiasedCurrentA();
            if (fabs(rawI) > 0.01f) {
                _cal.currScale = (refCurrentA - _cal.currOffsetA) / rawI;
            }
        }
        _cal.calCount++;
        saveCalibration();
        recomputeDerived(t, 0.0f);
    }

    void resetEnergy(KartTelemetry &t) {
        _energyWh = 0.0;
        _chargeAh = 0.0;
        t.inaEnergyWh = 0.0f;
        t.inaChargeAh = 0.0f;
    }

    void resetCalibration(KartTelemetry &t) {
        _cal = Ina48vCalibration{};
        saveCalibration();
        recomputeDerived(t, 0.0f);
    }

    String buildCalibrationJson(const KartTelemetry &t) const {
        char buf[430];
        snprintf(buf, sizeof(buf),
                 "{\"ready\":%s,\"chip\":\"%s\",\"addr\":\"0x%02X\",\"sda_pin\":%u,\"scl_pin\":%u,"
                 "\"pins_swapped\":%s,\"shunt_ohms\":%.6f,\"vbus_divider\":%.4f,"
                 "\"vbus_scale\":%.5f,\"vbus_offset_v\":%.4f,\"curr_scale\":%.5f,\"curr_offset_a\":%.4f,"
                 "\"invert_curr\":%s,\"bus_v\":%.3f,\"shunt_mv\":%.3f,\"current_a\":%.3f,\"power_w\":%.2f,\"energy_wh\":%.3f}",
                 _ready ? "true" : "false", chipName(), _addr, _i2c.sdaPin(), _i2c.sclPin(),
                 _pinsSwapped ? "true" : "false", _cal.shuntOhms, _cal.vbusDividerRatio,
                 _cal.vbusScale, _cal.vbusOffsetV, _cal.currScale, _cal.currOffsetA,
                 _cal.invertCurrent ? "true" : "false",
                 t.inaBusV, t.inaShuntMv, t.inaCurrentA, t.inaPowerW, t.inaEnergyWh);
        return String(buf);
    }

private:
    InaSoftI2C _i2c;
    Ina48vCalibration _cal;
    uint8_t _addr = 0;
    uint8_t _chipType = 0; // 1=INA226, 2=INA228
    bool _ready = false;
    bool _pinsSwapped = false;
    bool _sdaIdleHigh = false;
    bool _sclIdleHigh = false;
    uint8_t _errCount = 0;
    float _rawBusV = 0.0f;
    float _rawShuntMv = 0.0f;
    double _energyWh = 0.0;
    double _chargeAh = 0.0;
    unsigned long _lastIntegMs = 0;
    unsigned long _lastSampleMs = 0;
    unsigned long _lastRetryMs = 0;

    uint8_t detectInaOnCurrentPins(uint8_t &chipOut) {
        for (uint8_t a = 0x40; a <= 0x4F; a++) {
            if (!_i2c.probe(a)) continue;

            // 1. Check TI INA228 Manufacturer (0x3E == 0x5449 "TI") & Device ID (0x3F >> 4 == 0x228)
            uint16_t mfr228 = 0, dev228 = 0;
            if (_i2c.readReg16(a, 0x3E, mfr228) && _i2c.readReg16(a, 0x3F, dev228)) {
                if (mfr228 == 0x5449 && ((dev228 >> 4) == 0x228 || (dev228 >> 4) == 0x229)) {
                    chipOut = 2; // INA228 (20-bit, 85V)
                    return a;
                }
            }

            // 2. Check TI INA226 Manufacturer (0xFE == 0x5449 "TI") & Die ID (0xFF == 0x2260)
            uint16_t mfr226 = 0, dev226 = 0;
            if (_i2c.readReg16(a, 0xFE, mfr226) && _i2c.readReg16(a, 0xFF, dev226)) {
                if (mfr226 == 0x5449 || (dev226 & 0xFFF0) == 0x2260) {
                    chipOut = 1; // INA226 (16-bit, 36V)
                    return a;
                }
            }

            // 3. Fallback compatible INA226 clone check
            uint16_t cfg = 0;
            if (_i2c.readReg16(a, 0x00, cfg) && cfg != 0xFFFF && cfg != 0x0000) {
                chipOut = 1;
                return a;
            }
        }
        return 0;
    }

    void loadCalibration() {
        Preferences p;
        if (p.begin("ina48_cal", true)) {
            _cal.shuntOhms        = p.getFloat("shunt", INA22X_DEFAULT_SHUNT_OHM);
            _cal.vbusDividerRatio = p.getFloat("vdiv",  1.0000f);
            _cal.vbusScale        = p.getFloat("vscl",  1.0000f);
            _cal.vbusOffsetV      = p.getFloat("voff",  0.0000f);
            _cal.currScale        = p.getFloat("iscl",  1.0000f);
            _cal.currOffsetA      = p.getFloat("ioff",  0.0000f);
            _cal.invertCurrent    = p.getBool("inv",    false);
            _cal.calCount         = p.getUInt("cnt",    0);
            p.end();
        }
    }

    void saveCalibration() {
        Preferences p;
        if (p.begin("ina48_cal", false)) {
            p.putFloat("shunt", _cal.shuntOhms);
            p.putFloat("vdiv",  _cal.vbusDividerRatio);
            p.putFloat("vscl",  _cal.vbusScale);
            p.putFloat("voff",  _cal.vbusOffsetV);
            p.putFloat("iscl",  _cal.currScale);
            p.putFloat("ioff",  _cal.currOffsetA);
            p.putBool("inv",    _cal.invertCurrent);
            p.putUInt("cnt",    _cal.calCount);
            p.end();
        }
    }

    float computeUnbiasedCurrentA() const {
        float r = (_cal.shuntOhms > 0.00005f) ? _cal.shuntOhms : 0.100f;
        float i = (_rawShuntMv / 1000.0f) / r;
        return _cal.invertCurrent ? -i : i;
    }

    bool sampleNow(KartTelemetry &t) {
        if (!_ready) return false;

        if (_chipType == 2) {
            uint8_t sBuf[3] = {0}, bBuf[3] = {0};
            if (!_i2c.readRegBytes(_addr, 0x04, sBuf, 3) || !_i2c.readRegBytes(_addr, 0x05, bBuf, 3)) {
                return false;
            }
            int32_t sRaw20 = ((int32_t)(((uint32_t)sBuf[0] << 24) | ((uint32_t)sBuf[1] << 16) | ((uint32_t)sBuf[2] << 8))) >> 12;
            int32_t bRaw20 = ((int32_t)(((uint32_t)bBuf[0] << 24) | ((uint32_t)bBuf[1] << 16) | ((uint32_t)bBuf[2] << 8))) >> 12;
            _rawShuntMv = (float)sRaw20 * 0.0003125f;
            _rawBusV    = (float)bRaw20 * 0.0001953125f;

            uint16_t rawT = 0;
            if (_i2c.readReg16(_addr, 0x06, rawT)) {
                t.inaDieTempC = (float)((int16_t)rawT) * 0.0078125f;
            }
        } else {
            uint16_t s16 = 0, b16 = 0;
            if (!_i2c.readReg16(_addr, 0x01, s16) || !_i2c.readReg16(_addr, 0x02, b16)) {
                return false;
            }
            _rawShuntMv = (float)((int16_t)s16) * 0.0025f;
            _rawBusV    = (float)b16 * 0.00125f;
        }

        unsigned long now = millis();
        float dtSec = (_lastIntegMs > 0 && now > _lastIntegMs) ? ((float)(now - _lastIntegMs) / 1000.0f) : 0.0f;
        _lastIntegMs = now;
        if (dtSec > 2.0f) dtSec = 0.0f;

        recomputeDerived(t, dtSec);
        return true;
    }

    void recomputeDerived(KartTelemetry &t, float dtSec) {
        t.inaRawBusV = _rawBusV;
        t.inaShuntMv = _rawShuntMv;

        float vCal = (_cal.vbusScale * (_rawBusV * _cal.vbusDividerRatio)) + _cal.vbusOffsetV;
        if (vCal < 0.0f) vCal = 0.0f;

        float iCal = (_cal.currScale * computeUnbiasedCurrentA()) + _cal.currOffsetA;
        float pCal = vCal * iCal;

        t.inaBusV     = vCal;
        t.inaCurrentA = iCal;
        t.inaPowerW   = pCal;

        if (dtSec > 0.0f) {
            _energyWh += (double)pCal * ((double)dtSec / 3600.0);
            _chargeAh += (double)iCal * ((double)dtSec / 3600.0);
            t.inaEnergyWh = (float)_energyWh;
            t.inaChargeAh = (float)_chargeAh;
        }
    }
};
#endif
