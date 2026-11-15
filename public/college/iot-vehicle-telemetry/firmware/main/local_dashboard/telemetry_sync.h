/**
 * telemetry_sync.h
 * Dual-Path Telemetry Dispatcher (Local Wi-Fi WebSockets + Supabase Cloud Sync)
 */
#ifndef TELEMETRY_SYNC_H
#define TELEMETRY_SYNC_H

#include "../config.h"
#include "../sensors/env_sht31.h"
#include "../sensors/temp_ds18b20.h"
#include "../sensors/power_ina22x.h"
#include "../sensors/imu_bmi160.h"
#include "../sensors/rtc_ds3231.h"
#include "../sensors/sd_logger.h"
#include "../sensors/gps_sim7672.h"
#include "../boot_test/self_test.h"
#include "../calibration/calibration_manager.h"
#include "MinWebSockets.h"
#include "embedded_dashboard.h"
#include "calibration_portal.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ESPmDNS.h>
#include <time.h>

class TelemetrySync {
public:
    TelemetrySync() : _httpServer(80), _wsServer(81) {}

    void begin(KartTelemetry &t, EnvSht31 &sht, TempDs18b20 &ds18, PowerIna22x &ina, ImuBmi160 &imu, RtcDs3231 &rtc,
               SdLogger &sd, GpsSim7672 &modem, SelfTestEngine &selfTest, CalibrationManager &calMgr) {
        _stateRef    = &t;
        _shtRef      = &sht;
        _ds18Ref     = &ds18;
        _inaRef      = &ina;
        _imuRef      = &imu;
        _rtcRef      = &rtc;
        _sdRef       = &sd;
        _modemRef    = &modem;
        _selfTestRef = &selfTest;
        _calMgrRef   = &calMgr;

        connectMultiWifi(t);
        setupHttpRoutes();

        _httpServer.begin();
        _wsServer.begin();
    }

    void connectMultiWifi(KartTelemetry &t) {
        WiFi.disconnect(true);
        delay(120);
        WiFi.mode(WIFI_STA);

        // 1. Smart 2.4 GHz scan so whichever network is in range (FamiliaSanchez. or utp/UTP) connects fast
        USB_OUT.println(F("[Wi-Fi] Scanning 2.4 GHz networks for FamiliaSanchez. / utp ..."));
        int n = WiFi.scanNetworks(false, false);
        String bestPrimarySsid = "";
        int bestPrimaryRssi = -999;
        String bestFallbackSsid = "";
        int bestFallbackRssi = -999;

        for (int i = 0; i < n; i++) {
            String s = WiFi.SSID(i);
            int rssi = WiFi.RSSI(i);
            if (s == WIFI_SSID && rssi > bestPrimaryRssi) {
                bestPrimarySsid = s;
                bestPrimaryRssi = rssi;
            } else if ((s.equalsIgnoreCase(WIFI_SSID_FALLBACK)) && rssi > bestFallbackRssi) {
                bestFallbackSsid = s; // Preserves exact router capitalization ("utp" or "UTP")
                bestFallbackRssi = rssi;
            }
        }
        WiFi.scanDelete();

        bool connected = false;
        // Try stronger in-range known network first, then the other
        if (bestPrimarySsid.length() > 0 && bestPrimaryRssi >= bestFallbackRssi) {
            connected = tryConnectSta(bestPrimarySsid.c_str(), WIFI_PASS, 8000, t);
            if (!connected && bestFallbackSsid.length() > 0) {
                connected = tryConnectSta(bestFallbackSsid.c_str(), WIFI_PASS_FALLBACK, 8000, t);
            }
        } else if (bestFallbackSsid.length() > 0) {
            connected = tryConnectSta(bestFallbackSsid.c_str(), WIFI_PASS_FALLBACK, 8000, t);
            if (!connected && bestPrimarySsid.length() > 0) {
                connected = tryConnectSta(bestPrimarySsid.c_str(), WIFI_PASS, 8000, t);
            }
        }

        // Direct fallback attempts in case SSID broadcast is hidden
        if (!connected) {
            connected = tryConnectSta(WIFI_SSID, WIFI_PASS, 5500, t);
        }
        if (!connected) {
            connected = tryConnectSta(WIFI_SSID_FALLBACK, WIFI_PASS_FALLBACK, 6500, t);
        }

        if (connected) {
            digitalWrite(BOARD_LED_PIN, LOW);
            // Concurrent AP_STA mode: keeps "UTP"/"FamiliaSanchez." STA for Supabase + exposes "Kart-Cal-Lab" (192.168.4.1)
            // so campus Wi-Fi client-isolation NEVER blocks local browser access!
            WiFi.mode(WIFI_AP_STA);
            WiFi.softAP(WIFI_AP_SSID, WIFI_AP_PASS);

            // Atomic NTP UTC sync over Wi-Fi (populates UTC date/time indoors even before GPS lock)
            configTime(0, 0, "pool.ntp.org", "time.google.com", "time.nist.gov");
            struct tm ti;
            if (getLocalTime(&ti, 2500)) {
                t.ntpSynced = true;
            }

            if (MDNS.begin(MDNS_HOSTNAME)) {
                MDNS.addService("http", "tcp", 80);
            }
            USB_OUT.printf("[Wi-Fi] Connected to '%s' (%d dBm)\n", t.wifiSsid, (int)t.rssi);
            USB_OUT.printf("[Wi-Fi] LAN Dashboard:       http://%s/  (http://%s.local/)\n",
                           WiFi.localIP().toString().c_str(), MDNS_HOSTNAME);
            USB_OUT.printf("[Wi-Fi] Direct Hotspot (AP): Connect to '%s' (pass: %s) -> http://%s/\n",
                           WIFI_AP_SSID, WIFI_AP_PASS, WiFi.softAPIP().toString().c_str());
            USB_OUT.printf("[Wi-Fi] Calibration Lab:     http://%s/cal  OR  http://%s/cal\n",
                           WiFi.localIP().toString().c_str(), WiFi.softAPIP().toString().c_str());
        } else {
            USB_OUT.printf("\n[Wi-Fi] Starting Standalone SoftAP: %s (%s)\n", WIFI_AP_SSID, WIFI_AP_PASS);
            WiFi.mode(WIFI_AP);
            WiFi.softAP(WIFI_AP_SSID, WIFI_AP_PASS);
            strncpy(t.wifiSsid, WIFI_AP_SSID, sizeof(t.wifiSsid) - 1);
            t.netMode = 3;
            USB_OUT.printf("[Wi-Fi] AP Dashboard: http://%s/ | Calibration: http://%s/cal\n",
                           WiFi.softAPIP().toString().c_str(), WiFi.softAPIP().toString().c_str());
        }
    }

