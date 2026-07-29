'use client';

import { useState } from 'react';
import {
  Award,
  ClipboardList,
  Compass,
  Route,
  Sparkles,
} from 'lucide-react';
import { RIASECModal } from '@/components/riasec/RIASECModal';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: Compass,
    title: 'Understand the Future of Jobs',
    description:
      'Learn how the Future of Jobs 2025 trends are reshaping Fintech, AI/ML and Management careers.',
  },
  {
    icon: ClipboardList,
    title: 'Take the RIASEC Assessment',
    description:
      'Take the RIASEC assessment and get your personalised report.',
  },
  {
    icon: Route,
    title: 'Map Your Pathway',
    description:
      'Use your RIASEC type to choose degree pathways and upskilling plans that fit your strengths in this new job landscape. On successful completion and submission of the test, get a certificate of participation from Whiteboard Consultants.',
  },
] as const;

export function BgesRiasecSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section
      id="RIASEC"
      className="relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-slate-50 via-sky-50/80 to-slate-50 py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 60% 45% at 20% 20%, rgba(0,84,148,0.08), transparent 55%), radial-gradient(ellipse 50% 40% at 85% 75%, rgba(232,160,32,0.1), transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/60 bg-white/40 p-8 shadow-[0_8px_40px_rgba(0,50,100,0.08)] backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="mb-10 text-center sm:mb-12">
              <div className="mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-[hsl(209,100%,29%)]" aria-hidden />
                <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[hsl(209,100%,29%)]">
                  Career Discovery
                </span>
              </div>

              <h2 className="text-balance text-2xl font-bold leading-snug tracking-tight text-[hsl(209,100%,29%)] sm:text-3xl xl:text-4xl">
                Find your RIASEC type and your place in Fintech, AI/ML and
                Management
              </h2>

              <p className="mx-auto mt-5 max-w-3xl text-[16px] leading-relaxed text-slate-700">
                The RIASEC framework helps you match your personality and working
                style to future‑ready roles in Technology and Business—whether
                you&apos;re more investigative, enterprising, conventional or social.
                In this event, you will complete the RIASEC test and receive
                guidance on how your profile can translate into roles such as{' '}
                <span className="font-semibold text-[#E8A020]">
                  Fintech product strategist, AI/ML Engineer, Data Analyst,
                  Compliance Specialist, Tech Consultant, or Innovation‑driven
                  Leader
                </span>
                .
              </p>
            </div>

            <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
              {STEPS.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={title}
                  className="rounded-2xl border border-white/70 bg-white/50 p-6 text-center shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:bg-white/70 hover:shadow-md"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(209,100%,29%)]/10">
                    <Icon
                      className="h-6 w-6 text-[hsl(209,100%,29%)]"
                      aria-hidden
                    />
                  </div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#E8A020]">
                    Step {index + 1}
                  </p>
                  <h3 className="mb-2 text-base font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-4">
              <Button
                type="button"
                onClick={() => setIsOpen(true)}
                className="h-12 gap-2 bg-[hsl(209,100%,29%)] px-8 text-base font-semibold text-white hover:bg-[hsl(209,100%,24%)]"
              >
                <Sparkles className="h-5 w-5" aria-hidden />
                Discover your career path
              </Button>

              <p className="flex max-w-xl items-start gap-2 text-center text-sm leading-relaxed text-slate-600 sm:items-center">
                <Award
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#E8A020] sm:mt-0"
                  aria-hidden
                />
                <span>
                  Completes in about 10–15 minutes. Get your personalised report
                  and a certificate of participation from Whiteboard Consultants.
                </span>
              </p>
            </div>
          </div>
      </div>

      <RIASECModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        campaign="bges"
      />
    </section>
  );
}
