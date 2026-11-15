/**
 * gps_sim7672.h
 * LilyGO T-SIM7672G Built-in Multi-GNSS (GPS/GLONASS/Galileo/BeiDou) + 4G LTE Cellular
 */
#ifndef GPS_SIM7672_H
#define GPS_SIM7672_H

#include "../config.h"
#include "rtc_ds3231.h"

#define SerialAT Serial1

class GpsSim7672 {
public:
    bool begin(KartTelemetry &t) {
        // Hold active-LOW hardware RESET pin (GPIO 17) HIGH (deasserted)
        pinMode(MODEM_RESET_PIN, OUTPUT);
        digitalWrite(MODEM_RESET_PIN, !MODEM_RESET_LEVEL);

        pinMode(MODEM_DTR_PIN, OUTPUT);
        digitalWrite(MODEM_DTR_PIN, LOW);

        pinMode(MODEM_PWRKEY_PIN, OUTPUT);
        digitalWrite(MODEM_PWRKEY_PIN, LOW);

        SerialAT.setRxBufferSize(1024);
        SerialAT.begin(115200, SERIAL_8N1, MODEM_RX_PIN, MODEM_TX_PIN);
        delay(150);

        // Probe AT BEFORE pulsing PWRKEY so warm MCU resets never toggle an awake modem OFF
        _modemAwake = false;
        for (int i = 0; i < 3; i++) {
            if (sendATWait("AT", "OK", 250)) {
                _modemAwake = true;
                break;
            }
        }

        if (!_modemAwake) {
            USB_OUT.println(F("[SIM767x] Cold-booting modem via PWRKEY (GPIO 18)..."));
            digitalWrite(MODEM_PWRKEY_PIN, LOW);
            delay(60);
            digitalWrite(MODEM_PWRKEY_PIN, HIGH);
            delay(150);
            digitalWrite(MODEM_PWRKEY_PIN, LOW);

            unsigned long bootStart = millis();
            while (millis() - bootStart < 7500) {
                if (sendATWait("AT", "OK", 450)) {
                    _modemAwake = true;
                    break;
                }
                delay(150);
            }
        }

        t.modemAwake = _modemAwake;

        if (_modemAwake) {
            sendATWait("ATE0", "OK", 300);
            queryModemIdentity();
            USB_OUT.printf("[SIM767x] Modem Awake! Model: %s\n", _modemModel.c_str());
            enableGnss(t);
            configureLteApn();
            connect4GNetwork(t);
            RtcDs3231 dummyRtc;
            poll(t, dummyRtc, false);
        } else {
            USB_OUT.println(F("[SIM767x] WARNING: Modem did not answer AT (TX=11, RX=10). Check 18650 switch!"));
        }
        return _modemAwake;
    }

    bool enableGnss(KartTelemetry &t) {
        if (!_modemAwake) return false;

        // Enable 3.3V bias on SIM7670G/7672G internal GPIO 4 for 28dBi active ceramic GPS antenna
        sendATWait("AT+CGDRT=4,1", "OK", 350);
        sendATWait("AT+CGSETV=4,1", "OK", 350);

        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CGNSSPWR?");
        String pwrResp = collectResponse(500);
        if (pwrResp.indexOf("+CGNSSPWR: 1") >= 0) {
            _gnssEnabled = true;
            t.gnssPowered = true;
        } else {
            while (SerialAT.available()) SerialAT.read();
            SerialAT.println("AT+CGNSSPWR=1");
            unsigned long t0 = millis();
            String acc = "";
            bool gotOk = false;
            while (millis() - t0 < 3200) {
                while (SerialAT.available()) acc += (char)SerialAT.read();
                if (acc.indexOf("OK") >= 0) gotOk = true;
                if (acc.indexOf("READY") >= 0 || acc.indexOf("ERROR") >= 0) break;
                delay(10);
            }
            _gnssEnabled = gotOk;
            t.gnssPowered = gotOk;
        }

        if (_gnssEnabled) {
            // Enable 4-Constellation GNSS: 15 = GPS + GLONASS + GALILEO + BDS
            if (!sendATWait("AT+CGNSSMODE=15", "OK", 400)) {
                sendATWait("AT+CGNSSMODE=15,1", "OK", 400);
            }
            USB_OUT.println(F("[GNSS] Active Antenna 3.3V LNA ON + Multi-GNSS (GPS+GLO+GAL+BDS) Ready"));
        }
        return _gnssEnabled;
    }

