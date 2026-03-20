-- Cache table for API results (7-day TTL)
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_source TEXT NOT NULL,
  query_key TEXT NOT NULL,
  raw_response JSONB NOT NULL,
  summary TEXT,
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(api_source, query_key)
);

ALTER TABLE api_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON api_cache FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_api_cache_lookup ON api_cache (api_source, query_key, expires_at);

-- Settings columns for authoritative API toggle
ALTER TABLE settings
  ADD COLUMN authoritative_apis_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN authoritative_apis_config JSONB NOT NULL DEFAULT '{
    "openfda": true,
    "osha": true,
    "federal_register": true
  }'::jsonb;
