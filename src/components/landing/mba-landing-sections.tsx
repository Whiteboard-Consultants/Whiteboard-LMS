'use client';

import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Lightbulb,
  Search,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { OnlineMbaNavigator } from '@/components/landing/online-mba-navigator';

type ColorVariant = {
  glass: string;
  border: string;
  hoverBorder: string;
  iconBg: string;
  iconText: string;
};

const COLOR_VARIANTS: ColorVariant[] = [
  {
    glass: 'from-orange-50/70 to-amber-50/50',
    border: 'border-orange-200/60',
    hoverBorder: 'hover:border-orange-300/80',
    iconBg: 'bg-orange-200/70 group-hover:bg-orange-500',
    iconText: 'text-orange-600 group-hover:text-white',
  },
  {
    glass: 'from-purple-50/70 to-violet-50/50',
    border: 'border-purple-200/60',
    hoverBorder: 'hover:border-purple-300/80',
    iconBg: 'bg-purple-200/70 group-hover:bg-purple-500',
    iconText: 'text-purple-600 group-hover:text-white',
  },
  {
    glass: 'from-cyan-50/70 to-blue-50/50',
    border: 'border-cyan-200/60',
    hoverBorder: 'hover:border-cyan-300/80',
    iconBg: 'bg-cyan-200/70 group-hover:bg-cyan-500',
    iconText: 'text-cyan-600 group-hover:text-white',
  },
  {
    glass: 'from-rose-50/70 to-red-50/50',
    border: 'border-rose-200/60',
    hoverBorder: 'hover:border-rose-300/80',
    iconBg: 'bg-rose-200/70 group-hover:bg-rose-500',
    iconText: 'text-rose-600 group-hover:text-white',
  },
  {
    glass: 'from-slate-50/70 to-gray-50/50',
    border: 'border-slate-200/60',
    hoverBorder: 'hover:border-slate-300/80',
    iconBg: 'bg-slate-200/70 group-hover:bg-slate-600',
    iconText: 'text-slate-600 group-hover:text-white',
  },
];

const BENEFIT_VARIANTS: ColorVariant[] = [
  {
    glass: 'from-blue-50/70 to-cyan-50/50',
    border: 'border-blue-200/60',
    hoverBorder: 'hover:border-blue-300/80',
    iconBg: 'bg-blue-200/70 group-hover:bg-blue-600',
    iconText: 'text-blue-600 group-hover:text-white',
  },
  {
    glass: 'from-green-50/70 to-emerald-50/50',
    border: 'border-green-200/60',
    hoverBorder: 'hover:border-green-300/80',
    iconBg: 'bg-green-200/70 group-hover:bg-green-600',
    iconText: 'text-green-600 group-hover:text-white',
  },
  {
    glass: 'from-indigo-50/70 to-purple-50/50',
    border: 'border-indigo-200/60',
    hoverBorder: 'hover:border-indigo-300/80',
    iconBg: 'bg-indigo-200/70 group-hover:bg-indigo-600',
    iconText: 'text-indigo-600 group-hover:text-white',
  },
  {
    glass: 'from-amber-50/70 to-orange-50/50',
    border: 'border-amber-200/60',
    hoverBorder: 'hover:border-amber-300/80',
    iconBg: 'bg-amber-200/70 group-hover:bg-amber-500',
    iconText: 'text-amber-600 group-hover:text-white',
  },
];

const STEP_VARIANTS = [
  'from-blue-500/10 to-cyan-500/10 border-blue-200/50 hover:border-blue-300/70',
  'from-indigo-500/10 to-blue-500/10 border-indigo-200/50 hover:border-indigo-300/70',
  'from-purple-500/10 to-indigo-500/10 border-purple-200/50 hover:border-purple-300/70',
];

