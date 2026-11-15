/**
 * ds18b20_probe_cal.h
 * DS18B20 1-Wire Waterproof Thermal Probe Calibrator (Controller TS T-Alpha + Motor Stator)
 */
#ifndef DS18B20_PROBE_CAL_H
#define DS18B20_PROBE_CAL_H

#include "../../config.h"
#include "../../temp_ds18b20/temp_ds18b20.h"
#include "../../sd_logger/sd_logger.h"
#include <math.h>

class Ds18b20ProbeCalibrator {
public:
    // 1-point reference offset trim (or cross-calibration against settled SHT31 ambient)
    String calibrateOnePoint(uint8_t probeIdx, float refTempC, TempDs18b20 &ds, KartTelemetry &t, SdLogger &sd) {
        if (!t.ds18Ready) return "{\"ok\":false,\"error\":\"DS18B20_NOT_DETECTED\"}";
        float raw = (probeIdx == 0) ? t.ds18CtrlRawC : t.ds18MotorRawC;
        if (isnan(refTempC) || refTempC < -30.0f || refTempC > 125.0f) {
            return "{\"ok\":false,\"error\":\"INVALID_REF_TEMP\"}";
        }
        float offset = refTempC - raw;
        ds.applyProbeCalibration(probeIdx, 1.0f, offset, t);
        logToSd("1PT_REF", probeIdx, raw, refTempC, ds, t, sd);
        return ds.buildCalibrationJson(t);
    }

    // 2-point linear curve (e.g. Ice bath 0.00°C + Warm/Ambient reference)
    String calibrateTwoPoint(uint8_t probeIdx, float raw1, float ref1, float raw2, float ref2,
                             TempDs18b20 &ds, KartTelemetry &t, SdLogger &sd) {
        if (fabs(raw2 - raw1) < 1.0f) {
            return "{\"ok\":false,\"error\":\"NEED_AT_LEAST_1C_SPAN\"}";
        }
        float slope  = (ref2 - ref1) / (raw2 - raw1);
        float offset = ref1 - (slope * raw1);
        ds.applyProbeCalibration(probeIdx, slope, offset, t);
        logToSd("2PT_CURVE", probeIdx, raw2, ref2, ds, t, sd);
        return ds.buildCalibrationJson(t);
    }

    String crossCalibrateToSht31(TempDs18b20 &ds, KartTelemetry &t, SdLogger &sd) {
        if (!t.shtReady) return "{\"ok\":false,\"error\":\"SHT31_NOT_READY\"}";
        return calibrateOnePoint(0, t.shtTempC, ds, t, sd);
    }

private:
    static void logToSd(const char *mode, uint8_t idx, float rawT, float refT,
                        const TempDs18b20 &ds, const KartTelemetry &t, SdLogger &sd) {
        char csv[200];
        snprintf(csv, sizeof(csv), "%s,%s,%u,%u,%s,%.2f,%.2f,%.2f,%.2f",
                 t.isoTimestamp, mode, t.ds18Pin, idx, ds.romToHex(idx).c_str(),
                 rawT, refT, t.ds18CtrlC, t.ds18MotorC);
        sd.logCalibrationCsv("ds18b20_probe_cal",
                             "utc_ts,mode,gpio_pin,probe_idx,rom_hex,raw_c,ref_c,cal_ctrl_c,cal_motor_c",
                             String(csv));
    }
};

#endif
