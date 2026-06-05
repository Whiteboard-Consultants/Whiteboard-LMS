import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Career Solutions & Development Programs | Whiteboard Consultants',
  description:
    'Internship programs, skill development training, and career advancement opportunities to boost your professional growth with Whiteboard Consultants.',
  path: '/career-solutions',
});

export default function CareerSolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
