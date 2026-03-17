---
title: "Multimeters and DMMs — Calibration Reference"
tags: [multimeters, DMM, electrical-calibration, CAT-rating, true-RMS, voltage, resistance, current]
pillars: [calibration-services, equipment-guides]
categories: [electrical-calibration, multimeters]
equipment_types: [multimeters, dmms]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "IEC 61010-1 — Safety Requirements for Electrical Equipment"
  - "IEC 61326-1 — EMC Requirements for Measurement Equipment"
  - "IEC 61557 — Electrical Safety in Low Voltage Distribution Systems"
  - "Fluke Calibration Application Notes — DMM Calibration Best Practices"
  - "Keysight Technologies — Digital Multimeter Accuracy Specifications Explained"
---

# Multimeters and DMMs — Calibration Reference

## Measurement Categories (CAT Ratings)

IEC 61010-1 defines overvoltage installation categories that determine the transient voltage withstand capability of the instrument. Higher CAT numbers indicate closer proximity to the utility power source and higher transient energy.

| Category | Typical Application | Transient Voltage (at 600V rating) |
|----------|--------------------|------------------------------------|
| CAT I    | Protected electronic equipment, signal-level circuits | 1,500 V |
| CAT II   | Single-phase receptacle-connected loads (appliances, portable tools) | 2,500 V |
| CAT III  | Three-phase distribution, fixed installation wiring, panels, bus bars | 4,000 V |
| CAT IV   | Utility entrance, service drop, meter base, primary supply | 6,000 V |

A CAT III-1000V meter provides more transient protection than a CAT II-1000V meter even at the same voltage rating. For industrial calibration work, CAT III or CAT IV rated meters are standard.

## Accuracy Specification Format

DMM accuracy is expressed as:

**+/-(% of reading + counts/digits)**

Example: +/-(0.5% of reading + 2 digits)

For a reading of 10.000 V on a 4.5-digit meter with 0.001 V resolution:
- 0.5% of 10.000 V = 0.050 V
- 2 digits = 2 x 0.001 V = 0.002 V
- Total uncertainty = +/-0.052 V
- True value lies between 9.948 V and 10.052 V

Bench/system DMMs may specify accuracy as +/-(ppm of reading + ppm of range), where ppm = parts per million.

## Accuracy Time Windows

Manufacturers specify accuracy at different confidence windows:

| Spec Window | Meaning | Use Case |
|------------|---------|----------|
| 24-hour    | Accuracy within 24 hours of calibration | Immediately after adjustment, tightest spec |
| 90-day     | Accuracy valid for 90 days post-cal | Short-term laboratory work |
| 1-year     | Accuracy valid for 12 months post-cal | Standard calibration interval specification |
| 2-year     | Accuracy valid for 24 months post-cal | Extended interval for stable instruments |

The 1-year specification is the standard reference for calibration tolerance. The 24-hour spec is typically 2x to 5x tighter than the 1-year spec.

### Temperature Coefficient

Outside the rated temperature range (typically 18 degC to 28 degC or 23 degC +/- 5 degC), an additional temperature coefficient applies. This is specified as an additional +/-(% of reading + digits) per degree Celsius outside the rated range.

## Measurement Functions and Calibration Parameters

Each function must be calibrated at multiple points across each available range:

### DC Voltage
- Ranges: typically 200 mV, 2 V, 20 V, 200 V, 1000 V
- Test points per range: zero, 10%, 50%, 90%, 100% of range (positive and negative)
- Most critical function; establishes baseline accuracy

### AC Voltage
- Same ranges as DC voltage
- Must be tested at multiple frequencies (e.g., 50 Hz, 60 Hz, 1 kHz, 10 kHz, 100 kHz)
- Accuracy degrades at higher frequencies — bandwidth specifications vary significantly by model
- True RMS vs average-responding is critical (see below)

