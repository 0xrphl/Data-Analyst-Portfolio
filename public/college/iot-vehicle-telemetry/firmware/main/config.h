/**
 * config.h
 * Central Hardware, Multi-Wi-Fi, Calibration & Cloud Configuration
 * SOTA Electric Delta-Kart Telemetry & Instrumentation Node
 * LilyGO T-SIM7672G V1.1 (ESP32-S3) + BMI160 + DS3231/AT24C32 + SHT31 + 32GB SD + 18650
 */
#ifndef KART_CONFIG_H
#define KART_CONFIG_H

#include <Arduino.h>

// ============================================================================
// 1. USB-C Serial Routing (Native USB CDC + UART0 Fallback)
// ============================================================================
#if defined(ARDUINO_USB_MODE) && (ARDUINO_USB_MODE == 1)
  #if defined(ARDUINO_USB_CDC_ON_BOOT) && (ARDUINO_USB_CDC_ON_BOOT == 1)
    #define USB_OUT Serial
  #else
    #define USB_OUT USBSerial
  #endif
#else
  #define USB_OUT Serial
#endif

// ============================================================================
// 2. Multi-Wi-Fi Credentials (Loaded from gitignored `secrets.h` when present)
// ============================================================================
#if __has_include("secrets.h")
  #include "secrets.h"
#endif

#ifndef WIFI_SSID
  #define WIFI_SSID             "YOUR_PRIMARY_WIFI_SSID"
#endif
#ifndef WIFI_PASS
  #define WIFI_PASS             "YOUR_PRIMARY_WIFI_PASSWORD"
#endif

#ifndef WIFI_SSID_FALLBACK
  #define WIFI_SSID_FALLBACK    "utp"
#endif
#ifndef WIFI_PASS_FALLBACK
  #define WIFI_PASS_FALLBACK    "YOUR_CAMPUS_WIFI_PASSWORD"
#endif

#define WIFI_AP_SSID            "Kart-Cal-Lab"
#define WIFI_AP_PASS            "12345678"
#define MDNS_HOSTNAME           "kart-telemetry"

// Cellular 4G LTE APN (220 MB Data Plan)
#define SIM_APN                 "internet.movistar.com.co"
#define SIM_USER                ""
#define SIM_PASS                ""

// Supabase REST API Configuration (< 500 MB Free Tier Optimized)
#define SUPABASE_URL            "https://tapjoxeplcyeohsnrmnl.supabase.co"
#define SUPABASE_ANON_KEY       "sb_publishable_m6sJshs7hjbYHlE0lUGx9Q_ZM-wXn6e"
#define DEVICE_ID               "KART_DELTA_01"

// ============================================================================
// 3. Pin Definitions - LilyGO T-SIM7672G V1.1 (ESP32-S3-WROOM-1 MCN16R8)
// ============================================================================
#define BOARD_LED_PIN           12      // Active LOW Blue Status LED

// Bus 0 (Wire - HW I2C0): Bosch BMI160 6-DOF IMU (Right Header Pins 5 & 6)
#define BMI160_SDA_PIN          1       // GPIO 1
#define BMI160_SCL_PIN          2       // GPIO 2
#define I2C_FREQ_HZ             400000  // 400 kHz Fast-Mode

// Bus 1 (Wire1 - HW I2C1): DS3231 RTC + AT24C32 EEPROM (Right Header Pins 7 & 8)
#define DS3231_SDA_PIN          42      // GPIO 42
#define DS3231_SCL_PIN          41      // GPIO 41

// Bus 2 (Open-Drain I2C): Red 4-Pin Sensirion SHT31 Module (GND, VCC, SCL, SDA)
// Note: Red 4-pin breakout ties ADDR->GND internally on PCB (fixed 0x44) + 10k I2C pull-ups
#define SHT31_SDA_PIN           40      // GPIO 40 (Right Header Pin 9  - SDA)
#define SHT31_SCL_PIN           39      // GPIO 39 (Right Header Pin 10 - SCL)
#define SHT31_ADDR_DEFAULT      0x44    // Factory PCB hardwired address (no external ADR pin needed)
#define SHT31_ADDR_ALT          0x45    // Auto-scan fallback if solder jumper bridged on back

