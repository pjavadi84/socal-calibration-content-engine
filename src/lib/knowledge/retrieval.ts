import { loadKnowledgeBase, type KnowledgeFile } from './loader';

const MAX_CONTEXT_CHARS = 12000; // ~4000 tokens at ~3 chars/token

interface RetrievalOptions {
  pillar: string;
  category: string;
  location?: string | null;
  equipmentType?: string | null;
  industry?: string | null;
  pathPrefix?: string;
  maxChars?: number;
}

interface RetrievalResult {
  context: string;
  sources: string[];
}

function normalizeForMatch(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function scoreFile(file: KnowledgeFile, options: RetrievalOptions): number {
  // Path prefix filter — reject files that don't match
  if (options.pathPrefix && !file.relativePath.startsWith(options.pathPrefix)) {
    return -1;
  }

  let score = 0;
  const pillarSlug = normalizeForMatch(options.pillar);
  const categorySlug = normalizeForMatch(options.category);

  // Pillar match
  if (file.meta.pillars.some((p) => normalizeForMatch(p) === pillarSlug || pillarSlug.includes(normalizeForMatch(p)))) {
    score += 3;
  }

  // Category match (strongest signal)
  if (file.meta.categories.some((c) => {
    const normalized = normalizeForMatch(c);
    return normalized === categorySlug || categorySlug.includes(normalized) || normalized.includes(categorySlug);
  })) {
    score += 5;
  }

  // Tag match against category keywords
  const categoryWords = categorySlug.split('-').filter((w) => w.length > 2);
  for (const tag of file.meta.tags) {
    const tagNorm = normalizeForMatch(tag);
    for (const word of categoryWords) {
      if (tagNorm.includes(word) || word.includes(tagNorm)) {
        score += 2;
        break;
      }
    }
  }

  // Equipment type match
  if (options.equipmentType) {
    const eqSlug = normalizeForMatch(options.equipmentType);
    if (file.meta.equipment_types.some((e) => {
      const normalized = normalizeForMatch(e);
      return normalized === eqSlug || eqSlug.includes(normalized) || normalized.includes(eqSlug);
    })) {
      score += 4;
    }
  }

  // Industry match
  if (options.industry) {
    const indSlug = normalizeForMatch(options.industry);
    if (file.meta.industries.includes('all') || file.meta.industries.some((i) => {
      const normalized = normalizeForMatch(i);
      return normalized === indSlug || indSlug.includes(normalized);
    })) {
      score += 3;
    }
  }

  // Regional files get a bonus if location is specified
  if (options.location && file.relativePath.startsWith('regional/')) {
    score += 2;
  }

  return score;
}

function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;

  // Try to cut at a paragraph boundary
  const truncated = content.slice(0, maxChars);
  const lastParagraph = truncated.lastIndexOf('\n\n');
  if (lastParagraph > maxChars * 0.7) {
    return truncated.slice(0, lastParagraph) + '\n\n[... truncated for length]';
  }
  return truncated + '\n\n[... truncated for length]';
}

export function retrieveKnowledge(options: RetrievalOptions): RetrievalResult {
  const files = loadKnowledgeBase();
  const charBudget = options.maxChars ?? MAX_CONTEXT_CHARS;

  // Score and rank all files
  const scored = files
    .map((file) => ({ file, score: scoreFile(file, options) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Build context string within token budget
  let totalChars = 0;
  const selectedFiles: KnowledgeFile[] = [];

  for (const { file } of scored) {
    if (totalChars + file.content.length > charBudget) {
      // Try to fit a truncated version if we have room for at least 1000 chars
      const remaining = charBudget - totalChars;
      if (remaining > 1000) {
        selectedFiles.push({
          ...file,
          content: truncateContent(file.content, remaining),
        });
        totalChars += remaining;
      }
      break;
    }
    selectedFiles.push(file);
    totalChars += file.content.length;
  }

  if (selectedFiles.length === 0) {
    return { context: '', sources: [] };
  }

  // Format context
  const sections = selectedFiles.map(
    (file) =>
      `### ${file.meta.title}\n(Source: ${file.relativePath})\n\n${file.content}`
  );

  const context = sections.join('\n\n---\n\n');
  const sources = selectedFiles.map((f) => f.relativePath);

  return { context, sources };
}
