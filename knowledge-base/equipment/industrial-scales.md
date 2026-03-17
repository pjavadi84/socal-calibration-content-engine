---
title: "Industrial Scales and Balances — Calibration Reference"
tags: [scales, balances, NIST-HB44, NTEP, OIML-R76, legal-for-trade, mass-calibration]
pillars: [calibration-services, equipment-guides, industry-compliance]
categories: [scale-calibration, scales-balances]
equipment_types: [scales, balances]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "NIST Handbook 44 — Specifications, Tolerances, and Other Technical Requirements for Weighing and Measuring Devices"
  - "OIML R 76-1:2006 — Non-automatic Weighing Instruments"
  - "NIST Handbook 105-1 — Specifications for Field Standard Weights (OIML Class F1, F2)"
  - "USP General Chapter <41> — Balances"
  - "ASTM E617 — Standard Specification for Laboratory Weights and Precision Mass Standards"
---

# Industrial Scales and Balances — Calibration Reference

## Scale Types

### Analytical Balances
Capacity typically 80 g to 520 g, readability 0.01 mg to 0.1 mg. Enclosed draft shield is standard. Used in pharmaceutical, chemical, and research laboratories. Most are electromagnetic force restoration (EMFR) type.

### Precision/Bench Balances
Capacity 200 g to 64 kg, readability 0.001 g to 0.1 g. Used for formulation, quality control, and general laboratory weighing.

### Bench and Floor Scales
Bench scales: 3 kg to 150 kg capacity. Floor scales: 500 lb to 20,000 lb capacity. Typically use strain gauge load cells. Common in shipping/receiving, manufacturing, and industrial processes.

### Truck Scales (Weighbridges)
Capacity 40,000 lb to 200,000 lb or more. Require NTEP certification for commercial transactions. Foundation and installation are critical to accuracy. Section test and substitution test methods are used for calibration when full-capacity test weights are impractical.

## NIST Handbook 44 — Accuracy Classes

NIST HB 44 defines accuracy classes for commercial weighing devices in the United States:

| Class | Minimum Divisions (n) | Maximum Divisions (n) | Typical Application |
|-------|----------------------|----------------------|---------------------|
| I     | 50,000               | unlimited            | Precision laboratory balances |
| II    | 5,000                | 100,000              | Laboratory, pharmacy, precious metals |
| III   | 500                  | 10,000               | Commercial trade (most retail/industrial scales) |
| IIII (IIIL) | 500           | 10,000               | Vehicle scales, livestock, heavy-capacity |

Tolerances are expressed in scale divisions (d or e). For Class III on initial verification: 0 to 500d = ±0.5d; 501 to 2,000d = ±1.0d; 2,001 to 4,000d = ±1.5d. Maintenance (in-service) tolerances are double acceptance tolerances.

## OIML R 76 — International Classification

OIML R 76 defines four accuracy classes used internationally:

| OIML Class | Verification Interval (e) | Minimum Capacity | Typical Use |
|-----------|--------------------------|-----------------|-------------|
| Special (I) | 50,000e minimum | 100e | Precision laboratory |
| High (II) | 5,000e to 100,000e | 20e to 50e | Pharmacy, gold, gemstones |
| Medium (III) | 500e to 10,000e | 20e | General commercial trade |
| Ordinary (IIII) | 100e to 1,000e | 10e | Bulk weighing, aggregate |

Maximum permissible errors (MPE) on initial verification: ±0.5e for loads up to 50,000e (Class I); ±0.5e up to 5,000e, ±1e up to 20,000e for Class II.

## NTEP Certification

The National Type Evaluation Program (NTEP), administered by NCWM, evaluates and certifies weighing devices for legal-for-trade use in the United States. An NTEP Certificate of Conformance (CC) confirms the device design meets HB 44 requirements. Key points:
- NTEP certification applies to the device type/model, not individual units.
- Legal-for-trade scales must be NTEP certified AND properly installed and calibrated by a licensed service company.
- Certificates are searchable at the NCWM NTEP database.

## Calibration Test Procedures

### Eccentricity (Corner Load) Test
A test weight equal to approximately one-third of scale capacity is placed at the center and at each of four off-center positions (typically the four quadrants or corners). The difference between the center reading and each corner reading must be within tolerance. This reveals load cell imbalance or platform-level issues.

### Repeatability Test
The same load is placed and removed a minimum of five times, recording the reading each time. The range (maximum minus minimum reading) must not exceed the applicable tolerance for that load. Tests the consistency of the weighing system.

### Linearity (Increasing Load) Test
Test weights are applied in increments from zero to capacity (typically at 10%, 25%, 50%, 75%, and 100% of capacity). The error at each point must fall within tolerance. Increasing and decreasing load tests may also be performed to check for hysteresis.

### Substitution Testing (Large Scales)
When sufficient test weights are not available for full-capacity testing (common with truck scales), a substitution method is used: a known test load is placed, the reading is recorded, then material (e.g., gravel) is substituted for the test weights while maintaining the same indication. The test weights are then added again on top to test the next increment.

## Common Brands

| Brand | Strengths | Notable Models |
|-------|-----------|---------------|
| Mettler Toledo | Analytical and precision, industrial, vehicle | XPR, MS-TS, ICS series |
| Ohaus | Laboratory, education, portable | Explorer, Adventurer, Defender |
| Rice Lake | Industrial, truck scales, process weighing | Benchmark, SURVIVOR series |
| Sartorius | Analytical, pharmaceutical, research | Quintix, Practum, Cubis II |
| A&D Weighing | Laboratory, industrial, medical | HR-AZ, GX-A, FG-K series |

## USP Chapter <41> — Balances (Pharmaceutical)

USP <41> defines minimum weight and repeatability requirements for balances used in pharmaceutical compounding and testing:
- Repeatability requirement: standard deviation of 10 weighings of a test weight must not exceed 0.41d (where d is the scale division).
- Minimum weight = 2,000 x standard deviation of repeatability / desired tolerance (e.g., 0.10% requires minimum weight = 2,000 x s / 0.001).
- The minimum weight must be established for each balance and documented.
- A balance may meet its manufacturer's specifications but still fail USP <41> minimum weight requirements for a specific tolerance.

## Legal-for-Trade Requirements

- Scale must have a current NTEP CC number.
- Must be installed per manufacturer specifications.
- Must be calibrated and sealed by a licensed service agent.
- Must display the NTEP CC number, accuracy class, capacity, and scale division on the data plate.
- Weights and measures inspectors perform periodic verification using certified test weights (NIST Class F).
- Audit trail capabilities may be required in regulated industries (pharmaceutical, cannabis).

## Environmental Factors

- Temperature changes cause load cell drift; most strain gauge cells are compensated over a range (typically 14 degF to 104 degF / -10 degC to 40 degC).
- Drafts, vibration, and static charge significantly affect analytical balances.
- Floor scales must be on a level, rigid surface; flexing floors cause errors.
- Truck scales require proper drainage, approach ramps, and foundation per manufacturer specifications.

## Recalibration Triggers

- Scheduled interval (6 to 12 months typical; pharmaceutical may be quarterly or with each use via check-weight verification).
- After relocation or reinstallation.
- After repair or component replacement.
- When readings on check weights exceed action limits.
- After significant environmental changes (HVAC modifications, floor work).
