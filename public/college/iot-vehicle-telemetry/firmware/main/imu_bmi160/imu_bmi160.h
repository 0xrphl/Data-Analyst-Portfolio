/**
 * imu_bmi160.h
 * Bosch BMI160 6-Axis Inertial Measurement Unit Driver & Kart Dynamics Engine
 * Features:
 *  - 6-DOF Gyroscope (deg/s) + Accelerometer (g) at 400 kHz I2C
 *  - Precision Internal Die Temperature (°C)
 *  - Complementary Attitude Fusion (Roll, Pitch, Yaw)
 *  - Peak G-Force Window Detector & Chassis Vibration RMS Analyzer
 */
#ifndef IMU_BMI160_H
#define IMU_BMI160_H

#include "../config.h"
#include <Wire.h>
#include <Preferences.h>

#define BMI160_ADDR_LOW         0x68
#define BMI160_ADDR_HIGH        0x69
#define BMI160_REG_CHIP_ID      0x00
#define BMI160_REG_PMU_STATUS   0x03
#define BMI160_REG_GYR_X_LSB    0x0C
#define BMI160_REG_ACC_X_LSB    0x12
#define BMI160_REG_TEMP_LSB     0x20
#define BMI160_REG_ACC_CONF     0x40
#define BMI160_REG_ACC_RANGE    0x41
#define BMI160_REG_GYR_CONF     0x42
#define BMI160_REG_GYR_RANGE    0x43
#define BMI160_REG_CMD          0x7E

#define BMI160_CHIP_ID_VAL      0xD8
#define BMI160_CMD_SOFT_RESET   0xB6
#define BMI160_CMD_ACC_NORMAL   0x11
#define BMI160_CMD_GYR_NORMAL   0x15

#define ACCEL_LSB_PER_G         16384.0f  // +/- 2g range
#define GYRO_LSB_PER_DPS        131.2f    // +/- 250 deg/s range

class ImuBmi160 {
public:
    bool begin() {
        loadCalibrationFromNvs();
        if (!_wireInitialized) {
            Wire.begin(BMI160_SDA_PIN, BMI160_SCL_PIN, I2C_FREQ_HZ);
            _wireInitialized = true;
        }
        _addr = scanAddress();
        if (_addr == 0) {
            _ready = false;
            return false;
        }

        writeReg(BMI160_REG_CMD, BMI160_CMD_SOFT_RESET);
        delay(100);
        writeReg(BMI160_REG_CMD, BMI160_CMD_ACC_NORMAL);
        delay(50);
        writeReg(BMI160_REG_CMD, BMI160_CMD_GYR_NORMAL);
        delay(100);

        // 100Hz ODR, Normal Bandwidth (0x28); Accel +/-2g (0x03); Gyro +/-250 dps (0x03)
        writeReg(BMI160_REG_ACC_CONF, 0x28);
        writeReg(BMI160_REG_ACC_RANGE, 0x03);
        writeReg(BMI160_REG_GYR_CONF, 0x28);
        writeReg(BMI160_REG_GYR_RANGE, 0x03);
        delay(20);

        _lastMicros = micros();
        _ready = true;
        USB_OUT.printf("[BMI160] Ready at 0x%02X on SDA=%d, SCL=%d\n", _addr, BMI160_SDA_PIN, BMI160_SCL_PIN);
        return true;
    }

