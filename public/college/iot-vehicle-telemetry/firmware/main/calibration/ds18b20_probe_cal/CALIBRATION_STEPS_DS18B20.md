# DS18B20 Waterproof 1-Wire Thermal Probe Calibration Curves & Pin Guide

## 1. Safe Free Pins on LilyGO T-SIM7672G V1.1 (Left Header Under/At `6 & 7`)

| Left Header Position | Silkscreen GPIO | Status on LilyGO T-SIM7672G V1.1 | Recommendation |
| :---: | :---: | :--- | :--- |
| Pin 1 | **`3V3`** | Regulated `3.3V` rail | **Connect DS18B20 Red (`VDD`) + `4.7 kΩ` Pull-Up** |
| Pin 2 | **`GND`** | Common ground | **Connect DS18B20 Black (`GND`)** |
| Pin 4 | `GPIO 4` | **OCCUPIED** (18650 Battery ADC divider) | Do NOT use (used on DevKit, occupied on LilyGO!) |
| Pin 5 | `GPIO 5` | **OCCUPIED** (Solar Input ADC divider) | Do NOT use |
| **Pin 6** | **`GPIO 6`** | **FREE** (`ADC1_CH5` / Digital I/O) | **Supported & Auto-Scanned** |
| **Pin 7** | **`GPIO 7`** | **FREE** (`ADC1_CH6` / Digital I/O) | **Supported & Auto-Scanned** |
| **Pin 8** | **`GPIO 15`** | **FREE** (Right under `6 & 7`) | **PRIMARY SCHEMATIC PIN** (Leaves ADC1 `6,7` free!) |
| **Pin 9** | **`GPIO 16`** | **FREE** (Digital I/O) | **Supported & Auto-Scanned** |
| **Pin 10** | **`GPIO 8`** | **FREE** (Safe on ESP32-S3) | **Supported & Auto-Scanned** |
| Pin 11 | `GPIO 46` | **ESP32-S3 BOOT STRAPPING PIN** | **NEVER USE** (4.7k pull-up to 3V3 alters boot strap!) |

- **Mandatory Pull-Up Resistor**: Connect a **`4.7 kΩ` resistor** between **DS18B20 Yellow (`DATA`)** and **`3V3`** (`Red VDD`).

---

## 2. Calibration Curves & Metrology
1. **11-Bit / 12-Bit Fixed-Point Scratchpad Conversion (`0.125 °C` @ 11-bit, `375 ms` non-blocking)**:
   $$T_{\text{raw}}\,[{}^\circ\text{C}] = \frac{\text{int16}(\text{MSB} \ll 8 \mid \text{LSB})}{16.0}$$
   Validated via **9-byte Scratchpad Maxim CRC-8 (`poly = 0x8C`)**, rejecting `-127 °C` open-bus and `85.0 °C` power-on reset latches.
2. **Per-Probe Linear Calibration Curve (`Probe 0 = Controller T_ctrl`, `Probe 1 = Motor T_motor`)**:
   $$T_{\text{ctrl,cal}} = m_0 \cdot T_{\text{ctrl,raw}} + b_0, \qquad T_{\text{motor,cal}} = m_1 \cdot T_{\text{motor,raw}} + b_1$$
   - **2-Point Reference Calibration**:
     - Ice-water bath ($0.00\,^\circ\text{C}$) + Precision warm water / calibrated SHT31 ambient ($T_{\text{ref}}$):
       $$m = \frac{T_{\text{ref},2} - T_{\text{ref},1}}{T_{\text{raw},2} - T_{\text{raw},1}}, \qquad b = T_{\text{ref},1} - m \cdot T_{\text{raw},1}$$

## 3. Step-by-Step Engineer Test Procedure
1. Wire DS18B20 Red $\rightarrow$ `3V3`, Black $\rightarrow$ `GND`, Yellow $\rightarrow$ `GPIO 15` (or `6, 7, 16, 8`) with `4.7 kΩ` resistor between Yellow and `3V3`.
2. Open `http://192.168.4.1/cal` $\rightarrow$ verify detected GPIO, 64-bit ROM hex ID(s), and `CRC OK` count.
3. If using 2 probes on the same pin (Controller + Motor), warm one probe with your fingers and click **"Swap Controller / Motor ROM Order"** if needed.
4. Enter reference thermometer `°C` (or click **"Cross-Calibrate DS18B20 to Settled SHT31 Ambient"**) $\rightarrow$ saves slope/offset to NVS (`ds18_cal`) and `/calibration/ds18b20_probe_cal.csv`!
