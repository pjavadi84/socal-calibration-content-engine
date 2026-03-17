import fs from 'fs';
import path from 'path';

export interface KnowledgeFileMeta {
  title: string;
  tags: string[];
  pillars: string[];
  categories: string[];
  equipment_types: string[];
  industries: string[];
  last_reviewed: string;
  review_interval_months: number;
  sources: string[];
}

export interface KnowledgeFile {
  filePath: string;
  relativePath: string;
  meta: KnowledgeFileMeta;
  content: string;
}

const KNOWLEDGE_BASE_DIR = path.join(process.cwd(), 'knowledge-base');

let cachedFiles: KnowledgeFile[] | null = null;

function parseFrontmatter(raw: string): { meta: Partial<KnowledgeFileMeta>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, content: raw };
  }

  const yamlBlock = match[1];
  const content = match[2].trim();
  const meta: Record<string, unknown> = {};

  // Simple YAML parser for our known frontmatter structure
  let currentKey = '';
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of yamlBlock.split('\n')) {
    const trimmed = line.trim();

    if (inArray && trimmed.startsWith('- ')) {
      arrayValues.push(trimmed.slice(2).replace(/^["']|["']$/g, ''));
      continue;
    }

    if (inArray) {
      meta[currentKey] = arrayValues;
      inArray = false;
      arrayValues = [];
    }

    const kvMatch = trimmed.match(/^(\w[\w_]*)\s*:\s*(.*)$/);
    if (!kvMatch) continue;

    const key = kvMatch[1];
    let value = kvMatch[2].trim();

    if (value === '') {
      // Next lines are array items
      currentKey = key;
      inArray = true;
      arrayValues = [];
      continue;
    }

    // Inline array: [item1, item2]
    const inlineArrayMatch = value.match(/^\[(.*)\]$/);
    if (inlineArrayMatch) {
      meta[key] = inlineArrayMatch[1]
        .split(',')
        .map((v) => v.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
      continue;
    }

    // Strip quotes
    value = value.replace(/^["']|["']$/g, '');

    // Parse number
    if (/^\d+$/.test(value)) {
      meta[key] = parseInt(value, 10);
    } else {
      meta[key] = value;
    }
  }

  if (inArray) {
    meta[currentKey] = arrayValues;
  }

  return {
    meta: meta as Partial<KnowledgeFileMeta>,
    content,
  };
}

function scanDirectory(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanDirectory(fullPath));
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

export function loadKnowledgeBase(): KnowledgeFile[] {
  if (cachedFiles) return cachedFiles;

  const filePaths = scanDirectory(KNOWLEDGE_BASE_DIR);
  const files: KnowledgeFile[] = [];

  for (const filePath of filePaths) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { meta, content } = parseFrontmatter(raw);

    files.push({
      filePath,
      relativePath: path.relative(KNOWLEDGE_BASE_DIR, filePath),
      meta: {
        title: (meta.title as string) || path.basename(filePath, '.md'),
        tags: (meta.tags as string[]) || [],
        pillars: (meta.pillars as string[]) || [],
        categories: (meta.categories as string[]) || [],
        equipment_types: (meta.equipment_types as string[]) || [],
        industries: (meta.industries as string[]) || [],
        last_reviewed: (meta.last_reviewed as string) || '',
        review_interval_months: (meta.review_interval_months as number) || 12,
        sources: (meta.sources as string[]) || [],
      },
      content,
    });
  }

  cachedFiles = files;
  return files;
}

export function clearKnowledgeCache(): void {
  cachedFiles = null;
}
