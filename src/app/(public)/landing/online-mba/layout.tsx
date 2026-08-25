import type { Metadata } from 'next';
import { buildFaqPageSchema } from '@/lib/faq-schema';
import { pageMetadata } from '@/lib/seo';

const FAQS = [
  {
    question: 'Is the program-fit consultation really free?',
    answer:
      'Yes — no cost, no obligation, no credit card. The personalised report and 15-minute counsellor debrief are included at no charge.',
  },
  {
    question: "I'm not from a business background — will this work for me?",
    answer:
      'Yes. Many of our partner programmes accept graduates from non-commerce backgrounds. We match you to programmes that fit your academic profile and career goals.',
  },
  {
    question: "How is this different from just Googling 'best online MBA'?",
    answer:
      'Google gives you ranked lists. We give you a counsellor and a personalised shortlist based on your role, budget, timeline, and goals — plus a live debrief.',
  },
  {
    question: 'My timeline is tight — is it too late to apply for this cohort?',
    answer:
      'It depends on the programme. Some have rolling admissions; others have fixed cohort dates. A counsellor will confirm what is still open for your preferred start window.',
  },
  {
    question: 'How many hours a week does the program actually require?',
    answer:
      'Most working professionals plan for roughly 8–12 hours a week, depending on the university and pace.',
  },
  {
    question: "What if I go through the consultation and decide it's not the right fit?",
    answer:
      "That's a perfectly fine outcome. The consultation exists to give you clarity — including clarity that now isn't the right time. No catch, no hard sell.",
  },
] as const;

export const metadata: Metadata = pageMetadata({
  title: 'Online MBA — Free Program-Fit Report',
  description:
    'Still in the same role three years later? Get a free Online MBA program-fit report, ROI projection, and 15-minute counsellor debrief — no obligation.',
  path: '/landing/online-mba',
  openGraph: {
    images: [
      {
        url: '/landing/online_mba_hero.png',
        width: 1200,
        height: 630,
        alt: 'Online MBA career reframe — mid-career professional looking ahead',
      },
    ],
  },
});

export default function OnlineMbaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchema = buildFaqPageSchema(FAQS);

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
