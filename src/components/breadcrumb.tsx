'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { BreadcrumbStructuredData } from './structured-data'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  // Prepare items with Home as first item
  const breadcrumbItems = [
    { name: 'Home', url: 'https://www.whiteboardconsultant.com/' },
    ...items.map(item => ({
      name: item.name,
      url: `https://www.whiteboardconsultant.com${item.href}`
    }))
  ]

  return (
    <>
      <BreadcrumbStructuredData items={breadcrumbItems} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-1 text-sm text-muted-foreground mb-6 ${className}`}
      >
        <Link 
          href="/" 
          className="flex items-center hover:text-foreground transition-colors"
          aria-label="Go to homepage"
        >
          <Home className="h-4 w-4" />
          <span className="sr-only">Home</span>
        </Link>
        
        {items.map((item, index) => (
          <div key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
            {index === items.length - 1 ? (
              // Last item - current page (not clickable)
              <span 
                className="text-foreground font-medium"
                aria-current="page"
              >
                {item.name}
              </span>
            ) : (
              // Intermediate items - clickable
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </>
  )
}

// Predefined breadcrumb configurations for common pages
export const breadcrumbConfigs = {
  about: [
    { name: 'About Us', href: '/about' }
  ],
  courses: [
    { name: 'Courses', href: '/courses' }
  ],
  studyAbroad: [
    { name: 'Study Abroad', href: '/study-abroad' }
  ],
  studyAbroadCountry: (country: string) => [
    { name: 'Study Abroad', href: '/study-abroad' },
    { name: `Study in ${country}`, href: `/study-abroad/${country.toLowerCase()}` }
  ],
  blog: [
    { name: 'Blog', href: '/blog' }
  ],
  blogPost: (title: string, slug: string) => [
    { name: 'Blog', href: '/blog' },
    { name: title, href: `/blog/${slug}` }
  ],
  courseCategory: (category: string) => [
    { name: 'Courses', href: '/courses' },
    { name: category, href: `/courses/${category.toLowerCase().replace(/\s+/g, '-')}` }
  ],
  course: (courseTitle: string, courseId: string) => [
    { name: 'Courses', href: '/courses' },
    { name: courseTitle, href: `/courses/${courseId}` }
  ],
  contact: [
    { name: 'Contact Us', href: '/contact' }
  ],
  admissions: [
    { name: 'College Admissions', href: '/college-admissions' }
  ],
  uowIndia: [
    { name: 'Admissions', href: '/college-admissions' },
    { name: 'UOW India Partner', href: '/admissions/uow-india' }
  ]
}