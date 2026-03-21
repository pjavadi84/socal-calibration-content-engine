-- Add E-E-A-T author fields to settings
ALTER TABLE settings
  ADD COLUMN author_name TEXT DEFAULT 'SoCal Calibration Team',
  ADD COLUMN author_title TEXT DEFAULT 'Calibration Specialists',
  ADD COLUMN author_bio TEXT,
  ADD COLUMN author_image_url TEXT,
  ADD COLUMN author_profile_url TEXT;
