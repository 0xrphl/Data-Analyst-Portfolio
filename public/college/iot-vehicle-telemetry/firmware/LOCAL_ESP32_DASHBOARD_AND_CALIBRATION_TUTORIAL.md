# Local ESP32 Real-Time Dashboard, Sampling Rates & 4-Sensor Calibration Tutorial

**Hardware**: LilyGO T-SIM7672G V1.1 (`ESP32-S3-WROOM-1 MCN16R8`) + BMI160 (`IO1/IO2`) + DS3231/AT24C32 (`IO42/IO41`) + Red 4-Pin SHT31 (`IO40 SDA / IO39 SCL`) + SIM7670G/7672G GNSS & 4G LTE + 18650 (`IO4`) + 32GB MicroSD (`CS=13, MOSI=14, SCK=21, MISO=47`).

---

## 1. Exact Real-Time Sampling & Refresh Rates

| Subsystem / Pipeline | Exact Interval | Frequency | Destination & Notes |
| :--- | :---: | :---: | :--- |
| **BMI160 6-DOF Gyro + Accel + 3D Cube** | **Every `33 ms`** | **30 Hz** (60 FPS render) | Live WebSocket `:81` -> 3D Cube `Roll / Pitch / Yaw` + `Ax,Ay,Az,Gx,Gy,Gz` |
| **Local WebSocket Broadcast** | **Every `33 ms`** | **30 Hz** (`8 Hz` HTTP fallback) | `ws://<ESP32_IP>:81` (auto-falls back to `/status` if campus firewall blocks `:81`) |
| **Red 4-Pin SHT31 Temp, %RH & Dew Point** | **Every `500 ms`** | **2 Hz** (non-blocking `18 ms`) | Live scrolling Temp/Humidity/Dew oscilloscope chart (`< 0.04 °C` self-heating) |
| **DS3231 Clock Battery Date/Time** | **Every `33 ms`** | **30 Hz** | Exact UTC + Colombia (`UTC-5`) date/time & `0.25 °C` die temperature |
| **18650 Battery & Solar ADC (`IO4/IO5`)** | **Every `33 ms`** | **30 Hz** (8-tap IIR filter) | Raw `mV` and `V` (`0 mV` if battery switch is OFF; `3000–4200 mV` when ON) |
| **SIM767x Multi-GNSS Satellite Polling** | **Every `1000 ms`** | **1 Hz** | `GPS + GLONASS + Galileo + BeiDou` Lat/Lon/Alt/HDOP + UTP distance lock |
| **32GB MicroSD Blackbox CSV Logging** | **Every `200 ms`** | **5 Hz** | `/logs/kart_session_XXXX.csv` (**100% of past CSVs preserved**, never deleted) |
| **Supabase Cloud Ingestion** | **Every `4000 ms`** | **0.25 Hz** (`30s` idle) | `public.kart_telemetry` (`4 s` active/first 3 min; `30 s` parked plan-saver) |

---

## 2. Step-by-Step Tutorial: Accessing the Local ESP32 Dashboard (UTP Campus or Home)

University campus Wi-Fi networks such as **`UTP`** (`10.253.x.x`) often enable **AP Client Isolation** (allowing the ESP32 to upload to Supabase, while blocking peer-to-peer LAN browser traffic).

To guarantee **100% instant local access everywhere**, the firmware runs **`WIFI_AP_STA` Dual Concurrent Mode**:
- **STA Interface**: Connects automatically to primary home Wi-Fi or campus fallback (`utp` / `UTP`, credentials stored in gitignored `secrets.h`) for Supabase cloud sync + atomic NTP time.
- **AP Hotspot Interface**: Simultaneously broadcasts **`Kart-Cal-Lab`** (password: **`12345678`**) with **zero external CDN scripts**, so the 3D Cube and real-time charts work offline at full 30 Hz!

### Method A — Direct ESP32 Hotspot (Works 100% Everywhere, Zero Firewall Issues)
1. Power on the LilyGO board (USB-C or 18650 battery switch **ON**).
2. On your laptop or phone Wi-Fi list, connect to:
   - **SSID**: `Kart-Cal-Lab`
   - **Password**: `12345678`
3. Open Chrome / Edge and go to:
   - **Live 30 Hz 3D Cube + Temp/Humidity Chart Dashboard**: **`http://192.168.4.1/`**
   - **4-Sensor Calibration Lab**: **`http://192.168.4.1/cal`**
   - **Preserved SD Card CSV List**: **`http://192.168.4.1/sd/list`**
   - **8-Sensor Boot & Live Self-Test JSON**: **`http://192.168.4.1/test`**
   *(Meanwhile, the ESP32 stays connected to `UTP` or `FamiliaSanchez.` and continues pushing rows to Supabase!)*

