import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login | Whiteboard Consultants',
  description: 'Login to your Whiteboard Consultants account to access courses, tests, and personalized learning paths.',
  alternates: {
    canonical: '/auth/login',
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
