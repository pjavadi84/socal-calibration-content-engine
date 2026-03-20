import { z } from 'zod';

// ─── Schemas ──────────────────────────────────────────────────────────

export const GeneratedArticleSchema = z.object({
  title: z.string().describe('SEO-optimized article title'),
  body_html: z.string().describe('Full article body in HTML with h2, h3, p, a, ul, li tags'),
  meta_title: z.string().describe('SEO meta title (50-60 characters)'),
  meta_description: z.string().describe('SEO meta description (150-160 characters)'),
  h2_structure: z
    .array(z.object({ heading: z.string(), summary: z.string() }))
    .describe('H2 headings with brief summaries'),
  slug_candidates: z
    .array(z.string())
    .describe('3 URL slug options, lowercase, hyphenated'),
  faq: z
    .array(z.object({ question: z.string(), answer: z.string() }))
    .describe('3-5 FAQ items based on the article content'),
  word_count: z.number().describe('Approximate word count of body_html'),
});

export type GeneratedArticle = z.infer<typeof GeneratedArticleSchema>;

export const ExtractedKeywordsSchema = z.object({
  primary_keyword: z.string().describe('Main keyword phrase (location + service)'),
  seo_keywords: z
    .array(z.string())
    .describe('5-8 keywords that appear in the article'),
  long_tail_keywords: z
    .array(z.string())
    .optional()
    .describe('3-5 longer keyword phrases'),
});

export type ExtractedKeywords = z.infer<typeof ExtractedKeywordsSchema>;

// ─── Length Config ────────────────────────────────────────────────────

export const ARTICLE_LENGTH_CONFIG = {
  short: { wordCount: '500-800', h2Count: '2-3', links: '2-3' },
  medium: { wordCount: '1000-1500', h2Count: '3-4', links: '3-5' },
  long: { wordCount: '2000+', h2Count: '4-6', links: '5-8' },
} as const;

export type ArticleLength = keyof typeof ARTICLE_LENGTH_CONFIG;

// ─── Prompt Builders ──────────────────────────────────────────────────

interface ArticlePromptContext {
  pillar: { name: string; description: string };
  category: { name: string; description: string };
  location?: { city: string; state: string; display_name: string } | null;
  internalLinks: Array<{ url: string; anchor_text: string; page_type: string }>;
  targetLength: ArticleLength;
  preGeneratedTitle?: string;
  knowledgeContext?: string | null;
  authoritativeContext?: string | null;
  businessContext?: string | null;
}

