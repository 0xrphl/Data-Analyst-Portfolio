# TI INA226 (16-Bit) / INA228 (20-Bit 85V) 48V DC Traction Pack Calibration & Safety Guide

## 1. Pinout & High-Voltage 48V Safety Engineering
- **Logic & I2C Wiring (LilyGO Left Header)**:
  - `VCC / VS` -> **Left Header Pin 1 (`3V3`)** (shared with DS18B20 `VDD`)
  - `GND` -> **Left Header Pin 2 (`GND`)** (shared with DS18B20 `GND` & 48V Pack Negative `B-`)
  - `SDA` -> **Left Header Pin 6 (`GPIO 6`)**
  - `SCL` -> **Left Header Pin 7 (`GPIO 7`)**
- **CRITICAL 48V DC Rating Difference (`INA228` vs `INA226`)**:
  - **`INA228` (`Die ID = 0x2280`, 85V Common-Mode)**: Connects **directly** to a `48V` (`54.6V` 13S / `58.4V` 16S) battery on `VBUS` and high-side or low-side `IN+/IN-` (`vbusDividerRatio = 1.0000`).
  - **`INA226` (`Die ID = 0x2260`, 36V Recommended / 40V Abs Max)**: For a `48V–58V` pack on `INA226`:
    1. Place the shunt on the **Low-Side (`0V B-` return leg)** so `IN+` and `IN-` stay near `0V` common-mode, AND
    2. Feed `VBUS` through a **2:1 resistive divider** (two matched `100 kΩ 1%` resistors from your 600-pc kit between `Pack +48V`, `VBUS`, and `GND`) and set **`VBUS Divider Ratio = 2.0000`** in `/cal`!

---

## 2. Datasheet Transfer Equations & Calibration Curves
1. **Raw Silicon ADC Conversion**:
   - **`INA228` (20-bit signed two's complement)**:
     $$V_{\text{bus,raw}} = N_{\text{bus},20} \times 195.3125\,\mu\text{V}, \qquad V_{\text{shunt,mV}} = N_{\text{shunt},20} \times 0.0003125\,\text{mV}$$
   - **`INA226` (16-bit)**:
     $$V_{\text{bus,raw}} = N_{\text{bus},16} \times 1.25\,\text{mV}, \qquad V_{\text{shunt,mV}} = N_{\text{shunt},16} \times 0.0025\,\text{mV}$$
2. **Calibrated 48V Bus Voltage, Shunt Current, Power & Coulomb/Energy Integrals**:
   $$V_{\text{48V}} = s_V \cdot \left(V_{\text{bus,raw}} \cdot k_{\text{div}}\right) + b_V \quad [\text{V}]$$
   $$I_{\text{48V}} = \pm s_I \cdot \left(\frac{V_{\text{shunt,mV}} / 1000.0}{R_{\text{shunt},\Omega}}\right) + b_I \quad [\text{A}]$$
   $$P_{\text{48V}} = V_{\text{48V}} \cdot I_{\text{48V}} \quad [\text{W}], \qquad E_{\text{Wh}} = \sum P_{\text{48V}}\frac{\Delta t}{3600}, \qquad Q_{\text{Ah}} = \sum I_{\text{48V}}\frac{\Delta t}{3600}$$

---

## 3. Step-by-Step Engineer Calibration Procedure (`/cal` or `ina22x_48v_cal_test.ino`)
1. **Verify Auto-Detection**: Open `http://192.168.4.1/cal` -> check whether `Chip Model` reports **`INA228 (85V 20-bit)`** or **`INA226 (36V 16-bit)`** at `0x40` on `SDA=6, SCL=7`.
2. **Configure Shunt & Divider**: Enter exact shunt value in `Ohms` (e.g., `0.100` for onboard `R100`, or `0.00075` for an external `100A / 75mV` kart shunt) and `Divider Ratio` (`1.0` or `2.0`).
3. **Zero-Current Tare (`0.000 A`)**: With motor/controller load OFF (`0 A`), click **"Zero Current Tare (0.00 A)"** to cancel any µV thermoelectric offset.
4. **Reference Multimeter / Clamp Trim**: Measure pack voltage with your FNIRSI 2C53T multimeter, enter `Ref Voltage (V)` (and optional `Ref Current (A)` under load), and click **"Calibrate 48V Bus"**: coefficients save to NVS (`ina48_cal`) and append a calibration certificate row to `/calibration/ina22x_48v_cal.csv` on the 32GB MicroSD!