    void configureLteApn() {
        String cmd = String("AT+CGDCONT=1,\"IP\",\"") + SIM_APN + "\"";
        sendATWait(cmd.c_str(), "OK", 500);
    }

    void connect4GNetwork(KartTelemetry &t) {
        sendATWait("AT+CPIN?", "READY", 800);
        sendATWait("AT+CEREG=2", "OK", 350);
        updateCellularSignal(t);
        sendATWait("AT+CGACT=1,1", "OK", 2500);
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CGPADDR=1");
        String cpip = readLineWithPrefix("+CGPADDR:", 800);
        if (cpip.length() > 0) {
            USB_OUT.printf("[4G LTE] PDP Context: %s (CSQ=%d, CEREG=%u)\n",
                           cpip.c_str(), (int)t.lteCsq, t.lteRegStatus);
        }
    }

    bool triggerAgps() {
        if (!_modemAwake) return false;
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CAGPS");
        String r = collectResponse(4000);
        return (r.indexOf("success") >= 0 || r.indexOf("OK") >= 0);
    }

    bool restartGnss(uint8_t mode) {
        if (!_modemAwake) return false;
        const char *cmd = (mode == 0) ? "AT+CGPSCOLD" : (mode == 1 ? "AT+CGPSWARM" : "AT+CGPSHOT");
        return sendATWait(cmd, "OK", 800);
    }

    void poll(KartTelemetry &t, RtcDs3231 &rtc, bool allowRtcSync = true) {
        if (!_modemAwake) {
            if (sendATWait("AT", "OK", 120)) {
                _modemAwake = true;
                t.modemAwake = true;
                sendATWait("ATE0", "OK", 200);
                enableGnss(t);
                configureLteApn();
            }
            return;
        }
        t.modemAwake = true;
        if (!_gnssEnabled) enableGnss(t);

        _pollCounter++;
        if ((_pollCounter % 10) == 0) updateCellularSignal(t);

        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CGNSSINFO");

        String line = readLineWithPrefix("+CGNSSINFO:", 350);
        if (line.length() > 11) {
            _lastRawCgnss = line;
            parseCgnssInfo(line, t, rtc, allowRtcSync);
        }

        // Pre-fix NMEA satellite visibility & SNR inspector when gpsFix == 0
        if (t.gpsFix == 0 && (_pollCounter % 3) == 1) {
            samplePreFixNmeaSatellites(t);
        }
    }

