import type { Metadata } from 'next';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { CampusPlacementLanding } from '@/components/landing/campus-placement-landing';
import { pageMetadata } from '@/lib/seo';

const FAQS = [
  {
    question: 'Is the Career Compass Assessment really free?',
    answer:
      'Yes. Completely free — no credit card, no hidden charges, no catch. The assessment, your personalised report, and the 1-on-1 debrief call are all included at no cost.',
  },
  {
    question: "I'm from a tier-2 or tier-3 college. Will this work for me?",
    answer:
      "Yes — and honestly, this is where the work matters most. The students who benefit most from a clear targeting strategy are those who can't rely on brand recognition alone.",
  },
  {
    question:
      'How is the Batch Program different from the placement training my college already provides?',
    answer:
      'College placement training is designed for the average student. Our programme is built around your specific RIASEC profile — your resume strategy, your target roles, and your mock interview scenarios are personalised to you.',
  },
  {
    question: "My placement season hasn't started yet. Is it too early?",
    answer:
      "It's the perfect time. Students who start preparing 60 to 90 days before their placement season opens consistently outperform those who begin at the last minute.",
  },
  {
    question: 'How much time does the Batch Program require per week?',
    answer:
      'Plan for approximately 2 to 3 hours per week — one session plus preparation and follow-through. The programme is designed to fit around your academic schedule.',
  },
  {
    question: "What if I don't get placed after going through the programme?",
    answer:
      'We prepare our students to the best of our abilities. With an 85% success rate of students securing at least one offer within 90 days, we continue working with you to plug any remaining gaps.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Take the free Career Compass Assessment. It takes 10 minutes. You will receive your report instantly, and a counsellor will reach out to schedule your 1-on-1 debrief within 24 hours.',
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: 'Campus Placement Prep',
  description:
    'Final-year students: know exactly where you stand before placement season. Free Holland Code (RIASEC) assessment, personalised role-fit report, resume direction, and 1-on-1 debrief.',
  path: '/campus-placement',
  openGraph: {
    images: [
      {
        url: '/landing/campus-placement-hero.png',
        width: 1200,
        height: 630,
        alt: 'Campus Placements — student celebrating with offer letter',
      },
    ],
  },
});

export default function ApplicationCampusPlacementPage() {
  const faqSchema = buildFaqPageSchema(FAQS);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CampusPlacementLanding />
    </>
  );
}
