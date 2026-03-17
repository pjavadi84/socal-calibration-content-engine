---
title: "Torque Wrenches — Calibration Reference"
tags: [torque, ISO-6789, click-type, beam-type, torque-calibration, fastener-torque]
pillars: [calibration-services, equipment-guides, industry-compliance]
categories: [torque-calibration, torque-wrenches]
equipment_types: [torque-wrenches]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ISO 6789-1:2017 — Assembly Tools for Screws and Nuts — Hand Torque Tools — Part 1: Requirements and Methods for Design Conformance Testing and Quality Conformance Testing: Indicating Torque Tools"
  - "ISO 6789-2:2017 — Assembly Tools for Screws and Nuts — Hand Torque Tools — Part 2: Requirements and Methods for Design Conformance Testing and Quality Conformance Testing: Calibration and Determination of Measurement Uncertainty"
  - "ASME B107.300-2010 — Torque Instruments"
  - "ASTM E2624 — Standard Practice for Torque Calibration of Testing Machines"
---

# Torque Wrenches — Calibration Reference

## ISO 6789:2017 Classification

ISO 6789:2017 replaced the 2003 edition and split into two parts. It reclassified torque tools and introduced measurement uncertainty requirements.

### Type I — Indicating Torque Tools
Tools that display the applied torque value. The operator reads the torque and decides when target is reached.

| Class | Description | Conformity Tolerance |
|-------|------------|---------------------|
| A     | Torque wrench with indicating device, graduated scale | +/-4% of reading |
| B     | Torque wrench with dial indicator or digital display | +/-6% of reading |
| C     | Torque wrench with electronic display and/or data output | +/-6% of reading |
| D     | Torque screwdriver with indicating device | +/-6% of reading |

### Type II — Setting Torque Tools
Tools preset to release or signal at a specific torque value. The tool itself determines when target is reached (click, break-over, or electronic signal).

| Class | Description | Conformity Tolerance |
|-------|------------|---------------------|
| A     | Torque wrench with adjustable setting mechanism (click-type) | +/-4% of reading |
| B     | Torque wrench with fixed setting mechanism | +/-6% of reading |
| C     | Torque wrench with electronic setting and signal | +/-6% of reading |
| D     | Torque screwdriver with setting mechanism | +/-6% of reading |

Note: The +/-4% and +/-6% values are the maximum permissible deviations for conformity. These apply from 20% to 100% of the tool's marked capacity. Below 20% of capacity, the tool is outside its rated range and accuracy is not guaranteed.

## Torque Wrench Types

### Click-Type (Micrometer Setting)
The most widely used type. An internal spring-loaded mechanism releases (clicks) when the preset torque is reached. Adjustable via a micrometer-style handle. After the click, additional torque is applied if the operator does not stop. Must be returned to lowest setting for storage to preserve spring calibration.

### Beam-Type
A flexible beam deflects under load; a secondary pointer on an attached scale indicates torque. No release mechanism. Simple, durable, and inherently does not go out of calibration unless the beam is permanently deformed. Lower accuracy than click-type. Primarily used as a check/reference tool.

### Dial-Type
A dial indicator displays the torque value in real time. A memory needle can record peak torque. More accurate than click-type for reading actual torque applied but requires the operator to watch the dial during tightening.

### Digital/Electronic
Electronic strain gauge sensor with digital display. Features may include peak hold, preset alarms, angle measurement, data logging, and Bluetooth communication. Higher accuracy achievable (some rated +/-1% of reading). Battery dependent.

## Calibration Procedure per ISO 6789-2:2017

### Test Setup
- Calibration device: torque transducer/sensor with uncertainty no greater than 1% of the measured value (4:1 TUR preferred).
- The wrench is loaded through a square drive adapter into the transducer.
- The loading arm length must match the tool's nominal arm length (handle center to square drive center).
- Environment: 23 degC +/-5 degC; wrench and equipment must be thermally equilibrated.

### Test Protocol (Setting Tools — Type II)
1. **Pre-loading**: Apply three full-scale loadings as warm-up; discard these readings.
2. **Test points**: Calibrate at three torque values:
   - 20% of rated capacity
   - 60% of rated capacity
   - 100% of rated capacity
3. **Repetitions**: At each test point, apply a minimum of 5 readings.
4. **Direction**: Test in each direction the tool is designed to operate (clockwise and/or counterclockwise). For a single-direction tool: 3 points x 5 readings = 15 measurements minimum.
5. **Loading rate**: Apply torque smoothly and consistently, approximately 1 to 3 seconds from zero to target value.

### Test Protocol (Indicating Tools — Type I)
Same three test points and five repetitions per point. The calibration device applies a known torque, and the wrench's indicated value is recorded and compared.

### Evaluation
For each test point, calculate the mean and the expanded measurement uncertainty. The mean deviation from the nominal value, combined with the measurement uncertainty, must fall within the conformity tolerance (+/-4% or +/-6% depending on class).

ISO 6789-2:2017 explicitly requires the calibration laboratory to calculate and report measurement uncertainty — a significant change from the 2003 edition.

## Common Brands

| Brand | Product Lines | Notes |
|-------|--------------|-------|
| Snap-on | ATECH, TechAngle, QD series | Widely used in automotive and aerospace |
| Proto (Stanley) | J6000 series, Electronic | Industrial and MRO markets |
| CDI Torque Products | Computorq, Dial series | Snap-on industrial division |
| Tohnichi | CL/QL/QLE series, MTQL | Japanese precision, popular in electronics/aerospace |
| Sturtevant Richmont | Exacta, Global 400, CAL series | Focus on controlled bolting, lean manufacturing |
| Norbar | NorTorque, ProTronic, TTi series | UK manufacturer, broad range |
| Tekton | Click and digital wrenches | Consumer/light industrial market |

## Recalibration Triggers

| Trigger | Reason |
|---------|--------|
| Scheduled interval | 12 months standard; 6 months for critical applications (aerospace, automotive safety) |
| Dropped tool | Impact can shift the internal mechanism or damage the beam |
| Overloaded beyond capacity | Exceeding rated capacity deforms the spring or sensing element |
| Before critical assembly | Safety-critical or audit-required fastening operations |
| After repair or adjustment | Any internal work requires recalibration |
| Suspected damage | Visual damage, loose handle, inconsistent clicks |
| Change in usage pattern | Moving from light use to heavy production use |

## Common Failure Modes

| Failure | Symptoms | Root Cause |
|---------|----------|-----------|
| Over-reading | Clicks before actual target torque | Weak or fatigued mainspring, mechanism wear |
| Under-reading | Clicks after actual target torque | Binding in mechanism, lack of lubrication, corrosion |
| Erratic readings | Inconsistent click points | Worn cam, dirty ratchet, damaged pawl |
| No click | No release at any setting | Broken internal spring, jammed mechanism |
| Hysteresis | Different readings clockwise vs. counterclockwise | Wear in the reversible mechanism |

## Practical Notes

- Click-type wrenches should always be stored at the lowest torque setting to prevent spring fatigue. This is the single most common cause of calibration drift.
- Never use a torque wrench as a breaker bar. Applying force in the wrong direction or beyond capacity damages the mechanism.
- The operator's grip position matters. Gripping ahead of or behind the handle center changes the effective lever arm and alters the applied torque.
- For fastener torque accuracy in practice, friction (thread condition, lubrication) typically contributes far more error (+/-25% or more) than torque wrench calibration uncertainty (+/-4%).
- Digital torque wrenches with angle measurement capability are increasingly required in automotive and aerospace for torque-plus-angle (torque-to-yield) fastening specifications.
