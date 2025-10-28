import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.whiteboardconsultant.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/courses',
          '/study-abroad',
          '/study-abroad/*',
          '/contact',
          '/blog',
          '/blog/*',
          '/college-admissions',
          '/admissions/*'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/student/*',
          '/instructor/*',
          '/auth/*',
          '/settings/*',
          '/cart/*',
          '/*.json$',
          '/private/*',
          '/tmp/*'
        ],
        crawlDelay: 1, // Be respectful to servers
      },
      // Special rules for search engine bots
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/about',
          '/courses',
          '/study-abroad',
          '/study-abroad/*',
          '/contact', 
          '/blog',
          '/blog/*',
          '/college-admissions',
          '/admissions/*'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/student/*',
          '/instructor/*',
          '/auth/*',
          '/settings/*',
          '/cart/*',
          '/private/*'
        ]
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/about',
          '/courses', 
          '/study-abroad',
          '/study-abroad/*',
          '/contact',
          '/blog',
          '/blog/*',
          '/college-admissions'
        ],
        disallow: [
          '/admin/*',
          '/api/*',
          '/student/*', 
          '/instructor/*',
          '/auth/*',
          '/settings/*',
          '/cart/*'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}