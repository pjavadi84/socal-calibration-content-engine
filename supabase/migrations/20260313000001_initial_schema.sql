-- ─── Content Pillars ──────────────────────────────────────────────────

CREATE TABLE content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON content_pillars FOR ALL
  USING (true) WITH CHECK (true);

-- ─── Categories ──────────────────────────────────────────────────────

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID NOT NULL REFERENCES content_pillars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON categories FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_categories_pillar_id ON categories(pillar_id);

-- ─── Locations ───────────────────────────────────────────────────────

CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'CA',
  county TEXT,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON locations FOR ALL
  USING (true) WITH CHECK (true);

-- ─── Internal Links ──────────────────────────────────────────────────

CREATE TABLE internal_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  anchor_text TEXT NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'service',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE internal_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON internal_links FOR ALL
  USING (true) WITH CHECK (true);

-- ─── Generation Batches ──────────────────────────────────────────────

CREATE TABLE generation_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE generation_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON generation_batches FOR ALL
  USING (true) WITH CHECK (true);

-- ─── Articles ────────────────────────────────────────────────────────

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pillar_id UUID NOT NULL REFERENCES content_pillars(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  location_id UUID REFERENCES locations(id),
  generation_batch_id UUID REFERENCES generation_batches(id),

  status TEXT NOT NULL DEFAULT 'generating'
    CHECK (status IN ('generating', 'pending_review', 'approved', 'published', 'rejected', 'failed')),

  -- Content
  title TEXT,
  body_html TEXT,
  word_count INTEGER,
  h2_structure JSONB,
  faq JSONB,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  slug TEXT,
  slug_candidates TEXT[],
  primary_keyword TEXT,
  seo_keywords TEXT[],
  long_tail_keywords TEXT[],
  seo_score INTEGER,
  seo_breakdown JSONB,
  json_ld JSONB,

  -- WordPress
  wp_post_id INTEGER,
  wp_post_url TEXT,

  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON articles FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_pillar_id ON articles(pillar_id);
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_location_id ON articles(location_id);
CREATE INDEX idx_articles_seo_score ON articles(seo_score);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- ─── Social Posts ────────────────────────────────────────────────────

CREATE TABLE social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  variant TEXT NOT NULL
    CHECK (variant IN ('educational', 'practical', 'promotional')),
  platform TEXT NOT NULL DEFAULT 'linkedin',
  content TEXT NOT NULL,
  hashtags TEXT[],
  call_to_action TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated users"
  ON social_posts FOR ALL
  USING (true) WITH CHECK (true);

CREATE INDEX idx_social_posts_article_id ON social_posts(article_id);

-- ─── Updated At Trigger ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_pillars_updated_at
  BEFORE UPDATE ON content_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
