import type { Metadata } from 'next';
import { UowApplicationClient } from '@/components/application/uow-application-client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Apply to UOW India',
  description:
    'Submit your application to University of Wollongong with expert guidance from Whiteboard Consultants. Get assistance throughout the application process.',
  path: '/uow',
});

export default function ApplicationUowPage() {
  return <UowApplicationClient />;
}
