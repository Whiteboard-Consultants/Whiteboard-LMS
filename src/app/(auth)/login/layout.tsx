import type { Metadata } from 'next';
import { pageTitle } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: pageTitle('Login') },
  description: 'Login to your Whiteboard Consultants account to access courses, tests, and personalized learning paths.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
