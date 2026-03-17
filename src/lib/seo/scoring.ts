/**
 * SEO Scoring Algorithm
 * Deterministic scoring — no LLM cost.
 * Ported from Realience platform. Total: 100 points.
 */

export interface SEOAnalysis {
  total: number;
  title: number;
  metaDescription: number;
  keywords: number;
  content: number;
  structure: number;
  readability: number;
  links: number;
  factDensity: number;
  breakdown: {
    title: { exists: boolean; length: number; optimalLength: boolean; score: number };
    metaDescription: { exists: boolean; length: number; optimalLength: boolean; score: number };
    keywords: { primaryExists: boolean; density: number; distribution: boolean; score: number };
    content: { wordCount: number; optimalWordCount: boolean; headings: number; score: number };
    structure: { hasSlug: boolean; hasHeadings: boolean; headingHierarchy: boolean; score: number };
    readability: { averageSentenceLength: number; paragraphLength: number; score: number };
    links: { internalLinks: number; externalLinks: number; score: number };
    factDensity: { citations: number; numericalDataPoints: number; namedSpecifics: number; score: number };
  };
}

export interface ArticleContent {
  title?: string;
  meta_description?: string;
  content?: string;
  slug?: string;
  seo_keywords?: string[];
  primary_keyword?: string;
}

export function calculateSEOScore(article: ArticleContent): SEOAnalysis {
  const breakdown = {
    title: analyzeTitle(article.title),
    metaDescription: analyzeMetaDescription(article.meta_description),
    keywords: analyzeKeywords(article.content || '', article.seo_keywords || [], article.primary_keyword),
    content: analyzeContent(article.content || ''),
    structure: analyzeStructure(article.content || '', article.slug),
    readability: analyzeReadability(article.content || ''),
    links: analyzeLinks(article.content || ''),
    factDensity: analyzeFactDensity(article.content || ''),
  };

  const total =
    breakdown.title.score +
    breakdown.metaDescription.score +
    breakdown.keywords.score +
    breakdown.content.score +
    breakdown.structure.score +
    breakdown.readability.score +
    breakdown.links.score +
    breakdown.factDensity.score;

  return {
    total: Math.min(100, Math.max(0, total)),
    title: breakdown.title.score,
    metaDescription: breakdown.metaDescription.score,
    keywords: breakdown.keywords.score,
    content: breakdown.content.score,
    structure: breakdown.structure.score,
    readability: breakdown.readability.score,
    links: breakdown.links.score,
    factDensity: breakdown.factDensity.score,
    breakdown,
  };
}

// ─── Title (14 pts) ───────────────────────────────────────────────────

function analyzeTitle(title?: string) {
  if (!title || title.trim().length === 0) {
    return { exists: false, length: 0, optimalLength: false, score: 0 };
  }
  const length = title.length;
  const optimalLength = length >= 50 && length <= 60;
  let score = 8;
  if (optimalLength) score += 6;
  else if (length >= 40 && length <= 70) score += 3;
  return { exists: true, length, optimalLength, score: Math.min(14, score) };
}

// ─── Meta Description (10 pts) ───────────────────────────────────────

function analyzeMetaDescription(metaDescription?: string) {
  if (!metaDescription || metaDescription.trim().length === 0) {
    return { exists: false, length: 0, optimalLength: false, score: 0 };
  }
  const length = metaDescription.length;
  const optimalLength = length >= 150 && length <= 160;
  let score = 5;
  if (optimalLength) score += 5;
  else if (length >= 120 && length <= 170) score += 3;
  return { exists: true, length, optimalLength, score: Math.min(10, score) };
}

// ─── Keywords (15 pts, reduced from 18) ─────────────────────────────

