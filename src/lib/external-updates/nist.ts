import { createHash } from 'crypto';

export type ExternalUpdateItem = {
  source: 'nist' | 'iso';
  title: string;
  url: string;
  published_at: string | null;
  summary?: string | null;
  metadata?: Record<string, unknown>;
};

function stableKey(s: string) {
  return createHash('sha256').update(s).digest('hex').slice(0, 32);
}

// Best-effort NIST Publications RSS.
// NIST has multiple feeds; we start with a broad one and can refine later.
const NIST_PUBLICATIONS_RSS = 'https://www.nist.gov/publications/rss.xml';

export async function fetchNistUpdates(limit = 25): Promise<ExternalUpdateItem[]> {
  const res = await fetch(NIST_PUBLICATIONS_RSS, {
    // Avoid Next caching; we also de-dupe by URL in DB
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`NIST RSS fetch failed: ${res.status}`);
  const xml = await res.text();

  // Minimal XML parsing without extra deps
  const items = xml.split('<item>').slice(1);
  const parsed: ExternalUpdateItem[] = [];
  for (const raw of items) {
    if (parsed.length >= limit) break;
    const title = raw.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/)?.[1]
      || raw.match(/<title>([\s\S]*?)<\/title>/)?.[1]
      || '';
    const link = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || '';
    const pubDate = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || '';
    const description =
      raw.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1]
      || raw.match(/<description>([\s\S]*?)<\/description>/)?.[1]
      || '';

    const url = link || '';
    if (!url) continue;

    const published_at = pubDate ? new Date(pubDate).toISOString() : null;

    parsed.push({
      source: 'nist',
      title: (title || '').trim() || `NIST Update ${stableKey(url)}`,
      url,
      published_at,
      summary: description ? stripHtml(description).slice(0, 800) : null,
      metadata: { feed: NIST_PUBLICATIONS_RSS },
    });
  }

  return parsed;
}

function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

