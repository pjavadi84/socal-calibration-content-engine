import { createServiceClient } from './client';

// ─── Content Matrix Queries ───────────────────────────────────────────

export async function getPillars() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('content_pillars')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (error) throw new Error(`Failed to fetch pillars: ${error.message}`);
  return data;
}

export async function getPillarById(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('content_pillars')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to fetch pillar: ${error.message}`);
  return data;
}

export async function getCategories(pillarId?: string) {
  const db = createServiceClient();
  let query = db
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order');
  if (pillarId) query = query.eq('pillar_id', pillarId);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
  return data;
}

export async function getCategoryById(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to fetch category: ${error.message}`);
  return data;
}

export async function getLocations() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('display_name');
  if (error) throw new Error(`Failed to fetch locations: ${error.message}`);
  return data;
}

export async function getLocationById(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('locations')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to fetch location: ${error.message}`);
  return data;
}

export async function getInternalLinks() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('internal_links')
    .select('*')
    .eq('is_active', true);
  if (error) throw new Error(`Failed to fetch internal links: ${error.message}`);
  return data;
}

// ─── Article Queries ──────────────────────────────────────────────────

export async function createArticle(article: Record<string, unknown>) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('articles')
    .insert(article)
    .select()
    .single();
  if (error) throw new Error(`Failed to create article: ${error.message}`);
  return data;
}

export async function updateArticle(id: string, updates: Record<string, unknown>) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('articles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update article: ${error.message}`);
  return data;
}

export async function getArticleById(id: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('articles')
    .select(`
      *,
      content_pillars ( id, name ),
      categories ( id, name, slug ),
      locations ( id, city, state, display_name )
    `)
    .eq('id', id)
    .single();
  if (error) throw new Error(`Failed to fetch article: ${error.message}`);
  return data;
}

export async function getArticles(filters?: {
  status?: string;
  pillar_id?: string;
  category_id?: string;
  location_id?: string;
  limit?: number;
  offset?: number;
}) {
  const db = createServiceClient();
  let query = db
    .from('articles')
    .select(`
      id, title, status, seo_score, word_count, primary_keyword,
      created_at, updated_at, published_at, wp_post_id,
      content_pillars ( id, name ),
      categories ( id, name ),
      locations ( id, city, state, display_name )
    `, { count: 'exact' })
    .order('created_at', { ascending: false });

  if (filters?.status) query = query.eq('status', filters.status);
  if (filters?.pillar_id) query = query.eq('pillar_id', filters.pillar_id);
  if (filters?.category_id) query = query.eq('category_id', filters.category_id);
  if (filters?.location_id) query = query.eq('location_id', filters.location_id);
  if (filters?.limit) query = query.limit(filters.limit);
  if (filters?.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw new Error(`Failed to fetch articles: ${error.message}`);
  return { data, count };
}

// ─── Article Delete ──────────────────────────────────────────────────

export async function deleteArticle(id: string) {
  const db = createServiceClient();
  const { error } = await db
    .from('articles')
    .delete()
    .eq('id', id);
  if (error) throw new Error(`Failed to delete article: ${error.message}`);
}

export async function deleteArticles(ids: string[]) {
  const db = createServiceClient();
  const { error } = await db
    .from('articles')
    .delete()
    .in('id', ids);
  if (error) throw new Error(`Failed to delete articles: ${error.message}`);
}

// ─── Cluster / Sibling Queries ────────────────────────────────────────

export async function getSiblingArticles(
  articleId: string,
  pillarId: string,
  categoryId: string
) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('articles')
    .select('id, title, slug, primary_keyword')
    .eq('pillar_id', pillarId)
    .eq('category_id', categoryId)
    .neq('id', articleId)
    .in('status', ['pending_review', 'approved', 'published'])
    .not('slug', 'is', null)
    .not('title', 'is', null)
    .limit(10);
  if (error) throw new Error(`Failed to fetch sibling articles: ${error.message}`);
  return (data || []) as Array<{
    id: string;
    title: string;
    slug: string;
    primary_keyword: string | null;
  }>;
}

// ─── Social Post Queries ──────────────────────────────────────────────

export async function createSocialPost(post: Record<string, unknown>) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('social_posts')
    .insert(post)
    .select()
    .single();
  if (error) throw new Error(`Failed to create social post: ${error.message}`);
  return data;
}

export async function getSocialPostsByArticle(articleId: string) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('social_posts')
    .select('*')
    .eq('article_id', articleId)
    .order('variant');
  if (error) throw new Error(`Failed to fetch social posts: ${error.message}`);
  return data;
}

// ─── Settings Queries ─────────────────────────────────────────────────

export async function getSettings() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('settings')
    .select('*')
    .single();
  if (error) throw new Error(`Failed to fetch settings: ${error.message}`);
  return data;
}

export async function updateSettings(updates: Record<string, unknown>) {
  const db = createServiceClient();
  const settings = await getSettings();
  const { data, error } = await db
    .from('settings')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', settings.id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update settings: ${error.message}`);
  return data;
}

// ─── Google Search Console Queries ─────────────────────────────────────

export async function upsertGscPageMetrics(rows: Array<{
  page_url: string;
  date: string; // YYYY-MM-DD
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}>) {
  if (rows.length === 0) return;
  const db = createServiceClient();
  const { error } = await db
    .from('gsc_page_metrics')
    .upsert(
      rows.map((r) => ({
        page_url: r.page_url,
        date: r.date,
        clicks: r.clicks,
        impressions: r.impressions,
        ctr: r.ctr,
        position: r.position,
        fetched_at: new Date().toISOString(),
      })),
      { onConflict: 'page_url,date' }
    );
  if (error) throw new Error(`Failed to upsert GSC metrics: ${error.message}`);
}

