import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Resume & Cover Letter Mastery 2026 - Land More Interviews',
  description:
    'Master ATS systems, quantify your achievements, and build a professional brand. Learn the exact strategies used by candidates landing interviews at top companies.',
  path: '/landing/resume-mastery',
});

export default function ResumeMasteryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
