/**
 * Page templates already render the post title as the sole H1.
 * Demote any H1s in CMS HTML so Ahrefs/Google see a single H1 per page.
 */
export function demoteContentHeadings(html: string): string {
  if (!html) return html;
  return html
    .replace(/<\s*h1(\s[^>]*)?>/gi, '<h2$1>')
    .replace(/<\s*\/\s*h1\s*>/gi, '</h2>');
}

/** Split excerpt into citable takeaway bullets for AI/search snippets */
export function extractKeyTakeaways(excerpt: string, maxItems = 4): string[] {
  const trimmed = excerpt.trim();
  if (!trimmed) return [];

  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);

  if (sentences.length >= 2) {
    return sentences.slice(0, maxItems);
  }

  return [trimmed];
}