// Bus 3 (Maxim 1-Wire): DS18B20 Waterproof Thermal Probe(s) (VDD=3V3, GND=GND, DATA + 4.7k pull-up to 3V3)
// Free Left Header 1-Wire GPIOs: GPIO 15 (Pin 8), GPIO 16 (Pin 9), GPIO 8 (Pin 10)
// (GPIO 6 & 7 reserved for INA226/228 I2C; Avoid GPIO 4/5 = ADC dividers; Avoid GPIO 46 = Boot Strap!)
#define DS18B20_DEFAULT_PIN     15      // Primary schematic pin: GPIO 15 (Left Hdr Pin 8, right under 6 & 7)
#define DS18B20_RESOLUTION_BITS 11      // 11-bit = 0.125 °C resolution, ~375 ms non-blocking conversion

// Bus 4 (Open-Drain I2C): TI INA226 / INA228 48V DC Traction Battery Voltage, Current & Power Monitor
// Connected on Left Header: VCC=3V3 (Pin 1), GND=GND (Pin 2), SDA=GPIO 6 (Pin 6), SCL=GPIO 7 (Pin 7)
#define INA22X_SDA_PIN          6       // GPIO 6 (Left Header Pin 6 - SDA)
#define INA22X_SCL_PIN          7       // GPIO 7 (Left Header Pin 7 - SCL)
#define INA22X_DEFAULT_ADDR     0x40    // A0=GND, A1=GND default (auto-scans 0x40..0x4F)
#define INA22X_DEFAULT_SHUNT_OHM 0.100f // Default 0.100 Ohm (R100); configurable in /cal for high-A shunts

// Onboard 18650 Battery & Solar Input ADC (Left Header Pins 4 & 5)
#define BOARD_BAT_ADC_PIN       4       // GPIO 4 (x2 hardware divider)
#define BOARD_SOLAR_ADC_PIN     5       // GPIO 5 (x2 hardware divider)

// Onboard 32GB MicroSD Card SPI Slot
#define BOARD_SD_CS_PIN         13      // GPIO 13
#define BOARD_SD_MOSI_PIN       14      // GPIO 14
#define BOARD_SD_SCK_PIN        21      // GPIO 21
#define BOARD_SD_MISO_PIN       47      // GPIO 47

// Onboard SIM7670G / SIM7672G 4G LTE + Multi-GNSS Modem
#define MODEM_TX_PIN            11      // ESP32 TX -> SIM7672G RX
#define MODEM_RX_PIN            10      // ESP32 RX -> SIM7672G TX
#define MODEM_PWRKEY_PIN        18      // Power Key Pulse
#define MODEM_DTR_PIN           9       // Wake / Sleep control
#define MODEM_RING_PIN          3       // Ring indicator
#define MODEM_RESET_PIN         17      // Reset pin (Active LOW -> hold HIGH!)
#define MODEM_RESET_LEVEL       LOW
#define MODEM_GPS_ENABLE_GPIO   4       // Modem internal GPIO 4 controls 3.3V GNSS Active Antenna LNA
#define MODEM_GPS_ENABLE_LEVEL  1

// Current Test Place Reference: UTP (Universidad Tecnologica de Pereira)
#define UTP_REF_LAT             4.79520
#define UTP_REF_LON             -75.68860
#define UTP_REF_ALT_M           1445.0f
#define UTP_CAMPUS_RADIUS_M     2500.0f
#define PEREIRA_METRO_RADIUS_M  15000.0f

// ============================================================================
// 4. Unified Telemetry & Instrumentation State Struct
// ============================================================================
struct KartTelemetry {
    char     isoTimestamp[25] = "2026-11-13T00:00:00Z";
    uint32_t uptimeMs         = 0;

    // 18650 Battery & Solar (Strictly Volts & mV, NO percentage)
    uint16_t vbatMv           = 0;
    float    vbatV            = 0.0f;
    uint16_t solarMv          = 0;
    float    solarV           = 0.0f;

    // Board Thermal & RTC Status (BMI160 Die + DS3231 TCXO)
    bool     rtcReady         = false;
    bool     ntpSynced        = false;
    int8_t   rtcAgingReg      = 0;
    float    rtcDriftPpm      = 0.0f;
    float    gyroTempC        = 0.0f;
    float    rtcTempC         = 0.0f;