export function buildArticlePrompt(ctx: ArticlePromptContext): string {
  const lengthConfig = ARTICLE_LENGTH_CONFIG[ctx.targetLength];

  const locationContext = ctx.location
    ? `
LOCATION CONTEXT:
- City: ${ctx.location.city}, ${ctx.location.state}
- The article should reference this location naturally throughout the content.
- Include local relevance: mention industries, businesses, and regulations specific to this area.
`
    : `
LOCATION CONTEXT:
- This is a general article, not location-specific.
- Reference Southern California broadly where relevant.
`;

  const internalLinksSection =
    ctx.internalLinks.length > 0
      ? `
INTERNAL LINKS (use 3-6 naturally in the article):
${ctx.internalLinks.map((l) => `- ${l.url} — use when mentioning "${l.anchor_text}"`).join('\n')}

When linking, use natural anchor text. Do not force links where they don't fit.
`
      : '';

  const titleInstruction = ctx.preGeneratedTitle
    ? `Use this exact title: "${ctx.preGeneratedTitle}"`
    : 'Generate an SEO-optimized title that includes the primary keyword.';

  const knowledgeSection = ctx.knowledgeContext
    ? `
TECHNICAL REFERENCE MATERIAL:
The following is factual reference material from industry standards, regulations, and equipment specifications. You MUST use this material to ground the article in specific, verifiable facts.

${ctx.knowledgeContext}

CITATION REQUIREMENTS:
- You MUST cite at least 3 specific standards or regulations with clause numbers (e.g., "per ISO/IEC 17025:2017 Clause 6.4" or "as required by 21 CFR 820.72(a)")
- Include at least 2 real numerical values from the reference material (tolerances, accuracy specs, intervals, percentages)
- Reference specific equipment models, standard clause numbers, or regulation sections where relevant
- Do NOT paraphrase generically — use the specific details provided above

PRACTITIONER REVIEW PLACEHOLDERS:
- Insert 2-3 HTML comments where a real-world practitioner observation would strengthen the article
- Format: <!-- PRACTITIONER_NOTE: [suggestion for what to add here, e.g., "Add a specific example of an out-of-tolerance finding from your experience with pressure gauges in food manufacturing"] -->
- Place these where first-hand experience, specific client stories, or regional observations would add unique value
`
    : '';

  const businessSection = ctx.businessContext
    ? `
BUSINESS VALUE FRAMING:
${ctx.businessContext}

BUSINESS CONTEXT USAGE RULES:
- Integrate business impact naturally — do NOT create a separate "Business Case" section
- Lead at least one H2 section with a business problem, then provide the technical solution
- Include at least one specific cost figure, penalty amount, or ROI metric
- Connect technical requirements to business outcomes
- Use pain-point language for decision-makers (quality managers, plant managers, compliance officers)
- Do NOT fabricate financial figures — only use numbers from the reference material
`
    : '';

  const authoritativeSection = ctx.authoritativeContext
    ? `
SUPPLEMENTARY AUTHORITATIVE CONTEXT:
The following data comes from official government sources (FDA, OSHA, Federal Register).
Use these real data points to strengthen the article with current, verifiable information.

${ctx.authoritativeContext}

AUTHORITATIVE DATA USAGE RULES:
- Cite the specific source (e.g., "According to FDA enforcement data...")
- Include specific dates, case numbers, or record identifiers when available
- Do NOT speculate beyond what the data shows
- This data supplements the Technical Reference Material above - reference material takes priority
`
    : '';

  return `You are an expert technical writer specializing in calibration, metrology, and quality assurance. Write a comprehensive, authoritative article for SoCal Calibration's blog.

CONTENT PILLAR: ${ctx.pillar.name}
${ctx.pillar.description}

CATEGORY: ${ctx.category.name}
${ctx.category.description}
${locationContext}
${internalLinksSection}
${knowledgeSection}
${authoritativeSection}
${businessSection}
TITLE: ${titleInstruction}

ARTICLE REQUIREMENTS:
- Target length: ${lengthConfig.wordCount} words
- Include ${lengthConfig.h2Count} H2 sections with H3 subsections where appropriate
- Include ${lengthConfig.links} external links to authoritative sources (NIST, ISO, FDA, industry organizations)
- Write in a professional but approachable tone
- Include specific technical details that demonstrate expertise
- Naturally incorporate calibration terminology and industry jargon
- Balance technical depth with business relevance — every major section should connect to a practical business outcome
- End with a clear call-to-action mentioning SoCal Calibration's services
- Include 3-5 FAQ items that answer common questions about the topic

ABOUT SOCAL CALIBRATION:
- Full name: SoCal Calibration
- Services: NIST-traceable calibration for scales, electronic test equipment, medical devices, dimensional/mechanical instruments
- USP: Same-day or next-day service, free pickup & delivery in Southern California
- Website: socalcalibration.com

HTML FORMAT:
- Use <h2> and <h3> tags for headings (no <h1>, that's the title)
- Use <p> tags for paragraphs
- Use <a href="..." target="_blank" rel="noopener"> for external links
- Use <a href="..."> for internal links (no target="_blank")
- Use <ul><li> for lists
- Use <strong> and <em> for emphasis
- Do NOT include the title in the body HTML

IMPORTANT:
- Do NOT make up statistics or cite non-existent studies
- Do NOT include placeholder URLs — only use real, verifiable URLs
- Do NOT include any author introduction or byline in the article body
- ALL external links must point to real, authoritative websites`;
}

export function buildKeywordExtractionPrompt(
  articleContent: string,
  location?: { city: string; state: string } | null
): string {
  // Truncate to avoid token limits
  const truncated =
    articleContent.length > 5000
      ? articleContent.substring(0, 5000) + '...'
      : articleContent;

  const locationHint = location
    ? `The article is about calibration services in ${location.city}, ${location.state}.`
    : 'The article is about calibration services in Southern California.';

  return `Extract SEO keywords from the following article content.

${locationHint}

CRITICAL RULES:
1. Only include keywords that ACTUALLY APPEAR in the article text
2. Do NOT invent keywords that aren't present in the content
3. The primary keyword should combine the service type with the location (if applicable)
4. SEO keywords should be 5-8 phrases that appear naturally in the text
5. Long-tail keywords should be 3-5 longer phrases from the content

ARTICLE CONTENT:
${truncated}`;
}
