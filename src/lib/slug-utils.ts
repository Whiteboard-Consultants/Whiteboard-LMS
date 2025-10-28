export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove special characters except hyphens and alphanumeric
    .replace(/[^\w\-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

export function formatSlugForUrl(slug: string): string {
  // Ensure the slug is URL-safe
  return encodeURIComponent(slug);
}

export function parseSlugFromUrl(slug: string): string {
  // Decode URL-encoded slug
  return decodeURIComponent(slug);
}