export async function insertGscUrlInspection(row: {
  page_url: string;
  verdict: string | null;
  coverage_state: string | null;
  last_crawl_time: string | null;
  canonical_url: string | null;
  robots_txt_state: string | null;
  indexing_state: string | null;
}) {
  const db = createServiceClient();
  const { error } = await db
    .from('gsc_url_inspections')
    .insert({
      ...row,
      fetched_at: new Date().toISOString(),
    });
  if (error) throw new Error(`Failed to insert URL inspection: ${error.message}`);
}

export async function getRecentPublishedArticlesWithUrls(limit = 25) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('articles')
    .select('id, title, slug, wp_post_url, published_at, primary_keyword')
    .eq('status', 'published')
    .not('wp_post_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to fetch published articles: ${error.message}`);
  return (data || []) as Array<{
    id: string;
    title: string | null;
    slug: string | null;
    wp_post_url: string | null;
    published_at: string | null;
    primary_keyword: string | null;
  }>;
}

export async function getGscSummary(params: { urlPrefix?: string; days?: number }) {
  const days = params.days ?? 28;
  const db = createServiceClient();

  const start = new Date();
  start.setDate(start.getDate() - days);
  const startDate = start.toISOString().slice(0, 10);

  let query = db
    .from('gsc_page_metrics')
    .select('page_url, date, clicks, impressions, ctr, position')
    .gte('date', startDate);

  if (params.urlPrefix) query = query.ilike('page_url', `%${params.urlPrefix}%`);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to fetch GSC summary: ${error.message}`);

  const rows = (data || []) as Array<{
    page_url: string;
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;

  const totals = rows.reduce(
    (acc, r) => {
      acc.clicks += r.clicks || 0;
      acc.impressions += r.impressions || 0;
      acc.positionSum += (r.position || 0) * (r.impressions || 0);
      acc.impressionWeight += r.impressions || 0;
      return acc;
    },
    { clicks: 0, impressions: 0, positionSum: 0, impressionWeight: 0 }
  );

  const avgPosition =
    totals.impressionWeight > 0 ? totals.positionSum / totals.impressionWeight : null;
  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : null;

  return {
    clicks: totals.clicks,
    impressions: totals.impressions,
    ctr,
    avgPosition,
  };
}

// ─── Content Refresh Queue ─────────────────────────────────────────────

export async function upsertRefreshQueueItem(params: {
  articleId: string;
  reason: string;
  gscSnapshot: unknown;
  suggestedActions?: unknown;
}) {
  const db = createServiceClient();
  const { error } = await db
    .from('content_refresh_queue')
    .upsert(
      {
        article_id: params.articleId,
        status: 'queued',
        reason: params.reason,
        gsc_snapshot: params.gscSnapshot as never,
        suggested_actions: (params.suggestedActions || {}) as never,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'article_id,status' }
    );
  if (error) throw new Error(`Failed to upsert refresh queue item: ${error.message}`);
}

export async function listRefreshQueue() {
  const db = createServiceClient();
  const { data, error } = await db
    .from('content_refresh_queue')
    .select('id, article_id, status, reason, gsc_snapshot, suggested_actions, created_at, updated_at, articles(title, wp_post_url, primary_keyword)')
    .order('updated_at', { ascending: false });
  if (error) throw new Error(`Failed to list refresh queue: ${error.message}`);
  return data || [];
}

export async function updateRefreshQueueStatus(id: string, status: string) {
  const db = createServiceClient();
  const { error } = await db
    .from('content_refresh_queue')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update refresh queue: ${error.message}`);
}

// ─── Stats Queries ────────────────────────────────────────────────────

export async function getArticleStats() {
  const db = createServiceClient();

  // Total articles (excluding failed)
  const { count: totalArticles } = await db
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'failed');

  // Articles this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const { count: articlesThisMonth } = await db
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'failed')
    .gte('created_at', startOfMonth.toISOString());

  // Pending review count
  const { count: pendingReview } = await db
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending_review');

  // Average SEO score and fact density
  const { data: scoreData } = await db
    .from('articles')
    .select('seo_score, fact_density_score')
    .neq('status', 'failed')
    .not('seo_score', 'is', null);

  let avgSeoScore = 0;
  let avgFactDensity = 0;
  if (scoreData && scoreData.length > 0) {
    avgSeoScore = Math.round(
      scoreData.reduce((sum, a) => sum + (a.seo_score || 0), 0) / scoreData.length
    );
    const withFactDensity = scoreData.filter((a) => a.fact_density_score != null);
    if (withFactDensity.length > 0) {
      avgFactDensity = Math.round(
        withFactDensity.reduce((sum, a) => sum + (a.fact_density_score || 0), 0) /
          withFactDensity.length
      );
    }
  }

  // Status counts
  const { data: statusData } = await db
    .from('articles')
    .select('status');

  const statusCounts: Record<string, number> = {};
  if (statusData) {
    for (const row of statusData) {
      statusCounts[row.status] = (statusCounts[row.status] || 0) + 1;
    }
  }

  return {
    totalArticles: totalArticles || 0,
    articlesThisMonth: articlesThisMonth || 0,
    pendingReview: pendingReview || 0,
    avgSeoScore,
    avgFactDensity,
    statusCounts,
  };
}

// ─── Batch Queries ────────────────────────────────────────────────────

export async function createBatch(batch: Record<string, unknown>) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('generation_batches')
    .insert(batch)
    .select()
    .single();
  if (error) throw new Error(`Failed to create batch: ${error.message}`);
  return data;
}

export async function updateBatch(id: string, updates: Record<string, unknown>) {
  const db = createServiceClient();
  const { data, error } = await db
    .from('generation_batches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`Failed to update batch: ${error.message}`);
  return data;
}
