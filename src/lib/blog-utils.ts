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
