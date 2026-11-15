# DS3231 Real-Time Clock Hardware Troubleshooting Guide
**LilyGO T-SIM7672G V1.1 (ESP32-S3) + ZS-042 DS3231 / AT24C32 RTC Module**

---

## 1. Why Did Your Self-Test Report `rtc_ds3231: ok = false`?

Your boot report returned:
```json
"rtc_ds3231": {
  "ok": false,
  "info": "2026-11-08T00:00:01Z (29.0C)"
}
```

### What Happened Behind the Scenes:
1. When the ESP32 booted, it sent an I2C ping to address `0x68` on GPIO 41 & 42.
2. The DS3231 **did not acknowledge (NO I2C ACK)**.
3. Because the RTC did not respond, the firmware engaged the **safety software fallback**:
   - Time defaulted to: `2026-11-08T00:00:01Z` (`uptime / 1000 = 1 sec`).
   - Temperature defaulted to the BMI160 die temperature (`29.0°C`).
   - The parametric self-test set `"ok": false`.

---

## 2. Diagnosing "Connected GND and 3.3 to the Other Side Pins"

You mentioned:
> *"I connected as you said 41 42, but GND and 3.3 to the other side pins... clock battery module not working"*

There are **two common pitfalls** with "the other side pins":

---

### Pitfall A: LilyGO Left Header Pin Orientation (Top vs. Bottom)

If you plugged GND and 3.3V into the **Left Header** of the LilyGO board because the Right Header power pins were occupied by the BMI160:

Look at the LilyGO board with the USB-C port at the **bottom** and antenna at the **top**:

```
                  [ LTE & GPS ANTENNA ]
              LEFT HEADER         RIGHT HEADER
 (TOP) Pin 1: [ 3V3 ]  <-- OK     [ TX  ] :Pin 1
       Pin 2: [ GND ]  <-- OK     [ RX  ] :Pin 2
       Pin 3: [ RST ]             [ 3V3 ] :Pin 3  (BMI160 3V3)
       Pin 4: [ IO4 ] (BAT ADC)   [ GND ] :Pin 4  (BMI160 GND)
       Pin 5: [ IO5 ] (SOLAR)     [ IO1 ] :Pin 5  (BMI160 SDA)
       Pin 6: [ IO6 ]             [ IO2 ] :Pin 6  (BMI160 SCL)
       Pin 7: [ IO7 ]             [ IO42] :Pin 7  (DS3231 SDA)
       Pin 8: [ IO15]             [ IO41] :Pin 8  (DS3231 SCL)
              ...                        ...
(BTM) Pin 16: [VBAT ] <-- TRAP!   [ VIN ] :Pin 16
```

#### ⚠️ THE TRAP:
- **Pin 1 (3V3)** and **Pin 2 (GND)** on the Left Header are at the **VERY TOP** (next to the RST button and ESP32 metal shield).
- If you counted from the **bottom** (near the USB-C or SIM slot), **Pin 16 is `VBAT`** (raw 4.0V battery) and **Pin 15 is `IO21`** (MicroSD SCK).
- Connecting the RTC module to the bottom pins will prevent the RTC from powering up correctly.

---

### Pitfall B: DS3231 Module (ZS-042) Dual-Side Headers

A standard blue ZS-042 DS3231 module has **pins on both ends**:

```
        +------------------------------------------+
        |  [ 4-Pin Secondary Header ]              |
        |  (SCL  SDA  VCC  GND)                    |
        |                                          |
        |   [ DS3231 IC ]       [ CR2032 BATTERY ] |
        |   [ AT24C32   ]                          |
        |                                          |
        |  [ 6-Pin Primary Header ]                |
        |  (32K  SQW  SCL  SDA  VCC  GND)          |
        +------------------------------------------+
```

#### ⚠️ THE TRAP:
1. **Never split connections across both headers**: Connect all 4 active wires (`SCL`, `SDA`, `VCC`, `GND`) to the **SAME header** on the DS3231 module.
2. **Watch the pin order**:
   - On the 6-pin header, the pins are:
     1. **`32K`** -> *Leave Disconnected*
     2. **`SQW`** -> *Leave Disconnected*
     3. **`SCL`** -> Connect to LilyGO **GPIO 41** (Right Header, Pin 8)
     4. **`SDA`** -> Connect to LilyGO **GPIO 42** (Right Header, Pin 7)
     5. **`VCC`** -> Connect to LilyGO **3V3** (Top Left Pin 1 or Right Pin 3)
     6. **`GND`** -> Connect to LilyGO **GND** (Top Left Pin 2 or Right Pin 4)
3. If the module is viewed upside-down, `GND` and `32K` are reversed! Always check the silkscreen text printed on the PCB.

---

## 3. The Dedicated Troubleshooting Suite (`rtc_troubleshoot/`)

We have created an automated diagnostic tool in `rtc_troubleshoot/rtc_troubleshoot.ino`.

### What the Diagnostic Firmware Does:
1. **Tests Electrical Voltage on GPIO 41 & 42**:
   - Verifies if the pins are pulled up to 3.3V or stuck to GND (short circuit or unpowered module).
2. **Tests Wire1 at 100 kHz**:
   - Standard DS3231 speed (avoids breadboard capacitance issues).
3. **Auto-Detects Inverted SDA/SCL**:
   - If you swapped the Cyan and Orange wires, it detects it and tells you!
4. **Scans Wire0**:
   - Checks if the RTC was accidentally connected to GPIO 1 & 2.
5. **Serves a Live Web Dashboard**:
   - Connects to Wi-Fi and shows live status at `http://<lilygo-ip>/`.

---

## 4. Step-by-Step Verification Checklist

1. **Verify 3.3V Power with Board Silkscreen**:
   - Place your finger on the top-left corner of the board (near the antenna and RST button).
   - First pin down = **`3V3`** -> Connect to DS3231 **`VCC`**.
   - Second pin down = **`GND`** -> Connect to DS3231 **`GND`**.

2. **Verify I2C Signal Pins**:
   - Right Header, 7th pin from top = **`IO42`** -> Connect to DS3231 **`SDA`**.
   - Right Header, 8th pin from top = **`IO41`** -> Connect to DS3231 **`SCL`**.

3. **Check the Coin Cell**:
   - Ensure a CR2032 or LIR2032 coin cell is seated in the battery clip (+ side facing up).

4. **Flash `rtc_troubleshoot.ino` or the Updated `main.ino`**:
   - Open Arduino IDE -> `rtc_troubleshoot/rtc_troubleshoot.ino`.
   - Open Serial Monitor at **115200 baud** to see real-time pin voltage and scan results.
