/**
 * Practitioner Note Auto-Fill Service
 * Uses Gemini to generate authentic, first-person practitioner observations
 * to replace placeholder comments in article HTML.
 */

import { generateText } from '@/lib/llm';
import { PRACTITIONER_NOTE_PATTERN } from '@/lib/validation/practitioner-notes';

interface PractitionerFillContext {
  pillar: string;
  category: string;
  location: string | null;
  articleTitle: string;
}

/**
 * Extract practitioner note placeholders with their positions in the HTML.
 */
function extractNotesWithPositions(bodyHtml: string): Array<{ fullMatch: string; suggestion: string }> {
  const notes: Array<{ fullMatch: string; suggestion: string }> = [];
  const pattern = new RegExp(PRACTITIONER_NOTE_PATTERN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(bodyHtml)) !== null) {
    notes.push({
      fullMatch: match[0],
      suggestion: match[1].trim(),
    });
  }
  return notes;
}

/**
 * Build a prompt for Gemini to generate a single practitioner observation.
 */
function buildFillPrompt(
  suggestion: string,
  surroundingContext: string,
  ctx: PractitionerFillContext
): string {
  return `You are Pouya Javadi, Co-Founder & Calibration Engineer at SoCal Calibration in Southern California. You have years of hands-on experience calibrating scales, electronic test equipment, medical devices, and dimensional instruments across industries including manufacturing, food processing, aerospace, and pharmaceuticals.

Write a brief, authentic first-person observation for a blog article. This should read like something you'd naturally say based on your real field experience.

ARTICLE CONTEXT:
- Title: ${ctx.articleTitle}
- Topic area: ${ctx.pillar} / ${ctx.category}
${ctx.location ? `- Location: ${ctx.location}` : '- Region: Southern California'}

SURROUNDING ARTICLE TEXT (for tone matching):
${surroundingContext}

THE PLACEHOLDER ASKS FOR:
${suggestion}

RULES:
- Write 2-4 sentences maximum
- Use first person naturally ("In our experience...", "We've seen...", "One thing I always tell clients...")
- Be specific but don't fabricate verifiable details like exact company names or dates
- You CAN use realistic ranges, common scenarios, and typical outcomes you'd see in the field
- Match the tone of the surrounding article text
- Do NOT include any HTML tags — return plain text only
- Do NOT start with "As a calibration engineer" or any similar self-introduction
- Sound like a real person sharing a practical insight, not a textbook`;
}

/**
 * Get surrounding paragraph context around a practitioner note for tone matching.
 */
function getSurroundingContext(bodyHtml: string, noteMatch: string): string {
  const idx = bodyHtml.indexOf(noteMatch);
  if (idx === -1) return '';

  const before = bodyHtml.substring(Math.max(0, idx - 500), idx);
  const after = bodyHtml.substring(idx + noteMatch.length, idx + noteMatch.length + 500);

  // Extract just the text content
  const strip = (html: string) =>
    html.replace(/<[^>]*>/g, ' ').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();

  return strip(before + ' ' + after).substring(0, 400);
}

/**
 * Fill all practitioner note placeholders in an article body using Gemini.
 * Returns the updated HTML and count of notes filled.
 */
export async function fillPractitionerNotes(
  bodyHtml: string,
  ctx: PractitionerFillContext
): Promise<{ filledHtml: string; notesFilled: number }> {
  const notes = extractNotesWithPositions(bodyHtml);

  if (notes.length === 0) {
    return { filledHtml: bodyHtml, notesFilled: 0 };
  }

  let html = bodyHtml;
  let filled = 0;

  for (const note of notes) {
    try {
      const surroundingContext = getSurroundingContext(html, note.fullMatch);
      const prompt = buildFillPrompt(note.suggestion, surroundingContext, ctx);

      const result = await generateText(prompt, {
        systemPrompt:
          'You are a calibration industry professional writing authentic field observations for a technical blog. Be concise, specific, and genuine.',
        temperature: 0.8,
        maxTokens: 512,
      });

      const observation = result.content.trim();

      if (observation) {
        // Replace the HTML comment with a paragraph containing the observation
        html = html.replace(
          note.fullMatch,
          `<p><em>${observation}</em></p>`
        );
        filled++;
      }
    } catch (err) {
      console.error(`Failed to fill practitioner note: "${note.suggestion}"`, err);
      // Leave the placeholder in place — the validation gate will catch it
    }
  }

  return { filledHtml: html, notesFilled: filled };
}
