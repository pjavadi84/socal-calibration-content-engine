---
title: "ILAC-G24 / NCSL RP-1 — Calibration Interval Methodology"
tags:
  - ilac-g24
  - calibration-intervals
  - interval-adjustment
  - reliability
pillars:
  - industry-compliance
  - calibration-services
categories:
  - calibration-intervals
equipment_types: []
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ILAC-G24:2007 — Guidelines for the Determination of Calibration Intervals of Measuring Instruments"
  - "NCSL International RP-1 — Establishment and Adjustment of Calibration Intervals"
  - "ANSI/NCSL Z540.3-2006 Section 5.4"
  - "NASA-HDBK-8739.12 — Metrology Calibration and Measurement Processes Guidelines"
---

# ILAC-G24:2007 / NCSL RP-1 — Calibration Interval Methodology

## Overview

ILAC-G24:2007 (Guidelines for the Determination of Calibration Intervals of Measuring Instruments) is the internationally recognized guidance document for establishing and adjusting calibration intervals. It was published by the International Laboratory Accreditation Cooperation and closely mirrors NCSL International Recommended Practice RP-1. Both documents reject arbitrary fixed intervals and require a systematic, evidence-based approach to determining when instruments need recalibration.

ISO/IEC 17025:2017 Clause 6.4.7 requires that calibration intervals be reviewed and adjusted; ILAC-G24 provides the methods for doing so.

## The "No Arbitrary Interval" Principle

A cornerstone of ILAC-G24 is that calibration intervals must not be set arbitrarily. A 12-month interval applied uniformly to all equipment without analysis is not compliant with accreditation requirements. Intervals must be:

- Based on instrument stability data, manufacturer recommendations, and historical calibration results
- Reviewed periodically and adjusted when evidence supports a change
- Documented with the rationale for the chosen interval

## Methods for Determining Calibration Intervals

### Method 1 — Calendar Time (Automatic Adjustment)

The simplest and most widely used method. Instruments are assigned a fixed calendar interval (e.g., 6 months, 12 months), and the interval is adjusted up or down based on calibration results.

- **If the instrument is in tolerance at calibration**: increase the interval by a fixed step (e.g., 1–3 months)
- **If the instrument is out of tolerance at calibration**: decrease the interval by a fixed step
- Easy to implement in calibration management software
- Best suited for large populations of similar instruments

### Method 2 — Usage Time (Operating Hours)

The calibration interval is based on actual hours of use rather than elapsed calendar time. This is appropriate for equipment that degrades primarily through use rather than aging.

- Requires hour meters or usage logs on instruments
- Common for portable test equipment, force transducers, and production-floor gauges
- Interval expressed as "recalibrate every 2,000 hours of use" rather than "every 12 months"
- More accurate than calendar time for intermittently used equipment

### Method 3 — In-Service Checks (Sequential Testing)

Instruments are checked against a known reference at regular intervals between full calibrations. If the check shows the instrument is still within tolerance, the calibration interval is maintained or extended. If drift is detected, a full calibration is scheduled.

- Used for critical instruments where failure has high consequences
- Common with reference standards, check weights, and process control instruments
- Checks are less comprehensive than full calibrations but provide ongoing confidence
- Does not replace calibration; supplements it with interim verification

### Method 5 — Classical Statistical Methods (Binomial Model)

The most rigorous method, using statistical analysis of calibration history across a population of similar instruments to determine the optimal interval. The binomial model calculates the probability that an instrument will remain in tolerance over a given interval.

- **Reliability target**: typically set between 85% and 95% (meaning 85–95% of instruments should be found in tolerance at their next calibration)
- Requires a statistically meaningful sample size (at least 20–30 instruments of the same type)
- Uses pass/fail data from successive calibrations to estimate drift rates
- The interval is set so that the target reliability level is achieved
- More conservative targets (95%) yield shorter intervals; less conservative targets (85%) yield longer intervals

## Extending Calibration Intervals

Intervals may be extended when historical data demonstrates consistent in-tolerance performance:

| Condition | Recommended Action |
|-----------|-------------------|
| Instrument found in tolerance for 3 or more consecutive calibrations | Extend interval by 10–25% |
| Population reliability exceeds 95% | Consider extending interval for the entire equipment class |
| Manufacturer specifies a longer interval supported by stability data | Adopt manufacturer recommendation with documented justification |
| Equipment is used in controlled, stable environments | Factor reduced environmental stress into interval decision |

## Shortening Calibration Intervals

Intervals must be shortened when evidence indicates degradation:

| Condition | Recommended Action |
|-----------|-------------------|
| Instrument found out of tolerance at calibration | Reduce interval by 25–50% and investigate root cause |
| Out-of-tolerance rate exceeds 15% for an equipment class | Shorten intervals for the entire population |
| Equipment exposed to harsh conditions (vibration, temperature extremes, contamination) | Apply a reduced interval or increase in-service checks |
| Manufacturer issues a field notice or recall | Perform immediate calibration and reassess interval |

## Initial Interval Recommendations by Equipment Type

When no historical data exists, ILAC-G24 recommends starting with conservative intervals based on manufacturer guidance and industry practice:

| Equipment Type | Recommended Initial Interval | Rationale |
|---------------|------------------------------|-----------|
| Precision balances and scales | 6–12 months | Sensitive to drift from load cell fatigue |
| Pressure gauges (mechanical) | 12 months | Bourdon tubes are subject to hysteresis and fatigue |
| Digital multimeters | 12 months | Solid-state components drift slowly but measurably |
| Torque wrenches | 6–12 months | Mechanical springs lose calibration with heavy use |
| Dimensional gauges (calipers, micrometers) | 12 months | Wear patterns depend on handling and storage |
| Temperature sensors (RTDs, thermocouples) | 12 months | Drift rate depends on sensor type and exposure temperature |
| Reference standards | 12–24 months | Higher stability; longer intervals justified with data |
| Gas detection instruments | 6 months | Sensor degradation accelerates with exposure to target gases |

These initial intervals should be treated as starting points and adjusted using the methods described above once sufficient calibration history is available.

## Practical Implementation

1. **Track all calibration results** — record as-found data (readings before any adjustment) alongside as-left data to build a drift history
2. **Define in-tolerance criteria clearly** — without clear acceptance limits, pass/fail determinations are inconsistent and interval analysis is unreliable
3. **Group instruments by type and usage** — interval adjustments are most meaningful when applied to populations of similar instruments used under similar conditions
4. **Review intervals at least annually** — even if no individual adjustment is triggered, a periodic review of interval data is required by ISO/IEC 17025
5. **Document all interval decisions** — accreditation auditors will look for evidence that intervals are not arbitrary
