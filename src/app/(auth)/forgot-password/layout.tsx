import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forgot Password | Whiteboard Consultants',
  description: 'Reset your password to regain access to your Whiteboard Consultants account.',
  alternates: {
    canonical: '/auth/forgot-password',
  },
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
