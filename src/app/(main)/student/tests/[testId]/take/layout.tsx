import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/student/tests/[testId]/take',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
