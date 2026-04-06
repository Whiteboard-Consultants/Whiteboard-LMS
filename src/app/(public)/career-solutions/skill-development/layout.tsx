import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skill Development & Corporate Training | Whiteboard Consultants',
  description: 'Professional skill development and corporate training programs including leadership, communication, technical skills, and team building.',
  alternates: {
    canonical: '/career-solutions/skill-development',
  },
};

export default function SkillDevelopmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
