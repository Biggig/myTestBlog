/**
 * Content utility functions for extracting text, stripping HTML,
 * and estimating reading time from TipTap JSON content.
 */

/**
 * Extract plain text from TipTap JSON content (for RSS, excerpts, search, etc.)
 * Walks the TipTap document tree and collects all text nodes.
 */
export function extractTextFromTipTap(json: string): string {
  try {
    const doc = JSON.parse(json);
    const texts: string[] = [];
    function walk(node: Record<string, unknown>) {
      if (node.text) texts.push(node.text as string);
      if (node.content && Array.isArray(node.content)) {
        (node.content as Array<Record<string, unknown>>).forEach(walk);
      }
    }
    walk(doc);
    return texts.join(" ").slice(0, 300);
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
 * Uses ~500 characters per minute (suitable for mixed Chinese/English content).
 * Returns at least 1 minute.
 */
export function estimateReadingTime(json: string): number {
  const text = extractTextFromTipTap(json);
  const charCount = text.length;
  return Math.max(1, Math.ceil(charCount / 500));
}
