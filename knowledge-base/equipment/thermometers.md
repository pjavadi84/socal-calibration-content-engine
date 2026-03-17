---
title: "Thermometers and Temperature Sensors — Calibration Reference"
tags: [temperature, thermometers, RTD, thermocouple, thermistor, infrared, ITS-90, ASTM-E1, fixed-point]
pillars: [calibration-services, equipment-guides, industry-applications]
categories: [temperature-calibration, thermometers]
equipment_types: [thermometers, temperature-sensors]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ASTM E1-14 — Standard Specification for ASTM Liquid-in-Glass Thermometers"
  - "ASTM E2251-14 — Standard Specification for Liquid-in-Glass ASTM Thermometers with Low-Hazard Precision Liquids"
  - "ITS-90 — International Temperature Scale of 1990"
  - "ASTM E230/E230M — Standard Specification for Temperature-Electromotive Force (EMF) Tables for Standardized Thermocouples"
  - "NIST Monograph 175 — Platinum Resistance Thermometry"
  - "ASTM E1137 — Standard Specification for Industrial Platinum Resistance Thermometers"
---

# Thermometers and Temperature Sensors — Calibration Reference

## Temperature Scales and Standards

### ITS-90 (International Temperature Scale of 1990)
The internationally agreed temperature scale used to calibrate thermometers from 0.65 K to approximately 1,358 K (1,085 degC). It is defined by fixed points (phase transitions of pure materials) and interpolation instruments:

| Fixed Point | Temperature (degC) | Material |
|------------|-------------------|----------|
| Triple point of mercury | -38.8344 | Mercury |
| Triple point of water | 0.01 | Water (defining point) |
| Melting point of gallium | 29.7646 | Gallium |
| Freezing point of indium | 156.5985 | Indium |
| Freezing point of tin | 231.928 | Tin |
| Freezing point of zinc | 419.527 | Zinc |
| Freezing point of aluminum | 660.323 | Aluminum |
| Freezing point of silver | 961.78 | Silver |
| Freezing point of copper | 1,084.62 | Copper |

The primary interpolating instrument from -259.3467 degC to 961.78 degC is the Standard Platinum Resistance Thermometer (SPRT).

## Sensor Types

### RTD / PRT (Resistance Temperature Detector / Platinum Resistance Thermometer)
- Platinum element changes resistance predictably with temperature.
- Pt100 (100 ohm at 0 degC) is the industrial standard; Pt1000 for lower-current applications.
- IEC 60751 defines tolerance classes: Class AA (+/-0.1 degC at 0 degC), Class A (+/-0.15 degC), Class B (+/-0.3 degC), Class C (+/-0.6 degC).
- SPRTs (Standard Platinum Resistance Thermometers) achieve uncertainties of 0.001 degC or better; used as calibration standards.
- Excellent stability and repeatability. Drift is typically less than 0.01 degC per year for wire-wound PRTs.
- Range: -200 degC to 660 degC (industrial); to 962 degC for SPRTs.

### Thermocouples
Two dissimilar metal wires joined at a junction produce a voltage proportional to temperature. Common types per ASTM E230:

| Type | Conductors | Range (degC) | Typical Accuracy | Application |
|------|-----------|-------------|-----------------|-------------|
| K    | Chromel/Alumel | -200 to 1,260 | +/-2.2 degC or +/-0.75% | General purpose, most widely used |
| J    | Iron/Constantan | -40 to 760 | +/-2.2 degC or +/-0.75% | Older installations, reducing atmospheres |
| T    | Copper/Constantan | -200 to 370 | +/-1.0 degC or +/-0.75% | Low temperature, food, cryogenic |
| N    | Nicrosil/Nisil | -200 to 1,260 | +/-2.2 degC or +/-0.75% | Improved K-type stability, less drift |
| S    | Pt-10%Rh/Pt | 0 to 1,480 | +/-1.5 degC or +/-0.25% | High-temperature reference standard |
| R    | Pt-13%Rh/Pt | 0 to 1,480 | +/-1.5 degC or +/-0.25% | Similar to S, slightly different EMF |
| B    | Pt-30%Rh/Pt-6%Rh | 250 to 1,700 | +/-0.5% | Very high temperature, glass/ceramics |
| E    | Chromel/Constantan | -200 to 900 | +/-1.7 degC or +/-0.5% | Highest EMF output of base metal types |

