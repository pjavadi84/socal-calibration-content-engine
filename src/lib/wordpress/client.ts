/**
 * WordPress REST API Client
 * Pushes articles as drafts to the WordPress site.
 */

interface WPPostPayload {
  title: string;
  content: string;
  status: 'draft' | 'publish' | 'pending';
  categories?: number[];
  tags?: number[];
  slug?: string;
  meta?: Record<string, string>;
}

interface WPPost {
  id: number;
  link: string;
  status: string;
  slug: string;
}

interface WPCategory {
  id: number;
  name: string;
  slug: string;
}

function getConfig() {
  const siteUrl = process.env.WP_SITE_URL;
  const username = process.env.WP_USERNAME;
  const appPassword = process.env.WP_APP_PASSWORD;

  if (!siteUrl || !username || !appPassword) {
    throw new Error(
      'WordPress credentials not configured. Set WP_SITE_URL, WP_USERNAME, and WP_APP_PASSWORD.'
    );
  }

  return { siteUrl: siteUrl.replace(/\/$/, ''), username, appPassword };
}

function getAuthHeader() {
  const { username, appPassword } = getConfig();
  const encoded = Buffer.from(`${username}:${appPassword}`).toString('base64');
  return `Basic ${encoded}`;
}

async function wpFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { siteUrl } = getConfig();
  const url = `${siteUrl}/wp-json/wp/v2${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`WordPress API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Create a WordPress post as draft
 */
export async function createDraftPost(payload: WPPostPayload): Promise<WPPost> {
  return wpFetch<WPPost>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing WordPress post
 */
export async function updatePost(
  postId: number,
  payload: Partial<WPPostPayload>
): Promise<WPPost> {
  return wpFetch<WPPost>(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Get all WordPress categories
 */
export async function getCategories(): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>('/categories?per_page=100');
}

/**
 * Create a WordPress category
 */
export async function createCategory(
  name: string,
  slug?: string
): Promise<WPCategory> {
  return wpFetch<WPCategory>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, slug }),
  });
}

/**
 * Find or create a category by name
 */
export async function findOrCreateCategory(name: string): Promise<number> {
  const categories = await getCategories();
  const existing = categories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing.id;

  const created = await createCategory(name);
  return created.id;
}

/**
 * Push an article to WordPress as a draft
 */
export async function pushArticleToWordPress(article: {
  title: string;
  body_html: string;
  meta_title: string;
  meta_description: string;
  slug: string;
  category_name: string;
  json_ld?: string;
}): Promise<{ wpPostId: number; wpPostUrl: string }> {
  // Find or create the WP category
  const categoryId = await findOrCreateCategory(article.category_name);

  // Append JSON-LD to content if available
  let content = article.body_html;
  if (article.json_ld) {
    content += `\n\n<!-- JSON-LD Structured Data -->\n${article.json_ld}`;
  }

  const post = await createDraftPost({
    title: article.title,
    content,
    status: 'draft',
    slug: article.slug,
    categories: [categoryId],
    // RankMath meta fields (if RankMath is installed)
    meta: {
      rank_math_title: article.meta_title,
      rank_math_description: article.meta_description,
    },
  });

  return {
    wpPostId: post.id,
    wpPostUrl: post.link,
  };
}
