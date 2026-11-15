/**
 * rtc_ds3231_cal.h
 * Calibration & Crystal Aging Curve Engine for DS3231SN TCXO + AT24C32 Battery Clock Module
 *
 * Metrology & Calibration Curves:
 *  1. Crystal Aging Offset Register (0x10): Signed 8-bit (-128..+127 LSB).
 *     Datasheet Transfer Curve: Δf/f ≈ -0.1 ppm per +1 LSB at 25°C
 *     (Positive aging values add capacitance to XTAL, slowing oscillator frequency;
 *      Negative aging values remove capacitance, speeding up oscillator frequency).
 *  2. Epoch Drift Analyzer vs Atomic Reference (NTP / Multi-GNSS UTC):
 *     ppm_drift = ((T_rtc - T_ref) / Δt_elapsed_sec) * 1e6
 *     Recommended Aging LSB Trim = clamp(round(current_aging + (ppm_drift / 0.1)), -128, +127)
 *  3. Die Temperature Offset Curve: T_cal = T_raw_0.25C + temp_offset_c (verified vs calibrated SHT31).
 */
#ifndef RTC_DS3231_CAL_H
#define RTC_DS3231_CAL_H

#include "../../config.h"
#include "../../rtc_ds3231/rtc_ds3231.h"
#include "../../sd_logger/sd_logger.h"
#include <time.h>
#include <math.h>

class RtcDs3231Calibrator {
public:
    // Syncs DS3231 immediately to Wi-Fi NTP atomic UTC epoch and measures pre-sync drift (s & ppm)
    String calibrateFromNtp(RtcDs3231 &rtc, KartTelemetry &t, SdLogger &sd) {
        time_t ntpEpoch = time(nullptr);
        if (ntpEpoch < 1700000000) {
            return "{\"ok\":false,\"error\":\"NTP_NOT_SYNCED_YET\"}";
        }
        uint32_t rtcBefore = rtc.readUnixEpoch();
        int32_t offsetSec = (rtcBefore > 1700000000) ? ((int32_t)rtcBefore - (int32_t)ntpEpoch) : 0;

        float ppm = 0.0f;
        int8_t recAging = t.rtcAgingReg;
        if (_lastRefEpoch > 1700000000 && (uint32_t)ntpEpoch > _lastRefEpoch + 30) {
            uint32_t dt = (uint32_t)ntpEpoch - _lastRefEpoch;
            ppm = ((float)offsetSec / (float)dt) * 1000000.0f;
            int32_t trim = (int32_t)t.rtcAgingReg + (int32_t)lroundf(ppm / 0.1f);
            if (trim < -128) trim = -128;
            if (trim > 127)  trim = 127;
            recAging = (int8_t)trim;
            rtc.recordDriftMeasurement(ppm, t);
        }
        _lastRefEpoch = (uint32_t)ntpEpoch;

        struct tm ti;
        gmtime_r(&ntpEpoch, &ti);
        bool hwSynced = rtc.setUtcDateTime(
            (uint16_t)(ti.tm_year + 1900), (uint8_t)(ti.tm_mon + 1), (uint8_t)ti.tm_mday,
            (uint8_t)ti.tm_hour, (uint8_t)ti.tm_min, (uint8_t)ti.tm_sec
        );
        rtc.update(t);

        char csv[180];
        snprintf(csv, sizeof(csv), "%s,%d,%ld,%.3f,%d,%.2f",
                 t.isoTimestamp, hwSynced ? 1 : 0, (long)offsetSec, ppm, (int)recAging, t.rtcTempC);
        sd.logCalibrationCsv("rtc_ds3231_cal", "utc_ts,hw_ack,offset_sec,drift_ppm,rec_aging_lsb,rtc_temp_c", String(csv));

        char out[300];
        snprintf(out, sizeof(out),
                 "{\"ok\":%s,\"rtc_hw_ack\":%s,\"ntp_utc\":\"%s\",\"offset_sec\":%ld,"
                 "\"measured_ppm\":%.3f,\"current_aging_lsb\":%d,\"recommended_aging_lsb\":%d}",
                 hwSynced ? "true" : "false", t.rtcReady ? "true" : "false",
                 t.isoTimestamp, (long)offsetSec, ppm, (int)t.rtcAgingReg, (int)recAging);
        return String(out);
    }

    // Applies DS3231 Aging Offset Register (0x10, 0.1 ppm/LSB) + Temperature Offset vs SHT31
    String applyCrystalAgingAndTempTrim(int8_t agingLsb, float tempOffsetC, RtcDs3231 &rtc, KartTelemetry &t, SdLogger &sd) {
        bool hwOk = rtc.setAgingOffsetLsb(agingLsb, tempOffsetC, t);
        rtc.update(t);

        char csv[160];
        snprintf(csv, sizeof(csv), "%s,%d,0,%.3f,%d,%.2f",
                 t.isoTimestamp, hwOk ? 1 : 0, t.rtcDriftPpm, (int)t.rtcAgingReg, t.rtcTempC);
        sd.logCalibrationCsv("rtc_ds3231_cal", "utc_ts,hw_ack,offset_sec,drift_ppm,rec_aging_lsb,rtc_temp_c", String(csv));

        char out[240];
        snprintf(out, sizeof(out),
                 "{\"ok\":%s,\"rtc_ready\":%s,\"aging_lsb\":%d,\"ppm_trim_equiv\":%.2f,\"temp_offset_c\":%.2f,\"rtc_temp_c\":%.2f}",
                 hwOk ? "true" : "false", t.rtcReady ? "true" : "false",
                 (int)t.rtcAgingReg, (float)t.rtcAgingReg * -0.1f, tempOffsetC, t.rtcTempC);
        return String(out);
    }

    String buildStatusJson(const RtcDs3231 &rtc, const KartTelemetry &t) const {
        char buf[260];
        snprintf(buf, sizeof(buf),
                 "{\"rtc_ready\":%s,\"ntp_synced\":%s,\"osf_was_set\":%s,\"iso_utc\":\"%s\","
                 "\"aging_lsb\":%d,\"drift_ppm\":%.3f,\"temp_offset_c\":%.2f,\"rtc_temp_c\":%.2f}",
                 t.rtcReady ? "true" : "false", t.ntpSynced ? "true" : "false",
                 rtc.wasOsfSet() ? "true" : "false", t.isoTimestamp,
                 (int)t.rtcAgingReg, t.rtcDriftPpm, rtc.getTempOffsetC(), t.rtcTempC);
        return String(buf);
    }

private:
    uint32_t _lastRefEpoch = 0;
};

#endif
