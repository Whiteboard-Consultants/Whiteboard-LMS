/**
 * Schema Markup Utilities for SEO & AI Citations
 * Generates structured data in schema.org format for better search visibility
 */

// Course Schema
export function generateCourseSchema({
  id,
  title,
  description,
  imageUrl,
  price,
  category,
  rating,
  reviewCount,
  studentCount,
  instructorName,
  instructorId,
  duration, // in weeks or days
  skill, // array of skills taught
  learningResourceType = "Course",
  educationalLevel = "BeginnerLevel",
}: {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  category?: string;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  instructorName?: string;
  instructorId?: string;
  duration?: string;
  skill?: string[];
  learningResourceType?: string;
  educationalLevel?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": title,
    "description": description,
    "image": imageUrl,
    "learningResourceType": learningResourceType,
    "educationalLevel": educationalLevel,
    "url": `https://www.whiteboardconsultant.com/courses/${id}`,
    "provider": {
      "@type": "Organization",
      "name": "Whiteboard Consultants",
      "url": "https://www.whiteboardconsultant.com",
      "sameAs": [
        "https://www.whiteboardconsultant.com"
      ]
    },
    "instructor": instructorName ? {
      "@type": "Person",
      "name": instructorName,
      "url": instructorId ? `https://www.whiteboardconsultant.com/instructors/${instructorId}` : undefined
    } : undefined,
    "teaches": skill && skill.length > 0 ? skill : undefined,
    "duration": duration,
    "offers": {
      "@type": "Offer",
      "url": `https://www.whiteboardconsultant.com/courses/${id}`,
      "price": price ? price.toString() : "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "category": category
    },
    "aggregateRating": rating ? {
      "@type": "AggregateRating",
      "ratingValue": rating.toFixed(1),
      "reviewCount": (reviewCount || studentCount || 0),
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "coursePrerequisites": "None",
    "inLanguage": "en-US"
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
      "cssSelector": ["h1", "h2", "p"]
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
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Whiteboard Consultants",
    "url": "https://www.whiteboardconsultant.com",
    "logo": "https://www.whiteboardconsultant.com/logo.png",
    "description": "Education consulting and online learning platform for students worldwide",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "info@whiteboardconsultant.com",
      "availableLanguage": ["en"]
    },
    "sameAs": [
      "https://www.whiteboardconsultant.com"
    ],
    "areaServed": {
      "@type": "Country",
      "name": ["IN", "US", "GB", "AU", "CA"]
    }
  };
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
