-- ═══════════════════════════════════════════════════════════════════════
-- SoCal Calibration Content Engine — Seed Data
-- Content matrix: 4 pillars, ~28 categories, 25 locations, 13 internal links
-- ═══════════════════════════════════════════════════════════════════════

-- ─── Content Pillars ──────────────────────────────────────────────────

INSERT INTO content_pillars (id, name, description, display_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Calibration Services',
   'Service-specific guides explaining what calibration is, how it works, why it matters, and what to expect from professional calibration services.', 1),
  ('a0000000-0000-0000-0000-000000000002', 'Industry Compliance',
   'Articles about calibration standards, regulations, audit preparation, and compliance requirements across industries like healthcare, manufacturing, and food production.', 2),
  ('a0000000-0000-0000-0000-000000000003', 'Equipment Guides',
   'Buyer guides, maintenance tips, and educational content about specific calibration instruments and measurement equipment.', 3),
  ('a0000000-0000-0000-0000-000000000004', 'Industry Applications',
   'Vertical-specific content about calibration needs, challenges, and best practices for different industries served by SoCal Calibration.', 4);

-- ─── Categories ───────────────────────────────────────────────────────

-- Pillar 1: Calibration Services
INSERT INTO categories (id, pillar_id, name, slug, description, display_order) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001',
   'Scale Calibration', 'scale-calibration',
   'Calibration services for industrial scales, bench scales, analytical balances, and digital scales. Includes weight verification and NIST-traceable certificates.', 1),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001',
   'Electrical Calibration', 'electrical-calibration',
   'Calibration of multimeters, clamp meters, oscilloscopes, and other electronic test equipment to manufacturer specifications.', 2),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001',
   'Pressure Calibration', 'pressure-calibration',
   'Calibration services for pressure gauges, transducers, and transmitters used in industrial and medical applications.', 3),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001',
   'Temperature Calibration', 'temperature-calibration',
   'Calibration of thermometers, thermocouples, RTDs, and temperature controllers for accuracy verification.', 4),
  ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001',
   'Dimensional Calibration', 'dimensional-calibration',
   'Calibration of calipers, micrometers, height gauges, and other dimensional measurement instruments.', 5),
  ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001',
   'Medical Equipment Calibration', 'medical-equipment-calibration',
   'Calibration of blood pressure monitors, centrifuges, medical scales, and biomedical instruments for healthcare compliance.', 6),
  ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001',
   'Torque Calibration', 'torque-calibration',
   'Calibration of torque wrenches, torque screwdrivers, and torque analyzers for precision fastening applications.', 7);

-- Pillar 2: Industry Compliance
INSERT INTO categories (id, pillar_id, name, slug, description, display_order) VALUES
  ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002',
   'ISO 17025', 'iso-17025',
   'Understanding ISO/IEC 17025 accreditation for calibration laboratories, requirements, and how it ensures measurement accuracy.', 1),
  ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000002',
   'FDA Compliance', 'fda-compliance',
   'FDA calibration requirements for medical devices, pharmaceutical manufacturing, and food production facilities.', 2),
  ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000002',
   'OSHA Standards', 'osha-standards',
   'OSHA requirements for calibrated equipment in workplace safety, including pressure vessels, scales, and monitoring devices.', 3),
  ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000002',
   'NIST Traceability', 'nist-traceability',
   'What NIST-traceable calibration means, why it matters, and how the chain of traceability ensures measurement accuracy.', 4),
  ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000002',
   'Audit Preparation', 'audit-preparation',
   'How to prepare for calibration audits, maintain records, and ensure compliance with quality management systems.', 5),
  ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000002',
   'Calibration Intervals', 'calibration-intervals',
   'Determining optimal calibration intervals, factors that affect frequency, and best practices for calibration scheduling.', 6);

