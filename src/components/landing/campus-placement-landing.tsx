'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ChevronDown,
  ClipboardList,
  Compass,
  FileText,
  MessageCircleQuestion,
  Repeat,
  Upload,
  UserCheck,
} from 'lucide-react';
import { CampusPlacementHeader } from '@/components/landing/campus-placement-header';
import { RIASECModal } from '@/components/riasec/RIASECModal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const PAIN_POINTS = [
  {
    icon: Repeat,
    text: "You're applying to every company on the list with the same resume — and recruiters can tell immediately when an application isn't targeted.",
  },
  {
    icon: UserCheck,
    text: 'Your resume has only ever been reviewed by your seniors or professors — not by someone who has shortlisted candidates.',
  },
  {
    icon: Compass,
    text: "You don't know your Holland Code or RIASEC profile, which means you can't explain what kind of work you're best suited for.",
  },
  {
    icon: FileText,
    text: "You're preparing for interviews before fixing the resume — but the interview never happens if the resume doesn't pass.",
  },
  {
    icon: MessageCircleQuestion,
    text: "When asked 'Why do you want this role?' in an interview, you hesitate. You don't have a strong, specific answer ready.",
  },
];

const DELIVERABLES = [
  {
    title: 'Your RIASEC Profile',
    description:
      'A detailed breakdown of your six Holland Code scores and what they reveal about your working style, strengths, and environment preferences.',
  },
  {
    title: 'Role-Fit Report',
    description:
      'A personalised list of roles and industries that match your profile — with an explanation of why each is a fit. No guessing. No scattergun.',
  },
  {
    title: 'Resume Direction',
    description:
      'A clear picture of what to highlight, what to remove, and how to position your experience so a recruiter sees you in 6 seconds — not past you.',
  },
  {
    title: '1-on-1 Debrief Call',
    description:
      'A counsellor from Whiteboard Consultant walks you through your results, answers your questions, and maps out your next steps. Live. Personal. Free.',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Take the Assessment',
    description:
      'Complete the 10-minute Career Compass Assessment online — no prep required, no prior knowledge needed. Just answer honestly. The assessment is built on the Holland Code framework, used by career professionals worldwide.',
    detail: 'Time required: 10 minutes. Available: anytime, on any device.',
  },
  {
    step: '2',
    title: 'Receive Your Personalised Report',
    description:
      "Your results are ready instantly. You'll receive a full RIASEC breakdown, a list of role and industry matches, and specific guidance on how to position your resume and applications. This isn't a generic report. Every insight is specific to your profile.",
    detail: null,
  },
  {
    step: '3',
    title: 'Build Your Placement Strategy',
    description:
      "A Whiteboard Consultant counsellor contacts you to schedule your free 1-on-1 debrief. Together, you'll review your report, identify the gaps between where you are and where you need to be, and map out a clear 90-day placement strategy. For students who want to go further — this is where the Batch Program begins.",
    detail: null,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I went from zero callbacks in the first two weeks of placement season to two final-round interviews — in six weeks. The resume review alone changed everything. I finally understood what recruiters were actually looking for.',
    name: 'Priya M.',
    detail: 'Final Year, NIT Durgapur',
  },
  {
    quote:
      'I was applying to 30+ companies and getting nowhere. After the Career Compass Assessment, I narrowed it down to 8 roles that actually matched my profile. I got shortlisted in 5. I don\'t think that\'s a coincidence.',
    name: 'Arjun S.',
    detail: 'B.Tech CSE, VIT Vellore',
  },
  {
    quote:
      'The 1-on-1 session before my interview was the thing that made the difference. I walked in knowing exactly what to say when they asked why I wanted the role. I had a real answer — not a rehearsed one.',
    name: 'Sneha R.',
    detail: 'MBA Final Year, Amity University',
  },
];

const STATS = [
  { value: '240+', label: 'students helped across batches' },
  { value: '85%', label: 'of batch students received at least one offer within 90 days' },
  { value: '13', label: 'companies where our students have been placed' },
  { value: '8', label: 'average sessions from assessment to first interview call' },
];

const BATCH_SESSIONS = [
  'Career Compass debrief + role targeting strategy',
  'Resume deep-dive — structure, language, positioning',
  'Resume rewrite + recruiter-eye review',
  'Personal branding — LinkedIn, introduction, narrative',
  'Application strategy — which companies, which roles, in what order',
  'Interview fundamentals — structure, body language, first impressions',
  'Mock interview round 1 — with detailed feedback',
  'Mock interview round 2 — HR + technical + case practice',
  'Offer negotiation basics + what to do when you get the call',
  'Placement day prep — final strategy, mindset, and walkthrough',
];

