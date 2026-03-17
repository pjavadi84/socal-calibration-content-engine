---
title: "Calipers and Micrometers — Calibration Reference"
tags: [calipers, micrometers, dimensional-calibration, gauge-blocks, ASME-B89, Abbe-error, GD&T]
pillars: [calibration-services, equipment-guides]
categories: [dimensional-calibration, calipers]
equipment_types: [calipers, micrometers]
industries: all
last_reviewed: "2026-03-17"
review_interval_months: 12
sources:
  - "ASME B89.1.6-2002 — Measurement of Plain External Diameters for Use as Master Discs or Cylindrical Plug Gages"
  - "ASME B89.1.9-2002 (R2012) — Gauge Blocks"
  - "ASME B89.1.13-2013 — Micrometers"
  - "ASME B89.1.14-2018 — Calipers"
  - "ISO 3611:2023 — Geometrical Product Specifications — Dimensional Measuring Equipment: Micrometers for External Measurements"
  - "ISO 13385-1:2019 — Geometrical Product Specifications — Dimensional Measuring Equipment: Callipers — Part 1: Vernier Callipers"
  - "Mitutoyo Corporation — Metrology Handbook"
---

# Calipers and Micrometers — Calibration Reference

## Caliper Types

### Vernier Calipers
Analog scale with vernier graduation for interpolation. No battery required. Resolution typically 0.02 mm (metric) or 0.001 in (inch). Accuracy: +/-0.03 mm to +/-0.05 mm for 150 mm (6 in) models. Most durable type; standard in machine shops and field use.

### Dial Calipers
A rack-and-pinion mechanism drives a dial indicator for the fractional reading. Resolution: 0.02 mm or 0.001 in typical. Accuracy comparable to vernier type. The dial mechanism is susceptible to damage from shock; gear wear can introduce backlash error over time.

### Digital (Electronic) Calipers
Capacitive linear encoder provides digital readout. Resolution: 0.01 mm (0.0005 in). Accuracy: +/-0.02 mm to +/-0.03 mm for standard 150 mm models. Features include mm/inch conversion, zero-anywhere, and data output (SPC). Battery dependent; some models have solar cells. Capacitive encoder can be affected by coolant contamination.

### Specialty Calipers
- **Inside calipers**: for internal diameter measurement (groove, bore)
- **Depth calipers**: for step and depth measurement
- **Height gauges**: vertical caliper on a base for scribing and height measurement. Higher accuracy models achieve +/-0.01 mm.

## Micrometer Types

### Outside Micrometers
The most common type. A precision-ground spindle advances via a calibrated screw thread (0.5 mm pitch metric, 40 TPI inch). Resolution: 0.001 mm (with vernier on thimble) or 0.0001 in. Digital models achieve 0.001 mm (0.00005 in) resolution. Standard frame sizes: 0-25 mm, 25-50 mm, 50-75 mm, etc. (0-1 in, 1-2 in, 2-3 in, etc.)

### Inside Micrometers
For internal bore measurement. Types include tubular, caliper-jaw, and three-point (bore gauges). Three-point micrometers self-center in the bore and are preferred for accuracy.

### Depth Micrometers
Measure depth of holes, slots, and steps. A base (reference surface) rests on the workpiece; the thimble drives the rod into the feature. Interchangeable rods extend the range.

### Specialty Micrometers
- **Blade micrometers**: for narrow grooves and keyways
- **Disc micrometers**: for root diameter of gears
- **Thread micrometers**: with pointed anvils for pitch diameter
- **Digital micrometers with SPC output**: for statistical process control integration

## Accuracy and Resolution

| Instrument | Typical Resolution | Typical Accuracy (150 mm / 6 in range) |
|-----------|-------------------|----------------------------------------|
| Vernier caliper | 0.02 mm / 0.001 in | +/-0.03 to +/-0.05 mm |
| Dial caliper | 0.02 mm / 0.001 in | +/-0.03 to +/-0.05 mm |
| Digital caliper | 0.01 mm / 0.0005 in | +/-0.02 to +/-0.03 mm |
| Outside micrometer (analog) | 0.001 mm / 0.0001 in | +/-0.002 to +/-0.004 mm |
| Outside micrometer (digital) | 0.001 mm / 0.00005 in | +/-0.001 to +/-0.003 mm |

Micrometer accuracy specifications typically state the maximum permissible error (MPE) for the instrument. Per ASME B89.1.13, for a 0-25 mm outside micrometer, the MPE is +/-0.002 mm for a high-quality instrument.

## Gauge Block Standards (ASME B89.1.9)

Gauge blocks are the primary standards for calibrating dimensional instruments. ASME B89.1.9 defines tolerance grades:

| Grade | Length Tolerance (for 25 mm / 1 in block) | Typical Use |
|-------|------------------------------------------|-------------|
| 0 (Reference) | +/-0.05 um (+/-0.000002 in) | Primary standards laboratories |
| 1 (Calibration) | +/-0.10 um (+/-0.000004 in) | Calibration laboratories |
| 2 (Inspection) | +/-0.20 um (+/-0.000008 in) | Inspection, setting gauges |
| 3 (Workshop) | +/-0.45 um (+/-0.000018 in) | Shop floor reference |

ISO 3650 uses grades K, 0, 1, and 2 with comparable tolerances to ASME grades 0, 1, 2, and 3 respectively.

Gauge blocks are available in steel, ceramic (zirconia), carbide, and chrome carbide. Ceramic blocks are preferred for calibration use due to lower thermal expansion (approximately 9.5 ppm/degC vs 11.5 ppm/degC for steel) and superior wear resistance.

## Calibration Procedures

### Caliper Calibration
1. **Visual inspection**: Check for damage, wear on jaws, readability of scales.
2. **Zero check**: Close jaws gently; instrument must read zero (+/-0.01 mm for digital, +/-0.02 mm for vernier).
3. **Jaw flatness and parallelism**: Close jaws and hold up to a light source; no visible light gap should appear. Use an optical flat for quantitative assessment.
4. **Measurement accuracy**: Check at multiple points across the range using calibrated gauge blocks. Typical points: 25 mm, 50 mm, 75 mm, 100 mm, 125 mm, 150 mm (or 1 in increments for inch calipers).
5. **Inside jaw check**: Use ring gauges or gauge block stacks with jaw adapters.
6. **Depth rod check**: Use gauge blocks on a surface plate.

### Micrometer Calibration
1. **Visual inspection**: Check spindle, anvil, thimble, frame for damage.
2. **Zero check**: Clean anvil and spindle faces, close using the ratchet or friction thimble; verify zero reading.
3. **Parallelism check**: Use optical parallels (optical flats). With anvils closed on a parallel, observe interference fringes. For grade-A micrometers, parallelism must be within 0.001 mm.
4. **Flatness check**: Use an optical flat on each measuring face individually. Flatness specification is typically 0.0003 mm (0.3 um) for precision micrometers.
5. **Accuracy check**: Test at five or more points across the range using gauge blocks. For a 0-25 mm micrometer: 2.5 mm, 5.0 mm, 10.0 mm, 15.0 mm, 20.0 mm, 25.0 mm.
6. **Measuring force check**: Use a force gauge to verify the ratchet or friction thimble limits force to the specified range (typically 5 N to 10 N for standard micrometers).

## Common Brands

| Brand | Heritage | Notable Products |
|-------|---------|-----------------|
| Mitutoyo | Japanese, founded 1934 | Absolute Digimatic series, IP67 calipers, QuantuMike |
| Starrett | American, founded 1880 | 795/796 digital calipers, 733/734 digital micrometers |
| Brown & Sharpe (Hexagon) | American, founded 1833 | ValueLine and TESA branded instruments |
| Mahr | German, founded 1861 | MarCal digital calipers, Micromar micrometers |
| SPI (Swiss Precision Instruments) | Swiss heritage | Precision calipers and micrometers |

## Common Error Sources

| Error Source | Magnitude | Mitigation |
|-------------|-----------|-----------|
| Temperature deviation from 20 degC reference | 11.5 um/m per degC (steel) | Measure at 20 degC +/-2 degC or apply correction; handle with insulated grips |
| Abbe error (calipers) | 0.01 to 0.05 mm depending on jaw opening and angularity | Inherent to caliper design; micrometers are Abbe-compliant (scale axis aligns with measurement axis) |
| Measuring force variation | 0.001 to 0.005 mm for calipers | Use consistent, light touch; micrometers have ratchet/friction stop |
| Parallax (vernier reading) | 0.01 to 0.02 mm | View scale perpendicular to graduated surface |
| Cosine error | Proportional to misalignment angle | Ensure workpiece is perpendicular to measuring faces |
| Wear on measuring faces | Progressive accuracy degradation | Inspect anvil/jaw contact faces; recalibrate when wear is visible |
| Dirt and debris | Variable, potentially large | Clean instrument and workpiece before measurement |

## Recalibration Triggers

- Scheduled interval (12 months standard; 6 months for high-use production environments).
- After the instrument is dropped or subjected to impact.
- When measurement results are questioned or disagree with other calibrated instruments.
- After re-lapping or adjustment of measuring faces.
- Visible wear, damage, or corrosion on measuring surfaces.
- When moved between environments with significantly different temperatures (thermal stabilization required before use).