### Thermistors
Ceramic semiconductor elements with high sensitivity (typically -3% to -5% change in resistance per degC for NTC type). Excellent resolution but limited range (typically -50 degC to 150 degC for standard probes, up to 300 degC for glass-encapsulated). Not interchangeable without individual characterization. Drift is higher than PRT: typically 0.01 degC to 0.1 degC per year depending on type and temperature.

### Infrared (Non-Contact) Thermometers
Measure thermal radiation emitted by a surface. Accuracy depends critically on emissivity setting matching the target surface. Typical accuracy: +/-1 degC to +/-2 degC or +/-1% to +/-2% of reading. Affected by distance-to-spot ratio, ambient reflections, and intervening atmosphere. Calibrated against blackbody radiation sources with known emissivity (typically 0.95 to 0.99).

## Calibration Methods

### Fixed-Point Calibration
Uses ITS-90 fixed points (phase transitions) to calibrate reference thermometers. Each fixed point cell provides a single, highly reproducible temperature. Uncertainties of 0.0001 degC to 0.001 degC are achievable. Used for primary standards laboratories and SPRT calibration.

### Comparison Calibration
The unit under test and a calibrated reference thermometer are immersed in the same temperature-controlled medium (dry-well calibrator, liquid bath, or ice point). The reference reading is compared to the test instrument at multiple temperature set points. This is the most common industrial calibration method.

- **Liquid baths**: best uniformity and stability (+/-0.005 degC to +/-0.02 degC). Use silicone oil, ethanol, or water depending on temperature range.
- **Dry-well (dry-block) calibrators**: portable, no fluid handling. Uniformity typically +/-0.05 degC to +/-0.3 degC. Insert diameter must match the sensor closely to minimize air gap errors.

### Ice Point Verification (0 degC Check)
A fundamental field check using an ice bath prepared per ASTM E563:
1. Fill a Dewar flask with finely crushed or shaved ice made from distilled or deionized water.
2. Add a small amount of distilled water to fill voids (approximately 10% liquid).
3. Allow to equilibrate for 5 to 10 minutes.
4. Insert the sensor at least 150 mm into the ice-water mixture.
5. A properly prepared ice bath provides 0.000 degC +/-0.002 degC.

This simple check can detect gross errors and sensor drift between formal calibrations.

## Common Brands

| Brand | Products | Strengths |
|-------|---------|-----------|
| Fluke Hart Scientific (Fluke Calibration) | 1524, 9170/9171/9172 dry-wells, 7109A/7012 baths, 5681/5682 SPRTs | Gold standard for temperature calibration equipment |
| ERTCO (now Thermo Fisher) | Liquid-in-glass thermometers, ASTM thermometers | Reference LiG thermometers |
| Omega Engineering | Thermocouples, RTDs, IR thermometers, data loggers | Broadest sensor catalog |
| Thermo Scientific | Precision baths, incubators, laboratory thermometers | Laboratory and pharmaceutical |
| Additel | ADT878 dry-well, ADT286 reference thermometer | Portable calibration solutions |
| WIKA | Industrial RTDs, thermocouples, thermowells, CTD9100 dry-wells | Industrial process temperature |

## Drift Characteristics by Sensor Type

| Sensor | Typical Drift Rate | Key Drift Mechanism |
|--------|-------------------|-------------------|
| SPRT (wire-wound Pt) | < 0.001 degC/year | Strain relief in platinum wire |
| Industrial PRT (thin-film Pt100) | 0.01 to 0.05 degC/year | Substrate stress, contamination |
| Type K thermocouple | 1 to 5 degC after 1,000 hours at 1,000 degC | Oxidation, grain growth, short-range ordering (K-type specific) |
| Type N thermocouple | 0.5 to 2 degC after 1,000 hours at 1,000 degC | Improved over K-type, designed to resist ordering |
| Type S/R thermocouple | 0.2 to 1 degC at 1,100 degC over extended use | Rhodium migration, contamination |
| Thermistor (NTC, glass bead) | 0.01 to 0.1 degC/year | Aging of semiconductor material |
| IR thermometer | Sensor is stable; recalibrate optics and electronics | Lens contamination, detector aging |

## Recalibration Triggers

- Scheduled interval (6 to 12 months typical for industrial; 12 to 24 months for reference thermometers with established stability history).
- After thermal shock (rapid temperature excursion beyond rated range).
- After mechanical shock (dropped probe, bent sheath).
- When ice-point verification shows deviation beyond acceptable limits.
- After process where sensor was exposed to contaminating chemicals.
- When thermocouple wire shows discoloration, embrittlement, or insulation damage.