    void setupHttpRoutes() {
        _httpServer.on("/", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            _httpServer.send_P(200, "text/html", KART_EMBEDDED_HTML);
        });
        _httpServer.on("/cal", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            _httpServer.send_P(200, "text/html", KART_CALIBRATION_HTML);
        });
        _httpServer.on("/status", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            _httpServer.send(200, "application/json", _lastJson);
        });
        _httpServer.on("/test", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (_selfTestRef && _stateRef) _bootTestJson = _selfTestRef->runAllToJson(*_stateRef);
            _httpServer.send(200, "application/json", _bootTestJson);
        });
        _httpServer.on("/diag", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            _httpServer.send(200, "application/json", buildDiagnosticsJson());
        });
        _httpServer.on("/cal/onepoint", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_shtRef || !_stateRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            float rt = _httpServer.hasArg("ref_temp") && _httpServer.arg("ref_temp").length() > 0 ? _httpServer.arg("ref_temp").toFloat() : NAN;
            float rh = _httpServer.hasArg("ref_hum")  && _httpServer.arg("ref_hum").length()  > 0 ? _httpServer.arg("ref_hum").toFloat()  : NAN;
            String out = (_calMgrRef && _sdRef)
                ? _calMgrRef->shtCal.recordOnePointAndSave(rt, rh, *_shtRef, *_stateRef, *_sdRef)
                : (_shtRef->applyOnePointCalibration(rt, rh, *_stateRef), _shtRef->buildCalibrationJson(*_stateRef));
            _httpServer.send(200, "application/json", out);
        });
        _httpServer.on("/cal/heater", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            String res = (_calMgrRef && _shtRef && _stateRef && _sdRef)
                ? _calMgrRef->shtCal.runHeaterStepTestAndLog(*_shtRef, *_stateRef, *_sdRef)
                : ((_shtRef && _stateRef) ? _shtRef->runHeaterPlausibilityTest(*_stateRef) : "{\"ok\":false}");
            _httpServer.send(200, "application/json", res);
        });
        _httpServer.on("/cal/imu/level", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_imuRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->imuCal.calibrateStationaryLevel(*_imuRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/imu/tare", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_imuRef || !_stateRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->imuCal.tareCubeOnly(*_imuRef, *_stateRef));
        });
        _httpServer.on("/cal/imu/reset", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_imuRef || !_stateRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->imuCal.resetToFactory(*_imuRef, *_stateRef));
        });
        _httpServer.on("/cal/rtc/ntp", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_rtcRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->rtcCal.calibrateFromNtp(*_rtcRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/rtc/trim", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_rtcRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            int8_t ag = _httpServer.hasArg("aging") ? (int8_t)_httpServer.arg("aging").toInt() : 0;
            float to  = _httpServer.hasArg("t_off") ? _httpServer.arg("t_off").toFloat() : 0.0f;
            _httpServer.send(200, "application/json", _calMgrRef->rtcCal.applyCrystalAgingAndTempTrim(ag, to, *_rtcRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/gps/ref", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            double rlat = _httpServer.hasArg("lat") ? _httpServer.arg("lat").toDouble() : UTP_REF_LAT;
            double rlon = _httpServer.hasArg("lon") ? _httpServer.arg("lon").toDouble() : UTP_REF_LON;
            float  ralt = _httpServer.hasArg("alt") ? _httpServer.arg("alt").toFloat()  : UTP_REF_ALT_M;
            _httpServer.send(200, "application/json", _calMgrRef->gpsCal.setGeodeticReference(rlat, rlon, ralt, *_stateRef, *_sdRef));
        });
        _httpServer.on("/sd/list", HTTP_GET, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            _httpServer.send(200, "application/json", _sdRef ? _sdRef->listAllCsvFilesJson() : "{}");
        });
        _httpServer.on("/cal/ds18/onepoint", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_ds18Ref || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            uint8_t idx = _httpServer.hasArg("idx") ? (uint8_t)_httpServer.arg("idx").toInt() : 0;
            float rt = _httpServer.hasArg("ref_temp") ? _httpServer.arg("ref_temp").toFloat() : NAN;
            _httpServer.send(200, "application/json", _calMgrRef->ds18Cal.calibrateOnePoint(idx, rt, *_ds18Ref, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/ds18/shtsync", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_ds18Ref || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->ds18Cal.crossCalibrateToSht31(*_ds18Ref, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/ds18/swap", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (_ds18Ref && _stateRef) _ds18Ref->swapProbeRoles(*_stateRef);
            _httpServer.send(200, "application/json", _ds18Ref ? _ds18Ref->buildCalibrationJson(*_stateRef) : "{}");
        });
        _httpServer.on("/cal/ds18/pin", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (_ds18Ref && _stateRef && _httpServer.hasArg("gpio")) {
                _ds18Ref->setPreferredPin((uint8_t)_httpServer.arg("gpio").toInt(), *_stateRef);
            } else if (_ds18Ref && _stateRef) {
                _ds18Ref->begin(*_stateRef);
            }
            _httpServer.send(200, "application/json", _ds18Ref ? _ds18Ref->buildCalibrationJson(*_stateRef) : "{}");
        });
        _httpServer.on("/cal/ds18/reset", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (_ds18Ref && _stateRef) _ds18Ref->resetCalibration(*_stateRef);
            _httpServer.send(200, "application/json", _ds18Ref ? _ds18Ref->buildCalibrationJson(*_stateRef) : "{}");
        });
        _httpServer.on("/cal/ina/zero", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_inaRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->inaCal.zeroCurrentTare(*_inaRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/ina/shunt", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_inaRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            const Ina48vCalibration &c = _inaRef->getCalibration();
            float sh = _httpServer.hasArg("shunt") ? _httpServer.arg("shunt").toFloat() : c.shuntOhms;
            float dv = _httpServer.hasArg("div")   ? _httpServer.arg("div").toFloat()   : c.vbusDividerRatio;
            bool inv = _httpServer.hasArg("inv")   ? (_httpServer.arg("inv") == "1")    : c.invertCurrent;
            _httpServer.send(200, "application/json", _calMgrRef->inaCal.configureShuntAndDivider(sh, dv, inv, *_inaRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/ina/ref", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_inaRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            float rv = _httpServer.hasArg("ref_v") && _httpServer.arg("ref_v").length() > 0 ? _httpServer.arg("ref_v").toFloat() : NAN;
            float ra = _httpServer.hasArg("ref_a") && _httpServer.arg("ref_a").length() > 0 ? _httpServer.arg("ref_a").toFloat() : NAN;
            _httpServer.send(200, "application/json", _calMgrRef->inaCal.calibrateReferenceMultimeter(rv, ra, *_inaRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/ina/energy", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_inaRef || !_stateRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->inaCal.resetEnergyAccumulators(*_inaRef, *_stateRef));
        });
        _httpServer.on("/cal/ina/reset", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_calMgrRef || !_inaRef || !_stateRef || !_sdRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            _httpServer.send(200, "application/json", _calMgrRef->inaCal.resetFactoryCalibration(*_inaRef, *_stateRef, *_sdRef));
        });
        _httpServer.on("/cal/params", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (!_shtRef || !_stateRef) { _httpServer.send(500, "application/json", "{\"ok\":false}"); return; }
            float ts = _httpServer.hasArg("t_slope") ? _httpServer.arg("t_slope").toFloat() : 1.0f;
            float to = _httpServer.hasArg("t_off")   ? _httpServer.arg("t_off").toFloat()   : 0.0f;
            float hs = _httpServer.hasArg("h_slope") ? _httpServer.arg("h_slope").toFloat() : 1.0f;
            float ho = _httpServer.hasArg("h_off")   ? _httpServer.arg("h_off").toFloat()   : 0.0f;
            bool psy = _httpServer.hasArg("psy") && (_httpServer.arg("psy") == "1");
            _shtRef->setManualCoefficients(ts, to, hs, ho, psy, *_stateRef);
            _httpServer.send(200, "application/json", _shtRef->buildCalibrationJson(*_stateRef));
        });
        _httpServer.on("/cal/reset", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            if (_shtRef && _stateRef) _shtRef->resetCalibration(*_stateRef);
            _httpServer.send(200, "application/json", _shtRef ? _shtRef->buildCalibrationJson(*_stateRef) : "{}");
        });
        _httpServer.on("/gnss/agps", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            bool ok = _modemRef ? _modemRef->triggerAgps() : false;
            _httpServer.send(200, "application/json", String("{\"agps_triggered\":") + (ok ? "true" : "false") + "}");
        });
        _httpServer.on("/gnss/restart", HTTP_POST, [this]() {
            _httpServer.sendHeader("Access-Control-Allow-Origin", "*");
            uint8_t m = _httpServer.hasArg("mode") ? (uint8_t)_httpServer.arg("mode").toInt() : 1;
            bool ok = _modemRef ? _modemRef->restartGnss(m) : false;
            _httpServer.send(200, "application/json", String("{\"restarted\":") + (ok ? "true" : "false") + ",\"mode\":" + String(m) + "}");
        });
    }

    void registerCloudSession(KartTelemetry &t, const String &testJson, const String &calJson, GpsSim7672 &modem) {
        _bootTestJson = testJson;
        String urlStr = String(SUPABASE_URL);
        if (urlStr.indexOf("YOUR_PROJECT_REF") >= 0) return;
        String endpoint = urlStr + "/rest/v1/kart_sessions";

        char sdFile[36];
        snprintf(sdFile, sizeof(sdFile), "kart_session_%04lu.csv", (unsigned long)t.bootCount);

        String sessFull = String("{\"device_id\":\"") + DEVICE_ID +
                          "\",\"boot_count\":" + String(t.bootCount) +
                          ",\"sd_filename\":\"" + String(sdFile) +
                          "\",\"test\":" + testJson +
                          ",\"calibration\":" + calJson + "}";

        String sessWithTest = String("{\"device_id\":\"") + DEVICE_ID +
                              "\",\"boot_count\":" + String(t.bootCount) +
                              ",\"sd_filename\":\"" + String(sdFile) +
                              "\",\"test\":" + testJson + "}";

        if (WiFi.status() == WL_CONNECTED) {
            WiFiClientSecure client;
            client.setInsecure();
            HTTPClient http;
            if (http.begin(client, endpoint)) {
                http.addHeader("Content-Type", "application/json");
                http.addHeader("apikey", SUPABASE_ANON_KEY);
                http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
                http.addHeader("Prefer", "return=representation");
                int code = http.POST(sessFull);
                if (code < 200 || code >= 300) {
                    code = http.POST(sessWithTest);
                }
                if (code >= 200 && code < 300) {
                    String resp = http.getString();
                    int idIdx = resp.indexOf("\"session_id\":");
                    if (idIdx > 0) {
                        t.cloudSessionId = resp.substring(idIdx + 13).toInt();
                        USB_OUT.printf("[Supabase] Boot Session Registered! session_id=#%lld\n", (long long)t.cloudSessionId);
                    }
                }
                http.end();
            }
        } else if (t.modemAwake) {
            if (!modem.postToSupabaseViaLte(endpoint, SUPABASE_ANON_KEY, sessFull)) {
                modem.postToSupabaseViaLte(endpoint, SUPABASE_ANON_KEY, sessWithTest);
            }
        }
    }

    void loop(KartTelemetry &t) {
        _httpServer.handleClient();
        _wsServer.loop();

        unsigned long now = millis();
        if (t.netMode == 1 && WiFi.status() != WL_CONNECTED && (now - _lastWifiCheckMs >= 45000)) {
            _lastWifiCheckMs = now;
            WiFi.reconnect();
        }
    }

    void broadcastLocal(KartTelemetry &t, char *outBuf, size_t outSize) {
        if (WiFi.status() == WL_CONNECTED) {
            t.rssi = WiFi.RSSI();
            t.netMode = 1;
        } else if (t.netMode != 3) {
            t.rssi = (t.lteCsq < 32) ? (int16_t)(-113 + (t.lteCsq * 2)) : -85;
            t.netMode = 2;
        }

        // Backward-compatible keys + full SHT31 & GNSS instrumentation keys
        snprintf(outBuf, outSize,
                 "{\"ts\":\"%s\",\"rtc_ok\":%d,\"ntp_ok\":%d,\"vbat_mv\":%u,\"vbat_v\":%.3f,\"solar_mv\":%u,"
                 "\"gyro_temp\":%.1f,\"rtc_temp\":%.2f,"
                 "\"sht_ok\":%d,\"sht_raw_t\":%.2f,\"sht_raw_h\":%.2f,\"sht_temp\":%.2f,\"sht_hum\":%.2f,"
                 "\"dew_point\":%.2f,\"vpd_kpa\":%.3f,\"abs_hum\":%.2f,\"cond_margin\":%.2f,"
                 "\"sht_sig_t\":%.3f,\"sht_sig_h\":%.2f,\"sht_settled\":%d,\"sht_crc_ok\":%lu,\"sht_crc_err\":%lu,"
                 "\"ds18_ok\":%d,\"ds18_pin\":%u,\"ds18_cnt\":%u,\"ds18_ctrl\":%.2f,\"ds18_mot\":%.2f,"
                 "\"ina_ok\":%d,\"ina_chip\":%u,\"ina_v\":%.3f,\"ina_shunt_mv\":%.3f,\"ina_a\":%.3f,\"ina_w\":%.2f,\"ina_wh\":%.3f,"
                 "\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,\"gx\":%.2f,\"gy\":%.2f,\"gz\":%.2f,"
                 "\"roll\":%.2f,\"pitch\":%.2f,\"yaw\":%.2f,\"peak_g\":%.2f,\"vib\":%.3f,"
                 "\"lat\":%.6f,\"lon\":%.6f,\"spd\":%.1f,\"alt\":%.1f,\"crs\":%.1f,"
                 "\"sats\":%u,\"sats_view\":%u,\"gps_sv\":%u,\"bds_sv\":%u,\"glo_sv\":%u,\"gal_sv\":%u,"
                 "\"cn0_max\":%u,\"hdop\":%.1f,\"fix\":%u,\"utp_dist_m\":%.1f,\"place_ok\":%u,"
                 "\"sd_ok\":%d,\"sd_kb\":%lu,\"sd_rec\":%lu,\"boot\":%lu,\"rssi\":%d,\"net\":%u,"
                 "\"wifi_ssid\":\"%s\",\"cloud\":%lu}",
                 t.isoTimestamp, t.rtcReady ? 1 : 0, t.ntpSynced ? 1 : 0, t.vbatMv, t.vbatV, t.solarMv,
                 t.gyroTempC, t.rtcTempC,
                 t.shtReady ? 1 : 0, t.shtTempRawC, t.shtHumRawRh, t.shtTempC, t.shtHumRh,
                 t.dewPointC, t.vpdKpa, t.absHumGm3, t.condMarginC,
                 t.shtNoiseTempC, t.shtNoiseHumRh, t.shtSettled ? 1 : 0,
                 (unsigned long)t.shtCrcOk, (unsigned long)t.shtCrcErr,
                 t.ds18Ready ? 1 : 0, t.ds18Pin, t.ds18Count, t.ds18CtrlC, t.ds18MotorC,
                 t.inaReady ? 1 : 0, t.inaChipType, t.inaBusV, t.inaShuntMv, t.inaCurrentA, t.inaPowerW, t.inaEnergyWh,
                 t.ax, t.ay, t.az, t.gx, t.gy, t.gz,
                 t.roll, t.pitch, t.yaw, t.peakG, t.vibRms,
                 t.lat, t.lon, t.speedKmh, t.altM, t.courseDeg,
                 t.satellites, t.satsInView, t.gpsSvs, t.bdsSvs, t.gloSvs, t.galSvs,
                 t.maxCn0DbHz, t.hdop, t.gpsFix, t.utpDistanceM, t.placeConfirmed,
                 t.sdMounted ? 1 : 0, (unsigned long)t.sdLogKb, (unsigned long)t.sdRecords,
                 (unsigned long)t.bootCount, (int)t.rssi, t.netMode,
                 t.wifiSsid, (unsigned long)t.cloudSentCount);

        _lastJson = String(outBuf);
        _wsServer.broadcastTXT(outBuf);

        unsigned long now = millis();
        if (now - _lastUsbPrintMs >= 1000) {
            _lastUsbPrintMs = now;
            USB_OUT.println(outBuf);
        }
    }

    bool syncToSupabaseIfDue(KartTelemetry &t, GpsSim7672 &modem) {
        String urlStr = String(SUPABASE_URL);
        if (urlStr.indexOf("YOUR_PROJECT_REF") >= 0) return false;

        unsigned long now = millis();
        bool isMoving = (t.speedKmh > 1.5f) || (fabs(t.gz) > 3.5f) || (t.peakG > 1.15f);
        // Fast 4s sync during first 3 min (bench/field verification) or when moving; 30s idle heartbeat thereafter
        unsigned long intervalMs = (now < 180000UL || isMoving) ? 4000UL : 30000UL;
        if (now - _lastCloudSync < intervalMs) return false;
        _lastCloudSync = now;

        String endpoint = urlStr + "/rest/v1/kart_telemetry";
        char bodyExt[780];
        char bodyLegacy[440];
        buildSupabaseRow(t, bodyExt, sizeof(bodyExt), true);
        buildSupabaseRow(t, bodyLegacy, sizeof(bodyLegacy), false);

        const char *toSend = _supabaseExtendedColsSupported ? bodyExt : bodyLegacy;

        if (WiFi.status() == WL_CONNECTED) {
            WiFiClientSecure client;
            client.setInsecure();
            HTTPClient http;
            if (http.begin(client, endpoint)) {
                http.addHeader("Content-Type", "application/json");
                http.addHeader("apikey", SUPABASE_ANON_KEY);
                http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
                http.addHeader("Prefer", "return=minimal");
                int code = http.POST((uint8_t*)toSend, strlen(toSend));
                if (code == 400 && _supabaseExtendedColsSupported) {
                    // SQL migration not applied yet -> auto-negotiate to 27-col legacy schema without losing data!
                    _supabaseExtendedColsSupported = false;
                    USB_OUT.println(F("[Supabase] Extended SHT31 columns not in DB yet -> using 27-col compatible mode"));
                    code = http.POST((uint8_t*)bodyLegacy, strlen(bodyLegacy));
                }
                http.end();
                if (code >= 200 && code < 300) {
                    t.cloudSentCount++;
                    return true;
                }
            }
        } else if (t.modemAwake) {
            int lteCode = 0;
            bool ok = modem.postToSupabaseViaLte(endpoint, SUPABASE_ANON_KEY, String(toSend), &lteCode);
            if (!ok && lteCode == 400 && _supabaseExtendedColsSupported) {
                _supabaseExtendedColsSupported = false;
                ok = modem.postToSupabaseViaLte(endpoint, SUPABASE_ANON_KEY, String(bodyLegacy), &lteCode);
            }
            if (ok) {
                t.cloudSentCount++;
                return true;
            }
        }
        return false;
    }

