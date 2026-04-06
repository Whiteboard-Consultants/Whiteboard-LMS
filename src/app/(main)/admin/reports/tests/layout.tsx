import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/admin/reports/tests',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
