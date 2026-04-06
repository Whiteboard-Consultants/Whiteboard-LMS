import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/student/[courseId]/messaging/[threadId]',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
