/**
 * Article Image Generation Service
 * Uses Gemini to generate relevant images and places them within article HTML.
 * Images are uploaded to Supabase Storage and inserted after key H2 sections.
 */

import { generateImage } from '@/lib/llm';
import { createServiceClient } from '@/lib/db/client';

interface ImagePlacement {
  heading: string;
  prompt: string;
  insertAfterIndex: number;
}

/**
 * Analyze article HTML and determine where images should be placed.
 * Returns image prompts based on H2 section content.
 */
function determineImagePlacements(
  bodyHtml: string,
  articleTitle: string,
  category: string,
  maxImages: number = 3
): ImagePlacement[] {
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const h2Matches: Array<{ heading: string; index: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = h2Pattern.exec(bodyHtml)) !== null) {
    const headingText = match[1].replace(/<[^>]*>/g, '').trim();
    h2Matches.push({ heading: headingText, index: match.index + match[0].length });
  }

  if (h2Matches.length === 0) return [];

  // Select evenly spaced H2s for image placement
  const placements: ImagePlacement[] = [];
  const step = Math.max(1, Math.floor(h2Matches.length / maxImages));

  for (let i = 0; i < h2Matches.length && placements.length < maxImages; i += step) {
    const h2 = h2Matches[i];

    // Get the paragraph text after this H2 for context
    const afterH2 = bodyHtml.substring(h2.index, h2.index + 500);
    const firstParagraph = afterH2.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const context = firstParagraph
      ? firstParagraph[1].replace(/<[^>]*>/g, '').trim().substring(0, 200)
      : '';

    // Find the end of the first paragraph after this H2
    const paragraphEnd = firstParagraph
      ? h2.index + afterH2.indexOf(firstParagraph[0]) + firstParagraph[0].length
      : h2.index;

    placements.push({
      heading: h2.heading,
      prompt: buildImagePrompt(h2.heading, context, category, placements.length),
      insertAfterIndex: paragraphEnd,
    });
  }

  return placements;
}

/**
 * Image scene types to ensure variety across article images.
 * Alternates between technical/lab settings and customer-facing scenes.
 */
const IMAGE_SCENE_TYPES = [
  {
    type: 'customer-facing',
    directive: `Show a customer-facing scene: a calibration technician on-site at a client's facility, delivering or picking up equipment, consulting with a client, or a friendly handoff moment. Include people — a technician in a company polo interacting with a facility manager or quality engineer. The setting should be a client workspace, loading dock, factory floor, or office — NOT a lab. Convey trust, professionalism, and personal service.`,
  },
  {
    type: 'technical',
    directive: `Show a technical lab or workshop scene: precision instruments being calibrated, a clean metrology lab, close-up of measurement equipment, or a technician performing a calibration procedure. Focus on the equipment, tools, and technical expertise. The setting should be a calibration lab, test bench, or controlled environment.`,
  },
  {
    type: 'business-outcome',
    directive: `Show a business or industry scene: a quality manager reviewing calibration certificates, a manufacturing line with properly calibrated equipment running smoothly, a compliance audit in progress, or a warehouse/facility where calibrated instruments are in active use. Convey the real-world impact of calibration on business operations. Include people in professional or industrial settings.`,
  },
] as const;

/**
 * Build a descriptive prompt for image generation based on section context.
 * Cycles through scene types to create visual variety in articles.
 */
function buildImagePrompt(heading: string, paragraphContext: string, category: string, imageIndex: number): string {
  const scene = IMAGE_SCENE_TYPES[imageIndex % IMAGE_SCENE_TYPES.length];

  return `Subject: "${heading}" in the context of ${category}.

Scene context: ${paragraphContext}

${scene.directive}

The image should look like it belongs in a professional trade publication or corporate website.`;
}

/**
 * Upload an image buffer to Supabase Storage.
 */
async function uploadImage(
  imageData: Buffer,
  mimeType: string,
  articleId: string,
  index: number
): Promise<string> {
  const db = createServiceClient();
  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const fileName = `articles/${articleId}/section-${index}-${Date.now()}.${ext}`;

  const { error } = await db.storage
    .from('assets')
    .upload(fileName, imageData, {
      contentType: mimeType,
      upsert: true,
    });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = db.storage.from('assets').getPublicUrl(fileName);
  return data.publicUrl;
}

/**
 * Generate images for an article and inject them into the HTML.
 * Places images after the first paragraph of selected H2 sections.
 *
 * @returns Updated HTML and count of images added
 */
export async function generateArticleImages(
  bodyHtml: string,
  articleId: string,
  articleTitle: string,
  category: string,
  maxImages: number = 3,
  primaryKeyword?: string
): Promise<{ enrichedHtml: string; imagesAdded: number }> {
  const placements = determineImagePlacements(bodyHtml, articleTitle, category, maxImages);

  if (placements.length === 0) {
    return { enrichedHtml: bodyHtml, imagesAdded: 0 };
  }

  let html = bodyHtml;
  let offset = 0; // Track offset as we insert content
  let imagesAdded = 0;

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];

    try {
      const result = await generateImage(placement.prompt);
      if (!result) continue;

      const imageUrl = await uploadImage(result.imageData, result.mimeType, articleId, i);

      // Build alt text: include primary keyword for Yoast SEO, plus heading context
      const headingClean = placement.heading.replace(/^\d+\.\s*/, '').trim();
      const altText = primaryKeyword
        ? `${primaryKeyword} - ${headingClean}`
        : headingClean;

      const imgTag = `\n<figure class="article-image"><img src="${imageUrl}" alt="${altText}" loading="lazy" /><figcaption>${altText}</figcaption></figure>\n`;

      const insertAt = placement.insertAfterIndex + offset;
      html = html.substring(0, insertAt) + imgTag + html.substring(insertAt);
      offset += imgTag.length;
      imagesAdded++;
    } catch (err) {
      console.error(`Failed to generate image for section "${placement.heading}":`, err);
      // Continue with remaining images
    }
  }

  return { enrichedHtml: html, imagesAdded };
}
