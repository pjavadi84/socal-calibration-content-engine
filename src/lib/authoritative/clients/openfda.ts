import type { AuthoritativeClient, AuthoritativeQuery, AuthoritativeResult } from '../types';
import { getCachedResult, setCachedResult } from '../cache';

const RELEVANT_TERMS = ['fda', 'medical-device', 'medical-equipment'];
const RELEVANT_INDUSTRIES = ['medical-devices', 'pharmaceutical'];
const FETCH_TIMEOUT_MS = 5000;

function isRelevant(query: AuthoritativeQuery): boolean {
  const categoryLower = query.category.toLowerCase();
  if (RELEVANT_TERMS.some((t) => categoryLower.includes(t))) return true;
  if (query.industry && RELEVANT_INDUSTRIES.includes(query.industry.toLowerCase())) return true;
  return false;
}

function buildSearchTerm(query: AuthoritativeQuery): string {
  const terms: string[] = [];
  if (query.equipmentType) terms.push(query.equipmentType);
  if (query.category) terms.push(query.category);
  return terms.join('+').replace(/\s+/g, '+');
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchRecalls(searchTerm: string): Promise<{ results: unknown[]; urls: string[] }> {
  const url = `https://api.fda.gov/device/recall.json?search=${encodeURIComponent(searchTerm)}&limit=5`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return { results: [], urls: [] };
    const data = await res.json();
    const results = data.results || [];
    const urls = results.map(
      (_: unknown, i: number) =>
        `https://api.fda.gov/device/recall.json?search=${encodeURIComponent(searchTerm)}&limit=1&skip=${i}`
    );
    return { results, urls: urls.length > 0 ? ['https://www.fda.gov/medical-devices/medical-device-recalls'] : [] };
  } catch {
    return { results: [], urls: [] };
  }
}

async function fetchMaudeEvents(searchTerm: string): Promise<{ results: unknown[]; urls: string[] }> {
  const url = `https://api.fda.gov/device/event.json?search=${encodeURIComponent(searchTerm)}&limit=5`;
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return { results: [], urls: [] };
    const data = await res.json();
    const results = data.results || [];
    return {
      results,
      urls: results.length > 0 ? ['https://www.fda.gov/medical-devices/mandatory-reporting-requirements-manufacturers-importers-and-device-user-facilities/maude-manufacturer-and-user-facility-device-experience'] : [],
    };
  } catch {
    return { results: [], urls: [] };
  }
}

async function fetchData(query: AuthoritativeQuery): Promise<AuthoritativeResult | null> {
  const queryKey = `openfda:${query.category}:${query.equipmentType || ''}`;
  const cached = await getCachedResult('openfda', queryKey);
  if (cached) {
    return {
      source: 'openfda',
      sourceLabel: 'FDA (openFDA)',
      rawData: cached.raw_response,
      sourceUrls: cached.source_urls,
      resultCount: Array.isArray(cached.raw_response) ? (cached.raw_response as unknown[]).length : 0,
    };
  }

  const searchTerm = buildSearchTerm(query);
  const [recalls, maude] = await Promise.all([
    fetchRecalls(searchTerm),
    fetchMaudeEvents(searchTerm),
  ]);

  const allResults = [
    ...recalls.results.map((r) => ({ type: 'recall', data: r })),
    ...maude.results.map((r) => ({ type: 'maude_event', data: r })),
  ];
  const allUrls = [...recalls.urls, ...maude.urls];

  if (allResults.length === 0) return null;

  await setCachedResult('openfda', queryKey, allResults, null, allUrls);

  return {
    source: 'openfda',
    sourceLabel: 'FDA (openFDA)',
    rawData: allResults,
    sourceUrls: allUrls,
    resultCount: allResults.length,
  };
}

export const openfdaClient: AuthoritativeClient = {
  source: 'openfda',
  sourceLabel: 'FDA (openFDA)',
  isRelevant,
  fetch: fetchData,
};