function analyzeKeywords(content: string, keywords: string[], primaryKeyword?: string) {
  const textContent = stripHTML(content).toLowerCase();
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const wordCount = words.length;

  let score = 0;
  let primaryExists = false;
  let density = 0;

  if (primaryKeyword && keywords.length > 0) {
    primaryExists = true;
    score += 5;

    const keywordLower = primaryKeyword.toLowerCase();
    const exactMatches = (textContent.match(new RegExp(escapeRegex(keywordLower), 'gi')) || []).length;
    const keywordWords = keywordLower.split(/\s+/).filter((w) => w.length > 3);
    let wordMatchCount = 0;
    for (const kw of keywordWords) {
      wordMatchCount += (textContent.match(new RegExp(`\\b${escapeRegex(kw)}\\b`, 'gi')) || []).length;
    }

    const keywordOccurrences = exactMatches * 3 + wordMatchCount;
    const effectiveKeywords = keywordWords.length > 0 ? keywordWords.length : 1;
    density = wordCount > 0 ? (keywordOccurrences / effectiveKeywords / wordCount) * 100 : 0;

    if (density >= 0.5 && density <= 3) score += 5;
    else if (density >= 0.2 && density <= 5) score += 3;
    else if (density > 0) score += 1;

    // Distribution check
    const first100 = words.slice(0, 100).join(' ');
    const middleStart = Math.floor(words.length / 2);
    const middle100 = words.slice(middleStart, middleStart + 100).join(' ');
    const last100 = words.slice(-100).join(' ');

    const checkSection = (section: string) =>
      keywordWords.some((kw) => section.includes(kw)) || section.includes(keywordLower);

    const distributionCount = [
      checkSection(first100),
      checkSection(middle100),
      checkSection(last100),
    ].filter(Boolean).length;

    if (distributionCount >= 2) score += 5;
    else if (distributionCount === 1) score += 3;
  } else if (keywords.length > 0) {
    score += 3;
  }

  return {
    primaryExists,
    density: Math.round(density * 100) / 100,
    distribution: score >= 10,
    score: Math.min(15, score),
  };
}

// ─── Content (16 pts, reduced from 23) ──────────────────────────────

function analyzeContent(content: string) {
  const textContent = stripHTML(content);
  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;
  let score = 0;

  if (wordCount >= 2000) score += 9;
  else if (wordCount >= 1500) score += 6;
  else if (wordCount >= 1000) score += 4;
  else if (wordCount >= 500) score += 2;

  const headings = (content.match(/<h[23][^>]*>/gi) || []).length;
  if (headings >= 5) score += 7;
  else if (headings >= 3) score += 4;
  else if (headings >= 1) score += 2;

  return {
    wordCount,
    optimalWordCount: wordCount >= 2000,
    headings,
    score: Math.min(16, score),
  };
}

// ─── Structure (13 pts) ──────────────────────────────────────────────

function analyzeStructure(content: string, slug?: string) {
  let score = 0;
  if (slug && slug.trim().length > 0) score += 5;

  const hasHeadings = /<h[123][^>]*>/i.test(content);
  if (hasHeadings) score += 4;

  const h1 = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2 = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3 = (content.match(/<h3[^>]*>/gi) || []).length;
  const headingHierarchy = h1 <= 1 && h2 > 0 && (h3 === 0 || h2 >= h3);
  if (headingHierarchy) score += 4;

  return { hasSlug: !!slug, hasHeadings, headingHierarchy, score: Math.min(13, score) };
}

// ─── Readability (12 pts) ────────────────────────────────────────────

function analyzeReadability(content: string) {
  const textContent = stripHTML(content);
  const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const paragraphs = content.split(/<\/p>/i).filter((p) => stripHTML(p).trim().length > 0);

  let score = 0;
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  if (avgSentenceLength >= 15 && avgSentenceLength <= 20) score += 6;
  else if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 3;

  const avgParagraphLength = paragraphs.length > 0 ? sentences.length / paragraphs.length : 0;
  if (avgParagraphLength >= 3 && avgParagraphLength <= 5) score += 6;
  else if (avgParagraphLength >= 2 && avgParagraphLength <= 7) score += 3;

  return {
    averageSentenceLength: Math.round(avgSentenceLength * 100) / 100,
    paragraphLength: Math.round(avgParagraphLength * 100) / 100,
    score: Math.min(12, score),
  };
}

// ─── Links (8 pts, reduced from 10) ─────────────────────────────────