const GLASS_PANEL =
  'rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-md';
const GLASS_CARD =
  'rounded-xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-700/60 shadow-sm';
const GLASS_CARD_HOVER =
  'hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-white/80 dark:hover:border-slate-600/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300';
const PRIMARY_CARD =
  'rounded-2xl bg-primary text-white shadow-xl border border-white/20 min-w-0 overflow-hidden';
const MOBILE_CTA =
  'w-full max-w-full min-w-0 h-auto py-3 px-4 sm:px-6 whitespace-normal flex-wrap gap-2 text-sm sm:text-base justify-center text-center leading-snug';
const ICON_BOX =
  'flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-blue-500/25 border border-primary/20 dark:border-blue-400/40 flex items-center justify-center';
const ICON_COLOR = 'w-5 h-5 text-primary dark:text-blue-300';
const BADGE_BOX =
  'flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 dark:bg-blue-500/25 border border-primary/20 dark:border-blue-400/40 text-primary dark:text-blue-300 text-sm font-semibold flex items-center justify-center';

const FAQS = [
  {
    question: 'Is the Career Compass Assessment really free?',
    answer:
      'Yes. Completely free — no credit card, no hidden charges, no catch. The assessment, your personalised report, and the 1-on-1 debrief call are all included at no cost. We offer it free because we believe students should have access to real clarity before they make any financial commitment.',
  },
  {
    question: "I'm from a tier-2 or tier-3 college. Will this work for me?",
    answer:
      "Yes — and honestly, this is where the work matters most. The students who benefit most from a clear targeting strategy are those who can't rely on brand recognition alone. Our students come from a wide range of colleges across India. What they have in common isn't the name of their institution — it's that they showed up and did the work.",
  },
  {
    question:
      'How is the Batch Program different from the placement training my college already provides?',
    answer:
      'College placement training is designed for the average student. It gives everyone the same resume template, the same mock interview questions, the same generic advice. Our programme is built around your specific RIASEC profile — your resume strategy, your target roles, and your mock interview scenarios are personalised to you. There is no one-size-fits-all here.',
  },
  {
    question: "My placement season hasn't started yet. Is it too early?",
    answer:
      "It's the perfect time. Students who start preparing 60 to 90 days before their placement season opens consistently outperform those who begin at the last minute. The earlier you know your direction, the more time you have to build a resume, refine your targeting, and practice — without pressure.",
  },
  {
    question: 'How much time does the Batch Program require per week?',
    answer:
      "Plan for approximately 2 to 3 hours per week — one session plus preparation and follow-through. The programme is designed to fit around your academic schedule, not compete with it. We'll share the session schedule in advance so you can plan accordingly.",
  },
  {
    question: "What if I don't get placed after going through the programme?",
    answer:
      'We prepare our students to the best of our abilities and experience. Having a success rate of 85% of students having secured at least 1 offer letter in 90 days does speak for itself. We shall still work on you to plug in the gaps found, if any.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Take the free Career Compass Assessment at whiteboardconsultant.com. It takes 10 minutes. You\'ll receive your report instantly, and a counsellor will reach out to schedule your 1-on-1 debrief within 24 hours.',
  },
];

function CareerCompassCTA({
  className,
  size = 'default',
}: {
  className?: string;
  size?: 'default' | 'large';
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(MOBILE_CTA, className)}
        size={size === 'large' ? 'lg' : 'default'}
      >
        <span>Take the Free Career Compass Assessment</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Button>
      <RIASECModal isOpen={isOpen} onClose={() => setIsOpen(false)} campaign="campus-placement" />
    </>
  );
}

