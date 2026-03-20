-- Settings table (single-row) for WordPress credentials and feature flags
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_site_url TEXT,
  wp_username TEXT,
  wp_app_password TEXT,
  auto_push_on_approve BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON settings FOR ALL
  USING (true) WITH CHECK (true);

-- Seed single row
INSERT INTO settings (id) VALUES (gen_random_uuid());
