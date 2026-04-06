import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Take Test | Whiteboard Consultants',
  alternates: {
    canonical: '/student/test/[testId]',
  },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
