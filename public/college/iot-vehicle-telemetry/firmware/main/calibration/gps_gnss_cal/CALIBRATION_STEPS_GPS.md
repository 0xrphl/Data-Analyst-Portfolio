# SIM7670G / SIM7672G Multi-GNSS Geodetic & CEP50 Calibration Curves & Protocol

## 1. Hardware & RF LNA Pipeline
- **Modem Pins**: `TX = 11`, `RX = 10`, `PWRKEY = 18`, `DTR = 9 (LOW)`, `RESET = 17 (HIGH)`, Active 28 dBi Ceramic Patch Antenna on **`GPS` IPEX U.FL** biased at `3.3V` via `AT+CGDRT=4,1` & `AT+CGSETV=4,1`.
- **Constellations**: `AT+CGNSSMODE=15` (**GPS + GLONASS + Galileo + BeiDou**), polled every **1.0 – 1.5 s**.

## 2. Geodetic Error & CEP50 / CEP95 Scatter Curves
1. **Local Tangent Plane (East-North-Up) Offset vs Known Benchmark** $(\phi_{\text{ref}}, \lambda_{\text{ref}}, h_{\text{ref}})$ (Default UTP La Julita: `4.79520° N, -75.68860° W, 1445.0 m`):
   $$\Delta E = (\lambda - \lambda_{\text{ref}})\cos(\phi_{\text{ref}})\cdot 111319.49\text{ m}, \qquad \Delta N = (\phi - \phi_{\text{ref}})\cdot 110574.27\text{ m}$$
2. **Circular Error Probable (CEP50 & R95)**:
   $$\text{CEP}_{50} = 0.5887\,(\sigma_E + \sigma_N)\text{ [m]}, \qquad R_{95} = 2.08 \cdot \text{CEP}_{50}\text{ [m]}$$
3. **Orthometric Altitude Datum Trim**:
   $$h_{\text{cal}} = h_{\text{GNSS}} + \Delta h_{\text{datum}}, \qquad \Delta h_{\text{datum}} = h_{\text{ref}} - h_{\text{GNSS}}$$

## 3. Step-by-Step Engineer Test Procedure
1. **Turn ON the 18650 battery switch** (smooths RF current spikes) and place the **28 dBi ceramic GPS patch antenna outdoors or facing open sky** (ceramic face pointing UP).
2. Watch `Sats In View` and `Peak SNR (dB-Hz)` climb (`25..45 dB-Hz`) within 5–15 s; click **"Inject Assisted-GPS (AT+CAGPS)"** in `/cal` for rapid cold-start lock (`Fix = 3D`, `HDOP <= 2.0`).
3. Stand at a known UTP landmark (or enter smartphone/RTK reference Lat, Lon, Alt in `/cal`) and click **"Capture Geodetic Benchmark & CEP50 Sample"** 5–10 times: firmware computes `CEP50 (m)`, `CEP95 (m)`, saves altitude datum offset to NVS (`gps_cal`), and appends to `/calibration/gps_gnss_cal.csv`.
