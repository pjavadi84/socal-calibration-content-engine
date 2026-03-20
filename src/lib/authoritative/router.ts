import type { AuthoritativeQuery, AuthoritativeResult, AuthoritativeClient } from './types';
import { openfdaClient } from './clients/openfda';
import { oshaClient } from './clients/osha';
import { federalRegisterClient } from './clients/federal-register';

const ALL_CLIENTS: AuthoritativeClient[] = [
  openfdaClient,
  oshaClient,
  federalRegisterClient,
];

export async function queryAuthoritativeSources(
  query: AuthoritativeQuery,
  enabledApis: Record<string, boolean>
): Promise<AuthoritativeResult[]> {
  const relevantClients = ALL_CLIENTS.filter(
    (c) => enabledApis[c.source] !== false && c.isRelevant(query)
  );

  if (relevantClients.length === 0) return [];

  const settled = await Promise.allSettled(
    relevantClients.map((c) => c.fetch(query))
  );

  return settled
    .filter(
      (r): r is PromiseFulfilledResult<AuthoritativeResult | null> =>
        r.status === 'fulfilled' && r.value !== null
    )
    .map((r) => r.value!);
}
