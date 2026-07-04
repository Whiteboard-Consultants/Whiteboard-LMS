import type { Metadata } from 'next';
import ResumeMasteryLanding from '@/app/(public)/landing/resume-mastery/page';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Resume & Cover Letter Mastery 2026',
  description:
    'Master ATS systems, quantify your achievements, and build a professional brand. Learn the exact strategies used by candidates landing interviews at top companies.',
  path: '/resume-mastery',
});

export default function ApplicationResumeMasteryPage() {
  return <ResumeMasteryLanding />;
}
