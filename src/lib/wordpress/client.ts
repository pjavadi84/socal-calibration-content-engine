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
  featured_media?: number;
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
 * Set Yoast SEO meta fields on a post.
 * Requires the "Yoast REST API Bridge" plugin (wordpress/yoast-rest-api-bridge.php)
 * to be installed on the WordPress site, which registers Yoast meta keys for REST API access.
 */
async function setYoastMeta(
  postId: number,
  fields: {
    focuskw?: string;
    metadesc?: string;
    title?: string;
  },
  creds?: WPCredentials
): Promise<void> {
  const meta: Record<string, string> = {};
  if (fields.focuskw) meta._yoast_wpseo_focuskw = fields.focuskw;
  if (fields.metadesc) meta._yoast_wpseo_metadesc = fields.metadesc;
  if (fields.title) meta._yoast_wpseo_title = fields.title;

  if (Object.keys(meta).length === 0) return;

  try {
    await wpFetch(`/posts/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ meta }),
    }, creds);
  } catch (err) {
    console.error(`Failed to set Yoast meta on post ${postId}:`, err);
  }
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
 * Upload an image to the WordPress Media Library from a URL.
 * Downloads the image and uploads it as a media attachment.
 * Returns the media ID for use as featured_media.
 */
async function uploadMediaFromUrl(
  imageUrl: string,
  altText: string,
  creds?: WPCredentials
): Promise<number | null> {
  try {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) return null;

    const buffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';
    const filename = `${altText.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50)}.${ext}`;

    const { siteUrl } = getConfig(creds);
    const response = await fetch(`${siteUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(creds),
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': contentType,
      },
      body: Buffer.from(buffer),
    });

    if (!response.ok) {
      console.error(`Failed to upload media to WordPress: ${response.status}`);
      return null;
    }

    const media = await response.json() as { id: number };

    // Set alt text on the media attachment
    await fetch(`${siteUrl}/wp-json/wp/v2/media/${media.id}`, {
      method: 'POST',
      headers: {
        Authorization: getAuthHeader(creds),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alt_text: altText }),
    });

    return media.id;
  } catch (err) {
    console.error('Failed to upload featured image to WordPress:', err);
    return null;
  }
}

/**
 * Extract the first image URL and alt text from article HTML.
 */
function extractFirstImage(html: string): { url: string; alt: string } | null {
  const match = html.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i)
    || html.match(/<img[^>]+alt="([^"]*)"[^>]*src="([^"]+)"[^>]*>/i);
  if (!match) return null;
  // Handle both attribute orderings
  if (html.match(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*>/i)) {
    return { url: match[1], alt: match[2] };
  }
  return { url: match[2], alt: match[1] };
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
    author_byline?: string;
    primary_keyword?: string;
  },
  creds?: WPCredentials
): Promise<{ wpPostId: number; wpPostUrl: string }> {
  // Find or create the WP category
  const categoryId = await findOrCreateCategory(article.category_name, creds);

  // Prepend author byline if provided
  let content = article.author_byline
    ? `<p class="article-byline"><em>${article.author_byline}</em></p>\n\n${article.body_html}`
    : article.body_html;
  if (article.json_ld) {
    content += `\n\n<!-- JSON-LD Structured Data -->\n${article.json_ld}`;
  }

  // Upload first article image as WordPress featured image
  let featuredMediaId: number | undefined;
  const firstImage = extractFirstImage(article.body_html);
  if (firstImage) {
    const mediaId = await uploadMediaFromUrl(
      firstImage.url,
      firstImage.alt || article.title,
      creds
    );
    if (mediaId) featuredMediaId = mediaId;
  }

  const post = await createDraftPost({
    title: article.title,
    content,
    status: 'draft',
    slug: article.slug,
    categories: [categoryId],
    featured_media: featuredMediaId,
  }, creds);

  // Set Yoast SEO fields via form-encoded POST (JSON format is silently dropped by WP)
  await setYoastMeta(post.id, {
    focuskw: article.primary_keyword,
    metadesc: article.meta_description,
    title: article.meta_title,
  }, creds);

  return {
    wpPostId: post.id,
    wpPostUrl: post.link,
  };
}
