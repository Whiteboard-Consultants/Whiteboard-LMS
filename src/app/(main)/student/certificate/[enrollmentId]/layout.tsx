import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/student/certificate/[enrollmentId]',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
