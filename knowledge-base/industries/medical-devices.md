---
title: "Medical Device Industry Calibration Requirements"
tags: [medical-devices, ISO-13485, FDA-QSR, 21-CFR-820, EU-MDR, risk-management, ISO-14971, biomedical, electrical-safety]
pillars: [calibration-services, industry-compliance, equipment-guides, industry-applications]
categories: [fda-compliance, medical-equipment-calibration]
equipment_types: [patient-monitors, infusion-pumps, ventilators, defibrillators, imaging-equipment, surgical-instruments, electrical-safety-analyzers, pressure-calibrators, flow-analyzers]
industries: [medical-devices, healthcare]
last_reviewed: "2026-03-17"
review_interval_months: 6
sources:
  - "ISO 13485:2016 — Medical devices - Quality management systems - Requirements for regulatory purposes"
  - "21 CFR Part 820 — Quality System Regulation (QSR)"
  - "EU MDR 2017/745 — Regulation on Medical Devices"
  - "ISO 14971:2019 — Medical devices - Application of risk management to medical devices"
  - "IEC 62353:2014 — Medical electrical equipment - Recurrent test and test after repair of medical electrical equipment"
  - "AAMI TIR57:2016 — Principles for medical device security - Risk management"
---

# Medical Device Industry Calibration Requirements

## Regulatory Framework

### ISO 13485:2016 — Section 7.6 (Control of Monitoring and Measuring Equipment)

ISO 13485:2016 is the international quality management system standard for medical device organizations. Section 7.6 establishes comprehensive requirements for monitoring and measuring equipment:

- Equipment must be calibrated or verified at specified intervals, or prior to use, against measurement standards traceable to international or national measurement standards. Where no such standards exist, the basis for calibration must be recorded.
- Equipment must be adjusted or re-adjusted as necessary, with records of the basis for calibration used when no international or national measurement standards exist.
- Equipment must be identified to enable its calibration status to be determined.
- Equipment must be safeguarded from adjustments that would invalidate the measurement result.
- Equipment must be protected from damage and deterioration during handling, maintenance, and storage.
- When monitoring and measuring equipment is found to not conform to requirements, the organization must assess and document the validity of previous measurement results and take appropriate action on the equipment and any affected product.
- Documented procedures for calibration must be maintained (this is a specific ISO 13485 addition beyond ISO 9001).

Records of calibration and verification results must be maintained per Section 4.2.5. The standard requires documented calibration intervals justified by risk analysis, manufacturer recommendations, and historical performance data.

### 21 CFR Part 820 — Quality System Regulation (QSR)

The FDA's QSR governs the design, manufacture, packaging, labeling, storage, installation, and servicing of all finished medical devices intended for human use in the United States:

- **Section 820.72 — Inspection, Measuring, and Test Equipment**: Each manufacturer shall ensure that all inspection, measuring, and test equipment is suitable for its intended purposes and is capable of producing valid results. Equipment must be routinely calibrated, inspected, checked, and maintained. Calibration procedures must include specific directions and limits for accuracy and precision. Where calibration standards do not exist, the manufacturer must establish and document the standards used.
- **Section 820.72(a)**: Calibration standards used must be traceable to national or international standards. If national or international standards are not practical or available, an independent reproducible standard must be used and documented.
- **Section 820.72(b)**: Calibration records must include the equipment identification, calibration dates, the individual performing the calibration, and the next calibration due date. Records must be displayed on or near the equipment, or must be readily available to personnel using the equipment and to personnel responsible for calibrating the equipment.
- **Section 820.70(g) — Equipment**: Requires that manufacturing equipment be appropriately designed, constructed, placed, and installed to facilitate maintenance, adjustment, cleaning, and use. Calibration of manufacturing equipment falls under this section.
- **Section 820.250 — Statistical Techniques**: Where sampling methods are used, procedures must ensure that the methods are statistically valid and adequate. Measurement system analysis of calibrated instruments supports this requirement.

### EU MDR 2017/745 — European Medical Device Regulation

The EU MDR, which fully replaced the Medical Devices Directive (93/42/EEC) in May 2021, imposes rigorous requirements on manufacturers:

- **Annex IX, Chapter I, Section 2.2**: Quality management systems must address procedures for calibration and maintenance of measuring equipment.
- **Annex I — General Safety and Performance Requirements (GSPR)**: Clause 17.1 requires devices to be designed and manufactured to reduce risks of measurement error, providing appropriate accuracy and precision as stated by the manufacturer. Built-in measuring functions must include measurement tolerances.
- **Post-Market Surveillance (Article 83-86)**: Ongoing calibration verification is a component of post-market surveillance obligations.
- **Unique Device Identification (UDI)**: Equipment used to verify UDI marking (barcode scanners, vision systems) requires calibration.

