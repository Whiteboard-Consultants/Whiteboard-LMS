import type { Metadata } from 'next';
import ApplicationFormClient from '@/components/application-form-client';

export const metadata: Metadata = {
  title: 'Apply Now | Whiteboard Consultants',
  description:
    'Start your education journey with Whiteboard Consultants. Complete our guided application form and schedule a free counseling callback.',
  alternates: {
    canonical: '/apply',
  },
};

export default function ApplyPage() {
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.whiteboardconsultant.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Apply',
        item: 'https://www.whiteboardconsultant.com/apply',
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