    bool postToSupabaseViaLte(const String &url, const String &anonKey, const String &jsonPayload, int *httpStatusOut = nullptr) {
        if (!_modemAwake) return false;

        sendATWait("AT+HTTPTERM", "OK", 200);
        if (!sendATWait("AT+HTTPINIT", "OK", 1000)) return false;

        sendATWait("AT+CSSLCFG=\"sslversion\",0,4", "OK", 300);
        sendATWait("AT+CSSLCFG=\"enableSNI\",0,1", "OK", 300);

        String urlCmd = "AT+HTTPPARA=\"URL\",\"" + url + "\"";
        if (!sendATWait(urlCmd.c_str(), "OK", 500)) {
            sendATWait("AT+HTTPTERM", "OK", 200);
            return false;
        }

        sendATWait("AT+HTTPPARA=\"CONTENT\",\"application/json\"", "OK", 300);
        String keyHdr = "AT+HTTPPARA=\"USERDATA\",\"apikey: " + anonKey + "\\r\\nAuthorization: Bearer " + anonKey + "\\r\\nPrefer: return=minimal\"";
        sendATWait(keyHdr.c_str(), "OK", 400);

        String dataCmd = "AT+HTTPDATA=" + String(jsonPayload.length()) + ",5000";
        if (!sendATWait(dataCmd.c_str(), "DOWNLOAD", 1500)) {
            sendATWait("AT+HTTPTERM", "OK", 200);
            return false;
        }

        SerialAT.print(jsonPayload);
        if (!waitResponse("OK", 2000)) {
            sendATWait("AT+HTTPTERM", "OK", 200);
            return false;
        }

        SerialAT.println("AT+HTTPACTION=1");
        String actLine = readLineWithPrefix("+HTTPACTION:", 8000);
        sendATWait("AT+HTTPTERM", "OK", 300);

        int c1 = actLine.indexOf(',');
        int c2 = (c1 >= 0) ? actLine.indexOf(',', c1 + 1) : -1;
        int code = (c1 >= 0 && c2 > c1) ? actLine.substring(c1 + 1, c2).toInt() : 0;
        if (httpStatusOut) *httpStatusOut = code;
        return (code >= 200 && code < 300);
    }

    const String& getModemModel() const { return _modemModel; }
    const String& getLastRawCgnss() const { return _lastRawCgnss; }

    static float haversineMeters(double lat1, double lon1, double lat2, double lon2) {
        const double R = 6371000.0;
        double dLat = (lat2 - lat1) * (PI / 180.0);
        double dLon = (lon2 - lon1) * (PI / 180.0);
        double a = sin(dLat * 0.5) * sin(dLat * 0.5) +
                   cos(lat1 * (PI / 180.0)) * cos(lat2 * (PI / 180.0)) *
                   sin(dLon * 0.5) * sin(dLon * 0.5);
        return (float)(R * 2.0 * atan2(sqrt(a), sqrt(1.0 - a)));
    }

private:
    bool _modemAwake = false;
    bool _gnssEnabled = false;
    uint32_t _pollCounter = 0;
    String _modemModel = "SIM767x";
    String _lastRawCgnss = "";

    void queryModemIdentity() {
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CGMM");
        String resp = collectResponse(400);
        resp.replace("OK", "");
        resp.replace("+CGMM:", "");
        resp.trim();
        if (resp.length() > 2 && resp.length() < 40) _modemModel = resp;
    }

    void updateCellularSignal(KartTelemetry &t) {
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CSQ");
        String csqLine = readLineWithPrefix("+CSQ:", 300);
        int colon = csqLine.indexOf(':'), comma = csqLine.indexOf(',');
        if (colon >= 0 && comma > colon) {
            t.lteCsq = (int16_t)csqLine.substring(colon + 1, comma).toInt();
        }
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println("AT+CEREG?");
        String regLine = readLineWithPrefix("+CEREG:", 300);
        int rc = regLine.indexOf(',');
        if (rc > 0) t.lteRegStatus = (uint8_t)regLine.substring(rc + 1, rc + 3).toInt();
    }

    void samplePreFixNmeaSatellites(KartTelemetry &t) {
        if (!sendATWait("AT+CGNSSTST=1", "OK", 250)) return;
        uint8_t gp = 0, gl = 0, ga = 0, gb = 0, gn = 0, peakSnr = 0;
        unsigned long t0 = millis();
        String line = "";
        while (millis() - t0 < 850) {
            while (SerialAT.available()) {
                char c = (char)SerialAT.read();
                if (c == '\n') {
                    line.trim();
                    if (line.length() > 10 && line.indexOf("GSV,") == 3) {
                        parseGsvSentence(line, gp, gl, ga, gb, gn, peakSnr);
                    }
                    line = "";
                } else if (c != '\r') line += c;
            }
            delay(2);
        }
        sendATWait("AT+CGNSSTST=0", "OK", 250);
        while (SerialAT.available()) SerialAT.read();
        uint16_t totalView = (uint16_t)gp + gl + ga + gb;
        if (totalView == 0 && gn > 0) totalView = gn;
        t.satsInView = (uint8_t)((totalView > 99) ? 99 : totalView);
        t.maxCn0DbHz = peakSnr;
    }

