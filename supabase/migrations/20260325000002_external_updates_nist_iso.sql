-- Selective authoritative additions: NIST publications + ISO revision alerting

-- Generic table for external update feeds (NIST publications, ISO announcements, etc.)
CREATE TABLE external_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL, -- e.g. 'nist', 'iso'
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source, url)
);

ALTER TABLE external_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON external_updates FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_external_updates_source_published ON external_updates (source, published_at DESC);

-- Settings toggles for selective sources (keep Phase 6 focused)
ALTER TABLE settings
  ADD COLUMN authoritative_nist_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN authoritative_iso_alerts_enabled BOOLEAN NOT NULL DEFAULT false;
