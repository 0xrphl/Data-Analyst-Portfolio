# DS3231SN TCXO + AT24C32 Battery Clock Calibration Curves & Protocol

## 1. Hardware Wiring & Genuine-IC Verification
- **Pins**: `SDA = GPIO 42` (Right Header Pin 7), `SCL = GPIO 41` (Right Header Pin 8), `VCC = 3V3`, `GND = GND`, Backup Cell = `CR2032 (3.0V)`.
- **Zero-Collision Verification (`verifyGenuineDs3231`)**:
  - Both `BMI160` (`Wire`, `IO1/IO2`) and `DS3231` (`Wire1`, `IO42/IO41`) share I2C slave address `0x68`.
  - Firmware verifies `Reg 0x00 != 0xD1/0xD8` (Bosch `CHIP_ID`) and validates packed BCD bounds (`00..59` sec/min) so `BMI160` is never mistaken for `DS3231`.

## 2. Calibration Curves
1. **Crystal Aging Offset Register (`Reg 0x10`, 2's Complement `-128..+127` LSB)**:
   $$\frac{\Delta f}{f} \approx -0.1\text{ ppm per LSB at }25\,^\circ\text{C}$$
   $$\text{Drift}_{\text{ppm}} = \frac{t_{\text{DS3231}} - t_{\text{UTC\_Ref}}}{\Delta t_{\text{elapsed}}} \times 10^6$$
   $$\text{Aging}_{\text{new}} = \text{clamp}\!\left(\text{Aging}_{\text{old}} + \text{round}\!\left(\frac{\text{Drift}_{\text{ppm}}}{0.1}\right), -128, +127\right)$$
2. **TCXO Die Temperature Offset (`Reg 0x11..0x12`, `0.25 °C` resolution)**:
   $$T_{\text{rtc,cal}} = \left(\text{MSB} + 0.25 \cdot (\text{LSB} \gg 6)\right) + b_{T,\text{rtc}}$$

## 3. Step-by-Step Engineer Test Procedure
1. Ensure CR2032 coin cell measures $\ge 2.85\text{ V}$ and all 4 wires (`VCC, GND, SDA=42, SCL=41`) are on the **same header side** of the ZS-042 module.
2. Open `http://192.168.4.1/cal` (or `http://<ESP32_LAN_IP>/cal`) $\rightarrow$ click **"Sync DS3231 to Atomic NTP UTC"**.
3. Wait $\ge 60\text{ min}$ (or 24 hours for sub-ppm precision) and click **"Sync & Measure PPM Drift"** again: the firmware computes exact `measured_ppm`, recommends `aging_lsb`, logs a row to `/calibration/rtc_ds3231_cal.csv` on the 32GB MicroSD, and stores trim in `Reg 0x10` + ESP32 NVS.
4. Unplug USB power for 30 s (with 18650 off) and reboot: verify `osf_was_set == false` and exact UTC retention from CR2032 backup!
