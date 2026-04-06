import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/instructor/reports/[courseId]',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
