import type { Metadata } from 'next';
import { FUTURE_OF_JOBS_FAQS } from '@/components/landing/future-of-jobs-content';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Future of Jobs — How to Cross the Bridge',
  description:
    'A free 90-minute campus session on what the 2026 entry-level market actually rewards — and the four routes across it. 21 September, Bhawanipur Global Campus.',
  path: '/landing/future_of_jobs',
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

export default function FutureOfJobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = buildFaqPageSchema(FUTURE_OF_JOBS_FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
