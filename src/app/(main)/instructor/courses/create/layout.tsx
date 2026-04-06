import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/instructor/courses/create',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
