export type ExternalUpdateItem = {
  source: 'nist' | 'iso';
  title: string;
  url: string;
  published_at: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown>;
};

// ISO doesn't provide an easy, stable public API for standard revision announcements.
// For now we implement "alerts" as a lightweight monitor of a public page list (best-effort).
// This can be replaced with a paid feed or manual curated list later.
const ISO_NEWS_URL = 'https://www.iso.org/news.html';

export async function fetchIsoRevisionAlerts(limit = 10): Promise<ExternalUpdateItem[]> {
  const res = await fetch(ISO_NEWS_URL, { cache: 'no-store' });
  if (!res.ok) throw new Error(`ISO news fetch failed: ${res.status}`);
  const html = await res.text();

  // Very lightweight extraction: grab first N anchors under the page as "alerts"
  const hrefs = Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g))
    .map((m) => ({ href: m[1], text: stripHtml(m[2]) }))
    .filter((x) => x.text && x.href)
    .slice(0, limit);

  const items: ExternalUpdateItem[] = [];
  for (const h of hrefs) {
    const url = h.href.startsWith('http') ? h.href : `https://www.iso.org${h.href.startsWith('/') ? '' : '/'}${h.href}`;
    items.push({
      source: 'iso',
      title: h.text.slice(0, 160),
      url,
      published_at: null,
      summary: null,
      metadata: { page: ISO_NEWS_URL },
    });
  }
  return items;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

