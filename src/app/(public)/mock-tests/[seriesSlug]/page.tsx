import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { generateSlug } from '@/lib/slug-utils';
import { SeriesDetailClient } from '@/components/series-detail-client';
import { pageMetadata } from '@/lib/seo';
import {
    getCachedMockTestFilterOptions,
    getMockTestsForSeries,
    getPublishedTestSeries,
} from '@/lib/public-page-data';
import type { TestSeries } from '@/types';

export const revalidate = 1800;

type SeriesPageProps = {
    params: Promise<{
        seriesSlug: string;
    }>;
};

/** Exact slug match, then unique prefix match (e.g. campus-recruitment → full series). */
function findSeriesBySlug(
    seriesList: TestSeries[],
    decodedSlug: string
): { series: TestSeries; isExact: boolean } | null {
    const exact = seriesList.find((s) => generateSlug(s.title) === decodedSlug);
    if (exact) return { series: exact, isExact: true };

    const prefixMatches = seriesList.filter((s) =>
        generateSlug(s.title).startsWith(`${decodedSlug}-`)
    );
    if (prefixMatches.length === 1) {
        return { series: prefixMatches[0], isExact: false };
    }

    return null;
}

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

    const match = findSeriesBySlug(seriesResult.data, decodedSlug);

    if (!match) {
        return pageMetadata({
            title: 'Series Not Found',
            description: 'The test series you are looking for does not exist.',
            path: `/mock-tests/${encodeURIComponent(decodedSlug)}`,
            robots: { index: false, follow: true },
        });
    }

    const canonicalSlug = generateSlug(match.series.title);
    const path = `/mock-tests/${encodeURIComponent(canonicalSlug)}`;
    return pageMetadata({
        title: match.series.title,
        description: match.series.description || `Practice with ${match.series.title} mock tests`,
        path,
        openGraphTitle: match.series.title,
        openGraphDescription: match.series.description,
    });
}

export default async function SeriesPage({ params }: SeriesPageProps) {
    const { seriesSlug } = await params;
    const decodedSlug = decodeURIComponent(seriesSlug);

    const seriesResult = await getPublishedTestSeries();
    if (!seriesResult.success || !seriesResult.data) {
        notFound();
    }

    const match = findSeriesBySlug(seriesResult.data, decodedSlug);

    if (!match) {
        notFound();
    }

    const matchingSeries = match.series;
    const canonicalSlug = generateSlug(matchingSeries.title);

    // Short/legacy slugs permanently redirect to the canonical series URL
    if (!match.isExact) {
        permanentRedirect(`/mock-tests/${encodeURIComponent(canonicalSlug)}`);
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
                "item": `https://www.whiteboardconsultant.com/mock-tests/${encodeURIComponent(canonicalSlug)}`
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
