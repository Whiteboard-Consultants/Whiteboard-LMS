import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.whiteboardconsultant.com'
  
  // Static pages with high priority (SEO optimized)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0, // Homepage - highest priority
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9, // About page - high importance for trust
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'weekly', // Courses updated regularly
      priority: 0.9, // High priority for business
    },
    {
      url: `${baseUrl}/study-abroad`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // Core service page
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8, // Important for conversions
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily', // Fresh content daily
      priority: 0.8, // Content marketing hub
    },
    {
      url: `${baseUrl}/college-admissions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8, // Key service page
    },
    // Additional service pages for better SEO coverage
    {
      url: `${baseUrl}/admissions/uow-india`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }
  ]

  // Study abroad destination pages (GEO SEO optimization)
  const studyAbroadDestinations = [
    'ireland', 'uk', 'germany', 'usa', 'canada', 'australia', 'dubai', 'new-zealand'
  ]
  
  const destinationPages: MetadataRoute.Sitemap = studyAbroadDestinations.map(destination => ({
    url: `${baseUrl}/study-abroad/${destination}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8, // High priority for destination-specific SEO
  }))

  // Course category pages for better content discovery
  const courseCategoryPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/courses/test-prep`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courses/career-development`, 
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/courses/language-skills`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }
  ]

  // Auth and user pages (lower priority but still indexed)
  const userPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/register`, 
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    }
  ]

  // FAQ and legal pages for completeness
  const supportPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(), 
      changeFrequency: 'yearly',
      priority: 0.4,
    }
  ]

  return [
    ...staticPages,
    ...destinationPages,
    ...courseCategoryPages,
    ...userPages,
    ...supportPages
  ]
}