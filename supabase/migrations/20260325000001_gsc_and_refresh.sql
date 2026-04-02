-- Google Search Console integration + content refresh workflow

-- Settings columns for GSC OAuth + tracking scope
ALTER TABLE settings
  ADD COLUMN gsc_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN gsc_site_url TEXT,
  ADD COLUMN gsc_url_prefix TEXT DEFAULT '/blog/',
  ADD COLUMN gsc_refresh_token TEXT,
  ADD COLUMN gsc_token_updated_at TIMESTAMPTZ;

-- Store Search Console performance metrics (by page, daily granularity)
CREATE TABLE gsc_page_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  date DATE NOT NULL,
  clicks INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  ctr DOUBLE PRECISION NOT NULL DEFAULT 0,
  position DOUBLE PRECISION NOT NULL DEFAULT 0,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_url, date)
);

ALTER TABLE gsc_page_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON gsc_page_metrics FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_gsc_page_metrics_page_date ON gsc_page_metrics (page_url, date DESC);

-- Store URL Inspection-like signals (best-effort; depends on API access)
CREATE TABLE gsc_url_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  verdict TEXT,
  coverage_state TEXT,
  last_crawl_time TIMESTAMPTZ,
  canonical_url TEXT,
  robots_txt_state TEXT,
  indexing_state TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(page_url, fetched_at)
);

ALTER TABLE gsc_url_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON gsc_url_inspections FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_gsc_url_inspections_page_fetched ON gsc_url_inspections (page_url, fetched_at DESC);

-- Content refresh queue, driven by GSC signals
CREATE TABLE content_refresh_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued', -- queued | in_progress | completed | dismissed | failed
  reason TEXT,
  gsc_snapshot JSONB,
  suggested_actions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, status)
);

ALTER TABLE content_refresh_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for authenticated" ON content_refresh_queue FOR ALL USING (true) WITH CHECK (true);
CREATE INDEX idx_content_refresh_queue_status ON content_refresh_queue (status, updated_at DESC);
