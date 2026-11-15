/**
 * gps_gnss_cal.h
 * SIM7670G / SIM7672G Multi-GNSS Geodetic Benchmark, CEP50/CEP95 Scatter & Altitude Datum Calibrator
 *
 * Metrology & Geodetic Curves:
 *  1. Local Tangent Plane (ENU) Error Projection relative to Known Survey Benchmark (e.g. UTP Campus):
 *       ΔE_m = (lon - lon_ref) * cos(lat_ref) * 111319.49
 *       ΔN_m = (lat - lat_ref) * 110574.27
 *  2. Circular Error Probable (CEP50 & 2DRMS / CEP95) Scatter Curve across N Satellite Fixes:
 *       CEP50 = 0.5887 * (σ_E + σ_N)   [50% probability radius in meters]
 *       R95   = 2.08   * CEP50         [95% confidence circle in meters]
 *  3. Ellipsoidal / Orthometric Altitude Offset Trim: alt_cal = alt_gnss + alt_offset_m
 */
#ifndef GPS_GNSS_CAL_H
#define GPS_GNSS_CAL_H

#include "../../config.h"
#include "../../gps_sim7672/gps_sim7672.h"
#include "../../sd_logger/sd_logger.h"
#include <Preferences.h>
#include <math.h>

class GpsGnssCalibrator {
public:
    void begin() {
        Preferences p;
        if (p.begin("gps_cal", true)) {
            _refLat      = p.getDouble("ref_lat", UTP_REF_LAT);
            _refLon      = p.getDouble("ref_lon", UTP_REF_LON);
            _refAltM     = p.getFloat("ref_alt",  UTP_REF_ALT_M);
            _altOffsetM  = p.getFloat("alt_off",  0.0f);
            _lastCep50M  = p.getFloat("cep50",    0.0f);
            p.end();
        }
    }

    // Updates survey benchmark (defaults to UTP Pereira 4.79520, -75.68860, 1445m) and altitude offset
    String setGeodeticReference(double refLat, double refLon, float refAltM, KartTelemetry &t, SdLogger &sd) {
        if (fabs(refLat) > 0.001 && fabs(refLon) > 0.001) {
            _refLat = refLat;
            _refLon = refLon;
        }
        if (refAltM > -200.0f && refAltM < 6000.0f) {
            _refAltM = refAltM;
            if (t.gpsFix >= 2) {
                _altOffsetM = refAltM - t.altM;
            }
        }
        saveNvs();

        // Accumulate scatter sample if valid 2D/3D fix is active
        if (t.gpsFix >= 2) {
            pushScatterSample(t.lat, t.lon);
        }

        float distRefM = (t.gpsFix >= 2) ? GpsSim7672::haversineMeters(t.lat, t.lon, _refLat, _refLon) : -1.0f;
        char csv[220];
        snprintf(csv, sizeof(csv), "%s,%u,%u,%u,%.6f,%.6f,%.1f,%.2f,%.2f,%.2f",
                 t.isoTimestamp, t.gpsFix, t.satellites, t.satsInView,
                 t.lat, t.lon, t.altM + _altOffsetM, t.hdop, distRefM, _lastCep50M);
        sd.logCalibrationCsv("gps_gnss_cal",
                             "utc_ts,fix,sats_used,sats_view,lat,lon,cal_alt_m,hdop,err_to_ref_m,cep50_m",
                             String(csv));

        return buildStatusJson(t);
    }

    void pushLiveFixIfValid(const KartTelemetry &t) {
        if (t.gpsFix >= 2) pushScatterSample(t.lat, t.lon);
    }

    String buildStatusJson(const KartTelemetry &t) const {
        float distRefM = (t.gpsFix >= 2) ? GpsSim7672::haversineMeters(t.lat, t.lon, _refLat, _refLon) : -1.0f;
        char buf[380];
        snprintf(buf, sizeof(buf),
                 "{\"fix_mode\":%u,\"sats_used\":%u,\"sats_view\":%u,\"cn0_max_dbhz\":%u,\"hdop\":%.2f,"
                 "\"ref_lat\":%.6f,\"ref_lon\":%.6f,\"ref_alt_m\":%.1f,\"alt_offset_m\":%.2f,"
                 "\"err_to_ref_m\":%.2f,\"cep50_m\":%.2f,\"cep95_m\":%.2f,\"scatter_samples\":%u,\"place_code\":%u}",
                 t.gpsFix, t.satellites, t.satsInView, t.maxCn0DbHz, t.hdop,
                 _refLat, _refLon, _refAltM, _altOffsetM,
                 distRefM, _lastCep50M, _lastCep50M * 2.08f, _cnt, t.placeConfirmed);
        return String(buf);
    }

private:
    double _refLat = UTP_REF_LAT;
    double _refLon = UTP_REF_LON;
    float  _refAltM = UTP_REF_ALT_M;
    float  _altOffsetM = 0.0f;
    float  _lastCep50M = 0.0f;

    static const uint8_t MAX_PTS = 30;
    float _eastM[MAX_PTS] = {0};
    float _northM[MAX_PTS] = {0};
    uint8_t _idx = 0;
    uint8_t _cnt = 0;

    void pushScatterSample(double lat, double lon) {
        float e = (float)((lon - _refLon) * cos(_refLat * PI / 180.0) * 111319.49);
        float n = (float)((lat - _refLat) * 110574.27);
        _eastM[_idx] = e;
        _northM[_idx] = n;
        _idx = (_idx + 1) % MAX_PTS;
        if (_cnt < MAX_PTS) _cnt++;

        if (_cnt >= 3) {
            float me = 0, mn = 0;
            for (uint8_t i = 0; i < _cnt; i++) { me += _eastM[i]; mn += _northM[i]; }
            me /= _cnt; mn /= _cnt;
            float ve = 0, vn = 0;
            for (uint8_t i = 0; i < _cnt; i++) {
                ve += (_eastM[i] - me) * (_eastM[i] - me);
                vn += (_northM[i] - mn) * (_northM[i] - mn);
            }
            float sigE = sqrtf(ve / (_cnt - 1));
            float sigN = sqrtf(vn / (_cnt - 1));
            _lastCep50M = 0.5887f * (sigE + sigN);
        }
    }

    void saveNvs() {
        Preferences p;
        if (p.begin("gps_cal", false)) {
            p.putDouble("ref_lat", _refLat);
            p.putDouble("ref_lon", _refLon);
            p.putFloat("ref_alt",  _refAltM);
            p.putFloat("alt_off",  _altOffsetM);
            p.putFloat("cep50",    _lastCep50M);
            p.end();
        }
    }
};

#endif
