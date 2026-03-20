import type { AuthoritativeQuery } from './types';
import { queryAuthoritativeSources } from './router';
import { summarizeApiResults } from './summarizer';

export type { AuthoritativeQuery, AuthoritativeResult } from './types';

export async function retrieveAuthoritativeContext(
  query: AuthoritativeQuery,
  enabledApis: Record<string, boolean>
): Promise<{ context: string; sources: string[] }> {
  const results = await queryAuthoritativeSources(query, enabledApis);

  if (results.length === 0) return { context: '', sources: [] };

  return summarizeApiResults(results);
}
