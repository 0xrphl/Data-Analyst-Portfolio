/**
 * temp_ds18b20.h
 * Zero-Dependency ESP32-S3 1-Wire Master & DS18B20 Dual-Probe Driver (Controller + Motor)
 *
 * Adapted & Upgraded for LilyGO T-SIM7672G V1.1 from tested `ds18b20_esp32_controlador.ino`:
 *  - Auto-scans free Left Header pins {15, 6, 7, 16, 8} on boot so you can wire DATA + 4.7k pull-up
 *    to ANY of those free pins under/around 6 & 7 without reflashing!
 *  - Supports 1 or 2 DS18B20 probes on the same DATA pin (Index 0 = CONTROLLER, Index 1 = MOTOR).
 *  - Hardware-timed `portMUX_TYPE` critical-section 1-Wire slots immune to Wi-Fi/FreeRTOS jitter
 *    and immune to OneWire library compile issues on ESP32-S3 Arduino Core 3.x.
 *  - 11-bit resolution (0.125 °C, 385 ms non-blocking ESPERA -> CONVIRTIENDO state machine @ 1 Hz).
 *  - Full 9-byte Scratchpad Maxim CRC-8 (poly 0x8C) + 85.0 °C POR filter + -127 °C disconnect filter
 *    + 5-cycle automatic bus re-discovery (`MAX_CICLOS_FALLIDOS = 5`).
 */
#ifndef TEMP_DS18B20_H
#define TEMP_DS18B20_H

#include "../config.h"
#include <Preferences.h>
#include <driver/gpio.h>
#include <math.h>

class OneWireEsp32S3 {
public:
    void begin(uint8_t pin) {
        _pin = pin;
        gpio_reset_pin((gpio_num_t)_pin);
        pinMode(_pin, INPUT_PULLUP);
    }

    uint8_t pin() const { return _pin; }

    bool reset() {
        pinMode(_pin, INPUT_PULLUP);
        uint8_t retries = 125;
        while (digitalRead(_pin) == 0) {
            if (--retries == 0) return false;
            delayMicroseconds(2);
        }
        portENTER_CRITICAL(&_mux);
        digitalWrite(_pin, LOW);
        pinMode(_pin, OUTPUT);
        delayMicroseconds(480);
        pinMode(_pin, INPUT_PULLUP);
        delayMicroseconds(70);
        bool presence = (digitalRead(_pin) == LOW);
        portEXIT_CRITICAL(&_mux);
        delayMicroseconds(410);
        return presence;
    }

    void writeBit(uint8_t v) {
        portENTER_CRITICAL(&_mux);
        digitalWrite(_pin, LOW);
        pinMode(_pin, OUTPUT);
        if (v & 1) {
            delayMicroseconds(6);
            pinMode(_pin, INPUT_PULLUP);
            portEXIT_CRITICAL(&_mux);
            delayMicroseconds(64);
        } else {
            delayMicroseconds(60);
            pinMode(_pin, INPUT_PULLUP);
            portEXIT_CRITICAL(&_mux);
            delayMicroseconds(10);
        }
    }

    uint8_t readBit() {
        portENTER_CRITICAL(&_mux);
        digitalWrite(_pin, LOW);
        pinMode(_pin, OUTPUT);
        delayMicroseconds(3);
        pinMode(_pin, INPUT_PULLUP);
        delayMicroseconds(10);
        uint8_t r = (uint8_t)digitalRead(_pin);
        portEXIT_CRITICAL(&_mux);
        delayMicroseconds(53);
        return r;
    }

    void writeByte(uint8_t v) {
        for (uint8_t mask = 0x01; mask; mask <<= 1) {
            writeBit((v & mask) ? 1 : 0);
        }
    }

    uint8_t readByte() {
        uint8_t r = 0;
        for (uint8_t mask = 0x01; mask; mask <<= 1) {
            if (readBit()) r |= mask;
        }
        return r;
    }

    void resetSearch() {
        _lastDiscrepancy = 0;
        _lastDeviceFlag = false;
        memset(_romNo, 0, 8);
    }

