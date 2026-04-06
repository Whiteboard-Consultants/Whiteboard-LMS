import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Internship Programs | Whiteboard Consultants',
  description: 'Gain hands-on experience with our internship programs in graphic design, sales, marketing, SEO, development, and more. Launch your career today.',
  alternates: {
    canonical: '/career-solutions/internship-programs',
  },
};

export default function InternshipProgramsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
