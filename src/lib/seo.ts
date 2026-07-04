// SEO Configuration and Utilities
import type { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  noindex?: boolean;
  ogImage?: string;
  structuredData?: object;
}

/** Google/Ahrefs display limit; longer descriptions are truncated in SERPs. */
export const META_DESCRIPTION_MAX_LENGTH = 155;

/** SERP title display limit (~600px / ~60 chars). Longer titles are cut in results. */
export const META_TITLE_MAX_LENGTH = 60;

const BRAND_TITLE_SUFFIX = ' | Whiteboard Consultants';

/** Remove brand segments so we never stack "| Whiteboard Consultants" twice. */
function stripBrandFromTitle(title: string): string {
  return title
    .replace(/^\s*Whiteboard Consultants\s*[|–-]\s*/i, '')
    .replace(
      /\s*[|–-]\s*Whiteboard Consultants(?:\s+Blog)?(?:\s*[–-]\s*Your Gateway to Global Education)?\s*$/gi,
      ''
    )
    .replace(/\s*[|–-]\s*Whiteboard Consultants\s*$/gi, '')
    .trim();
}

/**
 * Build a keyword-first title with a single brand suffix, capped for SERPs.
 * Uses `absolute` titles so layout templates cannot append a second brand.
 */
export function pageTitle(
  title: string | null | undefined,
  maxLength = META_TITLE_MAX_LENGTH
): string {
  let clean = stripBrandFromTitle(title ?? '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Whiteboard Consultants';

  const budget = maxLength - BRAND_TITLE_SUFFIX.length;
  if (budget < 12) return clean.slice(0, maxLength);

  // Prefer the primary segment before "|" so secondary taglines don't force truncation
  // of the main keywords (e.g. "Study in Canada from India | Top Canada Consultants").
  if (clean.length > budget && clean.includes('|')) {
    const primary = clean.split('|')[0].trim();
    if (primary.length >= 12) clean = primary;
  }

  if (clean.length <= budget) {
    return `${clean}${BRAND_TITLE_SUFFIX}`;
  }

  // Keep the start (primary keywords); truncate on a word boundary.
  const slice = clean.slice(0, budget);
  const lastSpace = slice.lastIndexOf(' ');
  const lastSep = Math.max(slice.lastIndexOf(':'), slice.lastIndexOf('—'), slice.lastIndexOf('-'));
  const breakAt = Math.max(lastSpace, lastSep);
  const cut = breakAt > budget * 0.5 ? breakAt : budget;
  // Drop dangling prepositions/articles left by truncation
  const primary = slice
    .slice(0, cut)
    .replace(/[\s:–—-]+$/g, '')
    .replace(/\s+\b(in|for|and|or|the|a|an|to|of|with|on|at|by|from)\b$/i, '')
    .trim();
  return `${primary}${BRAND_TITLE_SUFFIX}`;
}

/**
 * Strip HTML and truncate to a SERP-safe meta description length.
 * Fixes Ahrefs "meta description too long" and course pages that dump HTML into meta.
 */
export function metaDescription(
  input: string | null | undefined,
  maxLength = META_DESCRIPTION_MAX_LENGTH
): string {
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

  const budget = maxLength - 1; // room for ellipsis
  const slice = text.slice(0, budget);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > budget * 0.6 ? lastSpace : budget;
  return `${slice.slice(0, cut).trimEnd()}…`;
}

/** Default share image — required for valid Open Graph (Ahrefs). */
export const DEFAULT_OG_IMAGE = {
  url: '/og-image-home.png',
  width: 1200,
  height: 630,
  alt: 'Whiteboard Consultants',
} as const;

function resolveOgImages(
  images: NonNullable<Metadata['openGraph']>['images'] | undefined
): NonNullable<NonNullable<Metadata['openGraph']>['images']> {
  if (Array.isArray(images) && images.length > 0) return images;
  if (images && !Array.isArray(images)) return images;
  return [DEFAULT_OG_IMAGE];
}

/**
 * Full page metadata with SERP-safe title/description and complete Open Graph tags.
 * Ahrefs requires og:title, og:type, og:image, and og:url for "valid Open Graph".
 */
export function pageMetadata({
  title,
  description,
  path,
  openGraphTitle,
  openGraphDescription,
  openGraph,
  ...extra
}: {
  title: string;
  description: string;
  path: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraph?: Omit<NonNullable<Metadata['openGraph']>, 'url'>;
} & Omit<Metadata, 'title' | 'description' | 'alternates' | 'openGraph'>): Metadata {
  const safeTitle = pageTitle(title);
  const safeDescription = metaDescription(description);
  const ogTitleSource =
    typeof openGraphTitle === 'string'
      ? openGraphTitle
      : typeof openGraph?.title === 'string'
        ? openGraph.title
        : title;
  const ogTitle = pageTitle(ogTitleSource);
  const ogDescription = metaDescription(
    typeof openGraphDescription === 'string'
      ? openGraphDescription
      : typeof openGraph?.description === 'string'
        ? openGraph.description
        : description
  );
  const images = resolveOgImages(openGraph?.images);

  return {
    ...extra,
    // absolute avoids layout templates stacking a second brand suffix
    title: { absolute: safeTitle },
    description: safeDescription,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      siteName: 'Whiteboard Consultants',
      ...openGraph,
      title: ogTitle,
      description: ogDescription,
      url: path,
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      ...(typeof extra.twitter === 'object' && extra.twitter ? extra.twitter : {}),
    },
  };
}

