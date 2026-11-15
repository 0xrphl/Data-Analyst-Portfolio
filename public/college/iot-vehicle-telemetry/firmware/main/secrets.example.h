/**
 * secrets.example.h
 * Copy this file to `secrets.h` (gitignored) in `main/` before flashing in Arduino IDE.
 * All Wi-Fi, Hotspot, Cellular APN & Supabase Cloud credentials live in one place!
 */
#ifndef KART_SECRETS_H
#define KART_SECRETS_H

// 1. Primary Home / Workshop Wi-Fi + Secondary Campus Fallback Wi-Fi
#define WIFI_SSID               "YOUR_PRIMARY_WIFI_SSID"
#define WIFI_PASS               "YOUR_PRIMARY_WIFI_PASSWORD"

#define WIFI_SSID_FALLBACK      "utp"
#define WIFI_PASS_FALLBACK      "YOUR_CAMPUS_WIFI_PASSWORD"

// 2. Concurrent Local Calibration Hotspot (`http://192.168.4.1/` & `/cal`)
#define WIFI_AP_SSID            "Kart-Cal-Lab"
#define WIFI_AP_PASS            "12345678"

// 3. Cellular 4G LTE SIM Card APN
#define SIM_APN                 "internet.movistar.com.co"
#define SIM_USER                ""
#define SIM_PASS                ""

// 4. Supabase Cloud REST Ingestion
#define SUPABASE_URL            "https://tapjoxeplcyeohsnrmnl.supabase.co"
#define SUPABASE_ANON_KEY       "sb_publishable_m6sJshs7hjbYHlE0lUGx9Q_ZM-wXn6e"
#define DEVICE_ID               "KART_DELTA_01"

#endif
