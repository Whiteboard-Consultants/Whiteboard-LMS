
import { Suspense } from 'react';
import { CourseList, CourseListSkeleton } from '@/components/course-list';
import CoursesPageClient from '@/components/course-page-client';
import { CourseCategory } from '@/types';
import type { Metadata } from 'next';
import { coursesFaqs } from '@/lib/courses-faqs';
import { pageMetadata } from '@/lib/seo';
import {
  filterPublishedCourses,
  getCachedCourseCategories,
  getCachedPrograms,
  getCachedPublishedCourses,
} from '@/lib/public-page-data';

// Cache courses list for 30 minutes - Improves TTFB
export const revalidate = 1800;

export const metadata: Metadata = pageMetadata({
  title: 'Test Prep & Career Courses in Kolkata | Whiteboard Consultants',
  description:
    'Expert IELTS, TOEFL, aptitude test prep, and career development programs in Kolkata. Achieve your academic goals with our proven coaching methods.',
  path: '/courses',
  openGraphTitle: 'Explore All Courses | Whiteboard Consultants',
  openGraphDescription:
    'Find the perfect course to advance your academic or professional journey. From test prep to career skills, we have you covered.',
});


type CoursesPageProps = {
  searchParams?: Promise<{
    search?: string;
    category?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
    const params = await searchParams;
    const searchTerm = params?.search || '';
    const category = (params?.category || 'All Programs') as CourseCategory | 'All Programs' | 'Free Courses';

    const [allCourses, categories, programs] = await Promise.all([
      getCachedPublishedCourses(),
      getCachedCourseCategories(),
      getCachedPrograms(),
    ]);
    const courses = filterPublishedCourses(allCourses, { searchTerm, category });

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.whiteboardconsultant.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Courses",
                "item": "https://www.whiteboardconsultant.com/courses"
            }
        ]
    };
    
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": coursesFaqs.map((faq) => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer,
            },
        })),
    };

    const itemListLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Courses Offered by Whiteboard Consultants",
        "itemListElement": courses.map((course, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Course",
                "url": `https://www.whiteboardconsultant.com/courses/${course.id}`,
                "name": course.title,
                "description": course.description,
                "image": course.imageUrl,
                "provider": {
                    "@type": "Organization",
                    "name": "Whiteboard Consultants",
                    "url": "https://www.whiteboardconsultant.com"
                }
            }
        }))
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <CoursesPageClient categories={categories} initialCategory={category} programs={programs}>
                <Suspense fallback={<CourseListSkeleton />}>
                    <CourseList courses={courses} />
                </Suspense>
            </CoursesPageClient>
        </>
    );
}
