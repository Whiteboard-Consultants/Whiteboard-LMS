
import { Suspense } from 'react';
import { getCourses, getCourseCategories } from '@/lib/supabase-data';
import { CourseList, CourseListSkeleton } from '@/components/course-list';
import CoursesPageClient from '@/components/course-page-client';
import { CourseCategory, Course } from '@/types';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Test Prep & Career Courses in Kolkata | Whiteboard Consultants',
    description: 'Explore expert-led courses for IELTS, TOEFL, GMAT, GRE, and SAT preparation, alongside career development programs. Achieve your academic and professional goals with Kolkata\'s leading education consultants.',
    alternates: {
        canonical: '/courses',
    },
    openGraph: {
        title: 'Explore All Courses | Whiteboard Consultants',
        description: 'Find the perfect course to advance your academic or professional journey. From test prep to career skills, we have you covered.',
        url: '/courses',
    },
};


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

    const courses: Course[] = await getCourses({ searchTerm, category });
    const categories = await getCourseCategories();

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://whiteboard-consultants-mock.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Courses",
                "item": "https://whiteboard-consultants-mock.com/courses"
            }
        ]
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
                "url": `https://whiteboard-consultants-mock.com/courses/${course.id}`,
                "name": course.title,
                "description": course.description,
                "image": course.imageUrl,
                "provider": {
                    "@type": "Organization",
                    "name": "Whiteboard Consultants",
                    "url": "https://whiteboard-consultants-mock.com"
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
            <CoursesPageClient categories={categories} initialCategory={category}>
                <Suspense fallback={<CourseListSkeleton />}>
                    <CourseList courses={courses} />
                </Suspense>
            </CoursesPageClient>
        </>
    );
}
