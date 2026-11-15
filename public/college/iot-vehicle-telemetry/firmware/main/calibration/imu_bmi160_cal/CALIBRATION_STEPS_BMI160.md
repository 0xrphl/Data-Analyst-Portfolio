# Bosch BMI160 6-DOF Gyroscope & Accelerometer Calibration Curves & Protocol

## 1. Hardware & Sampling Pipeline
- **Pins**: `SDA = GPIO 1` (Right Hdr Pin 5), `SCL = GPIO 2` (Right Hdr Pin 6), `VIN & CS = 3V3`, `GND & SAO = GND` (`0x68` @ `400 kHz`).
- **Real-Time Rate**: Sampled & fused at **30 Hz (`every 33 ms`)** ($\pm 2g$ @ `16384 LSB/g`, $\pm 250\,^\circ/\text{s}$ @ `131.2 LSB/(°/s)`).

## 2. Calibration Curves
1. **Stationary Zero-Rate Gyro Bias & Thermal Compensation**:
   $$\vec{\omega}_{\text{cal}} = \frac{\vec{\omega}_{\text{raw}}}{131.2} - \vec{b}_{\omega} - \vec{k}_T \left(T_{\text{die}} - T_{\text{ref}}\right)$$
   where $\vec{b}_{\omega} = \frac{1}{N}\sum_{i=1}^{N} \vec{\omega}_i$ ($N = 150$ stationary samples over `750 ms`), rejecting capture if $\text{RMS}(\omega_z) > 2.5\,^\circ/\text{s}$.
2. **Accelerometer Level & 1g Gravity-Norm Curve**:
   $$a_{k,\text{cal}} = s_k \left(\frac{a_{k,\text{raw}}}{16384.0} - b_{a,k}\right), \quad k \in \{x,y,z\}$$
   On a level horizontal bench: $b_{a,x} = \bar{a}_x$, $b_{a,y} = \bar{a}_y$, $b_{a,z} = \bar{a}_z - 1.000g$, yielding $\|\vec{a}_{\text{cal}}\| = 1.000g$ and `Roll = 0.0°`, `Pitch = 0.0°`.
3. **Complementary Attitude Fusion**:
   $$\phi_t = 0.96(\phi_{t-1} + \omega_x \Delta t) + 0.04\,\text{atan2}(a_y, a_z)$$
   $$\theta_t = 0.96(\theta_{t-1} + \omega_y \Delta t) + 0.04\,\text{atan2}\!\left(-a_x, \sqrt{a_y^2+a_z^2}\right)$$

## 3. Step-by-Step Engineer Test Procedure
1. Place the kart chassis or breadboard **completely flat and motionless** on a level table.
2. Open `http://192.168.4.1/cal` $\rightarrow$ click **"Calibrate Stationary Gyro + Level Accel (150 Samples)"**.
3. Verify `gyr_noise_rms_dps < 0.15 °/s` and that on the main dashboard (`http://192.168.4.1/`) the **3D Cube sits motionless at `0.0° / 0.0° / 0.0°`** with zero yaw drift!
4. Tilt +90° Roll and +90° Pitch to verify 1:1 3D Cube tracking; calibration is saved to NVS (`bmi160_cal`) and `/calibration/bmi160_cal.csv` on the SD card.
