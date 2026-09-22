import type { Metadata } from 'next';
import { GCC_FAQS } from '@/components/landing/gcc-content';
import { GccLanding } from '@/components/landing/gcc-landing';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata, siteConfig } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Global Career Camp 2026',
  description:
    'Meet global university delegates in person at Bhawanipur Global Campus, Kolkata, on 30 September and 1 October 2026. Free pass.',
  path: '/gcc',
});

const eventSchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationEvent',
  name: 'Global Career Camp 2026',
  description:
    'Map your international education journey with direct, face-to-face access to top global universities and expert career advisors, live on campus.',
  startDate: '2026-09-30T10:00:00+05:30',
  endDate: '2026-10-01',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  isAccessibleForFree: true,
  location: {
    '@type': 'Place',
    name: 'Bhawanipur Global Campus',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kolkata',
      addressCountry: 'IN',
    },
  },
  organizer: [
    {
      '@type': 'Organization',
      name: 'Higher Education Development Centre (HEDC), Bhawanipur Global Campus',
    },
    {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
};

export default function GccPage() {
  const faqSchema = buildFaqPageSchema(GCC_FAQS);

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
      <GccLanding />
    </>
  );
}