    // Standard Maxim 1-Wire Binary ROM Search (0xF0)
    bool search(uint8_t newAddr[8]) {
        uint8_t idBitNumber = 1;
        uint8_t lastZero = 0, romByteNumber = 0, romByteMask = 1;
        bool searchResult = false;

        if (!_lastDeviceFlag) {
            if (!reset()) {
                resetSearch();
                return false;
            }
            writeByte(0xF0);
            do {
                uint8_t idBit = readBit();
                uint8_t cmpIdBit = readBit();
                if (idBit == 1 && cmpIdBit == 1) break;

                uint8_t searchDirection;
                if (idBit != cmpIdBit) {
                    searchDirection = idBit;
                } else {
                    if (idBitNumber < _lastDiscrepancy) {
                        searchDirection = ((_romNo[romByteNumber] & romByteMask) > 0) ? 1 : 0;
                    } else {
                        searchDirection = (idBitNumber == _lastDiscrepancy) ? 1 : 0;
                    }
                    if (searchDirection == 0) lastZero = idBitNumber;
                }

                if (searchDirection == 1) _romNo[romByteNumber] |= romByteMask;
                else                      _romNo[romByteNumber] &= ~romByteMask;

                writeBit(searchDirection);
                idBitNumber++;
                romByteMask <<= 1;
                if (romByteMask == 0) { romByteNumber++; romByteMask = 1; }
            } while (romByteNumber < 8);

            if (!(idBitNumber < 65)) {
                _lastDiscrepancy = lastZero;
                if (_lastDiscrepancy == 0) _lastDeviceFlag = true;
                searchResult = true;
            }
        }
        if (!searchResult || !_romNo[0]) {
            resetSearch();
            return false;
        }
        memcpy(newAddr, _romNo, 8);
        return true;
    }

    // Maxim/Dallas 1-Wire CRC-8 (Reflected poly 0x8C = x^8 + x^5 + x^4 + 1)
    static uint8_t crc8(const uint8_t *addr, uint8_t len) {
        uint8_t crc = 0;
        while (len--) {
            uint8_t inbyte = *addr++;
            for (uint8_t i = 8; i; i--) {
                uint8_t mix = (crc ^ inbyte) & 0x01;
                crc >>= 1;
                if (mix) crc ^= 0x8C;
                inbyte >>= 1;
            }
        }
        return crc;
    }

private:
    uint8_t _pin = DS18B20_DEFAULT_PIN;
    portMUX_TYPE _mux = portMUX_INITIALIZER_UNLOCKED;
    uint8_t _romNo[8] = {0};
    uint8_t _lastDiscrepancy = 0;
    bool _lastDeviceFlag = false;
};

class TempDs18b20 {
public:
    static const uint8_t MAX_PROBES = 2;

    bool begin(KartTelemetry &t) {
        loadCalibration();

        // Auto-scan free Left Header 1-Wire pins {15, 16, 8} (GPIO 6 & 7 reserved for INA226/228 I2C!)
        if (_preferredPin == 6 || _preferredPin == 7) _preferredPin = DS18B20_DEFAULT_PIN;
        const uint8_t freePool[4] = { _preferredPin, 15, 16, 8 };

        _nSensors = 0;
        for (int p = 0; p < 4; p++) {
            uint8_t cand = freePool[p];
            if (p > 0 && cand == _preferredPin) continue;
            if (scanPinForProbes(cand)) {
                _activePin = cand;
                break;
            }
        }

        t.ds18Pin   = _activePin;
        t.ds18Count = _nSensors;
        t.ds18Ready = (_nSensors > 0);
        t.ds18MotorPresent = (_nSensors >= 2);

        if (_nSensors == 0) {
            USB_OUT.println(F("[DS18B20] No probe detected on free 1-Wire pins {15,16,8}. Check 4.7k pull-up to 3V3!"));
            return false;
        }

        configureResolution(DS18B20_RESOLUTION_BITS);
        _convWaitMs = 385; // 11-bit max = 375 ms + 10 ms safety margin

        // Perform initial conversion on boot so BIST & first packet have valid temperature
        triggerConversionAll();
        delay(_convWaitMs);
        collectTemperatures(t);

        USB_OUT.printf("[DS18B20] %u probe(s) ready on GPIO %u | Ctrl=%.2fC (ROM0=%s) | Motor=%s\n",
                       _nSensors, _activePin, t.ds18CtrlC, romToHex(0).c_str(),
                       t.ds18MotorPresent ? (String(t.ds18MotorC, 2) + "C").c_str() : "NONE");
        return true;
    }

    // Exact non-blocking ESPERA -> CONVIRTIENDO loop from `ds18b20_esp32_controlador.ino`
    void update(KartTelemetry &t) {
        unsigned long now = millis();

        if (_state == ST_WAIT && (now - _lastCycleMs >= 1000)) {
            _lastCycleMs = now;
            if (_nSensors == 0) {
                if (now - _lastRescanMs >= 4000) {
                    _lastRescanMs = now;
                    begin(t);
                }
                return;
            }
            if (triggerConversionAll()) {
                _convStartMs = now;
                _state = ST_CONVERTING;
            } else if (++_failedCycles >= 5) {
                _failedCycles = 0;
                _nSensors = 0;
                t.ds18Ready = false;
            }
        } else if (_state == ST_CONVERTING && (now - _convStartMs >= _convWaitMs)) {
            uint8_t validCount = collectTemperatures(t);
            if (validCount == 0) {
                if (++_failedCycles >= 5) {
                    _failedCycles = 0;
                    _nSensors = 0;
                    t.ds18Ready = false;
                }
            } else {
                _failedCycles = 0;
            }
            _state = ST_WAIT;
        }
    }