-- Pillar 3: Equipment Guides
INSERT INTO categories (id, pillar_id, name, slug, description, display_order) VALUES
  ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000003',
   'Multimeters', 'multimeters',
   'Guides for selecting, using, and maintaining digital and analog multimeters, including calibration best practices.', 1),
  ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000003',
   'Pressure Gauges', 'pressure-gauges',
   'Types of pressure gauges, how they work, common failure modes, and when to calibrate.', 2),
  ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000003',
   'Thermometers', 'thermometers',
   'Guide to industrial and medical thermometers, calibration methods, and accuracy requirements.', 3),
  ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000003',
   'Calipers & Micrometers', 'calipers-micrometers',
   'Selecting and maintaining precision dimensional measurement tools, including calibration schedules.', 4),
  ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000003',
   'Torque Wrenches', 'torque-wrenches',
   'Types of torque wrenches, proper use techniques, and calibration requirements for precision fastening.', 5),
  ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000003',
   'Scales & Balances', 'scales-balances',
   'Guide to industrial scales, analytical balances, and bench scales — selection, use, and calibration.', 6),
  ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000003',
   'Centrifuges', 'centrifuges',
   'Laboratory centrifuge types, maintenance, and calibration requirements for speed and temperature.', 7);

-- Pillar 4: Industry Applications
INSERT INTO categories (id, pillar_id, name, slug, description, display_order) VALUES
  ('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000004',
   'Healthcare & Medical', 'healthcare-medical',
   'Calibration requirements for hospitals, clinics, medical device manufacturers, and biomedical facilities.', 1),
  ('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000004',
   'Pharmaceutical', 'pharmaceutical',
   'GMP compliance, FDA regulations, and calibration needs specific to pharmaceutical manufacturing.', 2),
  ('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000004',
   'Manufacturing', 'manufacturing',
   'Calibration best practices for manufacturing plants, quality control, and production line equipment.', 3),
  ('b0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000004',
   'Automotive', 'automotive',
   'Calibration requirements for automotive manufacturing, repair shops, and emissions testing equipment.', 4),
  ('b0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000004',
   'Food & Beverage', 'food-beverage',
   'HACCP compliance, temperature monitoring, and scale calibration for food production and processing.', 5),
  ('b0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000004',
   'Aerospace', 'aerospace',
   'AS9100 requirements, precision measurement, and calibration standards for aerospace manufacturing.', 6),
  ('b0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000004',
   'Energy & Utilities', 'energy-utilities',
   'Calibration needs for power generation, oil & gas, and utility companies including pressure, temperature, and flow instruments.', 7),
  ('b0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000004',
   'Laboratories', 'laboratories',
   'Calibration best practices for research labs, testing labs, and quality control laboratories.', 8);

-- ─── Locations ────────────────────────────────────────────────────────

-- Orange County
INSERT INTO locations (id, city, state, county, display_name) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Irvine', 'CA', 'Orange County', 'Irvine, CA'),
  ('c0000000-0000-0000-0000-000000000002', 'Anaheim', 'CA', 'Orange County', 'Anaheim, CA'),
  ('c0000000-0000-0000-0000-000000000003', 'Santa Ana', 'CA', 'Orange County', 'Santa Ana, CA'),
  ('c0000000-0000-0000-0000-000000000004', 'Huntington Beach', 'CA', 'Orange County', 'Huntington Beach, CA'),
  ('c0000000-0000-0000-0000-000000000005', 'Costa Mesa', 'CA', 'Orange County', 'Costa Mesa, CA'),
  ('c0000000-0000-0000-0000-000000000006', 'Fullerton', 'CA', 'Orange County', 'Fullerton, CA'),
  ('c0000000-0000-0000-0000-000000000007', 'Newport Beach', 'CA', 'Orange County', 'Newport Beach, CA'),
  ('c0000000-0000-0000-0000-000000000008', 'Mission Viejo', 'CA', 'Orange County', 'Mission Viejo, CA');

