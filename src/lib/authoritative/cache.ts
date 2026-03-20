import { createServiceClient } from '@/lib/db/client';

export async function getCachedResult(
  source: string,
  queryKey: string
): Promise<{ raw_response: unknown; summary: string | null; source_urls: string[] } | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from('api_cache')
    .select('raw_response, summary, source_urls')
    .eq('api_source', source)
    .eq('query_key', queryKey)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !data) return null;
  return data;
}

export async function setCachedResult(
  source: string,
  queryKey: string,
  rawData: unknown,
  summary: string | null,
  sourceUrls: string[]
): Promise<void> {
  const db = createServiceClient();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  await db.from('api_cache').upsert(
    {
      api_source: source,
      query_key: queryKey,
      raw_response: rawData as Record<string, unknown>,
      summary,
      source_urls: sourceUrls,
      fetched_at: new Date().toISOString(),
      expires_at: expiresAt,
    },
    { onConflict: 'api_source,query_key' }
  );
}
