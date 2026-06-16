import { MetadataRoute } from 'next'
import { getCourses, getPosts } from '@/lib/supabase-data'
import { getTestSeries } from '@/app/instructor/test-series-actions'
import { generateSlug } from '@/lib/slug-utils'
import { APPLICATION_BASE_URL, APPLICATION_PATHS } from '@/lib/application-subdomain'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    },
    {
      url: `${baseUrl}/admissions/deakin-gift-city`,
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

  // Application subdomain lead-gen pages (see /application-sitemap.xml)
  const applicationPages: MetadataRoute.Sitemap = APPLICATION_PATHS.map((path) => ({
    url: `${APPLICATION_BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: path === '/apply' || path === '/uow' ? 0.85 : 0.7,
  }))

  // Career solutions pages
  const careerSolutionsPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/career-solutions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7, // Career solutions important for business
    },
    {
      url: `${baseUrl}/career-solutions/skill-development`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6, // Sub-page with medium priority
    },
    {
      url: `${baseUrl}/career-solutions/internship-programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6, // Sub-page with medium priority
    }
  ]

  // Test and assessment pages
  const testPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/mock-tests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8, // High priority for student services
    },
    {
      url: `${baseUrl}/online-programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7, // Important for program discovery
    },
    {
      url: `${baseUrl}/partner-programs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8, // High priority for partnership programs
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
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6, // FAQ page important for user support
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    }
  ]

  // Published course detail pages
  let coursePages: MetadataRoute.Sitemap = []
  try {
    const courses = await getCourses({ publishedOnly: true })
    coursePages = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.createdAt ? new Date(course.createdAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  }

  // Published mock test series pages
  let mockTestSeriesPages: MetadataRoute.Sitemap = []
  try {
    const seriesResult = await getTestSeries({ isPublished: true })
    if (seriesResult.success && seriesResult.data) {
      mockTestSeriesPages = seriesResult.data.map((series) => ({
        url: `${baseUrl}/mock-tests/${encodeURIComponent(generateSlug(series.title))}`,
        lastModified: series.updatedAt
          ? new Date(series.updatedAt)
          : series.createdAt
            ? new Date(series.createdAt)
            : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Error fetching mock test series for sitemap:', error)
  }

  // Fetch all published blog posts dynamically
  let blogPostPages: MetadataRoute.Sitemap = []
  try {
    const posts = await getPosts()
    blogPostPages = posts.map(post => ({
      url: `${baseUrl}/blog/${encodeURIComponent(post.slug)}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : (post.created_at ? new Date(post.created_at) : new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.7, // Good priority for blog content
    }))
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
    // Continue without blog posts if there's an error
  }

  return [
    ...staticPages,
    ...destinationPages,
    ...applicationPages,
    ...careerSolutionsPages,
    ...testPages,
    ...coursePages,
    ...mockTestSeriesPages,
    ...blogPostPages,
    ...userPages,
    ...supportPages
  ]
}