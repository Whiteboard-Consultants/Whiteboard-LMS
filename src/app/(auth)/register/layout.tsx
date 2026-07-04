import type { Metadata } from 'next';
import { pageTitle } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: pageTitle('Register') },
  description: 'Create your Whiteboard Consultants account to access courses, practice tests, and expert education guidance.',
  alternates: {
    canonical: '/register',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
