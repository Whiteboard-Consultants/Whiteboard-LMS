import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume & Cover Letter Mastery 2026 - Land More Interviews',
  description: 'Master ATS systems, quantify your achievements, and build a professional brand. Learn the exact strategies used by candidates landing interviews at top companies.',
  alternates: {
    canonical: '/landing/resume-mastery',
  },
};

export default function ResumeMasteryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
