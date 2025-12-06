import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Cleans up HTML by removing unnecessary empty paragraphs
 * Fixes issue where line breaks in text become excessive <p> tags
 * @param html - HTML string to clean
 * @returns Cleaned HTML string
 */
export function cleanupHTMLParagraphs(html: string): string {
  if (!html) return html;
  
  // Remove completely empty paragraphs: <p></p>
  let cleaned = html.replace(/<p>\s*<\/p>/g, '');
  
  // Remove paragraphs with only whitespace or br tags: <p><br></p>, <p>  </p>
  cleaned = cleaned.replace(/<p>[\s<br/>]*<\/p>/g, '');
  
  // Replace multiple consecutive line breaks with max 2
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>');
  
  // Remove excessive space between remaining paragraphs (preserve separation)
  cleaned = cleaned.replace(/<\/p>\s+<p>/g, '</p><p>');
  
  return cleaned;
}
