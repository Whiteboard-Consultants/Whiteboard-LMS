import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSlug } from '@/lib/slug-utils';
import { getTestSeries, searchMockTests, getMockTestFilterOptions } from '@/app/instructor/test-series-actions';
import { SeriesDetailClient } from '@/components/series-detail-client';
import { pageMetadata } from '@/lib/seo';

type SeriesPageProps = {
    params: Promise<{
        seriesSlug: string;
    }>;
};

export async function generateMetadata(
    { params }: SeriesPageProps
): Promise<Metadata> {
    const { seriesSlug } = await params;
    
    // Decode the slug
    const decodedSlug = decodeURIComponent(seriesSlug);
    
    // Fetch all series to find matching one
    const seriesResult = await getTestSeries();
    if (!seriesResult.success || !seriesResult.data) {
        return {
            title: 'Mock Tests | Whiteboard Consultants',
            description: 'Practice with our comprehensive mock test series.',
        };
    }

    const matchingSeries = seriesResult.data.find(
        (s) => generateSlug(s.title) === decodedSlug
    );

    if (!matchingSeries) {
        return {
            title: 'Series Not Found | Whiteboard Consultants',
            description: 'The test series you are looking for does not exist.',
        };
    }

    const path = `/mock-tests/${encodeURIComponent(decodedSlug)}`;
    return pageMetadata({
        title: `${matchingSeries.title} Mock Tests | Whiteboard Consultants`,
        description: matchingSeries.description || `Practice with ${matchingSeries.title} mock tests`,
        path,
        openGraphTitle: `${matchingSeries.title} Mock Tests`,
        openGraphDescription: matchingSeries.description,
    });
}

export default async function SeriesPage({ params }: SeriesPageProps) {
    const { seriesSlug } = await params;
    const decodedSlug = decodeURIComponent(seriesSlug);

    // Fetch all series
    const seriesResult = await getTestSeries();
    if (!seriesResult.success || !seriesResult.data) {
        notFound();
    }

    // Find matching series
    const matchingSeries = seriesResult.data.find(
        (s) => generateSlug(s.title) === decodedSlug
    );

    if (!matchingSeries) {
        notFound();
    }

    // Fetch tests for this series
    const testsResult = await searchMockTests({
        seriesId: matchingSeries.id,
    });

    const tests = testsResult.success ? testsResult.data || [] : [];

    // Fetch filter options for the page
    const filterOptionsResult = await getMockTestFilterOptions();
    const filterOptions = filterOptionsResult.success ? filterOptionsResult.data : null;

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://whiteboard-consultants.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Mock Tests",
                "item": "https://whiteboard-consultants.com/mock-tests"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": matchingSeries.title,
                "item": `https://whiteboard-consultants.com/mock-tests/${encodeURIComponent(decodedSlug)}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <SeriesDetailClient 
                series={matchingSeries}
                tests={tests}
                filterOptions={filterOptions}
            />
        </>
    );
}
