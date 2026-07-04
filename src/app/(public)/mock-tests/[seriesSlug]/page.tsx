import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateSlug } from '@/lib/slug-utils';
import { SeriesDetailClient } from '@/components/series-detail-client';
import { pageMetadata } from '@/lib/seo';
import {
    getCachedMockTestFilterOptions,
    getMockTestsForSeries,
    getPublishedTestSeries,
} from '@/lib/public-page-data';

export const revalidate = 1800;

type SeriesPageProps = {
    params: Promise<{
        seriesSlug: string;
    }>;
};

export async function generateStaticParams() {
    const seriesResult = await getPublishedTestSeries();
    if (!seriesResult.success || !seriesResult.data) return [];

    return seriesResult.data.map((series) => ({
        seriesSlug: encodeURIComponent(generateSlug(series.title)),
    }));
}

export async function generateMetadata(
    { params }: SeriesPageProps
): Promise<Metadata> {
    const { seriesSlug } = await params;
    const decodedSlug = decodeURIComponent(seriesSlug);
    const seriesResult = await getPublishedTestSeries();

    if (!seriesResult.success || !seriesResult.data) {
        return pageMetadata({
            title: 'Mock Tests',
            description: 'Practice with our comprehensive mock test series.',
            path: '/mock-tests',
        });
    }

    const matchingSeries = seriesResult.data.find(
        (s) => generateSlug(s.title) === decodedSlug
    );

    if (!matchingSeries) {
        return pageMetadata({
            title: 'Series Not Found',
            description: 'The test series you are looking for does not exist.',
            path: `/mock-tests/${encodeURIComponent(decodedSlug)}`,
        });
    }

    const path = `/mock-tests/${encodeURIComponent(decodedSlug)}`;
    return pageMetadata({
        title: matchingSeries.title,
        description: matchingSeries.description || `Practice with ${matchingSeries.title} mock tests`,
        path,
        openGraphTitle: matchingSeries.title,
        openGraphDescription: matchingSeries.description,
    });
}

export default async function SeriesPage({ params }: SeriesPageProps) {
    const { seriesSlug } = await params;
    const decodedSlug = decodeURIComponent(seriesSlug);

    const seriesResult = await getPublishedTestSeries();
    if (!seriesResult.success || !seriesResult.data) {
        notFound();
    }

    const matchingSeries = seriesResult.data.find(
        (s) => generateSlug(s.title) === decodedSlug
    );

    if (!matchingSeries) {
        notFound();
    }

    const [testsResult, filterOptionsResult] = await Promise.all([
        getMockTestsForSeries(matchingSeries.id),
        getCachedMockTestFilterOptions(),
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
                "item": "https://www.whiteboardconsultant.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Mock Tests",
                "item": "https://www.whiteboardconsultant.com/mock-tests"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": matchingSeries.title,
                "item": `https://www.whiteboardconsultant.com/mock-tests/${encodeURIComponent(decodedSlug)}`
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
