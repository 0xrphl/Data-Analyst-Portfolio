# Red 4-Pin Sensirion SHT31-DIS Temperature & Humidity Calibration Curves & Protocol

## 1. Hardware & Datasheet Transfer Equations
- **Pins (4-Port Red Module)**: `GND -> GND`, `VCC -> 3V3`, `SCL -> GPIO 39` (Pin 10), `SDA -> GPIO 40` (Pin 9). `ADDR` is tied to `GND` on PCB (`0x44`) with onboard `10 kΩ` pull-ups.
- **Sensirion SHT31-DIS Factory Transfer Curves (`0x2400` High-Repeatability, Dual CRC-8 `0x31`)**:
  $$T_{\text{raw}}\,[{}^\circ\text{C}] = -45.0 + 175.0 \times \frac{S_T}{65535.0}, \qquad RH_{\text{raw}}\,[\%\text{RH}] = 100.0 \times \frac{S_{RH}}{65535.0}$$

## 2. Linear Calibration & Psychrometric Curves
1. **1-Point Offset or 2-Point Linear Curve**:
   $$T_{\text{cal}} = m_T \cdot T_{\text{raw}} + b_T, \qquad RH_{\text{cal}} = \text{clamp}(m_H \cdot RH_{\text{raw}} + b_H,\,0,\,100)$$
   - **2-Point Saturated Salt Standards (ASTM E104 @ 25°C)**:
     - Low Point ($\text{MgCl}_2$ slurry): **$32.78\,\%\text{RH}$**
     - High Point ($\text{NaCl}$ slurry): **$75.29\,\%\text{RH}$**
     - $m_H = \frac{RH_{\text{ref},2} - RH_{\text{ref},1}}{RH_{\text{raw},2} - RH_{\text{raw},1}}$, $\quad b_H = RH_{\text{ref},1} - m_H \cdot RH_{\text{raw},1}$
2. **Alduchov-Eskridge Magnus-Tetens Dew Point & VPD Curves**:
   $$e_s(T) = 0.61094\,\exp\!\left(\frac{17.625\,T}{243.04 + T}\right)\text{ [kPa]}, \qquad \gamma = \ln\!\left(\frac{RH}{100}\right) + \frac{17.625\,T}{243.04 + T}$$
   $$T_{\text{dew}} = \frac{243.04\,\gamma}{17.625 - \gamma}\text{ [°C]}, \qquad \text{VPD} = e_s(T)\left(1 - \frac{RH}{100}\right)\text{ [kPa]}$$

## 3. Step-by-Step Engineer Test Procedure
1. Keep SHT31 $\ge 3\text{ cm}$ away from ESP32/SIM7670G heat sources so airflow reaches the white PTFE membrane; wait until `/cal` badge turns **`SETTLED`** ($|dT/dt| \le 0.15\,^\circ\text{C/min}$).
2. Click **"Run 1.5s Heater Plausibility BIST"**: verify $\Delta T \ge +0.30\,^\circ\text{C}$ and $\Delta RH < 0\%$, confirming CMOSens® element responsiveness, then wait 60 s for cooldown.
3. Place reference laboratory thermometer/hygrometer next to SHT31, enter `Ref Temp (°C)` and `Ref %RH` in `/cal` (or run 2-point low/high curve), and click **"Apply & Save"**: NVS (`sht31_cal`) and `/calibration/sht31_env_cal.csv` store the full calibration record!
