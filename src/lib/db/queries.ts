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
