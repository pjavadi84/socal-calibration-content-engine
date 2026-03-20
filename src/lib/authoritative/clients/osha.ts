import type { AuthoritativeClient, AuthoritativeQuery, AuthoritativeResult } from '../types';
import { getCachedResult, setCachedResult } from '../cache';

const FETCH_TIMEOUT_MS = 5000;

const SIC_CODE_MAP: Record<string, string> = {
  'medical-devices': '3841',
  'food-manufacturing': '2099',
  'aerospace': '3728',
  'pharmaceutical': '2834',
  'electronics': '3679',
  'automotive': '3711',
  'chemical': '2899',
};

function isRelevant(query: AuthoritativeQuery): boolean {
  const pillarLower = query.pillar.toLowerCase();
  const categoryLower = query.category.toLowerCase();
  if (pillarLower.includes('industry-compliance') || pillarLower.includes('compliance')) return true;
  if (categoryLower.includes('osha') || categoryLower.includes('safety') || categoryLower.includes('workplace'))
    return true;
  return false;
}

function getSicCode(query: AuthoritativeQuery): string | null {
  const categorySlug = query.category.toLowerCase().replace(/\s+/g, '-');
  if (SIC_CODE_MAP[categorySlug]) return SIC_CODE_MAP[categorySlug];
  if (query.industry) {
    const industrySlug = query.industry.toLowerCase().replace(/\s+/g, '-');
    if (SIC_CODE_MAP[industrySlug]) return SIC_CODE_MAP[industrySlug];
  }
  return null;
}

async function fetchData(query: AuthoritativeQuery): Promise<AuthoritativeResult | null> {
  const queryKey = `osha:${query.category}:${query.industry || ''}`;
  const cached = await getCachedResult('osha', queryKey);
  if (cached) {
    return {
      source: 'osha',
      sourceLabel: 'OSHA Enforcement',
      rawData: cached.raw_response,
      sourceUrls: cached.source_urls,
      resultCount: Array.isArray(cached.raw_response) ? (cached.raw_response as unknown[]).length : 0,
    };
  }

  const sicCode = getSicCode(query);
  const params = new URLSearchParams();
  params.set('p_logger', 'true');
  if (sicCode) params.set('p_sic', sicCode);
  params.set('p_state', 'CA');
  params.set('p_start_date', getOneYearAgo());
  params.set('p_end_date', getToday());

  const url = `https://enforcedata.dol.gov/api/enforcement/inspection?${params.toString()}`;

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
    const results = Array.isArray(data) ? data.slice(0, 10) : [];

    if (results.length === 0) return null;

    const sourceUrls = ['https://www.osha.gov/enforcement/inspections'];

    await setCachedResult('osha', queryKey, results, null, sourceUrls);

    return {
      source: 'osha',
      sourceLabel: 'OSHA Enforcement',
      rawData: results,
      sourceUrls,
      resultCount: results.length,
    };
  } catch {
    return null;
  }
}

function getOneYearAgo(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export const oshaClient: AuthoritativeClient = {
  source: 'osha',
  sourceLabel: 'OSHA Enforcement',
  isRelevant,
  fetch: fetchData,
};
