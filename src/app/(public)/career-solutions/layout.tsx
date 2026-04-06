import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Career Solutions & Development Programs | Whiteboard Consultants',
  description: 'Internship programs, skill development training, and career advancement opportunities to boost your professional growth with Whiteboard Consultants.',
  alternates: {
    canonical: '/career-solutions',
  },
};

export default function CareerSolutionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
