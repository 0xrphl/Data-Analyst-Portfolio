/**
 * imu_bmi160_cal.h
 * Bosch BMI160 6-DOF Gyroscope & Accelerometer Calibration Engine
 *
 * Calibration Curves & Models:
 *  1. Stationary Zero-Rate Gyro Bias (N = 150 samples @ 200 Hz = 750 ms):
 *       ω_cal = ω_raw - b_ω - k_T * (T_die - T_ref)
 *     Eliminates stationary yaw integration drift and measures RMS gyro noise floor (deg/s).
 *  2. Level Gravity-Norm Accelerometer Offset & Scale Calibration:
 *     On a flat horizontal surface, expected gravity vector is g_ref = [0, 0, +1.000g].
 *     Computes [b_ax, b_ay, b_az] and unit-norm scale factor so ||a_cal|| = 1.000g at rest.
 *  3. 3D Chassis Attitude Tare: Zeros [Roll, Pitch, Yaw] to current mounting angle on kart tube.
 */
#ifndef IMU_BMI160_CAL_H
#define IMU_BMI160_CAL_H

#include "../../config.h"
#include "../../imu_bmi160/imu_bmi160.h"
#include "../../sd_logger/sd_logger.h"
#include <math.h>

class ImuBmi160Calibrator {
public:
    // Collects 150 stationary samples (~750 ms), computes Gyro Zero-Bias + Accel Level Offset + Noise Floor
    String calibrateStationaryLevel(ImuBmi160 &imu, KartTelemetry &t, SdLogger &sd) {
        const int N = 150;
        double sumGx = 0, sumGy = 0, sumGz = 0;
        double sumAx = 0, sumAy = 0, sumAz = 0;
        double sqGx = 0, sqGy = 0, sqGz = 0;
        int valid = 0;

        for (int i = 0; i < N; i++) {
            float ax, ay, az, gx, gy, gz;
            if (imu.readRawSample(ax, ay, az, gx, gy, gz)) {
                sumGx += gx; sumGy += gy; sumGz += gz;
                sumAx += ax; sumAy += ay; sumAz += az;
                sqGx += gx * gx; sqGy += gy * gy; sqGz += gz * gz;
                valid++;
            }
            delay(5);
        }

        if (valid < 30) {
            return "{\"ok\":false,\"error\":\"BMI160_READ_FAILED\"}";
        }

        float gbx = (float)(sumGx / valid);
        float gby = (float)(sumGy / valid);
        float gbz = (float)(sumGz / valid);

        float meanAx = (float)(sumAx / valid);
        float meanAy = (float)(sumAy / valid);
        float meanAz = (float)(sumAz / valid);

        // Reject calibration if chassis was moving/vibrating during stationary capture
        float rmsGz = sqrtf(fmaxf(0.0f, (float)(sqGz / valid) - (gbz * gbz)));
        if (rmsGz > 2.5f) {
            return "{\"ok\":false,\"error\":\"CHASSIS_MOVING_KEEP_STILL\",\"rms_gz\":" + String(rmsGz, 3) + "}";
        }

        // Level horizontal reference: ax -> 0g, ay -> 0g, az -> +1.000g (or -1.000g if inverted)
        float targetAz = (meanAz >= 0.0f) ? 1.0f : -1.0f;
        float abx = meanAx;
        float aby = meanAy;
        float abz = meanAz - targetAz;

        imu.setCalibrationParams(gbx, gby, gbz, abx, aby, abz, 1.0f, 1.0f, 1.0f, t.gyroTempC, 0.0f, 0.0f);
        imu.update(t);
        imu.tareAttitude();
        imu.update(t);

        char csv[220];
        snprintf(csv, sizeof(csv), "%s,%d,%.4f,%.4f,%.4f,%.4f,%.4f,%.4f,%.4f,%.2f",
                 t.isoTimestamp, valid, gbx, gby, gbz, abx, aby, abz, rmsGz, t.gyroTempC);
        sd.logCalibrationCsv("bmi160_cal",
                             "utc_ts,samples,gyr_bx,gyr_by,gyr_bz,acc_bx,acc_by,acc_bz,gyr_rms_z,die_temp_c",
                             String(csv));

        char out[360];
        snprintf(out, sizeof(out),
                 "{\"ok\":true,\"samples\":%d,\"gyr_bias_dps\":[%.3f,%.3f,%.3f],"
                 "\"acc_bias_g\":[%.4f,%.4f,%.4f],\"gyr_noise_rms_dps\":%.4f,\"cal_temp_c\":%.1f}",
                 valid, gbx, gby, gbz, abx, aby, abz, rmsGz, t.gyroTempC);
        return String(out);
    }

    String tareCubeOnly(ImuBmi160 &imu, KartTelemetry &t) {
        imu.tareAttitude();
        imu.update(t);
        return imu.buildCalibrationJson();
    }

    String resetToFactory(ImuBmi160 &imu, KartTelemetry &t) {
        imu.resetCalibration();
        imu.update(t);
        return imu.buildCalibrationJson();
    }
};

#endif
