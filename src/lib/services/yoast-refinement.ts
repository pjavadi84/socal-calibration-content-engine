/**
 * Yoast SEO Refinement
 * Post-processes article content after keyword extraction to ensure
 * the primary keyword appears in all Yoast-required positions.
 */

interface RefinementInput {
  title: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
  primaryKeyword: string;
  slug: string;
}

interface RefinementOutput {
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
  slug: string;
}

/**
 * Check if text contains the primary keyword (case-insensitive).
 */
function containsKeyword(text: string, keyword: string): boolean {
  return text.toLowerCase().includes(keyword.toLowerCase());
}

/**
 * Refine meta title to include the primary keyword and stay under 55 characters.
 * Yoast requires the keyphrase at the beginning of the SEO title.
 */
function refineMetaTitle(metaTitle: string, primaryKeyword: string): string {
  if (containsKeyword(metaTitle, primaryKeyword) && metaTitle.length <= 55) {
    return metaTitle;
  }

  const titleKeyword = primaryKeyword
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const suffix = ' | SoCal Calibration';
  const maxContentLen = 55 - suffix.length;

  // Extract useful words from original title that aren't in the keyword
  const cleanTitle = metaTitle
    .replace(/\s*[\|–—:]\s*SoCal Calibration.*$/i, '')
    .replace(/\s*[\|–—]\s*$/i, '')
    .trim();

  const extraWords = cleanTitle.split(' ').filter(w =>
    !primaryKeyword.toLowerCase().includes(w.toLowerCase()) && w.length > 2
  );

  // Try: "Keyword: Extra Words | SoCal Calibration"
  if (titleKeyword.length + 2 < maxContentLen && extraWords.length > 0) {
    const descriptor = extraWords.slice(0, 3).join(' ');
    const candidate = `${titleKeyword}: ${descriptor}${suffix}`;
    if (candidate.length <= 55) return candidate;
  }

  // Fallback: "Keyword | SoCal Calibration"
  const fallback = `${titleKeyword}${suffix}`;
  if (fallback.length <= 55) return fallback;

  // Last resort: just the keyword
  return titleKeyword.substring(0, 55);
}

/**
 * Refine meta description to include the primary keyword and stay under 150 characters.
 */
function refineMetaDescription(metaDescription: string, primaryKeyword: string): string {
  if (containsKeyword(metaDescription, primaryKeyword) && metaDescription.length <= 150) {
    return metaDescription;
  }

  // If keyword is present but too long, trim
  if (containsKeyword(metaDescription, primaryKeyword)) {
    const trimmed = metaDescription.substring(0, 147);
    const atWord = trimmed.lastIndexOf(' ');
    return (atWord > 100 ? trimmed.substring(0, atWord) : trimmed) + '...';
  }

  // Rebuild with keyword at the start
  const kw = primaryKeyword.toLowerCase();
  const cleanDesc = metaDescription
    .replace(/\.\s*$/, '') // remove trailing period
    .trim();

  // Try: "Expert {keyword} services. {trimmed original}."
  const prefix = `Expert ${kw} services. `;
  const maxRemaining = 148 - prefix.length;

  if (maxRemaining > 30) {
    const trimmedOriginal = cleanDesc.substring(0, maxRemaining);
    const atWord = trimmedOriginal.lastIndexOf(' ');
    const final = prefix + (atWord > 20 ? trimmedOriginal.substring(0, atWord) : trimmedOriginal) + '.';
    if (final.length <= 150) return final;
  }

  // Fallback
  return `Expert ${kw} services by SoCal Calibration. NIST-traceable, same-day service in Southern California.`.substring(0, 150);
}

/**
 * Ensure the primary keyword appears in the first <p> tag of the article body.
 */
function refineFirstParagraph(bodyHtml: string, primaryKeyword: string): string {
  // Find the first <p>...</p> anywhere in the HTML (not anchored to start)
  const firstPMatch = bodyHtml.match(/(<p[^>]*>)([\s\S]*?)(<\/p>)/i);
  if (!firstPMatch) return bodyHtml;

  const [fullMatch, openTag, content, closeTag] = firstPMatch;
  const plainText = content.replace(/<[^>]*>/g, '');

  if (containsKeyword(plainText, primaryKeyword)) {
    return bodyHtml; // Already present
  }

  const kw = primaryKeyword.toLowerCase();

  // Strategy: insert a sentence containing the keyword after the first sentence
  const sentences = content.split(/(?<=[.!?])\s+/);
  const keywordSentence = `Proper ${kw} is essential to achieving this.`;

  if (sentences.length >= 2) {
    sentences.splice(1, 0, keywordSentence);
  } else if (sentences.length === 1) {
    // Append after the single sentence
    const trimmed = sentences[0].replace(/\s*$/, '');
    if (/[.!?]$/.test(trimmed)) {
      sentences[0] = `${trimmed} ${keywordSentence}`;
    } else {
      sentences[0] = `${trimmed}. ${keywordSentence}`;
    }
  }

  const newContent = sentences.join(' ');
  return bodyHtml.replace(fullMatch, `${openTag}${newContent}${closeTag}`);
}

/**
 * Ensure the primary keyword appears in at least one H2 subheading.
 */
function refineSubheadings(bodyHtml: string, primaryKeyword: string): string {
  // Check if any H2 already contains the keyword
  const h2Pattern = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  const h2Matches = [...bodyHtml.matchAll(h2Pattern)];

  const hasKeywordInH2 = h2Matches.some(match => {
    const text = match[1].replace(/<[^>]*>/g, '');
    return containsKeyword(text, primaryKeyword);
  });

  if (hasKeywordInH2 || h2Matches.length === 0) {
    return bodyHtml;
  }

  // Add the keyword to the first H2 that doesn't have it
  // Strategy: append "for {Keyword}" or "& {Keyword}" to a short H2
  const kw = primaryKeyword
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const firstH2 = h2Matches[0];
  const h2Text = firstH2[1].replace(/<[^>]*>/g, '').trim();

  // Pick the approach based on heading length
  let newHeading: string;
  if (h2Text.length + kw.length + 5 < 70) {
    // Short enough to append
    newHeading = `${firstH2[1].trim()}: ${kw}`;
  } else {
    // Replace the H2 text with keyword-prefixed version
    newHeading = `${kw} — ${h2Text}`.substring(0, 70);
  }

  return bodyHtml.replace(firstH2[0], `<h2>${newHeading}</h2>`);
}

/**
 * Ensure the slug contains the primary keyword words.
 */
function refineSlug(slug: string, primaryKeyword: string): string {
  const keywordSlug = primaryKeyword
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const keywordWords = keywordSlug.split('-');
  const slugWords = slug.split('-');

  const matches = keywordWords.filter(w => slugWords.includes(w));
  if (matches.length >= Math.ceil(keywordWords.length / 2)) {
    return slug;
  }

  return `${keywordSlug}-${slug}`.substring(0, 75);
}

/**
 * Run all Yoast refinements on article content after keyword extraction.
 */
export function refineForYoast(input: RefinementInput): RefinementOutput {
  let bodyHtml = refineFirstParagraph(input.bodyHtml, input.primaryKeyword);
  bodyHtml = refineSubheadings(bodyHtml, input.primaryKeyword);

  return {
    metaTitle: refineMetaTitle(input.metaTitle, input.primaryKeyword),
    metaDescription: refineMetaDescription(input.metaDescription, input.primaryKeyword),
    bodyHtml,
    slug: refineSlug(input.slug, input.primaryKeyword),
  };
}