    static void parseGsvSentence(const String &nmea, uint8_t &gp, uint8_t &gl, uint8_t &ga, uint8_t &gb, uint8_t &gn, uint8_t &peakSnr) {
        int star = nmea.indexOf('*');
        String clean = (star > 0) ? nmea.substring(0, star) : nmea;
        String f[22];
        int n = 0, s = 0;
        for (int i = 0; i <= (int)clean.length() && n < 22; i++) {
            if (i == (int)clean.length() || clean.charAt(i) == ',') {
                f[n++] = clean.substring(s, i);
                s = i + 1;
            }
        }
        if (n < 4) return;
        uint8_t iv = (uint8_t)f[3].toInt();
        if (clean.startsWith("$GPGSV") && iv > gp) gp = iv;
        else if (clean.startsWith("$GLGSV") && iv > gl) gl = iv;
        else if (clean.startsWith("$GAGSV") && iv > ga) ga = iv;
        else if ((clean.startsWith("$GBGSV") || clean.startsWith("$BDGSV")) && iv > gb) gb = iv;
        else if (clean.startsWith("$GNGSV") && iv > gn) gn = iv;
        for (int idx = 7; idx < n; idx += 4) {
            uint8_t snr = (uint8_t)f[idx].toInt();
            if (snr > peakSnr && snr <= 60) peakSnr = snr;
        }
    }

    String collectResponse(uint32_t timeoutMs) {
        unsigned long start = millis();
        String buf = "";
        while (millis() - start < timeoutMs) {
            while (SerialAT.available()) {
                buf += (char)SerialAT.read();
                if (buf.indexOf("OK\r\n") >= 0 || buf.indexOf("ERROR") >= 0) return buf;
            }
            delay(2);
        }
        return buf;
    }

    bool sendATWait(const char *cmd, const char *expected, uint32_t timeoutMs) {
        while (SerialAT.available()) SerialAT.read();
        SerialAT.println(cmd);
        return waitResponse(expected, timeoutMs);
    }

    bool waitResponse(const char *expected, uint32_t timeoutMs) {
        unsigned long start = millis();
        String buf = "";
        while (millis() - start < timeoutMs) {
            while (SerialAT.available()) {
                char c = (char)SerialAT.read();
                buf += c;
                if (buf.indexOf(expected) >= 0) return true;
                if (buf.indexOf("ERROR") >= 0) return false;
            }
            delay(1);
        }
        return false;
    }

    String readLineWithPrefix(const char *prefix, uint32_t timeoutMs) {
        unsigned long start = millis();
        String line = "";
        while (millis() - start < timeoutMs) {
            while (SerialAT.available()) {
                char c = (char)SerialAT.read();
                if (c == '\n') {
                    line.trim();
                    if (line.startsWith(prefix)) return line;
                    line = "";
                } else if (c != '\r') {
                    line += c;
                }
            }
            delay(1);
        }
        return "";
    }

    static double nmeaToDecimal(double ddmm, char indicator) {
        int deg = (int)(ddmm / 100.0);
        double mins = ddmm - (deg * 100.0);
        double dec = (double)deg + (mins / 60.0);
        if (indicator == 'S' || indicator == 'W') dec = -dec;
        return dec;
    }