export const siteConfig = {
  name: "Whiteboard Consultants",
  description: "Transform your academic future with Kolkata's top education consultant. Expert study abroad guidance, IELTS/TOEFL/Aptitude Test Prep preparation, college admissions, upskilling and career counseling.",
  url: "https://www.whiteboardconsultant.com",
  ogImage: "/og-image-home.png",
  links: {
    twitter: "https://twitter.com/whiteboardcons",
    facebook: "https://www.facebook.com/whiteboardconsultants",
    linkedin: "https://www.linkedin.com/company/whiteboard-consultants",
    instagram: "https://www.instagram.com/whiteboardconsultants",
    youtube: "https://www.youtube.com/@whiteboardconsultants"
  },
  contact: {
    phone: "+91 8583 035656",
    email: "info@whiteboardconsultant.com",
    address: "Park Plaza, 71 Park Street, Floor 6, Kolkata, West Bengal 700016, India"
  }
};

// Common keywords for the education industry
export const commonKeywords = [
  // Primary Keywords
  "education consultant", "study abroad consultants", "IELTS coaching", 
  "TOEFL classes", "overseas education", "career counseling",
  
  // Location-based Keywords (GEO)
  "Kolkata", "West Bengal", "India", "Park Street",
  
  // Service-specific Keywords
  "GMAT preparation", "GRE coaching", "student visa consultation", "public speaking","spoken English", "sales training", "internship programs",
  "university admissions", "test preparation", "academic counseling", "UOW admissions", "campus placement training",

  // Destination Keywords
  "study in USA", "study in Canada", "study in UK", "study in Australia",
  "study in Germany", "study in Ireland", "study in New Zealand", "study in Dubai"
];

// Generate SEO metadata
export function generateSEO({
  title,
  description,
  keywords = [],
  canonical,
  noindex = false,
  ogImage,
  structuredData
}: SEOConfig): Metadata {
  const fullTitle = pageTitle(title);
  const url = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;
  const image = ogImage || siteConfig.ogImage;
  const safeDescription = metaDescription(description);

  return {
    title: { absolute: fullTitle },
    description: safeDescription,
    keywords: [...commonKeywords, ...keywords].join(', '),
    robots: {
      index: !noindex,
      follow: !noindex,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: safeDescription,
      url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: safeDescription,
      images: [image],
      creator: '@whiteboardcons',
    },
    other: structuredData ? {
      'structured-data': JSON.stringify(structuredData)
    } : {},
  };
}

// Course-specific SEO
export function generateCourseSEO(course: {
  title: string;
  description: string;
  category: string;
  instructor: string;
  price?: number;
  rating?: number;
  imageUrl?: string;
}) {
  const keywords = [
    `${course.title} course`,
    `${course.category} training`,
    `online ${course.category}`,
    `${course.instructor} course`,
    "online learning",
    "certification course"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": siteConfig.name,
      "url": siteConfig.url
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructor
    },
    ...(course.price && {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "INR"
      }
    }),
    ...(course.rating && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": course.rating,
        "ratingCount": 100 // This should come from actual data
      }
    })
  };

  return generateSEO({
    title: `${course.title} - Online Course`,
    description: course.description,
    keywords,
    ogImage: course.imageUrl,
    structuredData
  });
}

// Blog post SEO
export function generateBlogSEO(post: {
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: string;
  tags: string[];
  imageUrl?: string;
}) {
  const keywords = [
    ...post.tags,
    post.category,
    "education blog",
    "study abroad tips",
    "test preparation guide"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": siteConfig.name,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteConfig.url}/logo.png`
      }
    },
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    ...(post.imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": post.imageUrl
      }
    })
  };

  return generateSEO({
    title: post.title,
    description: post.excerpt,
    keywords,
    ogImage: post.imageUrl,
    structuredData
  });
}

// Study abroad destination SEO
export function generateDestinationSEO(destination: {
  country: string;
  title: string;
  description: string;
  imageUrl?: string;
}) {
  const keywords = [
    `study in ${destination.country}`,
    `${destination.country} universities`,
    `student visa ${destination.country}`,
    `education in ${destination.country}`,
    `${destination.country} study abroad`,
    "international education",
    "overseas studies"
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Place",
    "name": destination.country,
    "description": destination.description,
    "additionalType": "Study Destination",
    "containedInPlace": {
      "@type": "Country",
      "name": destination.country
    }
  };

  return generateSEO({
    title: `Study in ${destination.country} - ${destination.title}`,
    description: destination.description,
    keywords,
    canonical: `/study-abroad/${destination.country.toLowerCase().replace(/\s+/g, '-')}`,
    ogImage: destination.imageUrl,
    structuredData
  });
}

// FAQ structured data for AEO
export function generateFAQStructuredData(faqs: Array<{question: string; answer: string}>) {
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

// Local business structured data for GEO
export function generateLocalBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": siteConfig.name,
    "image": `${siteConfig.url}/logo.png`,
    "url": siteConfig.url,
    "telephone": siteConfig.contact.phone,
    "email": siteConfig.contact.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "'My Cube', 6th Floor, Park Plaza, 71, Park Street",
      "addressLocality": "Kolkata",
      "addressRegion": "West Bengal",
      "postalCode": "700016",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 22.5574,
      "longitude": 88.3476
    },
    "openingHours": [
      "Mo-Fr 09:00-18:00",
      "Sa 09:00-15:00"
    ],
    "sameAs": Object.values(siteConfig.links),
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 22.5574,
        "longitude": 88.3476
      },
      "geoRadius": "50000" // 50km radius
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Education Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Study Abroad Consultation",
            "description": "Expert guidance for studying abroad"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Test Preparation",
            "description": "IELTS, TOEFL, GMAT, GRE coaching"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Career Counseling",
            "description": "Professional career guidance and counseling"
          }
        }
      ]
    }
  };
}