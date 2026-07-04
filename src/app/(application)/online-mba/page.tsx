import type { Metadata } from 'next';
import { OnlineMbaLandingClient } from '@/app/(public)/landing/online-mba/client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Online MBA Programs 2026',
  description:
    'Explore accredited online MBA programs for working professionals and fresh graduates. Flexible learning, recognized credentials, and free guidance from Whiteboard Consultants.',
  path: '/online-mba',
});

export default function ApplicationOnlineMbaPage() {
  return <OnlineMbaLandingClient />;
}