const PAIN_POINTS = [
  {
    icon: TrendingUp,
    title: 'Promotions Going Past You',
    text: "You've watched people with less experience get promoted past you — and the difference on paper is a degree, not ability.",
  },
  {
    icon: Briefcase,
    title: 'Full-Time Feels Impossible',
    text: "You've thought about going back to business school, but a 2-year full-time programme means walking away from your income and your role.",
  },
  {
    icon: Search,
    title: 'Too Many Options, No Clear Fit',
    text: "You've looked at options before and closed the tab — too many programmes, no clear sense of which one actually fits your situation.",
  },
  {
    icon: AlertCircle,
    title: 'No Clear ROI Number',
    text: "You don't have a clear number for what the degree would actually do to your salary or title — so it's easy to keep postponing.",
  },
  {
    icon: Compass,
    title: 'Generic Advice Everywhere',
    text: "Nobody has sat down with you and mapped your specific situation against a specific path. Every answer you've found online is generic.",
  },
];

const DELIVERABLES = [
  {
    title: 'Career & goals review',
    description:
      'A counsellor reviews your current role, trajectory, and what “next level” actually means for you specifically.',
  },
  {
    title: 'Program match report',
    description:
      'A personalised comparison of 2–3 programmes (including specialisations) that fit your goals, timeline, and budget.',
  },
  {
    title: 'ROI & salary projection',
    description:
      'A realistic estimate of what the investment returns, based on your industry and target role — not generic averages.',
  },
  {
    title: '1-on-1 counsellor call',
    description:
      'A live 15-minute call to walk through your report, answer questions, and map next steps. No pressure, no obligation.',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Book your free consultation',
    description:
      'Fill the short form below — no prep or documents needed. Takes a few minutes.',
  },
  {
    step: '2',
    title: 'Get your personalised program match report',
    description:
      'Delivered instantly, specific to your profile, goals, timeline, and budget.',
  },
  {
    step: '3',
    title: 'Apply with confidence',
    description:
      'Your counsellor guides you through the actual application, deadlines, and paperwork.',
  },
];

const COMPARISON_ROWS = [
  {
    label: 'Income while studying',
    fullTime: 'Paused',
    executive: 'Continues',
    online: 'Continues',
  },
  {
    label: 'Typical duration',
    fullTime: '1–2 years',
    executive: '1–2 years, weekends',
    online: '1–2 years, flexible pace',
  },
  {
    label: 'Best fit for',
    fullTime: 'Career switchers wanting full immersion',
    executive: 'Senior leaders with employer sponsorship',
    online: 'Anyone who can’t spare 2 years of income or a fixed campus schedule',
  },
  {
    label: 'Biggest trade-off',
    fullTime: 'Opportunity cost of income',
    executive: 'Rigid weekend schedule',
    online: 'Requires self-discipline',
  },
];

const COST_OF_WAITING = [
  {
    icon: TrendingUp,
    text: 'Every promotion cycle you sit out compounds — a 2-year delay isn’t 2 years of flat salary, it’s 2 years of missed raises stacked on top of each other.',
  },
  {
    icon: Clock,
    text: 'Application windows are seasonal — missing this cohort typically means a 3–6 month wait for the next one.',
  },
  {
    icon: Target,
    text: 'The people who get to “senior” and “head of” titles in your industry didn’t wait for the “right time” — they started before they felt fully ready.',
  },
];

const OBJECTIONS = [
  {
    icon: BookOpen,
    question: 'Will employers take an online MBA seriously?',
    answer:
      'Yes — when accreditation, university name, and outcomes are solid. We only shortlist UGC/AICTE-recognized partner universities and explain employer recognition plainly.',
  },
  {
    icon: Users,
    question: 'Will I actually build a network?',
    answer:
      'Online doesn’t mean isolated. Partner programmes include cohort peers, live sessions, and alumni access — we walk you through how each one structures community.',
  },
  {
    icon: Clock,
    question: 'Can I keep up with a full-time job?',
    answer:
      'Most working professionals succeed with a realistic weekly time commitment and flexible pacing. We match you to programmes that fit your actual schedule — not an idealised one.',
  },
  {
    icon: FileText,
    question: 'Is it worth the cost vs. a full-time MBA?',
    answer:
      'We show side-by-side cost and ROI for your situation, plus EMI/financing options where available — so you can decide with numbers, not guesses.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I graduated with zero real work experience, and every application felt like shouting into a void. The online MBA gave me an actual body of work to point to — a live project, and a placement cell that got me in front of recruiters. Three months into my first job now, and I skipped the “fresher with nothing to show” trap.',
    name: 'Ashutosh Singh',
    detail: 'Business Analyst (started as a fresher)',
  },
  {
    quote:
      'I’d been at the same designation for four years — good reviews, zero movement. My manager told me straight: the next level needed an MBA on paper. I did the programme without quitting my job. I’ve been promoted twice since. The degree didn’t do it alone, but it gave me the case to ask for the role.',
    name: 'Ritika Chatterjee',
    detail: 'Senior Manager · 2 promotions in 2 years post-MBA',
  },
];

