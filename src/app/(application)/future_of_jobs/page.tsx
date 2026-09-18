import type { Metadata } from 'next';
import { FUTURE_OF_JOBS_FAQS } from '@/components/landing/future-of-jobs-content';
import { FutureOfJobsLanding } from '@/components/landing/future-of-jobs-landing';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata, siteConfig } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Future of Jobs — How to Cross the Bridge',
  description:
    'A free 90-minute campus session on what the 2026 entry-level market actually rewards — and the four routes across it. 21 September, Bhawanipur Global Campus.',
  path: '/future_of_jobs',
  openGraph: {
    images: [
      {
        url: '/landing/future-of-jobs-hero.png',
        width: 1200,
        height: 630,
        alt: 'A bridge at sunrise — the crossing from degree to first job',
      },
    ],
  },
});

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationEvent',
  name: 'Future of Jobs: How to Cross the Bridge',
  description:
    'What the 2026 entry-level market actually rewards — and the four routes across it. A free 90-minute session for BBA students.',
  startDate: '2026-09-21',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  isAccessibleForFree: true,
  location: {
    '@type': 'Place',
    name: 'Bhawanipur Global Campus',
  },
  organizer: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
  },
  performer: {
    '@type': 'Person',
    name: 'Navnit Daniel Alley',
  },
};

export default function ApplicationFutureOfJobsPage() {
  const faqSchema = buildFaqPageSchema(FUTURE_OF_JOBS_FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <FutureOfJobsLanding />
    </>
  );
}
