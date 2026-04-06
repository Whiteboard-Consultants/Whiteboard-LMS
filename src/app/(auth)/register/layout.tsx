import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register | Whiteboard Consultants',
  description: 'Create your Whiteboard Consultants account to access courses, practice tests, and expert education guidance.',
  alternates: {
    canonical: '/auth/register',
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
