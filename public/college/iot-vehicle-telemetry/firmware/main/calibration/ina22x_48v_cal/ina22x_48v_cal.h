/**
 * ina22x_48v_cal.h
 * TI INA226 (16-Bit) & INA228 (20-Bit 85V) 48V DC Traction Bus Calibrator
 * Supports Shunt Ohms, VBUS Divider Ratio, Zero-Current Tare, Multimeter V/A Trim & SD CSV Audit
 */
#ifndef INA22X_48V_CAL_H
#define INA22X_48V_CAL_H

#include "../../config.h"
#include "../../sensors/power_ina22x.h"
#include "../../sensors/sd_logger.h"

class Ina22x48vCalibrator {
public:
    String zeroCurrentTare(PowerIna22x &ina, KartTelemetry &t, SdLogger &sd) {
        if (!t.inaReady) return "{\"ok\":false,\"error\":\"INA22X_NOT_DETECTED_ON_IO6_IO7\"}";
        ina.zeroCurrentOffset(t);
        logToSd("ZERO_TARE", t.inaBusV, 0.0f, ina, t, sd);
        return ina.buildCalibrationJson(t);
    }

    String configureShuntAndDivider(float shuntOhms, float dividerRatio, bool invertCurr,
                                    PowerIna22x &ina, KartTelemetry &t, SdLogger &sd) {
        ina.setShuntAndDivider(shuntOhms, dividerRatio, invertCurr, t);
        logToSd("SHUNT_DIV", t.inaBusV, t.inaCurrentA, ina, t, sd);
        return ina.buildCalibrationJson(t);
    }

    String calibrateReferenceMultimeter(float refBusV, float refCurrentA,
                                        PowerIna22x &ina, KartTelemetry &t, SdLogger &sd) {
        if (!t.inaReady) return "{\"ok\":false,\"error\":\"INA22X_NOT_DETECTED_ON_IO6_IO7\"}";
        ina.applyMultimeterReference(refBusV, refCurrentA, t);
        logToSd("MULTIMETER_REF", refBusV, refCurrentA, ina, t, sd);
        return ina.buildCalibrationJson(t);
    }

    String resetEnergyAccumulators(PowerIna22x &ina, KartTelemetry &t) {
        ina.resetEnergy(t);
        return ina.buildCalibrationJson(t);
    }

    String resetFactoryCalibration(PowerIna22x &ina, KartTelemetry &t, SdLogger &sd) {
        ina.resetCalibration(t);
        logToSd("FACTORY_RESET", t.inaBusV, t.inaCurrentA, ina, t, sd);
        return ina.buildCalibrationJson(t);
    }

private:
    static void logToSd(const char *mode, float refV, float refA,
                        const PowerIna22x &ina, const KartTelemetry &t, SdLogger &sd) {
        const Ina48vCalibration &c = ina.getCalibration();
        char csv[240];
        snprintf(csv, sizeof(csv), "%s,%s,%s,0x%02X,%.6f,%.4f,%.3f,%.3f,%.3f,%.3f,%.2f,%.3f",
                 t.isoTimestamp, mode, ina.chipName(), t.inaAddr,
                 c.shuntOhms, c.vbusDividerRatio,
                 refV, t.inaBusV, refA, t.inaCurrentA, t.inaPowerW, t.inaEnergyWh);
        sd.logCalibrationCsv("ina22x_48v_cal",
                             "utc_ts,mode,chip,addr,shunt_ohm,vbus_div,ref_v,cal_v,ref_a,cal_a,power_w,energy_wh",
                             String(csv));
    }
};

#endif
