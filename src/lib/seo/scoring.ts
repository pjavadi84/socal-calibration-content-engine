/**
 * SEO Scoring Algorithm v2
 * Deterministic scoring — no LLM cost.
 * Total: 100 points across 8 categories.
 *
 * v2 changes (from v1):
 *  - Keyword density replaced with keyword placement checks
 *  - Meta description optimal range fixed to 120–155
 *  - Image/alt text scoring added
 *  - JSON-LD presence scoring added
 *  - Flesch-Kincaid reading grade added
 *  - Fact Density weight increased from 12 → 19 (calibration niche differentiator)
 *
 * v2.1 changes:
 *  - Business Relevance scoring added (8 pts)
 *  - Fact Density reduced from 19 → 15 (-4)
 *  - Content reduced from 15 → 13 (-2)
 *  - Subtracted points redistributed to new businessRelevance component
 */

export interface SEOAnalysis {
  total: number;
  title: number;
  metaDescription: number;
  keywordPlacement: number;
  content: number;
  structure: number;
  readability: number;
  links: number;
  factDensity: number;
  businessRelevance: number;
  breakdown: {
    title: { exists: boolean; length: number; optimalLength: boolean; keywordInTitle: boolean; score: number; maxScore: number };
    metaDescription: { exists: boolean; length: number; optimalLength: boolean; keywordInMeta: boolean; score: number; maxScore: number };
    keywordPlacement: { inFirstParagraph: boolean; inH2: boolean; distribution: number; score: number; maxScore: number };
    content: { wordCount: number; optimalWordCount: boolean; headings: number; imagesWithAlt: number; totalImages: number; score: number; maxScore: number };
    structure: { hasSlug: boolean; headingHierarchy: boolean; jsonLdPresent: boolean; score: number; maxScore: number };
    readability: { averageSentenceLength: number; paragraphLength: number; fleschKincaidGrade: number; score: number; maxScore: number };
    links: { internalLinks: number; externalLinks: number; clusterLinks: number; score: number; maxScore: number };
    factDensity: { citations: number; numericalDataPoints: number; namedSpecifics: number; score: number; maxScore: number };
    businessRelevance: { costLanguage: number; consequenceLanguage: number; decisionMakerFraming: number; score: number; maxScore: number };
  };
}

export interface ArticleContent {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  content?: string;
  slug?: string;
  seo_keywords?: string[];
  primary_keyword?: string;
  json_ld?: unknown;
  clusterLinks?: number;
}

