/**
 * rtc_troubleshoot.ino
 * Dedicated Diagnostic & Auto-Recovery Suite for DS3231 RTC + AT24C32 EEPROM
 * Target: LilyGO T-SIM7672G V1.1 (ESP32-S3)
 */

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WebServer.h>

#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1)
  #if defined(ARDUINO_USB_CDC_ON_BOOT) && (ARDUINO_USB_CDC_ON_BOOT == 1)
    #define OUT Serial
  #else
    #define OUT USBSerial
  #endif
#else
  #define OUT Serial
#endif

#if __has_include("../../../secrets.h")
  #include "../../../secrets.h"
#endif
#ifndef WIFI_SSID
  #define WIFI_SSID "YOUR_PRIMARY_WIFI_SSID"
#endif
#ifndef WIFI_PASS
  #define WIFI_PASS "YOUR_PRIMARY_WIFI_PASSWORD"
#endif
#define BOARD_LED 12

#define PIN_WIRE0_SDA 1
#define PIN_WIRE0_SCL 2
#define PIN_WIRE1_SDA 42
#define PIN_WIRE1_SCL 41

WebServer server(80);

struct DiagResult {
    bool pin42_high;
    bool pin41_high;
    bool wire1_found_rtc;
    bool wire1_found_eeprom;
    bool wire1_swapped_rtc;
    bool wire1_swapped_eeprom;
    bool wire0_found_rtc;
    bool wire0_found_imu;
    float rtc_temp;
    String rtc_time_str;
    String diagnosis;
    String logBuffer;
};

DiagResult diag;

void logMsg(const String &msg) {
    OUT.println(msg);
    diag.logBuffer += msg + "\n";
    if (diag.logBuffer.length() > 3000) diag.logBuffer = diag.logBuffer.substring(diag.logBuffer.length() - 2500);
}

static uint8_t bcd2dec(uint8_t v) { return ((v / 16) * 10) + (v % 16); }

bool probeAddress(TwoWire &wire, uint8_t addr) {
    wire.beginTransmission(addr);
    return (wire.endTransmission() == 0);
}

void readRtcData(TwoWire &wire) {
    wire.beginTransmission(0x68);
    wire.write(0x00);
    if (wire.endTransmission(false) == 0 && wire.requestFrom((uint8_t)0x68, (uint8_t)7) == 7) {
        uint8_t sec   = bcd2dec(wire.read() & 0x7F);
        uint8_t min   = bcd2dec(wire.read());
        uint8_t hour  = bcd2dec(wire.read() & 0x3F);
        wire.read(); // day of week
        uint8_t date  = bcd2dec(wire.read());
        uint8_t month = bcd2dec(wire.read() & 0x1F);
        uint16_t year = 2000 + bcd2dec(wire.read());
        char buf[64];
        snprintf(buf, sizeof(buf), "%04u-%02u-%02u %02u:%02u:%02u UTC", year, month, date, hour, min, sec);
        diag.rtc_time_str = String(buf);
    }
    wire.beginTransmission(0x68);
    wire.write(0x11);
    if (wire.endTransmission(false) == 0 && wire.requestFrom((uint8_t)0x68, (uint8_t)2) == 2) {
        int8_t msb = (int8_t)wire.read();
        uint8_t lsb = wire.read() >> 6;
        diag.rtc_temp = (float)msb + ((float)lsb * 0.25f);
    }
}

