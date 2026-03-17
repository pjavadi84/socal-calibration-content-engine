-- Add knowledge base and fact density columns to articles table
-- Part of RAG-enhanced content engine redesign

ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS fact_density_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fact_density_breakdown JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS knowledge_sources TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS practitioner_notes_added BOOLEAN DEFAULT false;

-- Index for filtering articles by fact density score
CREATE INDEX IF NOT EXISTS idx_articles_fact_density_score ON articles (fact_density_score);
