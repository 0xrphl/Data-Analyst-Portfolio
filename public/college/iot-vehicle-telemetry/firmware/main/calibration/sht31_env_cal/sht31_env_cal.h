/**
 * sht31_env_cal.h
 * Sensirion SHT31-DIS Multi-Point Linear Regression Curve, Saturated-Salt & Psychrometric Calibrator
 *
 * Metrology & Datasheet Curves (Sensirion SHT3x-DIS):
 *  1. Raw CMOSens Transfer Equations:
 *       T_raw [°C]  = -45.0 + 175.0 * (S_T  / 65535.0)
 *       RH_raw [%RH]= 100.0 * (S_RH / 65535.0)
 *  2. Multi-Point Ordinary Least Squares (OLS) Calibration Curve (N >= 2 points) or 1-Point Offset Trim:
 *       y_cal = slope * x_raw + offset,  with Pearson R^2 goodness-of-fit verification.
 *     Supports ASTM E104 Saturated Salt Reference Standards:
 *       - MgCl2 (Magnesium Chloride)  @ 25°C = 32.78 %RH
 *       - NaCl  (Sodium Chloride)     @ 25°C = 75.29 %RH
 *  3. Magnus-Tetens Psychrometric Curve:
 *       e_s(T) = 0.61094 * exp(17.625 * T / (243.04 + T)) [kPa]
 *       Dew Point T_d = 243.04 * γ / (17.625 - γ),  VPD = e_s(T) - e_a [kPa]
 */
#ifndef SHT31_ENV_CAL_H
#define SHT31_ENV_CAL_H

#include "../../config.h"
#include "../../sensors/env_sht31.h"
#include "../../sensors/sd_logger.h"

class Sht31EnvCalibrator {
public:
    String recordOnePointAndSave(float refTempC, float refHumRh, EnvSht31 &sht, KartTelemetry &t, SdLogger &sd) {
        sht.applyOnePointCalibration(refTempC, refHumRh, t);
        logPointToSd("1PT_REF", refTempC, refHumRh, sht, t, sd);
        return sht.buildCalibrationJson(t);
    }

    String recordTwoPointAndSave(float rawT1, float refT1, float rawT2, float refT2,
                                 float rawH1, float refH1, float rawH2, float refH2,
                                 EnvSht31 &sht, KartTelemetry &t, SdLogger &sd) {
        bool ok = sht.applyTwoPointCalibration(rawT1, refT1, rawT2, refT2, rawH1, refH1, rawH2, refH2, t);
        logPointToSd(ok ? "2PT_CURVE" : "2PT_SKIP", refT2, refH2, sht, t, sd);
        return sht.buildCalibrationJson(t);
    }

    String runHeaterStepTestAndLog(EnvSht31 &sht, KartTelemetry &t, SdLogger &sd) {
        String res = sht.runHeaterPlausibilityTest(t);
        logPointToSd("HEATER_BIST", t.shtTempC, t.shtHumRh, sht, t, sd);
        return res;
    }

private:
    static void logPointToSd(const char *mode, float refT, float refH, const EnvSht31 &sht, const KartTelemetry &t, SdLogger &sd) {
        const Sht31Calibration &c = sht.getCalibration();
        char csv[240];
        snprintf(csv, sizeof(csv), "%s,%s,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.5f,%.4f,%.5f,%.4f,%.2f",
                 t.isoTimestamp, mode,
                 t.shtTempRawC, refT, t.shtTempC,
                 t.shtHumRawRh, refH, t.shtHumRh,
                 c.tempSlope, c.tempOffset, c.humSlope, c.humOffset, t.dewPointC);
        sd.logCalibrationCsv("sht31_env_cal",
                             "utc_ts,mode,raw_t,ref_t,cal_t,raw_rh,ref_rh,cal_rh,t_slope,t_off,h_slope,h_off,dew_c",
                             String(csv));
    }
};

#endif