### Method B — Same Home / Lab Router LAN IP
1. Open Arduino Serial Monitor (`115200` baud) and read the printed LAN IP, e.g.:
   `[Wi-Fi] LAN Dashboard: http://192.168.1.29/` (or `http://kart-telemetry.local/`).
2. Open `http://<LAN_IP>/` for the live 3D Cube & Temp/Humidity chart, or `http://<LAN_IP>/cal` for calibration.

---

## 3. Modular `calibration/` Folder Architecture & How to Calibrate All 4 Sensors

All calibration engines live under `main/calibration/` (one subfolder per sensor, persisted in ESP32 NVS Flash + logged as audit CSVs under `/calibration/*.csv` on the 32GB MicroSD card without touching `/logs/*.csv`):

1. **`calibration/sht31_env_cal/`** (`Red 4-Pin SHT31`, `IO40 SDA / IO39 SCL`, `0x44`):
   - Open `/cal` -> wait for **`SETTLED`** -> click **"Run 1.5s Heater Plausibility BIST"** (verifies $+\Delta T \ge 0.30\,^\circ\text{C}$).
   - Enter reference thermometer `°C` and hygrometer `%RH` -> click **"Apply & Save 1-Point Calibration"** (or manual 2-point slope/offset). Saved to `/calibration/sht31_env_cal.csv`.
2. **`calibration/imu_bmi160_cal/`** (`Bosch BMI160`, `IO1 SDA / IO2 SCL`, `0x68`):
   - Place the board/kart **flat and motionless** -> in `/cal` click **"Calibrate Gyro Bias + Level Accel (150 Samples)"**.
   - Removes stationary gyro drift (`gx, gy, gz -> 0.00 °/s`), norms gravity to `1.000 g`, zeros the **3D Cube (`0°/0°/0°`)**, and logs to `/calibration/bmi160_cal.csv`.
3. **`calibration/rtc_ds3231_cal/`** (`DS3231 + AT24C32`, `IO42 SDA / IO41 SCL`, `0x68 & 0x57`):
   - Connect all 4 wires (`VCC=3V3, GND, SDA=42, SCL=41`) on the same ZS-042 header with a `CR2032` battery installed.
   - Click **"Sync DS3231 to Atomic NTP & Measure PPM Drift"** in `/cal` to set exact UTC time, measure crystal ppm error, and trim `Reg 0x10` (`0.1 ppm/LSB`), logged to `/calibration/rtc_ds3231_cal.csv`.
4. **`calibration/gps_gnss_cal/`** (`SIM7670G/7672G Multi-GNSS`, Active 28 dBi Ceramic Antenna):
   - Switch **ON** the 18650 battery switch and place the ceramic GPS antenna **outdoors facing open sky**.
   - Click **"Inject Assisted-GPS (AT+CAGPS)"**, wait for `2D/3D LOCK`, then click **"Capture GPS Benchmark & Compute CEP50"** against UTP (`4.79520, -75.68860, 1445 m`) or your survey coordinate, logged to `/calibration/gps_gnss_cal.csv`.

---

## 4. 8-Subsystem Boot & Live Self-Test Suite (`self_test.h`)

On every boot (and live at `GET /test`), `SelfTestEngine` verifies all **8 hardware subsystems** and uploads the JSON report into `public.kart_sessions.test`:
1. `wifi` — Connected STA SSID (`FamiliaSanchez.` / `UTP`), IP, RSSI dBm
2. `4g_lte` — Real `SIM767x` UART `AT` response, `CSQ`, `CEREG`
3. `gnss_gps` — Active 3.3V LNA bias (`GPIO4=1`), `Fix` (`2D/3D`), `Sats Used / View`, `Peak SNR dB-Hz`, UTP Lock
4. `sht31_env` — `0x44` ACK on `IO40/IO39`, CRC-8 pass count, calibrated `°C`, `%RH`, `Dew Point °C`
5. `gyro_bmi160` — `0x68` ACK on `IO1/IO2` + calibrated die temp
6. `battery_18650` — `GPIO 4` ADC >= `2500 mV` (`PASS` when 18650 switch is ON; `CHK 0mV` when on USB-only)
7. `rtc_ds3231` — Genuine `DS3231` BCD verification on `Wire1` (`IO42/IO41`, never confused with `BMI160` `0x68`)
8. `sd_32gb` — `32GB` MicroSD mount, preserved `/logs/` + `/calibration/` CSV storage
