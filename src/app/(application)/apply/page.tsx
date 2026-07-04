import type { Metadata } from 'next';
import ApplicationFormClient from '@/components/application-form-client';
import { pageMetadata } from '@/lib/seo';
import { MAIN_SITE_URL, APPLICATION_BASE_URL } from '@/lib/application-subdomain';

export const metadata: Metadata = pageMetadata({
  title: 'Apply Now',
  description:
    'Start your education journey with Whiteboard Consultants. Complete our guided application form and schedule a free counseling callback.',
  path: '/apply',
});

export default function ApplicationApplyPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: MAIN_SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Apply',
        item: `${APPLICATION_BASE_URL}/apply`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ApplicationFormClient />
    </>
  );
}