void runDiagnostics() {
    diag.logBuffer = "";
    logMsg("=================================================");
    logMsg("  DS3231 RTC HARDWARE TROUBLESHOOTING & SCANNER  ");
    logMsg("=================================================");

    pinMode(PIN_WIRE1_SDA, INPUT_PULLUP);
    pinMode(PIN_WIRE1_SCL, INPUT_PULLUP);
    delay(20);
    diag.pin42_high = (digitalRead(PIN_WIRE1_SDA) == HIGH);
    diag.pin41_high = (digitalRead(PIN_WIRE1_SCL) == HIGH);

    logMsg("[STEP 1] Physical GPIO Level (Internal Pullups Enabled):");
    logMsg(String("  GPIO 42 (Right Pin 7 - SDA): ") + (diag.pin42_high ? "HIGH (OK - 3.3V)" : "LOW (STUCK TO GND/SHORT!)"));
    logMsg(String("  GPIO 41 (Right Pin 8 - SCL): ") + (diag.pin41_high ? "HIGH (OK - 3.3V)" : "LOW (STUCK TO GND/SHORT!)"));

    logMsg("\n[STEP 2] Probing Wire1 (SDA=42, SCL=41 @ 100kHz)...");
    Wire1.end();
    Wire1.begin(PIN_WIRE1_SDA, PIN_WIRE1_SCL, 100000);
    delay(30);
    diag.wire1_found_rtc    = probeAddress(Wire1, 0x68);
    diag.wire1_found_eeprom = probeAddress(Wire1, 0x57);
    logMsg(String("  DS3231 Clock (0x68): ") + (diag.wire1_found_rtc ? "FOUND! (SUCCESS)" : "NOT DETECTED"));
    logMsg(String("  AT24C32 EEPROM(0x57): ") + (diag.wire1_found_eeprom ? "FOUND! (SUCCESS)" : "NOT DETECTED"));

    if (diag.wire1_found_rtc) {
        readRtcData(Wire1);
        logMsg(String("  Current Time: ") + diag.rtc_time_str);
        logMsg(String("  DS3231 Temp : ") + String(diag.rtc_temp, 2) + " C");
    }

    if (!diag.wire1_found_rtc) {
        logMsg("\n[STEP 3] Probing Wire1 with SWAPPED pins (SDA=41, SCL=42)...");
        Wire1.end();
        Wire1.begin(PIN_WIRE1_SCL, PIN_WIRE1_SDA, 100000);
        delay(30);
        diag.wire1_swapped_rtc    = probeAddress(Wire1, 0x68);
        diag.wire1_swapped_eeprom = probeAddress(Wire1, 0x57);
        if (diag.wire1_swapped_rtc || diag.wire1_swapped_eeprom) {
            logMsg("  ALERT: WIRES ARE REVERSED! Swap Cyan (42) and Orange (41)!");
            if (diag.wire1_swapped_rtc) { readRtcData(Wire1); logMsg("  Time: " + diag.rtc_time_str); }
        } else {
            logMsg("  Reversed scan: Not detected.");
        }
    }

    logMsg("\n[STEP 4] Probing Wire0 (SDA=1, SCL=2)...");
    Wire.end();
    Wire.begin(PIN_WIRE0_SDA, PIN_WIRE0_SCL, 100000);
    delay(30);
    bool w0_68 = probeAddress(Wire, 0x68);
    bool w0_57 = probeAddress(Wire, 0x57);
    diag.wire0_found_rtc = w0_68;
    logMsg(String("  Wire0 0x68 device : ") + (w0_68 ? "PRESENT" : "NOT PRESENT"));
    logMsg(String("  Wire0 0x57 EEPROM : ") + (w0_57 ? "PRESENT (Module is on Wire0!)" : "NOT PRESENT"));

    if (diag.wire1_found_rtc) {
        diag.diagnosis = "SUCCESS: DS3231 RTC is operational on GPIO 42 & 41.";
    } else if (diag.wire1_swapped_rtc) {
        diag.diagnosis = "WIRING ERROR: Swap wires on GPIO 41 and 42.";
    } else if (w0_57) {
        diag.diagnosis = "BUS ERROR: Module is wired to GPIO 1 & 2 instead of 42 & 41.";
    } else if (!diag.pin42_high || !diag.pin41_high) {
        diag.diagnosis = "POWER/GND ERROR: GPIO 41 or 42 is stuck LOW. Check VCC & GND connections!";
    } else {
        diag.diagnosis = "NO POWER: DS3231 not responding. Check 3.3V and GND wires on the left header!";
    }
    logMsg("\nDIAGNOSIS: " + diag.diagnosis);
}

