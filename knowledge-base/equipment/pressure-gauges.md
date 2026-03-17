---
title: "Pressure Gauges — Calibration Reference"
tags: [pressure, bourdon-tube, diaphragm, digital-pressure, deadweight-tester, ASME-B40]
pillars: [calibration-services, equipment-guides]
categories: [pressure-calibration, pressure-gauges]
equipment_types: [pressure-gauges]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ASME B40.100-2013 — Pressure Gauges and Gauge Attachments"
  - "ASME B40.7-2013 — Pressure Indicating and Transmitting Instruments (Digital/Electronic)"
  - "ASME B40.1 (legacy, now incorporated into B40.100)"
  - "ISA-37.3-1982 (R1995) — Specifications and Tests for Strain Gauge Pressure Transducers"
---

# Pressure Gauges — Calibration Reference

## Gauge Types

### Bourdon Tube Gauges
The most common industrial pressure gauge. A curved, sealed tube deforms under pressure; mechanical linkage translates tube movement to needle rotation. Available in C-tube (low pressure), spiral, and helical (high resolution) configurations. Typical range: vacuum through 100,000 psi. Best suited for clean, non-corrosive, non-viscous media.

### Diaphragm Gauges
Use a flexible membrane to sense pressure. Well suited for low-pressure applications (inches of water column through approximately 500 psi), corrosive or viscous media, and sanitary applications. Often used in pharmaceutical and food processing.

### Digital Pressure Gauges
Electronic sensors (piezoresistive, capacitive, or resonant silicon) with digital display. Covered under ASME B40.7. Advantages include programmable engineering units, peak/valley capture, data logging, and configurable alarm outputs. Higher accuracy classes are achievable compared to analog gauges.

## ASME B40.100 Accuracy Grades

ASME B40.100 defines accuracy as a percentage of the full-scale span:

| Grade | Accuracy (% of span) | Typical Application |
|-------|----------------------|---------------------|
| 4A    | ±0.1%                | Primary/transfer standards |
| 3A    | ±0.25%               | Laboratory and test standards |
| 2A    | ±0.5%                | Critical process measurement, test gauges |
| A     | ±1.0%                | High-quality industrial process |
| B     | ±2.0%                | General industrial process |
| C     | ±3.0%                | Commercial and general purpose |
| D     | ±5.0%                | Non-critical indication only |

Accuracy applies over the middle 75% of the dial range. At the lower and upper 25% extremes, the allowable error is typically doubled (except for Grades 4A and 3A, where it applies over the full range).

## ASME B40.7 — Digital/Electronic Pressure Gauges

ASME B40.7 covers digital and electronic pressure gauges separately from analog. Key differences from B40.100:
- Accuracy is stated as a combined percentage of reading and percentage of full scale.
- Environmental performance requirements include temperature effect, vibration, and EMI/RFI susceptibility.
- Display resolution must be consistent with stated accuracy.

## Common Brands

| Brand | Notable Models | Notes |
|-------|---------------|-------|
| Ashcroft | 1279, 2089, 2089 Digital | Dominant US industrial brand |
| WIKA | 232.50, 612.20, CPG1500 digital | German manufacturer, broad catalog |
| Dwyer | Magnehelic, Capsuhelic, DPG-100 | Strong in low-pressure/differential |
| Fluke | 700G Series digital test gauges | Portable calibration-grade reference |
| Additel | ADT680, ADT681 | High-accuracy digital reference gauges |

## Calibration Methods

### Deadweight Tester (Pressure Balance)
The primary standard for pressure calibration. A piston-cylinder assembly generates a known pressure based on the mass loaded and the effective area of the piston. Accuracies of 0.005% to 0.015% of reading are typical. Must be corrected for local gravity, air buoyancy, temperature of piston/cylinder, and head pressure of the working fluid.

### Digital Pressure Calibrators
Portable electronic instruments (e.g., Fluke 729, Additel ADT761, Beamex MC6) that combine a pressure source, reference sensor, and documentation capability. Typical reference accuracies of 0.01% to 0.05% of full scale. Suitable for field calibration.

### Comparison Method
The unit under test and a reference gauge are connected to the same pressure source (typically a hand pump or regulated supply). Pressure is applied, and readings are compared at defined test points.

## Standard Calibration Points

Per ASME B40.100 and general industry practice, calibration is performed at a minimum of five ascending and five descending points:

- 0% of range (zero)
- 25% of range
- 50% of range
- 75% of range
- 100% of range (full scale)

Readings are taken on the way up and then on the way down to evaluate hysteresis. Some protocols add 10% and 90% points for critical applications. Each point should be approached from the same direction (never overshoot and reverse).

## Common Failure Modes

| Failure Mode | Description | Likely Cause |
|-------------|-------------|--------------|
| Hysteresis | Different readings on ascending vs. descending pressure at the same point | Worn movement, friction in linkage, fatigued Bourdon tube |
| Zero shift | Pointer does not return to zero after pressure is removed | Permanent deformation of Bourdon tube, overpressure event |
| Linearity error | Non-uniform error distribution across the range | Worn or improperly adjusted linkage, tube fatigue |
| Span error | Consistent over- or under-reading across entire range | Calibration drift, temperature effects on tube elasticity |
| Pointer vibration | Needle oscillates during steady pressure | Pulsating process pressure, insufficient damping (liquid fill) |

## Recalibration Triggers

- Annual interval (industry standard baseline)
- After a suspected overpressure event
- After physical damage (drop, impact)
- When readings appear inconsistent with process conditions
- After instrument repair or adjustment
- When moved between significantly different ambient temperature environments

## Environmental Considerations

- Ambient temperature affects Bourdon tube elasticity; most gauges are rated at 73 degF (23 degC). Deviation adds approximately 0.04% per degF for stainless steel elements.
- Liquid-filled gauges (glycerin or silicone) dampen vibration and pulsation but limit the readable accuracy to approximately Grade A.
- Vibration, pulsation, and corrosive atmospheres are the leading causes of premature gauge failure in industrial settings.
