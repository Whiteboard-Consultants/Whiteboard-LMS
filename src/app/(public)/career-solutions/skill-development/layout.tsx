import type { Metadata } from 'next';
import { skillDevelopmentFaqs } from '@/lib/skill-development-faqs';
import { buildFaqPageSchema } from '@/lib/faq-schema';

export const metadata: Metadata = {
  title: 'Skill Development & Corporate Training | Whiteboard Consultants',
  description: 'Professional skill development and corporate training programs including leadership, communication, technical skills, and team building.',
  alternates: {
    canonical: '/career-solutions/skill-development',
  },
};

const faqSchema = buildFaqPageSchema(skillDevelopmentFaqs);

export default function SkillDevelopmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