export function CampusPlacementLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <CampusPlacementHeader />

      {/* Section 1 — Hero */}
      <section className="relative bg-primary text-white overflow-hidden pt-28">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute -top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative z-10 min-w-0">
              <span className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-medium mb-6">
                Campus Placements · Your Future. Our Focus.
              </span>

              <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                Campus Placements Are a Few Months Away. Do You Know Exactly Where You Stand?
              </h1>

              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                Most final-year students walk into placement season unprepared — not because they
                aren&apos;t smart, but because no one showed them the gap between where they are and
                what recruiters actually want. We will. For free.
              </p>

              <div className="flex flex-col gap-3 mb-4 max-w-xl">
                <CareerCompassCTA
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                  size="large"
                />
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className={cn(
                    MOBILE_CTA,
                    'border-2 border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary font-semibold backdrop-blur-sm'
                  )}
                >
                  <Link href="/#resume" className="flex flex-wrap items-center justify-center gap-2">
                    <Upload className="h-4 w-4 shrink-0" />
                    <span>Upload Your Resume for a FREE Assessment</span>
                  </Link>
                </Button>
              </div>

              <p className="text-sm text-blue-200">
                Free. No credit card. 10 minutes. Instant results.
              </p>
            </div>

            <div className="relative z-0 min-w-0 lg:pl-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/25">
                <Image
                  src="/landing/campus-placement-hero.png"
                  alt="Student celebrating campus placement success with offer letter"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 — Problem */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl mx-auto p-8 md:p-12 ${GLASS_PANEL}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center text-balance max-w-2xl mx-auto leading-tight">
            Why Bright Students Get Rejected
            <span className="block sm:inline sm:ml-1">in Round&nbsp;1</span>
          </h2>

          <p className="text-lg text-gray-600 dark:text-slate-300 mb-4 leading-relaxed">
            It&apos;s rarely about your CGPA. Recruiters spend an average of 6 seconds deciding
            whether your resume makes the shortlist. Most students never find out why they were
            rejected — they just get a silence where an email should be. Here&apos;s what&apos;s
            happening behind closed doors:
          </p>

          <ul className="space-y-4 my-10">
            {PAIN_POINTS.map((point, index) => {
              const Icon = point.icon;
              return (
                <li
                  key={index}
                  className={`flex gap-4 items-start p-4 ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
                >
                  <div className={ICON_BOX}>
                    <Icon className={ICON_COLOR} />
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed pt-1.5">{point.text}</p>
                </li>
              );
            })}
          </ul>

          <p className="text-lg font-medium text-gray-900 dark:text-white text-center leading-relaxed">
            None of this means you aren&apos;t good enough. It means you haven&apos;t been shown
            what&apos;s missing yet. That&apos;s exactly what we do.
          </p>
        </div>
      </section>

      {/* Section 3 — Solution */}
      <section id="assessment-section" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-16 p-8 md:p-12 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Start With Clarity. The Free Career Compass Assessment.
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
              The Career Compass is a 10-minute Holland Code (RIASEC) assessment — the same
              framework used by career counsellors at top universities worldwide. It maps your
              personality, interests, and working style to the roles and industries where you&apos;re
              most likely to thrive.
            </p>
            <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
              Instead of applying everywhere and hoping something lands, you&apos;ll know exactly
              where to focus — and why you belong there.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {DELIVERABLES.map((item, index) => (
              <div
                key={index}
                className={`p-6 ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mb-4">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className={`text-center p-8 min-w-0 ${GLASS_PANEL}`}>
            <CareerCompassCTA
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
              size="large"
            />
            <p className="text-sm text-gray-500 mt-3">
              Free · 10 minutes · Instant results · 1-on-1 debrief included
            </p>
          </div>
        </div>
      </section>

      {/* Section 4 — How it works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-16 text-center">
            3 Steps to Walk into Placements with Confidence.
          </h2>

          <div className="space-y-6">
            {STEPS.map((item) => (
              <div key={item.step} className={`flex gap-6 p-6 md:p-8 ${GLASS_PANEL} ${GLASS_CARD_HOVER}`}>
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-2">{item.description}</p>
                  {item.detail && (
                    <p className="text-sm text-primary dark:text-blue-300 font-medium">{item.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5 — Social proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-16 p-8 md:p-10 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Happens When Students Stop Guessing.
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-300">
              We don&apos;t measure success by how many students we speak to. We measure it by what
              happens after they walk into that placement room.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {TESTIMONIALS.map((t, index) => (
              <blockquote
                key={index}
                className={`p-6 ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
              >
                <p className="text-gray-700 dark:text-slate-300 leading-relaxed mb-4 italic">&ldquo;{t.quote}&rdquo;</p>
                <footer className="text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">— {t.name}</span>
                  <span className="text-gray-500 dark:text-slate-400"> · {t.detail}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <div
                key={index}
                className={`text-center p-6 ${PRIMARY_CARD} hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2 text-white">{stat.value}</div>
                <p className="text-sm text-blue-100 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6 — Batch program */}
      <section id="batch-section" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className={`max-w-4xl mx-auto p-8 md:p-12 ${GLASS_PANEL}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Ready to Go All In? Join the Placement Prep Batch.
          </h2>

          <p className="text-lg text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
            The free assessment tells you where you stand. The Batch Program gets you where you need
            to be. In 10 structured sessions — with a cohort of peers, live expert guidance, and a
            personalised strategy built around your RIASEC profile — you&apos;ll go from uncertain to
            placement-ready. Not in theory. In practice.
          </p>

          <div className={`p-6 mb-8 ${GLASS_CARD}`}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Who this is for</h3>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              This programme is for final-year students who want a structured, guided path through
              placement season. Students who are willing to do the work, show up consistently, and
              take honest feedback. Not for students looking for a shortcut or a magic formula. If
              that&apos;s you — you&apos;re in the right place.
            </p>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            What&apos;s inside — 10 sessions
          </h3>
          <ol className="space-y-3 mb-8">
            {BATCH_SESSIONS.map((session, index) => (
              <li key={index} className={`flex gap-3 text-gray-700 dark:text-slate-300 p-3 ${GLASS_CARD}`}>
                <span className={BADGE_BOX}>
                  {index + 1}
                </span>
                <span className="pt-0.5">{session}</span>
              </li>
            ))}
          </ol>

          <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-8">
            Most placement training is generic — the same tips for every student, regardless of their
            strengths or target roles. Our batch is built around your Career Compass profile. Your
            resume strategy, your role targeting, your mock interview scenarios — all personalised to
            you. And because you&apos;re working in a cohort, you get the accountability of a peer
            group and the momentum of people going through the same season alongside you.
          </p>

          <div className={`p-8 text-center ${PRIMARY_CARD}`}>
            <div className="text-3xl font-bold mb-1 text-white">₹1,599</div>
            <p className="text-blue-100 mb-4">First 4 Hours FREE</p>
            <p className="text-sm text-blue-100 mb-6">
              Limited seats per batch — we keep numbers small deliberately, so every student gets
              real attention and not a factory-line experience.
            </p>
            <p className="font-semibold text-lg mb-1 text-white">Batch XII starts June 20, 2026.</p>
            <p className="text-sm text-blue-100 mb-8">
              Once the batch is full, the next opening is August 25, 2026.
            </p>
            <Button
              asChild
              size="lg"
              className={cn(MOBILE_CTA, 'bg-red-600 hover:bg-red-700 text-white font-semibold')}
            >
              <Link
                href="/courses/73f0185c-b5c2-4407-8ffe-17eb6a1350e7"
                className="flex flex-wrap items-center justify-center gap-2"
              >
                <span>Reserve Your Seat in Batch XII</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <p className="text-xs text-blue-200 mt-3">
              Limited seats · Starts June 20, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Section 7 — FAQ */}
      <section id="faq-section" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <div className={`text-center mb-10 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Questions We Get Asked Every Day.
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className={`overflow-hidden ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 flex justify-between items-start text-left hover:bg-white/30 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {openFaqIndex === index && (
                  <div className="px-6 pb-6 bg-white/20 dark:bg-slate-900/20 border-t border-white/40 dark:border-slate-700/40 backdrop-blur-sm">
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 — Closing CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Your Placement Season Starts Now. Not When You Feel Ready.
          </h2>

          <p className="text-lg text-blue-100 leading-relaxed mb-4">
            The students who walk out of placement season with an offer letter didn&apos;t get lucky.
            They didn&apos;t have better CGPAs or more impressive colleges. They prepared
            differently. They knew exactly who they were, what they offered, and where they belonged
            — before they walked into a single interview room.
          </p>
          <p className="text-lg text-blue-100 leading-relaxed mb-10">
            That clarity doesn&apos;t come from applying to more companies or updating your resume at
            midnight. It comes from starting with the right foundation. The Career Compass Assessment
            takes 10 minutes. It&apos;s free. And it tells you exactly what you&apos;re working with
            — so you can stop guessing and start building.
          </p>

          <CareerCompassCTA
            className="bg-red-600 hover:bg-red-700 text-white font-semibold mb-4"
            size="large"
          />
          <p className="text-sm text-blue-200 mb-8">
            Free · 10 minutes · Personalised report · 1-on-1 debrief
          </p>

          <Button
            asChild
            variant="outline"
            className={cn(
              MOBILE_CTA,
              'border-2 border-white/80 bg-white/10 text-white hover:bg-white hover:text-primary font-medium backdrop-blur-sm'
            )}
          >
            <Link
              href="/courses/73f0185c-b5c2-4407-8ffe-17eb6a1350e7"
              className="flex flex-wrap items-center justify-center gap-2"
            >
              <ClipboardList className="h-4 w-4 shrink-0" />
              <span>Already done the assessment? Reserve your seat in the Batch Program</span>
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
