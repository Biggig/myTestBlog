/**
 * Content utility functions for extracting text, stripping HTML,
 * and estimating reading time from TipTap JSON content.
 */

/**
 * Walk a TipTap JSON document and collect all text nodes.
 * Internal helper shared by extractTextFromTipTap and estimateReadingTime.
 */
function walkTipTapText(doc: Record<string, unknown>): string[] {
  const texts: string[] = [];
  function walk(node: Record<string, unknown>) {
    if (node.text) texts.push(node.text as string);
    if (node.content && Array.isArray(node.content)) {
      (node.content as Array<Record<string, unknown>>).forEach(walk);
    }
  }
  walk(doc);
  return texts;
}

/**
 * Extract plain text from TipTap JSON content (for RSS, excerpts, search, etc.)
 * Walks the TipTap document tree, collects all text nodes, and truncates to 300 chars.
 */
export function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json);
    return walkTipTapText(doc).join(" ").slice(0, 300);
  } catch {
    return "";
  }
}

/**
 * Strip HTML tags from a string, collapsing whitespace.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Estimate reading time from TipTap JSON content.
 * Walks the FULL text (no truncation) and uses ~500 characters per minute
 * (suitable for mixed Chinese/English content). Returns at least 1 minute.
 */
export function estimateReadingTime(json: string): number {
  try {
    const doc = JSON.parse(json);
    const charCount = walkTipTapText(doc).join(" ").length;
    return Math.max(1, Math.ceil(charCount / 500));
  } catch {
    return 1;
  }
}