    bool update(KartTelemetry &t) {
        if (!_ready) {
            unsigned long now = millis();
            if (now - _lastRetryMs < 2000) return false;
            _lastRetryMs = now;
            _ready = begin();
            if (!_ready) return false;
        }

        uint8_t raw[12] = {0};
        if (!readRegs(BMI160_REG_GYR_X_LSB, raw, 12)) {
            _ready = false;
            return false;
        }

        int16_t rawGx = (int16_t)((raw[1] << 8) | raw[0]);
        int16_t rawGy = (int16_t)((raw[3] << 8) | raw[2]);
        int16_t rawGz = (int16_t)((raw[5] << 8) | raw[4]);
        int16_t rawAx = (int16_t)((raw[7] << 8) | raw[6]);
        int16_t rawAy = (int16_t)((raw[9] << 8) | raw[8]);
        int16_t rawAz = (int16_t)((raw[11] << 8) | raw[10]);

        t.ax = (((float)rawAx / ACCEL_LSB_PER_G) - _accBiasX) * _accScaleX;
        t.ay = (((float)rawAy / ACCEL_LSB_PER_G) - _accBiasY) * _accScaleY;
        t.az = (((float)rawAz / ACCEL_LSB_PER_G) - _accBiasZ) * _accScaleZ;

        // Read Die Temperature (0x20..0x21) before thermal gyro compensation
        uint8_t tBuf[2] = {0};
        if (readRegs(BMI160_REG_TEMP_LSB, tBuf, 2)) {
            int16_t rawTemp = (int16_t)((tBuf[1] << 8) | tBuf[0]);
            t.gyroTempC = 23.0f + ((float)rawTemp / 512.0f) + _tempOffsetC;
        }

        float dTemp = t.gyroTempC - _calRefTempC;
        t.gx = ((float)rawGx / GYRO_LSB_PER_DPS) - (_gyrBiasX + _gyrTempSlopeZ * 0.0f * dTemp);
        t.gy = ((float)rawGy / GYRO_LSB_PER_DPS) - _gyrBiasY;
        t.gz = ((float)rawGz / GYRO_LSB_PER_DPS) - (_gyrBiasZ + _gyrTempSlopeZ * dTemp);

        // Sensor Fusion (Complementary Filter)
        unsigned long nowMicros = micros();
        float dt = (float)(nowMicros - _lastMicros) / 1000000.0f;
        _lastMicros = nowMicros;
        if (dt <= 0.0f || dt > 0.5f) dt = 0.033f;

        float accRoll  = atan2(t.ay, t.az) * 180.0f / PI;
        float accPitch = atan2(-t.ax, sqrt(t.ay * t.ay + t.az * t.az)) * 180.0f / PI;

        _roll  = 0.96f * (_roll + t.gx * dt) + 0.04f * accRoll;
        _pitch = 0.96f * (_pitch + t.gy * dt) + 0.04f * accPitch;
        // Deadband on calibrated Gz to prevent stationary yaw drift
        if (fabs(t.gz) > 0.35f) {
            _yaw += t.gz * dt;
        }

        t.roll  = _roll - _tareRoll;
        t.pitch = _pitch - _tarePitch;
        t.yaw   = _yaw - _tareYaw;

        // Total G-Force & Chassis Vibration RMS
        float totalG = sqrt(t.ax * t.ax + t.ay * t.ay + t.az * t.az);
        if (totalG > _windowPeakG) _windowPeakG = totalG;
        t.peakG = _windowPeakG;

        float dynG = fabs(totalG - 1.0f);
        _vibSqSum += dynG * dynG;
        _vibSamples++;
        if (_vibSamples >= 25) {
            t.vibRms = sqrt(_vibSqSum / (float)_vibSamples);
            _vibSqSum = 0.0f;
            _vibSamples = 0;
        }

        return true;
    }

    void resetWindowPeak(KartTelemetry &t) {
        _windowPeakG = sqrt(t.ax * t.ax + t.ay * t.ay + t.az * t.az);
    }

    void loadCalibrationFromNvs() {
        Preferences p;
        if (p.begin("bmi160_cal", true)) {
            _gyrBiasX      = p.getFloat("gbx", 0.0f);
            _gyrBiasY      = p.getFloat("gby", 0.0f);
            _gyrBiasZ      = p.getFloat("gbz", 0.0f);
            _accBiasX      = p.getFloat("abx", 0.0f);
            _accBiasY      = p.getFloat("aby", 0.0f);
            _accBiasZ      = p.getFloat("abz", 0.0f);
            _accScaleX     = p.getFloat("asx", 1.0f);
            _accScaleY     = p.getFloat("asy", 1.0f);
            _accScaleZ     = p.getFloat("asz", 1.0f);
            _calRefTempC   = p.getFloat("tref", 35.0f);
            _gyrTempSlopeZ = p.getFloat("gtsz", 0.0f);
            _tempOffsetC   = p.getFloat("toff", 0.0f);
            p.end();
        }
    }

    void setCalibrationParams(float gbx, float gby, float gbz,
                              float abx, float aby, float abz,
                              float asx, float asy, float asz,
                              float calTempC, float gtsz = 0.0f, float toff = 0.0f) {
        _gyrBiasX = gbx; _gyrBiasY = gby; _gyrBiasZ = gbz;
        _accBiasX = abx; _accBiasY = aby; _accBiasZ = abz;
        _accScaleX = asx; _accScaleY = asy; _accScaleZ = asz;
        _calRefTempC = calTempC; _gyrTempSlopeZ = gtsz; _tempOffsetC = toff;

        Preferences p;
        if (p.begin("bmi160_cal", false)) {
            p.putFloat("gbx", gbx); p.putFloat("gby", gby); p.putFloat("gbz", gbz);
            p.putFloat("abx", abx); p.putFloat("aby", aby); p.putFloat("abz", abz);
            p.putFloat("asx", asx); p.putFloat("asy", asy); p.putFloat("asz", asz);
            p.putFloat("tref", calTempC); p.putFloat("gtsz", gtsz); p.putFloat("toff", toff);
            p.end();
        }
    }

