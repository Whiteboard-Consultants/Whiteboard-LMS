import type { Metadata } from 'next';
import { pageTitle } from '@/lib/seo';

export const metadata: Metadata = {
  title: { absolute: pageTitle('Forgot Password') },
  description: 'Reset your password to regain access to your Whiteboard Consultants account.',
  alternates: {
    canonical: '/forgot-password',
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