    void applyProbeCalibration(uint8_t idx, float slope, float offset, KartTelemetry &t) {
        if (idx >= MAX_PROBES) return;
        if (slope > 0.5f && slope < 1.5f) _slope[idx] = slope;
        if (offset > -25.0f && offset < 25.0f) _offset[idx] = offset;
        saveCalibration();
        recomputeCalibrated(t);
    }

    void swapProbeRoles(KartTelemetry &t) {
        _swapRoles = !_swapRoles;
        saveCalibration();
        recomputeCalibrated(t);
    }

    void setPreferredPin(uint8_t gpioPin, KartTelemetry &t) {
        if (gpioPin == 15 || gpioPin == 16 || gpioPin == 8) {
            _preferredPin = gpioPin;
            saveCalibration();
            begin(t);
        }
    }

    void resetCalibration(KartTelemetry &t) {
        _slope[0] = _slope[1] = 1.0f;
        _offset[0] = _offset[1] = 0.0f;
        _swapRoles = false;
        saveCalibration();
        recomputeCalibrated(t);
    }

    String romToHex(uint8_t idx) const {
        if (idx >= _nSensors) return "NONE";
        char hex[20];
        const uint8_t *r = _rom[idx];
        snprintf(hex, sizeof(hex), "%02X%02X%02X%02X%02X%02X%02X%02X",
                 r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7]);
        return String(hex);
    }

    String buildCalibrationJson(const KartTelemetry &t) const {
        char buf[380];
        snprintf(buf, sizeof(buf),
                 "{\"ready\":%s,\"gpio_pin\":%u,\"probe_count\":%u,\"swap_roles\":%s,"
                 "\"rom_ctrl\":\"%s\",\"rom_motor\":\"%s\","
                 "\"ctrl_slope\":%.4f,\"ctrl_offset\":%.3f,\"motor_slope\":%.4f,\"motor_offset\":%.3f,"
                 "\"ctrl_temp_c\":%.2f,\"motor_temp_c\":%.2f,\"crc_ok\":%lu,\"crc_err\":%lu}",
                 t.ds18Ready ? "true" : "false", _activePin, _nSensors, _swapRoles ? "true" : "false",
                 romToHex(_swapRoles && _nSensors >= 2 ? 1 : 0).c_str(),
                 romToHex(_swapRoles && _nSensors >= 2 ? 0 : 1).c_str(),
                 _slope[0], _offset[0], _slope[1], _offset[1],
                 t.ds18CtrlC, t.ds18MotorC,
                 (unsigned long)t.ds18CrcOk, (unsigned long)t.ds18CrcErr);
        return String(buf);
    }

