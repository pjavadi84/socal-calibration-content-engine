import type { AuthoritativeClient, AuthoritativeQuery, AuthoritativeResult } from '../types';
import { getCachedResult, setCachedResult } from '../cache';

const FETCH_TIMEOUT_MS = 5000;

const AGENCY_SLUG_MAP: Record<string, string> = {
  'fda-compliance': 'food-and-drug-administration',
  'fda': 'food-and-drug-administration',
  'medical-device': 'food-and-drug-administration',
  'medical-devices': 'food-and-drug-administration',
  'pharmaceutical': 'food-and-drug-administration',
  'osha': 'occupational-safety-and-health-administration',
  'safety': 'occupational-safety-and-health-administration',
  'workplace': 'occupational-safety-and-health-administration',
  'epa': 'environmental-protection-agency',
  'environmental': 'environmental-protection-agency',
  'nist': 'national-institute-of-standards-and-technology',
  'metrology': 'national-institute-of-standards-and-technology',
  'calibration': 'national-institute-of-standards-and-technology',
  'aerospace': 'federal-aviation-administration',
  'aviation': 'federal-aviation-administration',
};

function isRelevant(query: AuthoritativeQuery): boolean {
  const pillarLower = query.pillar.toLowerCase();
  if (pillarLower.includes('industry-compliance') || pillarLower.includes('compliance')) return true;
  const agencySlug = getAgencySlug(query);
  return agencySlug !== null;
}

function getAgencySlug(query: AuthoritativeQuery): string | null {
  const categoryLower = query.category.toLowerCase().replace(/\s+/g, '-');
  for (const [key, slug] of Object.entries(AGENCY_SLUG_MAP)) {
    if (categoryLower.includes(key)) return slug;
  }
  if (query.industry) {
    const industryLower = query.industry.toLowerCase().replace(/\s+/g, '-');
    for (const [key, slug] of Object.entries(AGENCY_SLUG_MAP)) {
      if (industryLower.includes(key)) return slug;
    }
  }
  return null;
}

async function fetchData(query: AuthoritativeQuery): Promise<AuthoritativeResult | null> {
  const queryKey = `federal_register:${query.category}:${query.industry || ''}`;
  const cached = await getCachedResult('federal_register', queryKey);
  if (cached) {
    return {
      source: 'federal_register',
      sourceLabel: 'Federal Register',
      rawData: cached.raw_response,
      sourceUrls: cached.source_urls,
      resultCount: Array.isArray(cached.raw_response) ? (cached.raw_response as unknown[]).length : 0,
    };
  }

  const agencySlug = getAgencySlug(query);
  if (!agencySlug) return null;

  const params = new URLSearchParams();
  params.set('conditions[agencies][]', agencySlug);
  params.set('conditions[type][]', 'RULE');
  params.set('per_page', '5');
  params.set('order', 'newest');

  const url = `https://www.federalregister.gov/api/v1/documents.json?${params.toString()}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];

    if (results.length === 0) return null;

    const sourceUrls = results
      .map((r: { html_url?: string }) => r.html_url)
      .filter(Boolean) as string[];

    await setCachedResult('federal_register', queryKey, results, null, sourceUrls);

    return {
      source: 'federal_register',
      sourceLabel: 'Federal Register',
      rawData: results,
      sourceUrls,
      resultCount: results.length,
    };
  } catch {
    return null;
  }
}

export const federalRegisterClient: AuthoritativeClient = {
  source: 'federal_register',
  sourceLabel: 'Federal Register',
  isRelevant,
  fetch: fetchData,
};