## Risk-Based Calibration Intervals — ISO 14971

ISO 14971:2019 provides the framework for risk management of medical devices, and its principles directly influence calibration program design:

- **Risk-based interval determination**: Calibration intervals should be established using risk classification of the instrument's application. A thermometer monitoring an autoclave sterilization cycle (directly affecting patient safety) warrants more frequent calibration than a thermometer monitoring room temperature in a warehouse.
- **Risk Priority Number (RPN)**: While FMEA-based approaches are common, ISO 14971 encourages probability-of-occurrence and severity-of-harm matrices. Instruments where calibration drift could cause undetected product defects affecting patient safety receive shorter intervals and tighter tolerances.
- **Interval adjustment**: Historical calibration data (as-found readings) should be analyzed to determine if intervals can be extended or must be shortened. If an instrument is consistently found in tolerance, intervals may be lengthened. If found out of tolerance, intervals must be shortened and an impact assessment conducted.

## Biomedical Equipment Types

### Patient Care Equipment

- **Patient Monitors**: SpO2 accuracy (+/-2% in the 70-100% range), NIBP accuracy (+/-3 mmHg or +/-2% of reading), ECG amplitude accuracy (+/-5%), temperature accuracy (+/-0.1 degrees C). Calibration per manufacturer specifications, typically annually.
- **Infusion Pumps**: Flow rate accuracy typically +/-5% at nominal flow rates. Calibration verified using gravimetric method (NIST-traceable balance and stopwatch) or calibrated burette. Critical for chemotherapy and neonatal applications where +/-2% may be required.
- **Ventilators**: Tidal volume accuracy (+/-10% or +/-50 mL, whichever is greater), pressure accuracy (+/-2 cmH2O or +/-4%), FiO2 accuracy (+/-3% absolute). Tested with calibrated test lung and precision gas analyzers.
- **Defibrillators**: Delivered energy accuracy (+/-15% of selected energy or +/-4J, whichever is greater per IEC 60601-2-4). ECG simulator verification. Battery capacity testing.
- **Imaging Equipment**: X-ray output (kVp accuracy +/-5%, mAs reproducibility +/-5%), CT scanner calibration (Hounsfield unit accuracy for water = 0 +/-4 HU), ultrasound transducer output power verification.
- **Surgical Instruments**: Electrosurgical units (output power accuracy +/-20%), surgical lasers (power output verification with calibrated power meters).

### Electrical Safety Testing — IEC 62353

IEC 62353 defines recurrent test and test-after-repair procedures for medical electrical equipment. Calibration-relevant requirements:

- **Earth bond resistance**: Less than 0.3 ohms for Class I equipment (measured at 200 mA minimum test current or per manufacturer specification, typically 10A or 25A).
- **Insulation resistance**: Greater than or equal to 2 megohms at 500V DC for basic insulation.
- **Earth leakage current**: Less than 500 microamps (normal condition) for Class I equipment.
- **Patient leakage current**: Less than 10 microamps (Type CF applied parts, normal condition). These values require calibrated safety analyzers with uncertainty well below the pass/fail limits.

Electrical safety analyzers (e.g., Fluke ESA615, Rigel UniPulse 400) must be calibrated annually by an accredited laboratory.

## Southern California Medical Device Companies

Southern California is a major hub for medical device manufacturing:

- **Edwards Lifesciences (Irvine, CA)**: Global leader in heart valves and hemodynamic monitoring. Extensive calibration needs for cleanroom environmental monitoring, dimensional measurement of valve components, and testing of monitoring devices.
- **Masimo Corporation (Irvine, CA)**: Pulse oximetry and noninvasive monitoring technology. Calibration of optical test equipment, patient simulator devices, and manufacturing test fixtures.
- **ICU Medical (San Clemente, CA)**: Infusion therapy and vascular access products. Flow rate testing equipment, dimensional measurement, and sterilization monitoring.
- **ResMed (San Diego, CA)**: Respiratory care devices including CPAP/BiPAP machines. Pressure and flow calibration for manufacturing and quality testing.
- **DexCom (San Diego, CA)**: Continuous glucose monitoring systems. Electrochemical sensor calibration, environmental testing chambers, and biocompatibility testing equipment.
- **Hologic (San Diego, CA)**: Diagnostic imaging and surgical products. X-ray output calibration, mammography system QC, and dimensional measurement.
- **Numerous contract manufacturers** throughout Orange County and San Diego support the medical device supply chain, each requiring ISO 13485-compliant calibration programs to maintain their registrations.

The Irvine-to-San Diego corridor represents one of the densest concentrations of medical device companies in the United States, creating strong demand for calibration services with ISO 17025 accreditation and FDA QSR compliance expertise.
