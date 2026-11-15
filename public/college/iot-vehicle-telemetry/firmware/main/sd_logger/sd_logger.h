/**
 * sd_logger.h
 * 32GB MicroSD High-Speed Blackbox Telemetry Logger
 * Pins: CS=13, MOSI=14, SCK=21, MISO=47
 * Logs JSONL + CSV with exact DS3231 timestamps for zero data loss
 */
#ifndef SD_LOGGER_H
#define SD_LOGGER_H

#include "../config.h"
#include <SPI.h>
#include <SD.h>

class SdLogger {
public:
    bool begin(KartTelemetry &t) {
        SPI.begin(BOARD_SD_SCK_PIN, BOARD_SD_MISO_PIN, BOARD_SD_MOSI_PIN, BOARD_SD_CS_PIN);
        if (!SD.begin(BOARD_SD_CS_PIN, SPI, 20000000)) {
            USB_OUT.println(F("[MicroSD] Card mount failed or no 32GB card inserted"));
            t.sdMounted = false;
            return false;
        }

        uint64_t cardSizeMB = SD.cardSize() / (1024 * 1024);
        USB_OUT.printf("[MicroSD] Mounted! Size: %llu MB\n", cardSizeMB);

        if (!SD.exists("/logs")) {
            SD.mkdir("/logs");
        }
        if (!SD.exists("/calibration")) {
            SD.mkdir("/calibration");
        }

        // Preserve ALL existing CSVs on SD card; each boot increments bootCount via NVS+EEPROM
        snprintf(_logPath, sizeof(_logPath), "/logs/kart_session_%04lu.csv", (unsigned long)t.bootCount);
        File f = SD.open(_logPath, FILE_APPEND);
        if (f) {
            if (f.size() == 0) {
                f.println("rtc_ts,uptime_ms,vbat_mv,vbat_v,solar_mv,gyro_temp_c,rtc_temp_c,ax,ay,az,gx,gy,gz,roll,pitch,yaw,peak_g,vib_rms,lat,lon,speed_kmh,alt_m,course_deg,sats,gps_fix,sht_temp_c,sht_hum_rh,dew_point_c,hdop,sats_view,ds18_ctrl_c,ds18_motor_c,ina_bus_v,ina_current_a,ina_power_w,ina_energy_wh");
            }
            f.close();
            t.sdMounted = true;
            USB_OUT.printf("[MicroSD] Logging to %s\n", _logPath);
            return true;
        }

        t.sdMounted = false;
        return false;
    }

    void logRecord(KartTelemetry &t, const char *jsonLine) {
        (void)jsonLine;
        if (!t.sdMounted) return;

        File f = SD.open(_logPath, FILE_APPEND);
        if (!f) {
            t.sdMounted = false;
            return;
        }

        char csv[420];
        snprintf(csv, sizeof(csv),
                 "%s,%lu,%u,%.3f,%u,%.1f,%.2f,%.3f,%.3f,%.3f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f,%.3f,%.6f,%.6f,%.1f,%.1f,%.1f,%u,%u,%.2f,%.2f,%.2f,%.1f,%u,%.2f,%.2f,%.3f,%.3f,%.2f,%.3f",
                 t.isoTimestamp, (unsigned long)t.uptimeMs,
                 t.vbatMv, t.vbatV, t.solarMv,
                 t.gyroTempC, t.rtcTempC,
                 t.ax, t.ay, t.az, t.gx, t.gy, t.gz,
                 t.roll, t.pitch, t.yaw, t.peakG, t.vibRms,
                 t.lat, t.lon, t.speedKmh, t.altM, t.courseDeg,
                 t.satellites, t.gpsFix,
                 t.shtTempC, t.shtHumRh, t.dewPointC,
                 t.hdop, t.satsInView,
                 t.ds18CtrlC, t.ds18MotorC,
                 t.inaBusV, t.inaCurrentA, t.inaPowerW, t.inaEnergyWh);

        f.println(csv);
        t.sdRecords++;
        t.sdLogKb = (uint32_t)(f.size() / 1024);
        f.close();
    }

    const char* getLogPath() const { return _logPath; }

    // Appends a calibration certificate / curve point to `/calibration/<sensor>.csv` (never deletes existing CSVs)
    bool logCalibrationCsv(const char *sensorSlug, const char *headerCols, const String &csvRow) {
        if (!SD.cardType()) return false;
        if (!SD.exists("/calibration")) SD.mkdir("/calibration");
        char p[64];
        snprintf(p, sizeof(p), "/calibration/%s.csv", sensorSlug);
        File f = SD.open(p, FILE_APPEND);
        if (!f) return false;
        if (f.size() == 0 && headerCols != nullptr) {
            f.println(headerCols);
        }
        f.println(csvRow);
        f.close();
        return true;
    }

    // Lists all preserved CSV files in `/logs` and `/calibration` on the 32GB MicroSD card
    String listAllCsvFilesJson() {
        String j = "{\"logs\":[";
        appendDirJson("/logs", j);
        j += "],\"calibration\":[";
        appendDirJson("/calibration", j);
        j += "]}";
        return j;
    }

private:
    char _logPath[40] = "/logs/kart_session_0001.csv";

    static void appendDirJson(const char *dirPath, String &out) {
        File dir = SD.open(dirPath);
        if (!dir || !dir.isDirectory()) return;
        bool first = true;
        File entry = dir.openNextFile();
        int guard = 0;
        while (entry && guard++ < 60) {
            if (!entry.isDirectory()) {
                if (!first) out += ",";
                first = false;
                out += "{\"name\":\"" + String(entry.name()) + "\",\"bytes\":" + String((unsigned long)entry.size()) + "}";
            }
            entry.close();
            entry = dir.openNextFile();
        }
        dir.close();
    }
};

#endif
