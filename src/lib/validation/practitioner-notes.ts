/**
 * Practitioner Note Validation
 * Detects unfilled practitioner note placeholders in article HTML.
 * These comments must be resolved before pushing to WordPress.
 */

export const PRACTITIONER_NOTE_PATTERN = /<!--\s*PRACTITIONER_NOTE:\s*([\s\S]*?)-->/g;

/**
 * Check if the article body contains any pending practitioner note placeholders.
 */
export function hasPendingPractitionerNotes(bodyHtml: string): boolean {
  return PRACTITIONER_NOTE_PATTERN.test(bodyHtml);
}

/**
 * Extract the suggestion text from each practitioner note comment.
 */
export function extractPractitionerNotes(bodyHtml: string): string[] {
  const notes: string[] = [];
  // Reset lastIndex since the regex has the global flag
  const pattern = new RegExp(PRACTITIONER_NOTE_PATTERN.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(bodyHtml)) !== null) {
    const suggestion = match[1].trim();
    if (suggestion) {
      notes.push(suggestion);
    }
  }
  return notes;
}
