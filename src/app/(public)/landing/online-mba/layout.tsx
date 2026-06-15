import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Online MBA Programs 2026 — Advance Your Career Without Pausing Your Life',
  description:
    'Explore accredited online MBA programs for working professionals and fresh graduates. Flexible learning, recognized credentials, and free guidance from Whiteboard Consultants.',
  path: '/landing/online-mba',
});

export default function OnlineMbaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