function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl backdrop-blur-md bg-white/50 border border-white/70 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function MbaLandingSections() {
  return (
    <>
      {/* Pain — Stage 1 elaborated */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Talented Professionals Stay Stuck
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If even two of these resonate, you&apos;re not alone — and none of it means
              you&apos;re behind. It means no one has shown you the actual path yet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {PAIN_POINTS.map((point, index) => {
              const Icon = point.icon;
              const colors = COLOR_VARIANTS[index % COLOR_VARIANTS.length];
              return (
                <div
                  key={point.title}
                  className={`group p-8 rounded-xl backdrop-blur-md bg-gradient-to-br ${colors.glass} border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300 ${
                    index === PAIN_POINTS.length - 1 ? 'md:col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-3 rounded-lg transition-colors duration-300 ${colors.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${colors.iconText}`} />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {point.title}
                  </h3>
                  <p className="text-gray-600">{point.text}</p>
                </div>
              );
            })}
          </div>

          <p className="text-lg font-medium text-gray-900 text-center max-w-3xl mx-auto">
            That&apos;s what the next 15 minutes is for — a clear path, matched to you.
          </p>
        </div>
      </section>

      {/* Decision confusion — Stage 2 */}
      <section id="why-online-mba" className="py-20 bg-gradient-to-b from-white to-slate-50/80 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Confused Between Full-Time, Executive, or Online MBA?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A short, honest comparison — not a sales pitch. Freshers who can&apos;t pause
              income and working professionals alike are a legitimate fit for the online path.
            </p>
          </div>

          <div className="max-w-5xl mx-auto overflow-x-auto rounded-xl backdrop-blur-md bg-white/60 border border-white/80 shadow-lg mb-10">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="bg-primary/95 text-white">
                  <th className="p-4 text-left font-semibold" />
                  <th className="p-4 text-center font-semibold border-l border-blue-400/30">
                    Full-time MBA
                  </th>
                  <th className="p-4 text-center font-semibold border-l border-blue-400/30">
                    Executive MBA
                  </th>
                  <th className="p-4 text-center font-semibold border-l border-blue-400/30 bg-blue-500/40">
                    Online MBA
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, index) => (
                  <tr
                    key={row.label}
                    className={index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/50'}
                  >
                    <td className="p-4 font-medium text-gray-900 align-top">{row.label}</td>
                    <td className="p-4 text-center text-gray-600 border-l border-white/60 align-top">
                      {row.fullTime}
                    </td>
                    <td className="p-4 text-center text-gray-600 border-l border-white/60 align-top">
                      {row.executive}
                    </td>
                    <td className="p-4 text-center text-gray-900 font-medium border-l border-white/60 bg-blue-50/40 align-top">
                      {row.online}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-center text-lg text-gray-700 max-w-2xl mx-auto">
            Not sure which path fits your situation? Get a free 1:1 program-fit consultation
            — no pitch, just clarity.
          </p>
        </div>
      </section>

      {/* Free Program-Fit offer */}
      <section id="program-section" className="py-20 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <GlassCard className="p-8 md:p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Start With Clarity — The Free Program-Fit Consultation
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                This is what the enquiry form unlocks: a personalised report and a live
                debrief — not a generic brochure dump.
              </p>
            </GlassCard>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {DELIVERABLES.map((item, index) => {
              const colors = BENEFIT_VARIANTS[index % BENEFIT_VARIANTS.length];
              return (
                <div
                  key={item.title}
                  className={`group p-6 rounded-xl backdrop-blur-md bg-gradient-to-br ${colors.glass} border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-gray-500">
            Free · 15 minutes · Instant report · 1-on-1 debrief included
          </p>
        </div>
      </section>

      {/* Online MBA Navigator */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <OnlineMbaNavigator />
        </div>
      </section>

      {/* 3 Steps */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              3 Steps to Your Online MBA
            </h2>
          </div>

          <div className="space-y-6">
            {STEPS.map((item, index) => (
              <div
                key={item.step}
                className={`flex gap-6 p-8 rounded-xl backdrop-blur-md bg-gradient-to-br border ${STEP_VARIANTS[index]} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section id="success-stories" className="py-20 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Happens When Professionals Get Clarity
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you&apos;re a fresher or mid-career, the right Online MBA is a proven
              path forward — once you know which programme actually fits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
            {TESTIMONIALS.map((t) => (
              <blockquote
                key={t.name}
                className="p-8 rounded-xl backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-cyan-50/50 border border-blue-200/60 hover:shadow-lg transition-all"
              >
                <p className="text-gray-700 italic leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="text-sm">
                  <span className="font-semibold text-gray-900">— {t.name}</span>
                  <span className="text-gray-500"> · {t.detail}</span>
                </footer>
              </blockquote>
            ))}
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { stat: '500+', label: 'Professionals guided to date', color: 'text-blue-600' },
              { stat: '15+', label: 'Partner universities & accreditations', color: 'text-indigo-600' },
              { stat: '10+', label: 'MBA specialisations available', color: 'text-purple-600' },
              { stat: 'Free', label: 'Consultation — always', color: 'text-green-600' },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-6 rounded-xl backdrop-blur-md bg-white/50 border border-white/70 hover:shadow-md transition-all"
              >
                <div className={`text-4xl font-bold ${item.color} mb-2`}>{item.stat}</div>
                <p className="text-gray-600 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost of waiting — Stage 3 */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
              What Waiting Actually Costs You
            </h2>
            <ul className="space-y-4 my-8">
              {COST_OF_WAITING.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.text}
                    className="flex gap-4 items-start p-4 rounded-xl backdrop-blur-md bg-white/60 border border-white/80"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-1.5">{item.text}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-amber-50/70 to-yellow-50/50 border border-amber-200/60">
              <div className="flex items-start gap-4">
                <div className="inline-flex p-3 rounded-lg bg-amber-200/70 flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Next cohort</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Application windows open on a rolling basis across partner universities.
                    A counsellor will confirm the next real deadline and seat availability
                    for programmes that fit you — no manufactured scarcity.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Program deep-dive / objections — Stage 4 */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why an Online MBA Is the Reframe
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The objections we hear most — answered plainly, before you talk to a counsellor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {OBJECTIONS.map((item, index) => {
              const Icon = item.icon;
              const colors = BENEFIT_VARIANTS[index % BENEFIT_VARIANTS.length];
              return (
                <div
                  key={item.question}
                  className={`group p-8 rounded-xl backdrop-blur-md bg-gradient-to-br ${colors.glass} border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-3 rounded-lg transition-colors duration-300 ${colors.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${colors.iconText}`} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                </div>
              );
            })}
          </div>

          <GlassCard className="max-w-3xl mx-auto p-8 md:p-10">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              What programmes typically look like
            </h3>
            <ul className="space-y-3 text-gray-700">
              {[
                'Format: fully online or hybrid, designed for working professionals',
                'Duration: typically 1–2 years at a flexible pace',
                'Specialisations: Finance, Marketing, HR, Analytics, and more',
                'Accreditation: UGC / AICTE recognized partner universities',
                'Pricing: commonly ₹1–5 Lacs+ with EMI options where available',
              ].map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </section>
    </>
  );
}
