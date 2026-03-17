---
title: "Aerospace & Defense Industry Calibration Requirements"
tags: [aerospace, defense, AS9100D, NADCAP, pyrometry, AMS2750, CMM, torque, tolerances]
pillars: [calibration-services, industry-compliance, equipment-guides, industry-applications]
categories: [aerospace, audit-preparation]
equipment_types: [CMMs, surface-finish-testers, hardness-testers, optical-comparators, torque-wrenches, thermocouples, pressure-transducers, micrometers, calipers, bore-gauges]
industries: [aerospace, defense]
last_reviewed: "2026-03-17"
review_interval_months: 6
sources:
  - "AS9100D:2016 — Quality Management Systems - Requirements for Aviation, Space, and Defense Organizations"
  - "NADCAP AC7000 — Audit Criteria for Non-Conventional Machining and Other Technologies"
  - "NADCAP AC7102 — Audit Criteria for Heat Treating"
  - "AMS 2750G — Pyrometry (SAE International, revised 2022)"
  - "NAS 1638 — Cleanliness Requirements of Parts Used in Hydraulic Systems"
  - "ANSI/NCSL Z540.3 — Requirements for the Calibration of Measuring and Test Equipment"
---

# Aerospace & Defense Industry Calibration Requirements

## Quality Management — AS9100D

AS9100D (based on ISO 9001:2015 with aerospace-specific additions) is the foundational quality management standard for the aerospace supply chain. Section 7.1.5 (Monitoring and Measuring Resources) requires organizations to determine and provide resources needed to ensure valid and reliable monitoring and measurement results. Key requirements include:

- Calibration or verification at specified intervals, or prior to use, against measurement standards traceable to international or national standards (NIST in the U.S.).
- Identification of calibration status on the instrument or in a readily accessible location.
- Safeguarding from adjustments, damage, or deterioration that would invalidate calibration status.
- Documented assessment of the validity of previous measurement results when an instrument is found out of tolerance, including customer notification when product may have been affected.

AS9100D Section 8.5.1.1 specifically addresses control of production equipment, tools, and software programs, mandating validation before use and periodic re-validation.

## NADCAP Accreditation

The National Aerospace and Defense Contractors Accreditation Program (NADCAP) is managed by the Performance Review Institute (PRI) and provides industry-managed accreditation for special processes. Relevant audit criteria documents include:

- **AC7000 Series**: General audit criteria applicable across all NADCAP special processes. Requires documented calibration systems with defined intervals, uncertainty budgets, and traceability.
- **AC7101/AC7102 (Heat Treating)**: Mandates compliance with AMS 2750 for pyrometry. Requires System Accuracy Tests (SATs) and Temperature Uniformity Surveys (TUS) at defined intervals.
- **AC7108 (Welding)**: Calibration of weld monitoring equipment (current, voltage, travel speed, gas flow) with specific tolerances.
- **AC7114 (Non-Destructive Testing)**: Calibration of UT, RT, MT, PT, and ET inspection equipment.

NADCAP audits are notoriously rigorous. Common findings include lapsed calibration on shop-floor instruments, failure to perform measurement uncertainty analysis, and inadequate documentation of calibration procedures.

## Measurement Tolerances in Aerospace

Aerospace manufacturing demands extremely tight tolerances that directly drive calibration requirements:

- **Dimensional tolerances**: Critical flight hardware often requires tolerances of +/-0.0001" (0.0025 mm) or tighter. Turbine blade airfoil profiles may be held to +/-0.0005".
- **Surface finish**: Ra values of 16 microinches or finer are common on sealing surfaces and bearing journals.
- **Gage R&R requirements**: Measurement system analysis (MSA) per AIAG guidelines typically requires total gage R&R to be less than 10% of the tolerance band for critical characteristics.

The 10:1 (or 4:1 minimum) Test Accuracy Ratio (TAR) rule requires calibration standards to be 4-10 times more accurate than the instruments being calibrated, which cascades into requirements for high-precision reference standards.

## Pyrometry — AMS 2750G

