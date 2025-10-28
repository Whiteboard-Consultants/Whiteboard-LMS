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

export const siteConfig = {
  name: "Whiteboard Consultants",
  description: "Transform your academic future with Kolkata's top education consultant. Expert study abroad guidance, IELTS/TOEFL/GMAT/GRE preparation, college admissions, and career counseling.",
  url: "https://www.whiteboardconsultant.com",
  ogImage: "/og-image-home.png",
  links: {
    twitter: "https://twitter.com/whiteboardcons",
    facebook: "https://facebook.com/whiteboardconsultants",
    linkedin: "https://linkedin.com/company/whiteboard-consultants",
    instagram: "https://instagram.com/whiteboardconsultants",
    youtube: "https://youtube.com/@whiteboardconsultants"
  },
  contact: {
    phone: "+91-85830-35656",
    email: "info@whiteboardconsultant.com",
    address: "'My Cube', 6th Floor, Park Plaza, 71, Park Street, Kolkata, WB 700016, India"
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
  const fullTitle = title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`;
  const url = canonical ? `${siteConfig.url}${canonical}` : siteConfig.url;
  const image = ogImage || siteConfig.ogImage;

  return {
    title: fullTitle,
    description,
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
      description,
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
      description,
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