String buildHtmlPage() {
    String html = "<!DOCTYPE html><html><head><meta charset='utf-8'>";
    html += "<meta name='viewport' content='width=device-width,initial-scale=1'>";
    html += "<title>DS3231 RTC Diagnostic</title>";
    html += "<style>body{font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:20px;}";
    html += ".card{max-width:680px;margin:0 auto;background:#1e293b;border-radius:12px;padding:20px;border:1px solid #334155;}";
    html += "h1{color:#38bdf8;font-size:20px;}";
    html += ".badge{display:inline-block;padding:6px 12px;border-radius:16px;font-weight:bold;margin:10px 0;}";
    html += ".ok{background:#166534;color:#4ade80;}.fail{background:#991b1b;color:#fca5a5;}.warn{background:#854d0e;color:#fef08a;}";
    html += "table{width:100%;border-collapse:collapse;margin:12px 0;}td,th{padding:8px;border-bottom:1px solid #334155;text-align:left;}";
    html += "pre{background:#0b1120;padding:10px;border-radius:6px;font-size:11px;color:#cbd5e1;max-height:220px;overflow:auto;}";
    html += ".btn{background:#0284c7;color:#fff;padding:8px 16px;border-radius:6px;font-weight:bold;border:none;cursor:pointer;}";
    html += ".tip{background:#0c4a6e;border-left:4px solid #38bdf8;padding:10px;margin:10px 0;}";
    html += "</style></head><body><div class='card'>";
    html += "<h1>DS3231 RTC Live Diagnostic</h1>";

    if (diag.wire1_found_rtc) html += "<div class='badge ok'>DS3231 OK (0x68 FOUND)</div>";
    else if (diag.wire1_swapped_rtc) html += "<div class='badge warn'>WIRES SWAPPED</div>";
    else html += "<div class='badge fail'>DS3231 NOT DETECTED</div>";

    html += "<div class='tip'><strong>Diagnosis:</strong> " + diag.diagnosis + "</div>";
    html += "<table><tr><th>Check</th><th>Status</th></tr>";
    html += "<tr><td>GPIO 42 (Pin 7 - SDA)</td><td>" + String(diag.pin42_high ? "<span style='color:#4ade80'>HIGH (3.3V Pulled)</span>" : "<span style='color:#ef4444'>LOW (STUCK/SHORT)</span>") + "</td></tr>";
    html += "<tr><td>GPIO 41 (Pin 8 - SCL)</td><td>" + String(diag.pin41_high ? "<span style='color:#4ade80'>HIGH (3.3V Pulled)</span>" : "<span style='color:#ef4444'>LOW (STUCK/SHORT)</span>") + "</td></tr>";
    html += "<tr><td>Wire1 DS3231 (0x68)</td><td>" + String(diag.wire1_found_rtc ? "<span style='color:#4ade80'>FOUND</span>" : "<span style='color:#ef4444'>NO ACK</span>") + "</td></tr>";
    html += "<tr><td>Wire1 EEPROM (0x57)</td><td>" + String(diag.wire1_found_eeprom ? "<span style='color:#4ade80'>FOUND</span>" : "<span style='color:#ef4444'>NO ACK</span>") + "</td></tr>";
    html += "<tr><td>Swapped (SDA=41,SCL=42)</td><td>" + String(diag.wire1_swapped_rtc ? "<span style='color:#fde047'>FOUND (Swap wires!)</span>" : "No Ack") + "</td></tr>";
    if (diag.wire1_found_rtc) {
        html += "<tr><td>Clock Time</td><td><strong>" + diag.rtc_time_str + "</strong></td></tr>";
        html += "<tr><td>DS3231 Temp</td><td><strong>" + String(diag.rtc_temp, 2) + " C</strong></td></tr>";
    }
    html += "</table>";
    html += "<form method='POST' action='/rescan'><button class='btn' type='submit'>Re-Scan</button></form>";
    html += "<h4>Diagnostic Log:</h4><pre>" + diag.logBuffer + "</pre>";
    html += "</div></body></html>";
    return html;
}

void setup() {
    pinMode(BOARD_LED, OUTPUT);
    digitalWrite(BOARD_LED, HIGH);

    Serial.begin(115200);
#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1) && (!defined(ARDUINO_USB_CDC_ON_BOOT) || (ARDUINO_USB_CDC_ON_BOOT == 0))
    USBSerial.begin(115200);
#endif
    delay(1000);

    runDiagnostics();

    WiFi.disconnect(true);
    delay(100);
    WiFi.mode(WIFI_STA);
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    unsigned long start = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - start < 8000) {
        delay(250);
        digitalWrite(BOARD_LED, !digitalRead(BOARD_LED));
    }
    if (WiFi.status() == WL_CONNECTED) {
        digitalWrite(BOARD_LED, LOW);
        OUT.printf("\n[Wi-Fi] Connected! Open browser at: http://%s\n", WiFi.localIP().toString().c_str());
    } else {
        WiFi.mode(WIFI_AP);
        WiFi.softAP("RTC-DIAG", "12345678");
        OUT.printf("\n[Wi-Fi] AP Mode! Connect to 'RTC-DIAG' and open: http://%s\n", WiFi.softAPIP().toString().c_str());
    }

    server.on("/", HTTP_GET, []() { server.send(200, "text/html", buildHtmlPage()); });
    server.on("/rescan", HTTP_POST, []() {
        runDiagnostics();
        server.sendHeader("Location", "/");
        server.send(303);
    });
    server.on("/json", HTTP_GET, []() {
        String json = "{";
        json += "\"pin42_high\":" + String(diag.pin42_high ? "true" : "false") + ",";
        json += "\"pin41_high\":" + String(diag.pin41_high ? "true" : "false") + ",";
        json += "\"rtc_found\":" + String(diag.wire1_found_rtc ? "true" : "false") + ",";
        json += "\"eeprom_found\":" + String(diag.wire1_found_eeprom ? "true" : "false") + ",";
        json += "\"swapped\":" + String(diag.wire1_swapped_rtc ? "true" : "false") + ",";
        json += "\"time\":\"" + diag.rtc_time_str + "\",";
        json += "\"temp\":" + String(diag.rtc_temp, 2) + ",";
        json += "\"diagnosis\":\"" + diag.diagnosis + "\"}";
        server.send(200, "application/json", json);
    });
    server.begin();
}

void loop() {
    server.handleClient();
    delay(10);
}
