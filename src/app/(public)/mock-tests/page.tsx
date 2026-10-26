import type { Metadata } from 'next';
import { MockTestPageClient } from '@/components/mock-test-page-client';
import { metaDescription, pageMetadata } from '@/lib/seo';
import { getPublishedMockTests } from '@/lib/public-page-data';
import type { Test } from '@/types';

// Cache the full page for 30 minutes. Reading searchParams made every crawler
// request dynamic, which is why AI bots saw multi-second server responses.
export const revalidate = 1800;
export const dynamic = 'force-static';

export const metadata: Metadata = pageMetadata({
    title: 'Mock Tests Aptitude Series',
    description:
    'Practice with our comprehensive mock test series. Quantitative Aptitude, Verbal Ability, Logical Reasoning & Data Interpretation with difficulty levels from Easy to Hard.',
    path: '/mock-tests',
    openGraphTitle: 'Mock Tests Aptitude Series',
    openGraphDescription:
    'Prepare for competitive exams with targeted mock tests across multiple difficulty levels.',
});

function toPublicMockTest(test: Test): Test {
    return {
        id: test.id,
        title: test.title,
        description: metaDescription(test.description, 180),
        duration: test.duration,
        instructorId: test.instructorId,
        instructorName: test.instructorName,
        questionCount: test.questionCount,
        createdAt: test.createdAt,
        type: test.type,
        isTimeLimited: test.isTimeLimited,
        showResults: test.showResults,
        allowReview: test.allowReview,
        seriesId: test.seriesId,
        seriesTitle: test.seriesTitle,
        seriesPrice: test.seriesPrice,
        discountPercentage: test.discountPercentage,
        topic: test.topic,
        difficultyLevel: test.difficultyLevel,
        price: test.price,
        isFree: test.isFree,
    };
}

export default async function MockTestsPage() {
    const testsResult = await getPublishedMockTests();
    const tests = (testsResult.success ? testsResult.data || [] : []).map(toPublicMockTest);

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
            <MockTestPageClient initialTests={tests} />
        </>
    );
}