function analyzeLinks(content: string) {
  const allLinks = content.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [];
  const externalLinkMatches = content.match(/<a[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  const externalLinks = externalLinkMatches.length;
  const internalLinks = allLinks.length - externalLinks;
  const totalLinks = allLinks.length;

  let score = 0;
  if (totalLinks >= 3) score += 3;
  else if (totalLinks >= 1) score += 1;

  if (internalLinks >= 3 && internalLinks <= 10) score += 3;
  else if (internalLinks > 10) score += 2;
  else if (internalLinks >= 1) score += 1;

  if (externalLinks >= 1 && externalLinks <= 5) score += 2;
  else if (externalLinks > 5) score += 1;

  return { internalLinks, externalLinks, score: Math.min(8, score) };
}

// ─── Fact Density (12 pts, NEW) ──────────────────────────────────────

const STANDARD_PATTERNS = [
  /\bISO\s*\/?(?:IEC\s*)?\d{4,5}(?:[:-]\d{4})?/gi,
  /\b(?:ANSI|ASME|ASTM|IEEE|NFPA)\s*[A-Z]?\d+(?:\.\d+)?/gi,
  /\b21\s*CFR\s*(?:Part\s*)?\d+(?:\.\d+)?/gi,
  /\bNIST\b(?:\s+(?:SP|Handbook|HB)\s*\d+)?/gi,
  /\bOSHA\s*(?:29\s*CFR\s*)?\d{4}\.\d+/gi,
  /\bAS\s*9100/gi,
  /\bNADCAP\b/gi,
  /\bILAC[- ]G\d+/gi,
  /\bFSMA\b/gi,
  /\bHACCP\b/gi,
  /\bIATF\s*16949/gi,
  /\bISO\s*13485/gi,
  /\bGMP\b|cGMP\b/gi,
  /\bUSP\s*(?:Chapter\s*)?\d+/gi,
  /\bMIL-STD-\d+/gi,
  /\bNTEP\b/gi,
];

const NUMERICAL_PATTERN = /(?:±\s*)?[\d]+(?:\.\d+)?(?:\s*%|\s*°[CF]|\s*(?:psi|kPa|mm|µm|mg|kg|lb|N·?m|ft-?lb|mV|V|A|Ω|Hz|dB))\b/gi;
const CLAUSE_PATTERN = /(?:Clause|Section|Part|Chapter|Subpart|Article)\s+\d+(?:\.\d+)*(?:\.\d+)?(?:\([a-z]\))?/gi;

function analyzeFactDensity(content: string) {
  const textContent = stripHTML(content);

  // Count standard/regulation citations
  const citationSet = new Set<string>();
  for (const pattern of STANDARD_PATTERNS) {
    const matches = textContent.match(pattern) || [];
    for (const match of matches) {
      citationSet.add(match.trim().toLowerCase());
    }
  }
  const citations = citationSet.size;

  // Count numerical data points (tolerances, percentages, intervals with units)
  const numericalMatches = textContent.match(NUMERICAL_PATTERN) || [];
  const numericalDataPoints = new Set(numericalMatches.map((m) => m.trim().toLowerCase())).size;

  // Count named specifics (clause numbers, specific regulation sections)
  const clauseMatches = textContent.match(CLAUSE_PATTERN) || [];
  const namedSpecifics = new Set(clauseMatches.map((m) => m.trim().toLowerCase())).size;

  // Scoring
  let score = 0;

  // Citations: 0-4 pts
  if (citations >= 5) score += 4;
  else if (citations >= 3) score += 3;
  else if (citations >= 1) score += 2;

  // Numerical data points: 0-4 pts
  if (numericalDataPoints >= 5) score += 4;
  else if (numericalDataPoints >= 3) score += 3;
  else if (numericalDataPoints >= 1) score += 2;

  // Named specifics: 0-4 pts
  if (namedSpecifics >= 4) score += 4;
  else if (namedSpecifics >= 2) score += 3;
  else if (namedSpecifics >= 1) score += 2;

  return {
    citations,
    numericalDataPoints,
    namedSpecifics,
    score: Math.min(12, score),
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────

function stripHTML(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&(amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
