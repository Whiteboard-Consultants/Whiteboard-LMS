import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/student/[courseId]/messaging/new',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
