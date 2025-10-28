'use client'

import Script from 'next/script'

interface StructuredDataProps {
  data: object | object[]
  id?: string
}

export function StructuredData({ data, id }: StructuredDataProps) {
  const jsonLd = Array.isArray(data) ? data : [data]
  
  return (
    <>
      {jsonLd.map((item, index) => (
        <Script
          key={id ? `${id}-${index}` : index}
          id={id ? `${id}-${index}` : `structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item)
          }}
        />
      ))}
    </>
  )
}

// Breadcrumb structured data component
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbStructuredData({ items }: BreadcrumbProps) {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem", 
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  }

  return <StructuredData data={breadcrumbData} id="breadcrumb" />
}

// FAQ structured data component  
interface FAQ {
  question: string
  answer: string
}

interface FAQProps {
  faqs: FAQ[]
}

export function FAQStructuredData({ faqs }: FAQProps) {
  const faqData = {
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
  }

  return <StructuredData data={faqData} id="faq" />
}

// Local Business structured data for GEO SEO
export function LocalBusinessStructuredData() {
  const businessData = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "name": "Whiteboard Consultants",
    "description": "Premier education consultant in Kolkata specializing in study abroad guidance, test preparation, and career counseling",
    "image": "https://www.whiteboardconsultant.com/logo.png",
    "url": "https://www.whiteboardconsultant.com",
    "telephone": "+91-85830-35656",
    "email": "info@whiteboardconsultant.com",
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
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI",
    "areaServed": [
      {
        "@type": "City",
        "name": "Kolkata"
      },
      {
        "@type": "State", 
        "name": "West Bengal"
      },
      {
        "@type": "Country",
        "name": "India"
      }
    ],
    "serviceArea": {
      "@type": "GeoCircle",
      "geoMidpoint": {
        "@type": "GeoCoordinates",
        "latitude": 22.5574,
        "longitude": 88.3476
      },
      "geoRadius": "100000" // 100km radius
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Education Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "EducationalOccupationalProgram",
            "name": "Study Abroad Consultation",
            "description": "Expert guidance for studying in USA, Canada, UK, Australia, Germany, Ireland, New Zealand, and Dubai",
            "provider": {
              "@type": "Organization",
              "name": "Whiteboard Consultants"
            }
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "IELTS Preparation",
            "description": "Comprehensive IELTS coaching for all bands"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course", 
            "name": "TOEFL Preparation",
            "description": "Complete TOEFL training and practice"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "GMAT Preparation", 
            "description": "GMAT coaching for MBA aspirants"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "GRE Preparation",
            "description": "GRE coaching for graduate studies"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Career Counseling",
            "description": "Professional career guidance and educational planning"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "500+",
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": [
      {
        "@type": "Review", 
        "author": {
          "@type": "Person",
          "name": "Student Testimonial"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": "5"
        },
        "reviewBody": "Excellent guidance for studying abroad. Highly professional team."
      }
    ],
    "sameAs": [
      "https://www.facebook.com/whiteboardconsultants",
      "https://www.linkedin.com/company/whiteboard-consultants",
      "https://www.instagram.com/whiteboardconsultants", 
      "https://twitter.com/whiteboardcons"
    ]
  }

  return <StructuredData data={businessData} id="local-business" />
}

// Course structured data
interface CourseStructuredDataProps {
  course: {
    name: string
    description: string
    instructor: string
    price?: number
    rating?: number
    ratingCount?: number
    duration?: string
    category: string
    imageUrl?: string
  }
}

export function CourseStructuredData({ course }: CourseStructuredDataProps) {
  const courseData = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.name,
    "description": course.description,
    "provider": {
      "@type": "Organization",
      "name": "Whiteboard Consultants",
      "url": "https://www.whiteboardconsultant.com"
    },
    "instructor": {
      "@type": "Person",
      "name": course.instructor
    },
    "courseCode": course.category.toUpperCase(),
    "educationalLevel": "Professional",
    "teaches": course.category,
    ...(course.duration && {
      "timeRequired": course.duration
    }),
    ...(course.imageUrl && {
      "image": course.imageUrl
    }),
    ...(course.price && {
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      }
    }),
    ...(course.rating && course.ratingCount && {
      "aggregateRating": {
        "@type": "AggregateRating", 
        "ratingValue": course.rating,
        "ratingCount": course.ratingCount,
        "bestRating": 5,
        "worstRating": 1
      }
    })
  }

  return <StructuredData data={courseData} id="course" />
}

// Article structured data for blog posts
interface ArticleStructuredDataProps {
  article: {
    headline: string
    description: string
    author: string
    datePublished: string
    dateModified?: string
    imageUrl?: string
    category: string
    tags: string[]
  }
}

export function ArticleStructuredData({ article }: ArticleStructuredDataProps) {
  const articleData = {
    "@context": "https://schema.org",
    "@type": "Article", 
    "headline": article.headline,
    "description": article.description,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Whiteboard Consultants",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.whiteboardconsultant.com/logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://www.whiteboardconsultant.com/blog"
    },
    "articleSection": article.category,
    "keywords": article.tags.join(", "),
    ...(article.imageUrl && {
      "image": {
        "@type": "ImageObject",
        "url": article.imageUrl,
        "width": 1200,
        "height": 630
      }
    })
  }

  return <StructuredData data={articleData} id="article" />
}