private:
    WebServer _httpServer;
    MinWebSocketServer _wsServer;
    KartTelemetry *_stateRef = nullptr;
    EnvSht31 *_shtRef = nullptr;
    TempDs18b20 *_ds18Ref = nullptr;
    PowerIna22x *_inaRef = nullptr;
    ImuBmi160 *_imuRef = nullptr;
    RtcDs3231 *_rtcRef = nullptr;
    SdLogger *_sdRef = nullptr;
    GpsSim7672 *_modemRef = nullptr;
    SelfTestEngine *_selfTestRef = nullptr;
    CalibrationManager *_calMgrRef = nullptr;
    unsigned long _lastCloudSync = 0;
    unsigned long _lastUsbPrintMs = 0;
    unsigned long _lastWifiCheckMs = 0;
    bool _supabaseExtendedColsSupported = true;
    String _lastJson = "{}";
    String _bootTestJson = "{}";

    bool tryConnectSta(const char *ssid, const char *pass, uint32_t timeoutMs, KartTelemetry &t) {
        USB_OUT.printf("[Wi-Fi] Trying SSID '%s'", ssid);
        WiFi.begin(ssid, pass);
        unsigned long start = millis();
        while (WiFi.status() != WL_CONNECTED && (millis() - start) < timeoutMs) {
            delay(300);
            digitalWrite(BOARD_LED_PIN, !digitalRead(BOARD_LED_PIN));
            USB_OUT.print(".");
        }
        USB_OUT.println();
        if (WiFi.status() == WL_CONNECTED) {
            strncpy(t.wifiSsid, ssid, sizeof(t.wifiSsid) - 1);
            t.wifiSsid[sizeof(t.wifiSsid) - 1] = '\0';
            t.rssi = WiFi.RSSI();
            t.netMode = 1;
            return true;
        }
        WiFi.disconnect(false);
        delay(80);
        return false;
    }

    static void buildSupabaseRow(const KartTelemetry &t, char *buf, size_t sz, bool includeSht31Cols) {
        char sessPrefix[40] = "";
        if (t.cloudSessionId > 0) {
            snprintf(sessPrefix, sizeof(sessPrefix), "\"session_id\":%lld,", (long long)t.cloudSessionId);
        }

        if (includeSht31Cols) {
            char shtFields[120];
            if (t.shtReady) {
                snprintf(shtFields, sizeof(shtFields),
                         ",\"sht_temp_c\":%.2f,\"sht_hum_rh\":%.2f,\"dew_point_c\":%.2f",
                         t.shtTempC, t.shtHumRh, t.dewPointC);
            } else {
                snprintf(shtFields, sizeof(shtFields),
                         ",\"sht_temp_c\":null,\"sht_hum_rh\":null,\"dew_point_c\":null");
            }

            char hdopField[32];
            if (t.gpsFix >= 2 && t.hdop < 90.0f) {
                snprintf(hdopField, sizeof(hdopField), ",\"hdop\":%.2f", t.hdop);
            } else {
                snprintf(hdopField, sizeof(hdopField), ",\"hdop\":null");
            }

            char ds18Fields[96];
            if (t.ds18Ready) {
                if (t.ds18MotorPresent) {
                    snprintf(ds18Fields, sizeof(ds18Fields), ",\"ds18_ctrl_c\":%.2f,\"ds18_motor_c\":%.2f", t.ds18CtrlC, t.ds18MotorC);
                } else {
                    snprintf(ds18Fields, sizeof(ds18Fields), ",\"ds18_ctrl_c\":%.2f,\"ds18_motor_c\":null", t.ds18CtrlC);
                }
            } else {
                snprintf(ds18Fields, sizeof(ds18Fields), ",\"ds18_ctrl_c\":null,\"ds18_motor_c\":null");
            }

            char inaFields[140];
            if (t.inaReady) {
                snprintf(inaFields, sizeof(inaFields),
                         ",\"ina_bus_v\":%.3f,\"ina_current_a\":%.3f,\"ina_power_w\":%.2f,\"ina_energy_wh\":%.3f",
                         t.inaBusV, t.inaCurrentA, t.inaPowerW, t.inaEnergyWh);
            } else {
                snprintf(inaFields, sizeof(inaFields),
                         ",\"ina_bus_v\":null,\"ina_current_a\":null,\"ina_power_w\":null,\"ina_energy_wh\":null");
            }

            snprintf(buf, sz,
                     "{%s\"rtc_ts\":\"%s\",\"vbat_mv\":%u,\"solar_mv\":%u,"
                     "\"gyro_temp_c\":%.1f,\"rtc_temp_c\":%.2f,"
                     "\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,\"gx\":%.2f,\"gy\":%.2f,\"gz\":%.2f,"
                     "\"roll\":%.2f,\"pitch\":%.2f,\"yaw\":%.2f,\"peak_g\":%.2f,\"vib_rms\":%.3f,"
                     "\"lat\":%.6f,\"lon\":%.6f,\"speed_kmh\":%.1f,\"alt_m\":%.1f,\"course_deg\":%.1f,"
                     "\"sats\":%u,\"gps_fix\":%u,\"sd_kb\":%lu,\"rssi\":%d,\"net_mode\":%u"
                     "%s%s,\"sats_view\":%u%s%s}",
                     sessPrefix, t.isoTimestamp, t.vbatMv, t.solarMv,
                     t.gyroTempC, t.rtcTempC,
                     t.ax, t.ay, t.az, t.gx, t.gy, t.gz,
                     t.roll, t.pitch, t.yaw, t.peakG, t.vibRms,
                     t.lat, t.lon, t.speedKmh, t.altM, t.courseDeg,
                     t.satellites, t.gpsFix, (unsigned long)t.sdLogKb, (int)t.rssi, t.netMode,
                     shtFields, hdopField, t.satsInView, ds18Fields, inaFields);
        } else {
            snprintf(buf, sz,
                     "{%s\"rtc_ts\":\"%s\",\"vbat_mv\":%u,\"solar_mv\":%u,"
                     "\"gyro_temp_c\":%.1f,\"rtc_temp_c\":%.2f,"
                     "\"ax\":%.3f,\"ay\":%.3f,\"az\":%.3f,\"gx\":%.2f,\"gy\":%.2f,\"gz\":%.2f,"
                     "\"roll\":%.2f,\"pitch\":%.2f,\"yaw\":%.2f,\"peak_g\":%.2f,\"vib_rms\":%.3f,"
                     "\"lat\":%.6f,\"lon\":%.6f,\"speed_kmh\":%.1f,\"alt_m\":%.1f,\"course_deg\":%.1f,"
                     "\"sats\":%u,\"gps_fix\":%u,\"sd_kb\":%lu,\"rssi\":%d,\"net_mode\":%u}",
                     sessPrefix, t.isoTimestamp, t.vbatMv, t.solarMv,
                     t.gyroTempC, t.rtcTempC,
                     t.ax, t.ay, t.az, t.gx, t.gy, t.gz,
                     t.roll, t.pitch, t.yaw, t.peakG, t.vibRms,
                     t.lat, t.lon, t.speedKmh, t.altM, t.courseDeg,
                     t.satellites, t.gpsFix, (unsigned long)t.sdLogKb, (int)t.rssi, t.netMode);
        }
    }

    String buildDiagnosticsJson() {
        String wire0 = "[";
        for (uint8_t a = 0x08; a < 0x78; a++) {
            Wire.beginTransmission(a);
            if (Wire.endTransmission() == 0) {
                if (wire0.length() > 1) wire0 += ",";
                char hx[8]; snprintf(hx, sizeof(hx), "\"0x%02X\"", a); wire0 += hx;
            }
        }
        wire0 += "]";

        String wire1 = "[";
        for (uint8_t a = 0x08; a < 0x78; a++) {
            Wire1.beginTransmission(a);
            if (Wire1.endTransmission() == 0) {
                if (wire1.length() > 1) wire1 += ",";
                char hx[8]; snprintf(hx, sizeof(hx), "\"0x%02X\"", a); wire1 += hx;
            }
        }
        wire1 += "]";

        String cal  = (_shtRef && _stateRef) ? _shtRef->buildCalibrationJson(*_stateRef) : "{}";
        String allC = (_calMgrRef && _rtcRef && _imuRef && _shtRef && _ds18Ref && _inaRef && _stateRef)
                      ? _calMgrRef->buildAllCalibrationsJson(*_rtcRef, *_imuRef, *_shtRef, *_ds18Ref, *_inaRef, *_stateRef)
                      : "{}";
        String ip   = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : WiFi.softAPIP().toString();
        String apIp = WiFi.softAPIP().toString();
        String mdl  = _modemRef ? _modemRef->getModemModel() : "UNKNOWN";
        String rawG = _modemRef ? _modemRef->getLastRawCgnss() : "";
        rawG.replace("\"", "'");

        String out = "{";
        out += "\"wifi_ssid\":\"" + String(_stateRef ? _stateRef->wifiSsid : "") + "\",";
        out += "\"local_ip\":\"" + ip + "\",";
        out += "\"hotspot_ap\":\"" + String(WIFI_AP_SSID) + " (http://" + apIp + "/)\",";
        out += "\"rssi_dbm\":" + String(_stateRef ? _stateRef->rssi : 0) + ",";
        out += "\"supabase_ext_cols\":" + String(_supabaseExtendedColsSupported ? "true" : "false") + ",";
        out += "\"i2c_bus0_io1_io2\":" + wire0 + ",";
        out += "\"i2c_bus1_io42_io41\":" + wire1 + ",";
        out += "\"calibration\":" + cal + ",";
        out += "\"all_sensors_calibration\":" + allC + ",";
        out += "\"modem_model\":\"" + mdl + "\",";
        out += "\"last_cgnssinfo\":\"" + rawG + "\"";
        out += "}";
        return out;
    }
};

#endif

