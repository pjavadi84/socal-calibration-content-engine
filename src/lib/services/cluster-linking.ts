/**
 * Cluster Linking Service
 * Injects internal links between articles in the same pillar/category
 * to build topical authority signals for search engines.
 */

export interface SiblingArticle {
  id: string;
  title: string;
  slug: string;
  primary_keyword: string | null;
}

/**
 * Get significant words from a title (4+ chars, excluding common stop words).
 */
function getSignificantTitleWords(title: string): string[] {
  const stopWords = new Set([
    'about', 'after', 'also', 'been', 'before', 'being', 'between',
    'both', 'could', 'does', 'doing', 'down', 'during', 'each',
    'even', 'every', 'from', 'have', 'having', 'here', 'into',
    'just', 'like', 'made', 'make', 'many', 'more', 'most', 'much',
    'must', 'need', 'only', 'other', 'over', 'same', 'should',
    'some', 'such', 'than', 'that', 'their', 'them', 'then',
    'there', 'these', 'they', 'this', 'those', 'through', 'under',
    'very', 'want', 'well', 'were', 'what', 'when', 'where',
    'which', 'while', 'will', 'with', 'would', 'your',
  ]);

  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length >= 4 && !stopWords.has(w));
}

/**
 * Check if a position in the HTML is inside an existing <a> tag or heading.
 */
function isInsideTagAtPosition(html: string, position: number): boolean {
  // Check if inside an <a> tag
  const beforeText = html.substring(0, position);
  const lastAOpen = beforeText.lastIndexOf('<a ');
  const lastAClose = beforeText.lastIndexOf('</a>');
  if (lastAOpen > lastAClose) return true;

  // Check if inside a heading tag
  const headingOpenPattern = /<h[1-6][^>]*>/gi;
  const headingClosePattern = /<\/h[1-6]>/gi;
  let match: RegExpExecArray | null;
  let lastHeadingOpen = -1;
  let lastHeadingClose = -1;

  while ((match = headingOpenPattern.exec(beforeText)) !== null) {
    lastHeadingOpen = match.index;
  }
  while ((match = headingClosePattern.exec(beforeText)) !== null) {
    lastHeadingClose = match.index;
  }
  if (lastHeadingOpen > lastHeadingClose) return true;

  return false;
}

/**
 * Inject cluster links into article body HTML.
 * Links sibling articles by matching their primary keywords or title words
 * in the content.
 *
 * @param bodyHtml - The article body HTML
 * @param siblings - Related articles in the same pillar/category
 * @param maxLinks - Maximum number of cluster links to inject (default: 3)
 * @returns The enriched HTML and count of links added
 */
export function injectClusterLinks(
  bodyHtml: string,
  siblings: SiblingArticle[],
  maxLinks: number = 3
): { enrichedHtml: string; clusterLinksAdded: number } {
  if (siblings.length === 0) {
    return { enrichedHtml: bodyHtml, clusterLinksAdded: 0 };
  }

  let html = bodyHtml;
  let linksAdded = 0;

  for (const sibling of siblings) {
    if (linksAdded >= maxLinks) break;

    // Build search terms: primary keyword first, then significant title words
    const searchTerms: string[] = [];
    if (sibling.primary_keyword) {
      searchTerms.push(sibling.primary_keyword);
    }
    const titleWords = getSignificantTitleWords(sibling.title);
    // Build 2-word phrases from title for more precise matching
    for (let i = 0; i < titleWords.length - 1; i++) {
      searchTerms.push(`${titleWords[i]} ${titleWords[i + 1]}`);
    }

    let linked = false;
    for (const term of searchTerms) {
      if (linked) break;

      // Case-insensitive search for the term in plain text portions
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(`(?<=>)([^<]*?)(\\b${escapedTerm}\\b)([^<]*?)(?=<)`, 'i');
      const match = pattern.exec(html);

      if (match && match.index !== undefined) {
        const fullMatchStart = match.index;
        // Check we're not inside an <a> or heading
        if (!isInsideTagAtPosition(html, fullMatchStart)) {
          const before = match[1];
          const matchedText = match[2];
          const after = match[3];
          const link = `<a href="/blog/${sibling.slug}">${matchedText}</a>`;
          const replacement = `>${before}${link}${after}<`;

          // Replace only the first occurrence
          html = html.substring(0, fullMatchStart) + replacement + html.substring(fullMatchStart + match[0].length);
          linksAdded++;
          linked = true;
        }
      }
    }
  }

  return { enrichedHtml: html, clusterLinksAdded: linksAdded };
}
