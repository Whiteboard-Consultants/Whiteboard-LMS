import type { Metadata } from 'next';
import { internshipProgramsFaqs } from '@/lib/internship-programs-faqs';
import { buildFaqPageSchema } from '@/lib/faq-schema';

export const metadata: Metadata = {
  title: 'Internship Programs | Whiteboard Consultants',
  description: 'Gain hands-on experience with our internship programs in graphic design, sales, marketing, SEO, development, and more. Launch your career today.',
  alternates: {
    canonical: '/career-solutions/internship-programs',
  },
};

const faqSchema = buildFaqPageSchema(internshipProgramsFaqs);

export default function InternshipProgramsLayout({
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
