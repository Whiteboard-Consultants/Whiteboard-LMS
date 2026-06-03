import { MetadataRoute } from 'next'

const baseUrl = 'https://www.whiteboardconsultant.com'

/** Public marketing & content paths — kept in sync with sitemap.ts */
const publicAllow = [
  '/',
  '/about',
  '/contact',
  '/apply',
  '/courses',
  '/courses/*',
  '/study-abroad',
  '/study-abroad/*',
  '/blog',
  '/blog/*',
  '/college-admissions',
  '/admissions/*',
  '/mock-tests',
  '/mock-tests/*',
  '/online-programs',
  '/partner-programs',
  '/career-solutions',
  '/career-solutions/*',
  '/landing/*',
  '/faqs',
  '/privacy',
  '/refund-policy',
  '/login',
  '/register',
]

/** App, transactional, and non-production routes */
const disallow = [
  '/admin/*',
  '/api/*',
  '/student/*',
  '/instructor/*',
  '/settings/*',
  '/cart',
  '/cart/*',
  '/auth/*',
  '/private/*',
  '/tmp/*',
  '/demo/*',
  '/courses/*/learn',
  '/courses/*/lessons/*',
  '/category-demo',
  '/test-upload',
  '/test-simple-upload',
  '/debug-upload',
  '/auth-diagnostic',
  '/direct-test',
  '/logout-test',
  '/test-env',
  '/*.json$',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllow,
        disallow,
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: publicAllow,
        disallow,
      },
      {
        userAgent: 'Bingbot',
        allow: publicAllow,
        disallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
