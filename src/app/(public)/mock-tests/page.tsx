import { Suspense } from 'react';
import type { Metadata } from 'next';
import { MockTestPageClient } from '@/components/mock-test-page-client';
import { searchMockTests, getMockTestFilterOptions } from '@/app/instructor/test-series-actions';

export const revalidate = 1800; // Cache for 30 minutes

export const metadata: Metadata = {
    title: 'Mock Tests & Practice Series | Whiteboard Consultants',
    description: 'Practice with our comprehensive mock test series. Quantitative Aptitude, Verbal Ability, Logical Reasoning & Data Interpretation with difficulty levels from Easy to Hard.',
    alternates: {
        canonical: '/mock-tests',
    },
    openGraph: {
        title: 'Mock Tests & Practice Series',
        description: 'Prepare for competitive exams with targeted mock tests across multiple difficulty levels.',
        url: '/mock-tests',
    },
};

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

export default async function MockTestsPage({ searchParams }: MockTestsPageProps) {
    const params = await searchParams;
    
    // Build filter object from search params
    const filters: any = {};
    if (params?.series) filters.seriesId = params.series;
    if (params?.topic) filters.topic = params.topic;
    if (params?.difficulty) filters.difficultyLevel = params.difficulty;
    if (params?.minPrice) filters.minPrice = parseInt(params.minPrice);
    if (params?.maxPrice) filters.maxPrice = parseInt(params.maxPrice);
    if (params?.instructor) filters.instructorId = params.instructor;

    // Fetch test data and filter options
    const [testsResult, filterOptionsResult] = await Promise.all([
        searchMockTests(filters),
        getMockTestFilterOptions()
    ]);

    const tests = testsResult.success ? testsResult.data || [] : [];
    const filterOptions = filterOptionsResult.success ? filterOptionsResult.data : null;

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
                "name": "Mock Tests",
                "item": "https://whiteboard-consultants-mock.com/mock-tests"
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