export function calculateSEOScore(article: ArticleContent): SEOAnalysis {
  const primaryWords = getSignificantWords(article.primary_keyword);

  const breakdown = {
    title: analyzeTitle(article.title, article.meta_title, primaryWords),
    metaDescription: analyzeMetaDescription(article.meta_description, primaryWords),
    keywordPlacement: analyzeKeywordPlacement(article.content || '', primaryWords),
    content: analyzeContent(article.content || ''),
    structure: analyzeStructure(article.content || '', article.slug, article.json_ld),
    readability: analyzeReadability(article.content || ''),
    links: analyzeLinks(article.content || '', article.clusterLinks),
    factDensity: analyzeFactDensity(article.content || ''),
    businessRelevance: analyzeBusinessRelevance(article.content || ''),
  };

  const total =
    breakdown.title.score +
    breakdown.metaDescription.score +
    breakdown.keywordPlacement.score +
    breakdown.content.score +
    breakdown.structure.score +
    breakdown.readability.score +
    breakdown.links.score +
    breakdown.factDensity.score +
    breakdown.businessRelevance.score;

  return {
    total: Math.min(100, Math.max(0, total)),
    title: breakdown.title.score,
    metaDescription: breakdown.metaDescription.score,
    keywordPlacement: breakdown.keywordPlacement.score,
    content: breakdown.content.score,
    structure: breakdown.structure.score,
    readability: breakdown.readability.score,
    links: breakdown.links.score,
    factDensity: breakdown.factDensity.score,
    businessRelevance: breakdown.businessRelevance.score,
    breakdown,
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

/** Extract words ≥4 chars from a keyword phrase for fuzzy matching. */
function getSignificantWords(keyword?: string): string[] {
  if (!keyword) return [];
  return keyword
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4);
}

/** Check if significant keyword words appear in a text block (case-insensitive). */
function textContainsKeyword(text: string, significantWords: string[]): boolean {
  if (significantWords.length === 0) return false;
  const lower = text.toLowerCase();
  return significantWords.some((w) => lower.includes(w));
}

/** Count syllables in a word using a vowel-group heuristic. */
function countSyllables(word: string): number {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (cleaned.length <= 2) return 1;

  const vowelGroups = cleaned.match(/[aeiouy]+/g);
  if (!vowelGroups) return 1;

  let count = vowelGroups.length;

  // Subtract for silent trailing e
  if (cleaned.endsWith('e') && count > 1) {
    count--;
  }
  // Common suffixes that don't add syllables
  if (cleaned.endsWith('le') && cleaned.length > 2 && !/[aeiouy]/.test(cleaned[cleaned.length - 3])) {
    count++;
  }

  return Math.max(1, count);
}

// ─── Title (14 pts) ───────────────────────────────────────────────────

function analyzeTitle(title?: string, metaTitle?: string, primaryWords: string[] = []) {
  if (!title || title.trim().length === 0) {
    return { exists: false, length: 0, optimalLength: false, keywordInTitle: false, score: 0, maxScore: 14 };
  }

  const length = title.length;
  const optimalLength = length >= 50 && length <= 60;
  let score = 5; // exists

  if (optimalLength) score += 4;
  else if (length >= 40 && length <= 70) score += 2;

  const titleToCheck = (metaTitle || title).toLowerCase();
  const keywordInTitle = textContainsKeyword(titleToCheck, primaryWords);
  if (keywordInTitle) score += 5;

  return { exists: true, length, optimalLength, keywordInTitle, score: Math.min(14, score), maxScore: 14 };
}

// ─── Meta Description (10 pts) ───────────────────────────────────────

function analyzeMetaDescription(metaDescription?: string, primaryWords: string[] = []) {
  if (!metaDescription || metaDescription.trim().length === 0) {
    return { exists: false, length: 0, optimalLength: false, keywordInMeta: false, score: 0, maxScore: 10 };
  }

  const length = metaDescription.length;
  const optimalLength = length >= 120 && length <= 155;
  let score = 3; // exists

  if (optimalLength) score += 3;
  else if (length >= 100 && length <= 170) score += 2;

  const keywordInMeta = textContainsKeyword(metaDescription.toLowerCase(), primaryWords);
  if (keywordInMeta) score += 4;

  return { exists: true, length, optimalLength, keywordInMeta, score: Math.min(10, score), maxScore: 10 };
}

// ─── Keyword Placement (13 pts) ──────────────────────────────────────

function analyzeKeywordPlacement(content: string, primaryWords: string[]) {
  if (primaryWords.length === 0) {
    return { inFirstParagraph: false, inH2: false, distribution: 0, score: 0, maxScore: 13 };
  }

  let score = 0;

  // First paragraph check
  const firstParagraphMatch = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const firstParagraph = firstParagraphMatch ? stripHTML(firstParagraphMatch[1]) : '';
  const inFirstParagraph = textContainsKeyword(firstParagraph, primaryWords);
  if (inFirstParagraph) score += 4;

  // H2 check
  const h2Matches = content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const h2Texts = h2Matches.map((h) => stripHTML(h));
  const inH2 = h2Texts.some((text) => textContainsKeyword(text, primaryWords));
  if (inH2) score += 4;

  // Distribution check (beginning, middle, end thirds)
  const textContent = stripHTML(content).toLowerCase();
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const third = Math.floor(words.length / 3);

  const sections = [
    words.slice(0, third).join(' '),
    words.slice(third, third * 2).join(' '),
    words.slice(third * 2).join(' '),
  ];

  const distribution = sections.filter((section) =>
    primaryWords.some((w) => section.includes(w))
  ).length;

  if (distribution >= 3) score += 5;
  else if (distribution >= 2) score += 3;
  else if (distribution >= 1) score += 1;

  return { inFirstParagraph, inH2, distribution, score: Math.min(13, score), maxScore: 13 };
}

// ─── Content (13 pts) ────────────────────────────────────────────────

function analyzeContent(content: string) {
  const textContent = stripHTML(content);
  const wordCount = textContent.split(/\s+/).filter((w) => w.length > 0).length;
  let score = 0;

  // Word count: 6 pts
  if (wordCount >= 2000) score += 6;
  else if (wordCount >= 1500) score += 4;
  else if (wordCount >= 1000) score += 3;
  else if (wordCount >= 500) score += 1;

  // Headings: 4 pts
  const headings = (content.match(/<h[23][^>]*>/gi) || []).length;
  if (headings >= 5) score += 4;
  else if (headings >= 3) score += 3;
  else if (headings >= 1) score += 1;

  // Images with alt text: 3 pts
  const imgTags = content.match(/<img[^>]*>/gi) || [];
  const totalImages = imgTags.length;
  const imagesWithAlt = imgTags.filter((tag) => /alt=["'][^"']+["']/i.test(tag)).length;

  if (imagesWithAlt >= 3) score += 3;
  else if (imagesWithAlt >= 1) score += 2;
  else if (totalImages > 0) score += 1;

  return {
    wordCount,
    optimalWordCount: wordCount >= 2000,
    headings,
    imagesWithAlt,
    totalImages,
    score: Math.min(13, score),
    maxScore: 13,
  };
}

// ─── Structure (11 pts) ──────────────────────────────────────────────

function analyzeStructure(content: string, slug?: string, jsonLd?: unknown) {
  let score = 0;

  // Slug: 3 pts
  const hasSlug = !!slug && slug.trim().length > 0;
  if (hasSlug) score += 3;

  // Heading hierarchy: 4 pts
  const h1 = (content.match(/<h1[^>]*>/gi) || []).length;
  const h2 = (content.match(/<h2[^>]*>/gi) || []).length;
  const h3 = (content.match(/<h3[^>]*>/gi) || []).length;
  const headingHierarchy = h1 <= 1 && h2 > 0 && (h3 === 0 || h2 >= h3);
  if (headingHierarchy) score += 4;

  // JSON-LD: 4 pts
  const jsonLdPresent = jsonLd != null && typeof jsonLd === 'object' && Object.keys(jsonLd as Record<string, unknown>).length > 0;
  if (jsonLdPresent) score += 4;

  return { hasSlug, headingHierarchy, jsonLdPresent, score: Math.min(11, score), maxScore: 11 };
}

// ─── Readability (10 pts) ────────────────────────────────────────────

function analyzeReadability(content: string) {
  const textContent = stripHTML(content);
  const sentences = textContent.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const words = textContent.split(/\s+/).filter((w) => w.length > 0);
  const paragraphs = content.split(/<\/p>/i).filter((p) => stripHTML(p).trim().length > 0);

  let score = 0;

  // Avg sentence length: 4 pts
  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  if (avgSentenceLength >= 15 && avgSentenceLength <= 20) score += 4;
  else if (avgSentenceLength >= 10 && avgSentenceLength <= 25) score += 2;

  // Avg paragraph length: 3 pts
  const avgParagraphLength = paragraphs.length > 0 ? sentences.length / paragraphs.length : 0;
  if (avgParagraphLength >= 3 && avgParagraphLength <= 5) score += 3;
  else if (avgParagraphLength >= 2 && avgParagraphLength <= 7) score += 1;

  // Flesch-Kincaid grade level: 3 pts
  let fleschKincaidGrade = 0;
  if (words.length > 0 && sentences.length > 0) {
    const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
    fleschKincaidGrade =
      0.39 * (words.length / sentences.length) +
      11.8 * (totalSyllables / words.length) -
      15.59;
    fleschKincaidGrade = Math.round(fleschKincaidGrade * 10) / 10;
  }

  // Ideal for technical-professional content: grade 8–12
  if (fleschKincaidGrade >= 8 && fleschKincaidGrade <= 12) score += 3;
  else if (fleschKincaidGrade >= 6 && fleschKincaidGrade <= 14) score += 2;
  else if (fleschKincaidGrade >= 4 && fleschKincaidGrade <= 16) score += 1;

  return {
    averageSentenceLength: Math.round(avgSentenceLength * 100) / 100,
    paragraphLength: Math.round(avgParagraphLength * 100) / 100,
    fleschKincaidGrade,
    score: Math.min(10, score),
    maxScore: 10,
  };
}

// ─── Links (8 pts) ───────────────────────────────────────────────────

function analyzeLinks(content: string, clusterLinksCount?: number) {
  const allLinks = content.match(/<a[^>]*href=["'][^"']*["'][^>]*>/gi) || [];
  const externalLinkMatches = content.match(/<a[^>]*href=["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  const externalLinks = externalLinkMatches.length;
  const internalLinks = allLinks.length - externalLinks;
  const totalLinks = allLinks.length;
  const clusterLinks = clusterLinksCount || 0;

  let score = 0;
  if (totalLinks >= 3) score += 3;
  else if (totalLinks >= 1) score += 1;

  // Internal links: reduced max from 3 to 2 pts to make room for cluster link bonus
  if (internalLinks >= 3 && internalLinks <= 10) score += 2;
  else if (internalLinks > 10) score += 1;
  else if (internalLinks >= 1) score += 1;

  if (externalLinks >= 1 && externalLinks <= 5) score += 2;
  else if (externalLinks > 5) score += 1;

  // Cluster link bonus: up to 2 pts (replaces 1 pt from internal links max)
  if (clusterLinks >= 2) score += 2;
  else if (clusterLinks >= 1) score += 1;

  return { internalLinks, externalLinks, clusterLinks, score: Math.min(8, score), maxScore: 8 };
}

// ─── Fact Density (15 pts) ──────────────────────────────────────────

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

  // Count numerical data points
  const numericalMatches = textContent.match(NUMERICAL_PATTERN) || [];
  const numericalDataPoints = new Set(numericalMatches.map((m) => m.trim().toLowerCase())).size;

  // Count named specifics (clause numbers, regulation sections)
  const clauseMatches = textContent.match(CLAUSE_PATTERN) || [];
  const namedSpecifics = new Set(clauseMatches.map((m) => m.trim().toLowerCase())).size;

  let score = 0;

  // Citations: 0–6 pts
  if (citations >= 7) score += 6;
  else if (citations >= 5) score += 5;
  else if (citations >= 3) score += 4;
  else if (citations >= 1) score += 2;

  // Numerical data points: 0–5 pts
  if (numericalDataPoints >= 8) score += 5;
  else if (numericalDataPoints >= 5) score += 4;
  else if (numericalDataPoints >= 3) score += 3;
  else if (numericalDataPoints >= 1) score += 1;

  // Named specifics: 0–4 pts
  if (namedSpecifics >= 5) score += 4;
  else if (namedSpecifics >= 3) score += 3;
  else if (namedSpecifics >= 1) score += 2;

  return {
    citations,
    numericalDataPoints,
    namedSpecifics,
    score: Math.min(15, score),
    maxScore: 15,
  };
}

// ─── Business Relevance (8 pts) ─────────────────────────────────────

const COST_LANGUAGE_PATTERNS = [
  /\$[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|thousand|M|B|K))?\b/gi,
  /\bcost(?:s|ing)?\s+of\b/gi,
  /\b(?:penalty|penalties|fine|fines)\b/gi,
  /\bROI\b/gi,
  /\b(?:savings?|save)\b/gi,
  /\bremediation\b/gi,
  /\bbudget\b/gi,
];

const CONSEQUENCE_LANGUAGE_PATTERNS = [
  /\baudit\s+fail(?:ure|ed|s|ing)?\b/gi,
  /\bwarning\s+letter/gi,
  /\bproduction\s+(?:delay|downtime|halt|shutdown)/gi,
  /\brecall(?:s|ed)?\b/gi,
  /\blost\s+(?:contract|revenue|business)/gi,
  /\bnonconformance|non-conformance/gi,
  /\bde-?listing\b/gi,
  /\bscrap(?:ped)?\b/gi,
  /\brework\b/gi,
  /\bconsent\s+decree/gi,
];

const DECISION_MAKER_PATTERNS = [
  /\bquality\s+manager/gi,
  /\brisk\s+management/gi,
  /\bbottom\s+line/gi,
  /\bcompetitive\s+advantage/gi,
  /\bplant\s+manager/gi,
  /\bcompliance\s+officer/gi,
  /\bcost\s+of\s+quality/gi,
  /\bbudget\s+justification/gi,
];

function analyzeBusinessRelevance(content: string) {
  const textContent = stripHTML(content);

  // Cost/financial language: 0–3 pts
  let costMatches = 0;
  for (const pattern of COST_LANGUAGE_PATTERNS) {
    const matches = textContent.match(pattern);
    if (matches) costMatches += matches.length;
  }
  let costLanguage = 0;
  if (costMatches >= 5) costLanguage = 3;
  else if (costMatches >= 3) costLanguage = 2;
  else if (costMatches >= 1) costLanguage = 1;

  // Business consequence language: 0–3 pts
  let consequenceMatches = 0;
  for (const pattern of CONSEQUENCE_LANGUAGE_PATTERNS) {
    const matches = textContent.match(pattern);
    if (matches) consequenceMatches += matches.length;
  }
  let consequenceLanguage = 0;
  if (consequenceMatches >= 5) consequenceLanguage = 3;
  else if (consequenceMatches >= 3) consequenceLanguage = 2;
  else if (consequenceMatches >= 1) consequenceLanguage = 1;

  // Decision-maker framing: 0–2 pts
  let decisionMakerMatches = 0;
  for (const pattern of DECISION_MAKER_PATTERNS) {
    const matches = textContent.match(pattern);
    if (matches) decisionMakerMatches += matches.length;
  }
  let decisionMakerFraming = 0;
  if (decisionMakerMatches >= 3) decisionMakerFraming = 2;
  else if (decisionMakerMatches >= 1) decisionMakerFraming = 1;

  const score = costLanguage + consequenceLanguage + decisionMakerFraming;

  return {
    costLanguage,
    consequenceLanguage,
    decisionMakerFraming,
    score: Math.min(8, score),
    maxScore: 8,
  };
}
