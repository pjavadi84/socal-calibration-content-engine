import { generateText } from '@/lib/llm';
import type { AuthoritativeResult } from './types';

const MAX_AUTHORITATIVE_CHARS = 4000;

export async function summarizeApiResults(
  results: AuthoritativeResult[]
): Promise<{ context: string; sources: string[] }> {
  if (results.length === 0) return { context: '', sources: [] };

  const allSources = results.flatMap((r) => r.sourceUrls);

  const rawSummary = results
    .map(
      (r) =>
        `--- ${r.sourceLabel} (${r.resultCount} results) ---\n${JSON.stringify(r.rawData, null, 2).slice(0, 3000)}`
    )
    .join('\n\n');

  const prompt = `Summarize these government data results into factual statements that can be used to enrich a technical article about calibration and compliance.

Include specific numbers, dates, case identifiers, and regulation references. Attribute each fact to its source (e.g., "According to FDA enforcement data..." or "OSHA inspection records show...").

Keep the summary between 200-400 words. Focus on the most significant and recent findings.

RAW GOVERNMENT DATA:
${rawSummary}`;

  const response = await generateText(prompt, {
    systemPrompt:
      'You are a regulatory data analyst. Summarize government API data into clear, factual statements. Never speculate beyond what the data shows. Always include specific identifiers, dates, and numbers.',
    temperature: 0.3,
    maxTokens: 2048,
  });

  const context = response.content.slice(0, MAX_AUTHORITATIVE_CHARS);

  return { context, sources: allSources };
}