-- Los Angeles County
INSERT INTO locations (id, city, state, county, display_name) VALUES
  ('c0000000-0000-0000-0000-000000000009', 'Los Angeles', 'CA', 'Los Angeles County', 'Los Angeles, CA'),
  ('c0000000-0000-0000-0000-000000000010', 'Long Beach', 'CA', 'Los Angeles County', 'Long Beach, CA'),
  ('c0000000-0000-0000-0000-000000000011', 'Pasadena', 'CA', 'Los Angeles County', 'Pasadena, CA'),
  ('c0000000-0000-0000-0000-000000000012', 'Torrance', 'CA', 'Los Angeles County', 'Torrance, CA'),
  ('c0000000-0000-0000-0000-000000000013', 'Burbank', 'CA', 'Los Angeles County', 'Burbank, CA'),
  ('c0000000-0000-0000-0000-000000000014', 'Glendale', 'CA', 'Los Angeles County', 'Glendale, CA'),
  ('c0000000-0000-0000-0000-000000000015', 'Downey', 'CA', 'Los Angeles County', 'Downey, CA'),
  ('c0000000-0000-0000-0000-000000000016', 'Pomona', 'CA', 'Los Angeles County', 'Pomona, CA');

-- Inland Empire
INSERT INTO locations (id, city, state, county, display_name) VALUES
  ('c0000000-0000-0000-0000-000000000017', 'Riverside', 'CA', 'Riverside County', 'Riverside, CA'),
  ('c0000000-0000-0000-0000-000000000018', 'San Bernardino', 'CA', 'San Bernardino County', 'San Bernardino, CA'),
  ('c0000000-0000-0000-0000-000000000019', 'Ontario', 'CA', 'San Bernardino County', 'Ontario, CA'),
  ('c0000000-0000-0000-0000-000000000020', 'Rancho Cucamonga', 'CA', 'San Bernardino County', 'Rancho Cucamonga, CA'),
  ('c0000000-0000-0000-0000-000000000021', 'Corona', 'CA', 'Riverside County', 'Corona, CA');

-- San Diego County
INSERT INTO locations (id, city, state, county, display_name) VALUES
  ('c0000000-0000-0000-0000-000000000022', 'San Diego', 'CA', 'San Diego County', 'San Diego, CA'),
  ('c0000000-0000-0000-0000-000000000023', 'Carlsbad', 'CA', 'San Diego County', 'Carlsbad, CA'),
  ('c0000000-0000-0000-0000-000000000024', 'Oceanside', 'CA', 'San Diego County', 'Oceanside, CA');

-- Ventura County
INSERT INTO locations (id, city, state, county, display_name) VALUES
  ('c0000000-0000-0000-0000-000000000025', 'Thousand Oaks', 'CA', 'Ventura County', 'Thousand Oaks, CA');

-- ─── Internal Links (from socalcalibration.com) ──────────────────────

INSERT INTO internal_links (url, anchor_text, page_type) VALUES
  ('https://socalcalibration.com/industrial-scale-calibration/', 'industrial scale calibration', 'service'),
  ('https://socalcalibration.com/multimeter-calibration/', 'multimeter calibration', 'service'),
  ('https://socalcalibration.com/pressure-gauge-calibration/', 'pressure gauge calibration', 'service'),
  ('https://socalcalibration.com/thermometer-calibration/', 'thermometer calibration', 'service'),
  ('https://socalcalibration.com/torque-wrench-calibration/', 'torque wrench calibration', 'service'),
  ('https://socalcalibration.com/digital-scale-calibration/', 'digital scale calibration', 'service'),
  ('https://socalcalibration.com/centrifuge-calibration/', 'centrifuge calibration', 'service'),
  ('https://socalcalibration.com/caliper-calibration/', 'caliper calibration', 'service'),
  ('https://socalcalibration.com/blood-pressure-monitor-calibration/', 'blood pressure monitor calibration', 'service'),
  ('https://socalcalibration.com/bench-scale-calibration/', 'bench scale calibration', 'service'),
  ('https://socalcalibration.com/contact-us/', 'contact SoCal Calibration', 'page'),
  ('https://socalcalibration.com/about-us/', 'about SoCal Calibration', 'page'),
  ('https://socalcalibration.com/faqs/', 'calibration FAQs', 'page');
