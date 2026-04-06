import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: {
    canonical: '/instructor/dashboard',
  },
};

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
