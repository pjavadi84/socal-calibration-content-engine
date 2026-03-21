/**
 * Content Variation System
 * Deterministically selects system prompts, temperatures, style directives,
 * and article formats based on a seed (pillar+category+location) to produce
 * varied content that resists AI detection patterns.
 */

// ─── System Prompt Variants ──────────────────────────────────────────

export const SYSTEM_PROMPT_VARIANTS = [
  // 1. Technical-authoritative (current baseline voice)
  'You are a technical content writer for SoCal Calibration, a precision calibration company in Southern California. Write authoritative, SEO-optimized articles grounded in real standards, regulations, and technical specifications. Use precise technical language and maintain a formal, expert tone throughout.',

  // 2. Conversational-expert — more contractions, direct address, shorter paragraphs
  'You are a senior calibration engineer writing practical guidance for SoCal Calibration\'s blog. You\'ve spent years in the field and you write the way you\'d explain things to a colleague — direct, clear, and grounded in real experience. Use contractions naturally, address the reader as "you," and keep paragraphs punchy. Every claim must still be backed by real standards and data.',

  // 3. Problem-solution — leads with pain points, then solutions
  'You are a calibration industry consultant writing for SoCal Calibration\'s blog. Your approach: open each section by describing a real problem that quality managers, plant operators, or compliance officers face — then provide the solution grounded in specific standards and best practices. Make readers feel understood before you educate them. Write with authority but empathy.',

  // 4. Narrative-journalistic — scenarios, anecdotes, varied rhythm
  'You are an industry journalist covering calibration and metrology for SoCal Calibration\'s blog. Open with a vivid scenario or case study that pulls readers in. Vary your sentence length — mix short, punchy sentences with longer explanatory ones. Use transitions that feel natural rather than formulaic. Ground everything in verifiable standards and data, but tell it like a story.',
] as const;

// ─── Style Directives ────────────────────────────────────────────────

export const STYLE_DIRECTIVES = [
  // Directive 1: Moderate contractions, balanced voice
  `WRITING STYLE:
- Use contractions occasionally (30-40% of opportunities) for natural flow
- Mix active and passive voice (70/30 active-to-passive ratio)
- Vary paragraph length between 2-5 sentences
- Use standard transition phrases sparingly
- Include one rhetorical question per 500 words`,

  // Directive 2: Heavy contractions, direct voice
  `WRITING STYLE:
- Use contractions freely (60-70% of opportunities)
- Strongly prefer active voice (85/15 ratio)
- Keep most paragraphs to 2-3 sentences
- Minimize formal transition phrases — let ideas flow naturally
- Use rhetorical questions to open at least 2 sections`,

  // Directive 3: Formal, no contractions
  `WRITING STYLE:
- Avoid contractions entirely for a formal register
- Balance active and passive voice evenly (55/45 ratio)
- Use longer paragraphs (3-6 sentences) with detailed explanations
- Use explicit transition phrases between sections
- Avoid rhetorical questions — use declarative statements instead`,

  // Directive 4: Mixed register, varied rhythm
  `WRITING STYLE:
- Use contractions selectively — in explanatory passages but not in citations or technical claims
- Alternate between short declarative sentences and longer compound sentences
- Vary paragraph length dramatically (1 sentence to 5 sentences)
- Use occasional parenthetical asides for emphasis
- Include 1-2 rhetorical questions in the introduction only`,

  // Directive 5: Problem-first, empathetic tone
  `WRITING STYLE:
- Use contractions moderately (40-50% of opportunities)
- Lead explanations with the problem or pain point before the solution
- Keep paragraphs focused — one idea per paragraph (2-4 sentences)
- Use "you" and "your" to address the reader directly
- End key sections with a forward-looking statement or implication`,
] as const;

// ─── Article Formats ─────────────────────────────────────────────────

export const ARTICLE_FORMATS = {
  standard: {
    name: 'standard',
    instructions: '', // Uses default article prompt H2 guidance
  },
  listicle: {
    name: 'listicle',
    instructions: `ARTICLE FORMAT: LISTICLE
- Structure the article as a numbered list (e.g., "5 Critical Reasons...", "7 Steps to...")
- Each H2 should be a numbered item with a descriptive title
- Use 5-8 numbered H2 sections
- Each section should be self-contained but build on the previous
- Open with a brief introduction explaining why this list matters
- Close with a summary tying all items together`,
  },
  'how-to': {
    name: 'how-to',
    instructions: `ARTICLE FORMAT: HOW-TO GUIDE
- Structure the article as a step-by-step guide
- Each H2 should start with an action verb (e.g., "Identify Your Calibration Requirements", "Select the Right Standards")
- Use 4-7 sequential H2 sections representing steps
- Include a "Before You Begin" or "Prerequisites" section at the start
- Each step should include specific, actionable instructions
- End with a "Next Steps" or "Putting It All Together" section`,
  },
} as const;

export type ArticleFormat = keyof typeof ARTICLE_FORMATS;

// ─── Deterministic Selection ─────────────────────────────────────────

/**
 * Simple string hash for deterministic variation selection.
 * Returns a positive integer from a seed string.
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

export interface VariationSelection {
  systemPrompt: string;
  temperature: number;
  styleDirective: string;
  format: ArticleFormat;
  formatInstructions: string;
}

/**
 * Deterministically select a content variation based on a seed string.
 * Same seed always produces the same variation.
 */
export function selectVariation(seed: string): VariationSelection {
  const hash = hashSeed(seed);

  const systemPrompt = SYSTEM_PROMPT_VARIANTS[hash % SYSTEM_PROMPT_VARIANTS.length];

  // Temperature: 0.6 to 0.8 in 0.05 steps (5 options)
  const tempSteps = [0.6, 0.65, 0.7, 0.75, 0.8];
  const temperature = tempSteps[hash % tempSteps.length];

  const styleDirective = STYLE_DIRECTIVES[hash % STYLE_DIRECTIVES.length];

  const formatKeys = Object.keys(ARTICLE_FORMATS) as ArticleFormat[];
  const format = formatKeys[hash % formatKeys.length];
  const formatInstructions = ARTICLE_FORMATS[format].instructions;

  return {
    systemPrompt,
    temperature,
    styleDirective,
    format,
    formatInstructions,
  };
}