    void tareAttitude() {
        _tareRoll  = _roll;
        _tarePitch = _pitch;
        _tareYaw   = _yaw;
    }

    void resetCalibration() {
        setCalibrationParams(0,0,0, 0,0,0, 1,1,1, 35.0f, 0.0f, 0.0f);
        _tareRoll = _tarePitch = _tareYaw = 0.0f;
    }

    bool readRawSample(float &axG, float &ayG, float &azG, float &gxDps, float &gyDps, float &gzDps) {
        if (!_ready) return false;
        uint8_t raw[12] = {0};
        if (!readRegs(BMI160_REG_GYR_X_LSB, raw, 12)) return false;
        gxDps = (float)((int16_t)((raw[1] << 8) | raw[0])) / GYRO_LSB_PER_DPS;
        gyDps = (float)((int16_t)((raw[3] << 8) | raw[2])) / GYRO_LSB_PER_DPS;
        gzDps = (float)((int16_t)((raw[5] << 8) | raw[4])) / GYRO_LSB_PER_DPS;
        axG   = (float)((int16_t)((raw[7] << 8) | raw[6])) / ACCEL_LSB_PER_G;
        ayG   = (float)((int16_t)((raw[9] << 8) | raw[8])) / ACCEL_LSB_PER_G;
        azG   = (float)((int16_t)((raw[11] << 8) | raw[10])) / ACCEL_LSB_PER_G;
        return true;
    }

    String buildCalibrationJson() const {
        char buf[340];
        snprintf(buf, sizeof(buf),
                 "{\"ready\":%s,\"addr\":\"0x%02X\",\"gyr_bias\":[%.3f,%.3f,%.3f],"
                 "\"acc_bias\":[%.4f,%.4f,%.4f],\"acc_scale\":[%.4f,%.4f,%.4f],"
                 "\"ref_temp_c\":%.1f,\"gyr_temp_slope_z\":%.4f,\"tare\":[%.2f,%.2f,%.2f]}",
                 _ready ? "true" : "false", _addr, _gyrBiasX, _gyrBiasY, _gyrBiasZ,
                 _accBiasX, _accBiasY, _accBiasZ, _accScaleX, _accScaleY, _accScaleZ,
                 _calRefTempC, _gyrTempSlopeZ, _tareRoll, _tarePitch, _tareYaw);
        return String(buf);
    }

private:
    uint8_t _addr = 0;
    bool _ready = false;
    bool _wireInitialized = false;
    unsigned long _lastRetryMs = 0;
    float _roll = 0.0f, _pitch = 0.0f, _yaw = 0.0f;
    float _tareRoll = 0.0f, _tarePitch = 0.0f, _tareYaw = 0.0f;
    float _gyrBiasX = 0.0f, _gyrBiasY = 0.0f, _gyrBiasZ = 0.0f;
    float _accBiasX = 0.0f, _accBiasY = 0.0f, _accBiasZ = 0.0f;
    float _accScaleX = 1.0f, _accScaleY = 1.0f, _accScaleZ = 1.0f;
    float _calRefTempC = 35.0f, _gyrTempSlopeZ = 0.0f, _tempOffsetC = 0.0f;
    float _windowPeakG = 1.0f;
    float _vibSqSum = 0.0f;
    uint16_t _vibSamples = 0;
    unsigned long _lastMicros = 0;

    uint8_t scanAddress() {
        uint8_t found = 0;
        for (uint8_t a = 0x08; a < 0x78; a++) {
            Wire.beginTransmission(a);
            if (Wire.endTransmission() == 0) {
                uint8_t id = 0;
                readRegsAddr(a, BMI160_REG_CHIP_ID, &id, 1);
                USB_OUT.printf("  [I2C Scan] Device at 0x%02X (Reg 0x00 = 0x%02X)\n", a, id);
                if (a == BMI160_ADDR_LOW || a == BMI160_ADDR_HIGH || id == BMI160_CHIP_ID_VAL) {
                    found = a;
                }
            }
        }
        return found;
    }

    bool writeReg(uint8_t reg, uint8_t val) {
        Wire.beginTransmission(_addr);
        Wire.write(reg);
        Wire.write(val);
        return (Wire.endTransmission() == 0);
    }

    bool readRegsAddr(uint8_t addr, uint8_t reg, uint8_t *buf, size_t len) {
        Wire.beginTransmission(addr);
        Wire.write(reg);
        if (Wire.endTransmission(false) != 0) return false;
        if (Wire.requestFrom(addr, (uint8_t)len) != len) return false;
        for (size_t i = 0; i < len; i++) buf[i] = Wire.read();
        return true;
    }

    bool readRegs(uint8_t reg, uint8_t *buf, size_t len) {
        return readRegsAddr(_addr, reg, buf, len);
    }
};

#endif
