import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/instructor/tests/edit/[testId]',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