AMS 2750G governs pyrometric requirements for thermal processing equipment used in aerospace. Key provisions:

- **Instrumentation Types**: Type 1 through Type 6 classifications for thermocouples and instrumentation, defining accuracy requirements from +/-1 degree F (Type 1) to +/-10 degrees F (Type 6).
- **System Accuracy Tests (SATs)**: Required at intervals from monthly to quarterly depending on furnace class. Comparison of controlling, recording, and test thermocouples.
- **Temperature Uniformity Surveys (TUS)**: Surveys conducted at minimum annually (more frequently for new or repaired furnaces). Nine-point survey minimum for furnaces under 12 cubic feet, additional sensors for larger volumes. Uniformity tolerances range from +/-5 degrees F (Class 1) to +/-50 degrees F (Class 6).
- **Thermocouple requirements**: Base metal thermocouples (Type K, J, N) have limited reuse depending on temperature exposure. Noble metal thermocouples (Type R, S, B) for higher-temperature applications. All must be NIST-traceable.

## Torque and Fastener Requirements

Aerospace fastener installation requires precise torque application per specifications such as:

- **NAS 1638**: Defines cleanliness levels for hydraulic fluid systems, requiring calibrated particle counters.
- Torque wrench calibration per ISO 6789:2017, with typical accuracy of +/-4% of reading in the 20-100% range of full scale.
- Tension testing of critical fasteners (AN, MS, NAS series) requires calibrated load cells traceable to NIST.
- Prevailing torque verification for self-locking nuts per MIL-DTL-18240 and NASM25027.

## Common Aerospace Calibration Equipment

- **Coordinate Measuring Machines (CMMs)**: Annual verification per ISO 10360 series. MPEE (Maximum Permissible Error of Indication for Size Measurement) and MPEp (probing error) documented. Environmental compensation for temperature (20 +/- 1 degree C nominal).
- **Surface Finish Testers**: Calibrated using NIST-traceable roughness comparison specimens. Ra, Rz, and Rt parameters verified.
- **Hardness Testers**: Rockwell (ASTM E18), Brinell (ASTM E10), Vickers (ASTM E92). Daily verification with certified test blocks. Indirect verification annually.
- **Optical Comparators**: Stage accuracy, protractor accuracy, and lens magnification verified. NIST-traceable reticles and stage micrometers used.
- **Pressure Transducers and Gauges**: Deadweight testers as primary standards. Typical accuracy requirement of +/-0.25% of full scale for flight-critical hydraulic systems.

## Southern California Aerospace Landscape

Southern California is the historic center of American aerospace and remains the largest concentration of aerospace and defense companies in the world:

- **Boeing**: Major facilities in El Segundo (satellite systems), Long Beach (C-17 sustainment, commercial programs), and Huntington Beach (Space Launch System, satellite programs). Thousands of calibrated instruments across these sites.
- **Northrop Grumman**: Palmdale (B-2 Spirit sustainment, B-21 Raider production), Redondo Beach (Space Park — satellite and space systems), El Segundo, and San Diego. NADCAP-accredited processes across multiple facilities.
- **Raytheon / RTX**: El Segundo (Space and Airborne Systems), Tucson-adjacent operations, missile systems requiring precision measurement.
- **SpaceX (Hawthorne, CA)**: Rapid manufacturing of Merlin and Raptor engines, Falcon 9/Heavy airframes, and Starship components. High-volume calibration demand driven by vertical integration and fast production cadence.
- **L3Harris Technologies**: Multiple SoCal locations supporting electronic warfare, communication systems, and ISR platforms.
- **General Atomics (San Diego)**: Predator/Reaper UAV manufacturing and nuclear fusion research equipment.
- **Virgin Orbit (Long Beach, CA)**: Small satellite launch vehicle manufacturing (though operations have scaled down).

The concentration of Tier 1, 2, and 3 aerospace suppliers throughout Los Angeles, Orange, Ventura, and San Diego counties creates a dense calibration services market. Many smaller machine shops and component manufacturers in the region require AS9100D and NADCAP-compliant calibration to maintain their supply chain positions.
