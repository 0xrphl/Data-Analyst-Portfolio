/**
 * calibration_manager.h
 * Master Multi-Sensor Calibration Orchestrator & Certificate Builder
 * Coordinates:
 *  1) calibration/rtc_ds3231_cal/rtc_ds3231_cal.h   (DS3231 TCXO Clock & Aging Curve)
 *  2) calibration/imu_bmi160_cal/imu_bmi160_cal.h   (BMI160 6-DOF Gyro Bias & Accel Level)
 *  3) calibration/gps_gnss_cal/gps_gnss_cal.h       (SIM767x GNSS CEP50/95 & UTP Benchmark)
 *  4) calibration/sht31_env_cal/sht31_env_cal.h     (Sensirion SHT31-DIS OLS & Magnus Curve)
 */
#ifndef CALIBRATION_MANAGER_H
#define CALIBRATION_MANAGER_H

#include "rtc_ds3231_cal/rtc_ds3231_cal.h"
#include "imu_bmi160_cal/imu_bmi160_cal.h"
#include "gps_gnss_cal/gps_gnss_cal.h"
#include "sht31_env_cal/sht31_env_cal.h"
#include "ds18b20_probe_cal/ds18b20_probe_cal.h"
#include "ina22x_48v_cal/ina22x_48v_cal.h"

class CalibrationManager {
public:
    RtcDs3231Calibrator    rtcCal;
    ImuBmi160Calibrator    imuCal;
    GpsGnssCalibrator      gpsCal;
    Sht31EnvCalibrator     shtCal;
    Ds18b20ProbeCalibrator ds18Cal;
    Ina22x48vCalibrator    inaCal;

    void begin() {
        gpsCal.begin();
    }

    String buildAllCalibrationsJson(const RtcDs3231 &rtc, const ImuBmi160 &imu,
                                    const EnvSht31 &sht, const TempDs18b20 &ds18,
                                    const PowerIna22x &ina, const KartTelemetry &t) const {
        String out = "{";
        out += "\"ina_48v\":" + ina.buildCalibrationJson(t) + ",";
        out += "\"sht31\":" + sht.buildCalibrationJson(t) + ",";
        out += "\"ds18b20\":" + ds18.buildCalibrationJson(t) + ",";
        out += "\"bmi160\":" + imu.buildCalibrationJson() + ",";
        out += "\"rtc_ds3231\":" + rtcCal.buildStatusJson(rtc, t) + ",";
        out += "\"gps_gnss\":" + gpsCal.buildStatusJson(t);
        out += "}";
        return out;
    }
};

#endif
