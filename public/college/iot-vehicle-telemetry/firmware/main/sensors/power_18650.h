/**
 * power_18650.h
 * 18650 Li-Ion Battery & Solar Input Voltage Monitor
 * Outputs raw Millivolts (mV) and Volts (V) with moving-average filter (No %)
 */
#ifndef POWER_18650_H
#define POWER_18650_H

#include "../config.h"
#include <esp32-hal-adc.h>

class Power18650 {
public:
    void begin() {
        analogSetAttenuation(ADC_11db);
        analogReadResolution(12);
        // Prime filter
        for (int i = 0; i < 8; i++) {
            sample();
        }
    }

    void update(KartTelemetry &t) {
        sample();
        t.vbatMv  = _filteredBatMv;
        t.vbatV   = (float)_filteredBatMv / 1000.0f;
        t.solarMv = _filteredSolarMv;
        t.solarV  = (float)_filteredSolarMv / 1000.0f;
    }

private:
    uint16_t _filteredBatMv = 3850;
    uint16_t _filteredSolarMv = 0;

    void sample() {
        // Hardware voltage divider on GPIO 4 (VBAT) and GPIO 5 (SOLAR)
        uint32_t rawBatMv = analogReadMilliVolts(BOARD_BAT_ADC_PIN) * 2;
        uint32_t rawSolMv = analogReadMilliVolts(BOARD_SOLAR_ADC_PIN) * 2;

        // When plugged into USB without battery, ADC floats near 0-50 mV.
        // When real 18650 cell is connected, voltage is between 2800 mV (empty) and 4250 mV (full).
        if (rawBatMv >= 2500) {
            _filteredBatMv = (uint16_t)((_filteredBatMv * 7 + rawBatMv) / 8);
        } else {
            // Keep actual reading
            _filteredBatMv = (uint16_t)rawBatMv;
        }
        _filteredSolarMv = (uint16_t)((_filteredSolarMv * 7 + rawSolMv) / 8);
    }
};

#endif
