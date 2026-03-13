import { z } from 'zod';

export const SocialPostSchema = z.object({
  content: z.string().describe('Post text, 2-3 sentences, 150-250 characters'),
  hashtags: z.array(z.string()).describe('3-5 relevant hashtags'),
  call_to_action: z.string().describe('Short CTA'),
});

export type SocialPost = z.infer<typeof SocialPostSchema>;

export type SocialVariant = 'educational' | 'practical' | 'promotional';

interface SocialPromptContext {
  articleTitle: string;
  articleSummary: string;
  location?: string;
  variant: SocialVariant;
}

const VARIANT_INSTRUCTIONS: Record<SocialVariant, string> = {
  educational:
    'Write an informative post that shares a valuable insight or fact from the article. Focus on teaching the reader something they may not know about calibration.',
  practical:
    'Write a practical, actionable post with a tip or advice from the article. Focus on helping the reader solve a problem or improve their calibration practices.',
  promotional:
    'Write a service-focused post that highlights SoCal Calibration\'s expertise and offerings. Mention same-day service, NIST traceability, or free pickup & delivery.',
};

export function buildSocialPostPrompt(ctx: SocialPromptContext): string {
  const locationMention = ctx.location
    ? `Reference ${ctx.location} naturally in the post.`
    : 'Reference Southern California if relevant.';

  return `Write a LinkedIn/Facebook post for SoCal Calibration based on this article.

ARTICLE TITLE: ${ctx.articleTitle}
ARTICLE SUMMARY: ${ctx.articleSummary}

VARIANT: ${ctx.variant}
${VARIANT_INSTRUCTIONS[ctx.variant]}

REQUIREMENTS:
- 2-3 complete sentences (150-250 characters total)
- ${locationMention}
- Include 3-5 relevant hashtags (e.g., #Calibration, #QualityControl, #SoCalManufacturing)
- End with a short call-to-action
- Professional but engaging tone suitable for LinkedIn
- Do NOT use emojis
- Do NOT start with "Did you know" for every post — vary the opening`;
}
