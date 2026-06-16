import type { Metadata } from 'next';
import { APPLICATION_BASE_URL } from '@/lib/application-subdomain';

export const metadata: Metadata = {
  metadataBase: new URL(APPLICATION_BASE_URL),
  robots: {
    index: true,
    follow: true,
  },
};

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