    void parseCgnssInfo(const String &line, KartTelemetry &t, RtcDs3231 &rtc, bool allowRtcSync) {
        int colon = line.indexOf(':');
        if (colon < 0) return;
        String body = line.substring(colon + 1);
        body.trim();

        String fields[20];
        int fIdx = 0, start = 0;
        for (int i = 0; i <= (int)body.length() && fIdx < 20; i++) {
            if (i == (int)body.length() || body.charAt(i) == ',') {
                fields[fIdx++] = body.substring(start, i);
                start = i + 1;
            }
        }
        if (fIdx < 14) return;

        // SIM7670G/SIM7672G 17-field format: [0]=mode,[1]=GPS,[2]=BDS,[3]=GLO,[4]=GAL,[5]=lat,[6]=N/S,[7]=lon,[8]=E/W,...
        int latIdx = (fIdx >= 15 && (fields[5] == "N" || fields[5] == "S")) ? 4 : 5;

        uint8_t fixMode = (uint8_t)fields[0].toInt();
        t.gpsFix = fixMode;

        t.gpsSvs = (uint8_t)fields[1].toInt();
        t.bdsSvs = (uint8_t)fields[2].toInt();
        t.gloSvs = (uint8_t)fields[3].toInt();
        t.galSvs = (latIdx == 5) ? (uint8_t)fields[4].toInt() : 0;

        uint8_t usedSats = (uint8_t)(t.gpsSvs + t.bdsSvs + t.gloSvs + t.galSvs);
        t.satellites = usedSats;
        if (usedSats > t.satsInView) t.satsInView = usedSats;

        if ((fixMode == 2 || fixMode == 3) && fields[latIdx].length() > 0 && fields[latIdx + 2].length() > 0) {
            double rawLat = fields[latIdx].toDouble();
            char ns = fields[latIdx + 1].length() > 0 ? fields[latIdx + 1].charAt(0) : 'N';
            double rawLon = fields[latIdx + 2].toDouble();
            char ew = fields[latIdx + 3].length() > 0 ? fields[latIdx + 3].charAt(0) : 'W';

            t.lat       = nmeaToDecimal(rawLat, ns);
            t.lon       = nmeaToDecimal(rawLon, ew);
            t.altM      = fields[latIdx + 6].toFloat();
            t.speedKmh  = fields[latIdx + 7].toFloat() * 1.852f;
            t.courseDeg = fields[latIdx + 8].toFloat();

            if (fIdx > latIdx + 9  && fields[latIdx + 9].length() > 0)  t.pdop = fields[latIdx + 9].toFloat();
            if (fIdx > latIdx + 10 && fields[latIdx + 10].length() > 0) t.hdop = fields[latIdx + 10].toFloat();

            t.utpDistanceM = haversineMeters(t.lat, t.lon, UTP_REF_LAT, UTP_REF_LON);
            if (t.utpDistanceM <= UTP_CAMPUS_RADIUS_M) {
                t.placeConfirmed = 1; // UTP Campus Confirmed
            } else if (t.utpDistanceM <= PEREIRA_METRO_RADIUS_M) {
                t.placeConfirmed = 2; // Pereira / Dosquebradas Metro Confirmed
            } else {
                t.placeConfirmed = 3; // Valid GNSS Fix Elsewhere
            }

            String dateStr = fields[latIdx + 4];
            String timeStr = fields[latIdx + 5];
            if (allowRtcSync && dateStr.length() == 6 && timeStr.length() >= 6) {
                uint8_t d  = (uint8_t)dateStr.substring(0, 2).toInt();
                uint8_t m  = (uint8_t)dateStr.substring(2, 4).toInt();
                uint16_t y = (uint16_t)(2000 + dateStr.substring(4, 6).toInt());
                uint8_t hh = (uint8_t)timeStr.substring(0, 2).toInt();
                uint8_t mm = (uint8_t)timeStr.substring(2, 4).toInt();
                uint8_t ss = (uint8_t)timeStr.substring(4, 6).toInt();
                rtc.syncFromGps(y, m, d, hh, mm, ss);
            }
        }
    }
};

#endif

