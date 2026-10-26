/**
 * Schema Markup Utilities for SEO & AI Citations
 * Generates structured data in schema.org format for better search visibility
 */

import { organizationSameAs, organizationSchema } from '@/lib/organization-schema';
import { siteConfig } from '@/lib/seo';

const SITE_URL = siteConfig.url;

export type CourseSchemaInput = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  originalPrice?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  /** @deprecated Student count is not a review count. Kept so older callers still type-check. */
  studentCount?: number;
  instructorName?: string;
  instructorId?: string;
  duration?: string;
  skill?: string[];
  learningResourceType?: string;
  educationalLevel?: string;
};

/** Plain text for JSON-LD. Course descriptions are stored as HTML. */
export function schemaText(input: string | null | undefined, maxLength = 5000): string {
  if (!input) return '';
  const text = input
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

function coursePageUrl(id: string): string {
  return `${SITE_URL}/courses/${id}`;
}

function absoluteUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('https://') || url.startsWith('http://')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

function formatPrice(price?: number): string {
  if (price == null || Number.isNaN(price)) return '0';
  return String(price);
}

/** ISO 8601 durations only. Free-text lengths are not valid schema.org Duration values. */
function isoDuration(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  return /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?$/.test(trimmed)
    ? trimmed
    : undefined;
}

function aggregateRating(rating?: number, reviewCount?: number) {
  if (rating == null || rating <= 0 || !reviewCount || reviewCount <= 0) return undefined;
  return {
    '@type': 'AggregateRating',
    ratingValue: rating.toFixed(1),
    reviewCount,
    bestRating: '5',
    worstRating: '1',
  };
}

function courseOffer(id: string, price?: number, originalPrice?: number) {
  const activePrice = price ?? 0;
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    url: coursePageUrl(id),
    price: formatPrice(activePrice),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: siteConfig.name,
    },
  };

  if (originalPrice != null && originalPrice > activePrice) {
    offer.priceSpecification = {
      '@type': 'UnitPriceSpecification',
      priceType: 'https://schema.org/StrikethroughPrice',
      price: formatPrice(originalPrice),
      priceCurrency: 'INR',
    };
  }

  return offer;
}

// Course Schema
export function generateCourseSchema({
  id,
  title,
  description,
  imageUrl,
  price,
  originalPrice,
  rating,
  reviewCount,
  instructorName,
  instructorId,
  duration,
  skill,
  learningResourceType = 'Course',
  educationalLevel,
}: CourseSchemaInput) {
  const url = coursePageUrl(id);
  const workload = isoDuration(duration);
  const hasInstance = Boolean(instructorName || workload);

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    '@id': `${url}#course`,
    name: title,
    description: schemaText(description) || title,
    image: absoluteUrl(imageUrl),
    learningResourceType,
    educationalLevel: educationalLevel || undefined,
    url,
    provider: {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#organization`,
      name: siteConfig.name,
      url: SITE_URL,
      sameAs: [...organizationSameAs],
    },
    hasCourseInstance: hasInstance
      ? {
          '@type': 'CourseInstance',
          courseMode: 'online',
          courseWorkload: workload,
          instructor: instructorName
            ? {
                '@type': 'Person',
                name: instructorName,
                url: instructorId ? `${SITE_URL}/instructors/${instructorId}` : undefined,
              }
            : undefined,
        }
      : undefined,
    teaches: skill && skill.length > 0 ? skill : undefined,
    offers: courseOffer(id, price, originalPrice),
    aggregateRating: aggregateRating(rating, reviewCount),
    inLanguage: 'en-IN',
  };
}

/**
 * Product schema for course pages. Ahrefs classifies priced course URLs as
 * product pages and reports "Product page missing Product schema" when only
 * Course markup is present.
 */
export function generateProductSchema({
  id,
  title,
  description,
  imageUrl,
  price,
  originalPrice,
  category,
  rating,
  reviewCount,
}: CourseSchemaInput) {
  const url = coursePageUrl(id);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: title,
    description: schemaText(description) || title,
    image: absoluteUrl(imageUrl),
    sku: id,
    productID: id,
    url,
    category: category || undefined,
    brand: {
      '@type': 'Brand',
      name: siteConfig.name,
    },
    offers: courseOffer(id, price, originalPrice),
    aggregateRating: aggregateRating(rating, reviewCount),
  };
}

// Blog Post Schema
export function generateBlogPostSchema({
  title,
  excerpt,
  content,
  imageUrl,
  authorName,
  authorUrl,
  datePublished,
  dateModified,
  slug,
  category,
  tags,
}: {
  title: string;
  excerpt: string;
  content?: string;
  imageUrl?: string;
  authorName: string;
  authorUrl?: string;
  datePublished: Date;
  dateModified: Date;
  slug: string;
  category?: string;
  tags?: string[];
}) {
  const wordCount = content ? content.split(/\s+/).length : 0;
  
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.whiteboardconsultant.com/blog/${slug}`
    },
    "headline": title,
    "description": excerpt,
    "image": imageUrl ? {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": 1200,
      "height": 630,
      "caption": title
    } : undefined,
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": authorUrl || "https://www.whiteboardconsultant.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Whiteboard Consultants",
      "url": "https://www.whiteboardconsultant.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.whiteboardconsultant.com/logo.png",
        "width": 250,
        "height": 60
      }
    },
    "datePublished": datePublished.toISOString(),
    "dateModified": dateModified.toISOString(),
    "articleBody": content,
    "keywords": tags ? tags.join(", ") : category,
    "wordCount": wordCount,
    "articleSection": category || "Education",
    "inLanguage": "en-US",
    "speakable": {
      "@type": "SpeakableSpecification",
      "cssSelector": ["h1", "[data-ai-summary='true']", "h2", "p"]
    }
  };
}

// Breadcrumb Schema
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
}

// FAQ Schema for Blog FAQs
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// Organization Schema (for site-wide use)
export function generateOrganizationSchema() {
  return organizationSchema;
}

// Review Schema (for testimonials)
export function generateReviewSchema({
  reviewText,
  ratingValue,
  authorName,
  datePublished,
}: {
  reviewText: string;
  ratingValue: number;
  authorName: string;
  datePublished: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": ratingValue.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "reviewBody": reviewText,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "datePublished": datePublished.toISOString()
  };
}

// Remove undefined fields from object
export function cleanSchema(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(cleanSchema).filter(item => item !== undefined);
  } else if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, cleanSchema(value)])
        .filter(([, value]) => value !== undefined)
    );
  }
  return obj;
}
