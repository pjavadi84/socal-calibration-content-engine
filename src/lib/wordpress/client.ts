/**
 * WordPress REST API Client
 * Pushes articles as drafts to the WordPress site.
 */

export interface WPCredentials {
  siteUrl: string;
  username: string;
  appPassword: string;
}

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

function getConfig(creds?: WPCredentials) {
  if (creds) {
    return {
      siteUrl: creds.siteUrl.replace(/\/$/, ''),
      username: creds.username,
      appPassword: creds.appPassword,
    };
  }

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

function getAuthHeader(creds?: WPCredentials) {
  const { username, appPassword } = getConfig(creds);
  const encoded = Buffer.from(`${username}:${appPassword}`).toString('base64');
  return `Basic ${encoded}`;
}

async function wpFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  creds?: WPCredentials
): Promise<T> {
  const { siteUrl } = getConfig(creds);
  const url = `${siteUrl}/wp-json/wp/v2${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: getAuthHeader(creds),
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
export async function createDraftPost(
  payload: WPPostPayload,
  creds?: WPCredentials
): Promise<WPPost> {
  return wpFetch<WPPost>('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, creds);
}

/**
 * Update an existing WordPress post
 */
export async function updatePost(
  postId: number,
  payload: Partial<WPPostPayload>,
  creds?: WPCredentials
): Promise<WPPost> {
  return wpFetch<WPPost>(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }, creds);
}

/**
 * Get all WordPress categories
 */
export async function getWPCategories(creds?: WPCredentials): Promise<WPCategory[]> {
  return wpFetch<WPCategory[]>('/categories?per_page=100', {}, creds);
}

/**
 * Create a WordPress category
 */
export async function createCategory(
  name: string,
  slug?: string,
  creds?: WPCredentials
): Promise<WPCategory> {
  return wpFetch<WPCategory>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name, slug }),
  }, creds);
}

/**
 * Find or create a category by name
 */
export async function findOrCreateCategory(
  name: string,
  creds?: WPCredentials
): Promise<number> {
  const categories = await getWPCategories(creds);

  // Exact match
  const existing = categories.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) return existing.id;

  // Try to create; if user lacks permission, fall back to "Blog" or "Uncategorized"
  try {
    const created = await createCategory(name, undefined, creds);
    return created.id;
  } catch (err) {
    console.warn(`Could not create WP category "${name}", looking for fallback:`, err);
    const blog = categories.find((c) => c.name.toLowerCase() === 'blog');
    if (blog) return blog.id;
    return 1; // WordPress built-in "Uncategorized"
  }
}

/**
 * Test WordPress connection by hitting the users/me endpoint
 */
export async function testConnection(creds: WPCredentials): Promise<{ success: true; siteName: string } | { success: false; error: string }> {
  try {
    const { siteUrl } = getConfig(creds);
    const response = await fetch(`${siteUrl}/wp-json`, {
      headers: {
        Authorization: getAuthHeader(creds),
      },
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const data = await response.json();
    return { success: true, siteName: data.name || siteUrl };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Connection failed' };
  }
}

/**
 * Push an article to WordPress as a draft
 */
export async function pushArticleToWordPress(
  article: {
    title: string;
    body_html: string;
    meta_title: string;
    meta_description: string;
    slug: string;
    category_name: string;
    json_ld?: string;
  },
  creds?: WPCredentials
): Promise<{ wpPostId: number; wpPostUrl: string }> {
  // Find or create the WP category
  const categoryId = await findOrCreateCategory(article.category_name, creds);

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
    // Yoast SEO meta fields
    meta: {
      _yoast_wpseo_title: article.meta_title,
      _yoast_wpseo_metadesc: article.meta_description,
    },
  }, creds);

  return {
    wpPostId: post.id,
    wpPostUrl: post.link,
  };
}
