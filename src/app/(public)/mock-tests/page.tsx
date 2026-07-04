import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MockTestPageClient } from '@/components/mock-test-page-client';
import { pageMetadata } from '@/lib/seo';
import {
    getCachedMockTestFilterOptions,
    getPublishedMockTests,
} from '@/lib/public-page-data';
import type { Test } from '@/types';

export const revalidate = 1800; // Cache for 30 minutes

export const metadata: Metadata = pageMetadata({
    title: 'Mock Tests & Practice Series | Whiteboard Consultants',
    description:
    'Practice with our comprehensive mock test series. Quantitative Aptitude, Verbal Ability, Logical Reasoning & Data Interpretation with difficulty levels from Easy to Hard.',
    path: '/mock-tests',
    openGraphTitle: 'Mock Tests & Practice Series',
    openGraphDescription:
    'Prepare for competitive exams with targeted mock tests across multiple difficulty levels.',
});

type MockTestsPageProps = {
    searchParams?: Promise<{
        series?: string;
        topic?: string;
        difficulty?: string;
        minPrice?: string;
        maxPrice?: string;
        instructor?: string;
    }>;
};

function filterMockTests(
    tests: Test[],
    filters: {
        seriesId?: string;
        topic?: string;
        difficultyLevel?: string;
        minPrice?: number;
        maxPrice?: number;
        instructorId?: string;
    }
): Test[] {
    return tests.filter((test) => {
        if (filters.seriesId && test.seriesId !== filters.seriesId) return false;
        if (filters.topic && test.topic !== filters.topic) return false;
        if (filters.difficultyLevel && test.difficultyLevel !== filters.difficultyLevel) return false;
        if (filters.minPrice !== undefined && (test.price ?? 0) < filters.minPrice) return false;
        if (filters.maxPrice !== undefined && (test.price ?? 0) > filters.maxPrice) return false;
        if (filters.instructorId && test.instructorId !== filters.instructorId) return false;
        return true;
    });
}

export default async function MockTestsPage({ searchParams }: MockTestsPageProps) {
    const params = await searchParams;

    const filters = {
        seriesId: params?.series,
        topic: params?.topic,
        difficultyLevel: params?.difficulty,
        minPrice: params?.minPrice ? parseInt(params.minPrice, 10) : undefined,
        maxPrice: params?.maxPrice ? parseInt(params.maxPrice, 10) : undefined,
        instructorId: params?.instructor,
    };

    const [testsResult, filterOptionsResult] = await Promise.all([
        getPublishedMockTests(),
        getCachedMockTestFilterOptions(),
    ]);

    const allTests = testsResult.success ? testsResult.data || [] : [];
    const tests = filterMockTests(allTests, filters);
    const filterOptions = filterOptionsResult.success ? filterOptionsResult.data : null;

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
                "name": "Mock Tests",
                "item": "https://www.whiteboardconsultant.com/mock-tests"
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <Suspense fallback={<MockTestPageSkeleton />}>
                <MockTestPageClient 
                    initialTests={tests} 
                    filterOptions={filterOptions}
                    initialFilters={{
                        series: params?.series,
                        topic: params?.topic,
                        difficulty: params?.difficulty,
                        minPrice: params?.minPrice ? parseInt(params.minPrice) : undefined,
                        maxPrice: params?.maxPrice ? parseInt(params.maxPrice) : undefined,
                        instructor: params?.instructor
                    }}
                />
            </Suspense>
        </>
    );
}

function MockTestPageSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header skeleton */}
                <div className="mb-8 space-y-4">
                    <div className="h-10 w-64 bg-slate-200 rounded animate-pulse" />
                    <div className="h-5 w-96 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* Filters skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-200 rounded animate-pulse" />
                    ))}
                </div>

                {/* Tests grid skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                            <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
                            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                            <div className="flex justify-between">
                                <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
                                <div className="h-8 w-24 bg-blue-200 rounded animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