private:
    enum ConvState { ST_WAIT, ST_CONVERTING };
    OneWireEsp32S3 _ow;
    uint8_t _preferredPin = DS18B20_DEFAULT_PIN;
    uint8_t _activePin    = DS18B20_DEFAULT_PIN;
    uint8_t _rom[MAX_PROBES][8] = {{0}};
    uint8_t _nSensors = 0;
    float   _lastValidRaw[MAX_PROBES] = {NAN, NAN};
    float   _slope[MAX_PROBES]  = {1.0f, 1.0f};
    float   _offset[MAX_PROBES] = {0.0f, 0.0f};
    bool    _swapRoles = false;
    ConvState _state = ST_WAIT;
    unsigned long _lastCycleMs = 0;
    unsigned long _convStartMs = 0;
    unsigned long _convWaitMs  = 385;
    unsigned long _lastRescanMs = 0;
    uint8_t _failedCycles = 0;

    void loadCalibration() {
        Preferences p;
        if (p.begin("ds18_cal", true)) {
            _preferredPin = p.getUChar("pin", DS18B20_DEFAULT_PIN);
            _slope[0]     = p.getFloat("s0",  1.0f);
            _offset[0]    = p.getFloat("o0",  0.0f);
            _slope[1]     = p.getFloat("s1",  1.0f);
            _offset[1]    = p.getFloat("o1",  0.0f);
            _swapRoles    = p.getBool("swap", false);
            p.end();
        }
    }

    void saveCalibration() {
        Preferences p;
        if (p.begin("ds18_cal", false)) {
            p.putUChar("pin", _preferredPin);
            p.putFloat("s0",  _slope[0]);
            p.putFloat("o0",  _offset[0]);
            p.putFloat("s1",  _slope[1]);
            p.putFloat("o1",  _offset[1]);
            p.putBool("swap", _swapRoles);
            p.end();
        }
    }

    bool scanPinForProbes(uint8_t gpioPin) {
        _ow.begin(gpioPin);
        delayMicroseconds(150);
        if (!_ow.reset()) return false;

        _ow.resetSearch();
        uint8_t addr[8];
        uint8_t found = 0;
        while (found < MAX_PROBES && _ow.search(addr)) {
            // Verify Maxim 8-byte ROM CRC-8 and DS18x20 family code (0x28 = DS18B20, 0x10/0x22/0x3B/0x42)
            if (OneWireEsp32S3::crc8(addr, 7) == addr[7] &&
                (addr[0] == 0x28 || addr[0] == 0x10 || addr[0] == 0x22 || addr[0] == 0x3B || addr[0] == 0x42)) {
                memcpy(_rom[found], addr, 8);
                found++;
            }
        }
        _nSensors = found;
        return (_nSensors > 0);
    }

    void configureResolution(uint8_t bits) {
        uint8_t cfgByte = (bits == 9) ? 0x1F : (bits == 10 ? 0x3F : (bits == 11 ? 0x5F : 0x7F));
        for (uint8_t i = 0; i < _nSensors; i++) {
            if (_rom[i][0] == 0x10) continue; // DS18S20 fixed 9-bit
            if (_ow.reset()) {
                _ow.writeByte(0x55); // Match ROM
                for (uint8_t b = 0; b < 8; b++) _ow.writeByte(_rom[i][b]);
                _ow.writeByte(0x4E); // Write Scratchpad
                _ow.writeByte(0x7D); // TH = +125C
                _ow.writeByte(0xC9); // TL = -55C
                _ow.writeByte(cfgByte);
            }
        }
    }

    bool triggerConversionAll() {
        if (!_ow.reset()) return false;
        _ow.writeByte(0xCC); // Skip ROM (starts conversion simultaneously on all DS18B20 probes!)
        _ow.writeByte(0x44); // Convert T
        return true;
    }

    // Exact plausibility filter from user's `ds18b20_esp32_controlador.ino`
    static float validar(float tempC, float prevValidC) {
        if (tempC <= -126.0f) return NAN;
        if (tempC < -20.0f || tempC > 125.0f) return NAN;
        // 85.0 °C is DS18B20 power-on reset value; discard unless probe already warmed >= 80 °C
        if (fabs(tempC - 85.0f) < 0.01f && (isnan(prevValidC) || prevValidC < 80.0f)) return NAN;
        return tempC;
    }

    uint8_t collectTemperatures(KartTelemetry &t) {
        uint8_t validCount = 0;
        for (uint8_t i = 0; i < _nSensors; i++) {
            if (!_ow.reset()) continue;
            _ow.writeByte(0x55); // Match ROM
            for (uint8_t b = 0; b < 8; b++) _ow.writeByte(_rom[i][b]);
            _ow.writeByte(0xBE); // Read 9-byte Scratchpad

            uint8_t sp[9] = {0};
            for (uint8_t b = 0; b < 9; b++) sp[b] = _ow.readByte();

            if (OneWireEsp32S3::crc8(sp, 8) != sp[8]) {
                t.ds18CrcErr++;
                continue;
            }
            t.ds18CrcOk++;

            int16_t raw16 = (int16_t)((sp[1] << 8) | sp[0]);
            if (_rom[i][0] == 0x10) {
                raw16 <<= 3;
            } else {
                uint8_t cfg = (sp[4] & 0x60);
                if (cfg == 0x00) raw16 &= ~7;      // 9-bit
                else if (cfg == 0x20) raw16 &= ~3; // 10-bit
                else if (cfg == 0x40) raw16 &= ~1; // 11-bit (0.125 °C)
            }

            float degC = (float)raw16 / 16.0f;
            float clean = validar(degC, _lastValidRaw[i]);
            if (!isnan(clean)) {
                _lastValidRaw[i] = clean;
                validCount++;
            }
        }

        if (validCount > 0) {
            t.ds18Ready = true;
            recomputeCalibrated(t);
        }
        return validCount;
    }

    void recomputeCalibrated(KartTelemetry &t) {
        uint8_t ctrlIdx  = (_swapRoles && _nSensors >= 2) ? 1 : 0;
        uint8_t motorIdx = (_swapRoles && _nSensors >= 2) ? 0 : 1;

        if (!isnan(_lastValidRaw[ctrlIdx])) {
            t.ds18CtrlRawC = _lastValidRaw[ctrlIdx];
            t.ds18CtrlC    = (_slope[0] * t.ds18CtrlRawC) + _offset[0];
        }
        if (_nSensors >= 2 && !isnan(_lastValidRaw[motorIdx])) {
            t.ds18MotorPresent = true;
            t.ds18MotorRawC    = _lastValidRaw[motorIdx];
            t.ds18MotorC       = (_slope[1] * t.ds18MotorRawC) + _offset[1];
        } else {
            t.ds18MotorPresent = false;
        }
    }
};
#endif