    // Sensirion SHT31-DIS Precision Ambient Temp, Humidity & Psychrometrics
    bool     shtReady         = false;
    uint8_t  shtAddr          = 0x44;
    bool     shtPinsSwapped   = false;
    float    shtTempRawC      = 0.0f;
    float    shtHumRawRh      = 0.0f;
    float    shtTempC         = 0.0f;
    float    shtHumRh         = 0.0f;
    float    dewPointC        = 0.0f;
    float    vpdKpa           = 0.0f;
    float    absHumGm3        = 0.0f;
    float    condMarginC      = 0.0f;
    float    shtNoiseTempC    = 0.0f;
    float    shtNoiseHumRh    = 0.0f;
    float    shtDriftCPerMin  = 0.0f;
    bool     shtSettled       = false;
    bool     shtHeaterOn      = false;
    uint16_t shtStatusReg     = 0xFFFF;
    uint32_t shtCrcOk         = 0;
    uint32_t shtCrcErr        = 0;

    // Dallas/Maxim DS18B20 1-Wire Probe(s) (Controller T_ctrl + Optional Motor T_motor)
    bool     ds18Ready        = false;
    uint8_t  ds18Pin          = DS18B20_DEFAULT_PIN;
    uint8_t  ds18Count        = 0;      // 1 or 2 probes on the same 1-Wire pin
    float    ds18CtrlRawC     = 0.0f;
    float    ds18MotorRawC    = 0.0f;
    float    ds18CtrlC        = 0.0f;   // Calibrated Probe 0: Controller (°C)
    float    ds18MotorC       = 0.0f;   // Calibrated Probe 1: Motor (°C, if 2nd probe attached)
    bool     ds18MotorPresent = false;
    uint32_t ds18CrcOk        = 0;
    uint32_t ds18CrcErr       = 0;

    // TI INA226 (16-bit) / INA228 (20-bit 85V) 48V DC Traction Pack Monitor (SDA=IO6, SCL=IO7)
    bool     inaReady         = false;
    uint8_t  inaAddr          = 0x40;
    uint8_t  inaChipType      = 0;      // 0=None, 1=INA226 (16-bit), 2=INA228 (20-bit 85V)
    bool     inaPinsSwapped   = false;
    float    inaRawBusV       = 0.0f;
    float    inaShuntMv       = 0.0f;
    float    inaBusV          = 0.0f;   // Calibrated 48V DC Traction Pack Voltage (V)
    float    inaCurrentA      = 0.0f;   // Calibrated 48V DC Traction Current (A)
    float    inaPowerW        = 0.0f;   // Calibrated 48V DC Traction Power (W)
    float    inaEnergyWh      = 0.0f;   // Cumulative Traction Energy (Wh)
    float    inaChargeAh      = 0.0f;   // Cumulative Traction Charge (Ah)
    float    inaDieTempC      = 0.0f;   // INA228 internal die temperature (°C)


    // 6-DOF IMU & Attitude
    float    ax = 0.0f, ay = 0.0f, az = 1.0f;
    float    gx = 0.0f, gy = 0.0f, gz = 0.0f;
    float    roll = 0.0f, pitch = 0.0f, yaw = 0.0f;
    float    peakG            = 1.0f;
    float    vibRms           = 0.0f;

    // SIM7670G / SIM7672G Multi-GNSS & UTP Place Confirmation
    bool     modemAwake       = false;
    bool     gnssPowered      = false;
    uint8_t  lteRegStatus     = 0;
    int16_t  lteCsq           = 99;
    double   lat              = UTP_REF_LAT;
    double   lon              = UTP_REF_LON;
    float    speedKmh         = 0.0f;
    float    altM             = UTP_REF_ALT_M;
    float    courseDeg        = 0.0f;
    uint8_t  satellites       = 0;
    uint8_t  satsInView       = 0;
    uint8_t  gpsSvs           = 0;
    uint8_t  bdsSvs           = 0;
    uint8_t  gloSvs           = 0;
    uint8_t  galSvs           = 0;
    uint8_t  maxCn0DbHz       = 0;
    float    hdop             = 99.9f;
    float    pdop             = 99.9f;
    uint8_t  gpsFix           = 0;      // 0=No Fix, 2=2D, 3=3D
    float    utpDistanceM     = -1.0f;
    uint8_t  placeConfirmed   = 0;      // 0=Unconfirmed, 1=UTP Campus, 2=Pereira Metro, 3=Other GNSS

    // Storage & Connectivity
    bool     sdMounted        = false;
    uint32_t sdLogKb          = 0;
    uint32_t sdRecords        = 0;
    uint32_t bootCount        = 1;
    int16_t  rssi             = -100;
    uint8_t  netMode          = 0;      // 1=Wi-Fi STA, 2=4G SIM, 3=Local AP
    char     wifiSsid[28]     = "DISCONNECTED";
    uint32_t cloudSentCount   = 0;
    int64_t  cloudSessionId   = 0;
};

#endif