### DC Current
- Ranges: 200 uA, 2 mA, 20 mA, 200 mA, 2 A, 10 A (or 20 A)
- Test points at 10%, 50%, 90%, 100% of each range
- High-current ranges (10 A) often have reduced accuracy and time-limited operation

### AC Current
- Same ranges as DC current
- Frequency dependency same as AC voltage
- True RMS capability required for non-sinusoidal waveforms

### Resistance
- Ranges: 200 ohm, 2 kohm, 20 kohm, 200 kohm, 2 Mohm, 20 Mohm, 200 Mohm
- 2-wire vs 4-wire measurement (4-wire eliminates lead resistance error)
- Calibration uses precision decade resistance standards or wire-wound resistors

## True RMS vs Average Responding

| Type | Measures | Accuracy on Non-Sinusoidal |
|------|----------|---------------------------|
| Average responding | Rectified average, scaled by 1.1107 (sine wave form factor) | Significant error on distorted waveforms; only accurate on pure sine |
| True RMS | Actual RMS value regardless of waveform shape | Accurate on square, triangle, pulse, and distorted waveforms |

For industrial environments with variable-frequency drives (VFDs), switching power supplies, and non-linear loads, true RMS measurement is essential. Most professional-grade DMMs are true RMS on both AC V and AC A.

## Common Brands and Models

### Handheld DMMs
| Model | Digits | DC V Accuracy (1-year) | CAT Rating | Key Features |
|-------|--------|----------------------|------------|-------------|
| Fluke 87V | 4.5 | +/-(0.05% + 1) | CAT III 1000V / CAT IV 600V | Industry standard handheld |
| Fluke 189 | 4.5 | +/-(0.025% + 2) | CAT III 1000V / CAT IV 600V | Logging, min/max/avg |
| Fluke 289 | 4.5 | +/-(0.025% + 2) | CAT III 1000V / CAT IV 600V | TrendCapture graphing |
| Keysight U1272A | 4.5 | +/-(0.05% + 2) | CAT III 1000V / CAT IV 600V | IP54, low-impedance mode |

### Bench/System DMMs
| Model | Digits | DC V Accuracy (1-year) | Key Features |
|-------|--------|----------------------|-------------|
| Keysight 34461A | 6.5 | +/-(0.0035% + 0.0005%) | Truevolt, 1000 readings/sec |
| Keithley DMM6500 | 6.5 | +/-(0.003% + 0.0003%) | Touchscreen, digitizer mode |
| Fluke 8845A | 6.5 | +/-(0.0024% + 0.0005%) | Dual display, 2x4 wire |
| Keysight 3458A | 8.5 | +/-(0.0001% + 0.00001%) | Metrology-grade reference DMM |

## Calibration Equipment

- **Multifunction calibrator** (e.g., Fluke 5520A, 5730A): sources precise DC/AC voltage, current, and resistance for calibrating handheld and bench DMMs.
- **Precision DC voltage standard** (e.g., Fluke 732B): Zener-based 10 V reference for highest-accuracy DC voltage calibration.
- **Precision resistance standards**: wire-wound or foil resistors with known values and stability (e.g., Fluke 742A series).
- **AC measurement standard** (e.g., Fluke 5790A): for verifying AC voltage measurement to 0.003% uncertainty.

## Common Failure Modes

| Failure | Likely Cause |
|---------|-------------|
| DC voltage drift | Aging internal voltage reference, thermal effects |
| AC voltage error at high frequency | Degraded input circuit bandwidth |
| Resistance offset | Corroded input terminals, degraded internal shunt |
| Overload damage | Measuring voltage on current range (blown fuse or varistor) |
| Display anomalies | Firmware issue, failing display driver, low battery |

## Recalibration Triggers

- Standard 12-month interval (most common for industrial DMMs)
- After suspected overload or electrical transient event
- After firmware update (bench DMMs may require recalibration after update)
- After repair or component replacement
- If readings disagree with known reference values or other calibrated instruments
- After extended storage or significant temperature excursion
