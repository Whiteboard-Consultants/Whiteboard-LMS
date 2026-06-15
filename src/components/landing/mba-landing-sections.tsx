'use client';

import {
  AlertCircle,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Lightbulb,
  Search,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

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
  'from-cyan-500/10 to-blue-500/10 border-cyan-200/50 hover:border-cyan-300/70',
];

const PAIN_POINTS = [
  {
    icon: TrendingUp,
    title: 'The Promotion Ceiling',
    text: "You've been in the same role for 2–3 years. New hires with an MBA are being considered for positions you were eyeing.",
  },
  {
    icon: Search,
    title: 'The Information Overload',
    text: 'Every university claims to be the best. You\'re more confused than when you started researching.',
  },
  {
    icon: Briefcase,
    title: 'The Time Trap',
    text: 'A full-time MBA means leaving your salary and experience streak. That feels impossible right now.',
  },
  {
    icon: AlertCircle,
    title: 'The Budget Anxiety',
    text: 'Programs range from ₹1 Lac to ₹15 Lacs+. You don\'t know what\'s worth the investment — or what employers actually recognize.',
  },
];

const STEPS = [
  {
    step: '1',
    title: 'Tell Us Where You Are',
    description:
      'Share your career stage, goals, budget, and timeline through our quick enquiry form. Takes under 5 minutes.',
  },
  {
    step: '2',
    title: 'Get a Personalized Shortlist',
    description:
      'Our education consultants match you with 2–3 online MBA programs that fit your profile — not a list of 50 options to sift through.',
  },
  {
    step: '3',
    title: 'Understand the Real Cost & ROI',
    description:
      'We break down fees, EMI plans, duration, specializations, and what each program delivers for your career goal.',
  },
  {
    step: '4',
    title: 'Start When You\'re Ready',
    description:
      'Whether you want to begin within a month or need 6 months to plan, we help with admissions, documentation, and onboarding.',
  },
];

const REFRAME_BENEFITS = [
  {
    icon: Users,
    title: 'Built for Professionals',
    text: 'Weekend classes, recorded lectures, and flexible deadlines.',
  },
  {
    icon: BookOpen,
    title: 'Employer-Recognized',
    text: 'Same curriculum and credentials as on-campus programs.',
  },
  {
    icon: Target,
    title: 'Affordable Options',
    text: 'Starting from ₹1 Lac, with EMI plans that fit your budget.',
  },
  {
    icon: TrendingUp,
    title: 'Career-Focused',
    text: 'Specializations in Analytics, Finance, Marketing, HR & more.',
  },
];

const COMPARISON = [
  { label: 'Quit your job', fullTime: true, online: false },
  { label: 'Relocate to campus', fullTime: true, online: false },
  { label: '₹10–25 Lacs+ typical cost', fullTime: true, online: false },
  { label: 'Fixed schedule', fullTime: true, online: false },
  { label: 'Keep earning while you learn', fullTime: false, online: true },
  { label: 'Study from home', fullTime: false, online: true },
  { label: '₹1–5 Lacs with flexible EMI', fullTime: false, online: true },
  { label: 'Learn on your schedule', fullTime: false, online: true },
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
      className={`backdrop-blur-md bg-white/50 border border-white/70 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function MbaLandingSections() {
  return (
    <>
      {/* Section 1: Hook */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GlassCard className="rounded-2xl p-10 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              You&apos;ve Worked Hard. So Why Does Your Career Feel Stuck?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              You show up every day. You deliver results. You watch colleagues with
              similar experience move into leadership roles — and you wonder what they
              have that you don&apos;t.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-4">
              It&apos;s not talent. It&apos;s not effort. Often, it&apos;s a credential gap — and
              the belief that an MBA is only for people who can afford to quit their jobs
              for two years.
            </p>
            <p className="text-lg font-semibold text-primary">
              You don&apos;t need to pause your life to upgrade your career. You need the
              right Online MBA — and someone to help you find it.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* Section 2: Relatable Problem */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Sound Familiar?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              If even two of these resonate, you&apos;re not alone. Most MBA aspirants we
              speak to feel exactly this way before their first consultation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {PAIN_POINTS.map((point, index) => {
              const Icon = point.icon;
              const colors = COLOR_VARIANTS[index % COLOR_VARIANTS.length];
              return (
                <div
                  key={point.title}
                  className={`group p-8 rounded-xl backdrop-blur-md bg-gradient-to-br ${colors.glass} border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300`}
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
        </div>
      </section>

      {/* Section 3: Deeper Truth */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <GlassCard className="rounded-2xl p-10 md:p-12">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                The Real Reason Most People Never Do Their MBA
              </h2>
            </div>

            <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
              <p>
                It&apos;s rarely about motivation. It&apos;s about{' '}
                <strong className="text-gray-900">decision paralysis</strong>.
              </p>
              <p>
                There are 50+ online MBA programs in India. Each has different
                accreditation (UGC, AICTE, DEB), fee structures, specialization
                relevance, placement networks, and flexibility for working professionals.
              </p>
              <p>
                Choosing wrong doesn&apos;t just waste money — it wastes 2 years of effort on
                a degree that doesn&apos;t move the needle.
              </p>
            </div>

            <div className="mt-10 p-8 rounded-xl backdrop-blur-md bg-gradient-to-br from-amber-50/70 to-yellow-50/50 border border-amber-200/60">
              <div className="flex items-start gap-4">
                <div className="inline-flex p-3 rounded-lg bg-amber-200/70 flex-shrink-0">
                  <Lightbulb className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">The Deeper Truth</h3>
                  <p className="text-gray-700 leading-relaxed">
                    An MBA isn&apos;t a magic ticket. But the{' '}
                    <strong>right MBA</strong>, matched to your career stage and goals, is
                    one of the highest-ROI investments a professional can make in India
                    today.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Section 4: Reframe Belief */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-indigo-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What If an MBA Didn&apos;t Mean Quitting Your Job?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Online MBA programs have changed the game. Today&apos;s accredited online
              degrees are designed for working professionals, employer-recognized, and
              affordable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {REFRAME_BENEFITS.map((item, index) => {
              const Icon = item.icon;
              const colors = BENEFIT_VARIANTS[index % BENEFIT_VARIANTS.length];
              return (
                <div
                  key={item.title}
                  className={`group p-6 rounded-xl backdrop-blur-md bg-gradient-to-br ${colors.glass} border ${colors.border} ${colors.hoverBorder} hover:shadow-lg transition-all duration-300 text-center`}
                >
                  <div className="mb-4">
                    <div
                      className={`inline-flex p-3 rounded-lg transition-colors duration-300 ${colors.iconBg}`}
                    >
                      <Icon className={`w-6 h-6 transition-colors duration-300 ${colors.iconText}`} />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto overflow-hidden rounded-xl backdrop-blur-md bg-white/60 border border-white/80 shadow-lg">
            <div className="grid grid-cols-3 bg-primary/95 backdrop-blur-sm text-white text-sm font-semibold">
              <div className="p-4" />
              <div className="p-4 text-center border-l border-blue-400/30">
                Full-Time MBA
              </div>
              <div className="p-4 text-center border-l border-blue-400/30">
                Online MBA
              </div>
            </div>
            {COMPARISON.map((row, index) => (
              <div
                key={row.label}
                className={`grid grid-cols-3 text-sm ${
                  index % 2 === 0 ? 'bg-white/40' : 'bg-slate-50/50'
                }`}
              >
                <div className="p-4 font-medium text-gray-900">{row.label}</div>
                <div className="p-4 text-center border-l border-white/60">
                  {row.fullTime ? (
                    <span className="text-red-500 font-semibold">✗</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                <div className="p-4 text-center border-l border-white/60">
                  {row.online ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Actionable Steps */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How Whiteboard Consultants Helps You Find the Right MBA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              No generic advice. A structured path from confusion to clarity — in one
              free consultation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {STEPS.map((item, index) => (
              <div
                key={item.step}
                className={`flex gap-6 p-8 rounded-xl backdrop-blur-md bg-gradient-to-br ${STEP_VARIANTS[index]} hover:shadow-lg transition-all duration-300`}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shadow-md">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { text: 'A clear MBA roadmap tailored to your career stage', color: 'text-blue-600' },
              { text: 'Honest comparison of programs within your budget', color: 'text-green-600' },
              { text: "Answers to questions Google can't answer", color: 'text-indigo-600' },
              { text: 'Zero pressure — enquire first, decide later', color: 'text-purple-600' },
            ].map((item) => (
              <div
                key={item.text}
                className="flex items-start gap-3 p-4 rounded-xl backdrop-blur-md bg-white/50 border border-white/70 hover:shadow-md transition-all"
              >
                <CheckCircle2 className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                <span className="text-sm text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Encouragement */}
      <section className="py-20 bg-gradient-to-br from-slate-100 via-blue-50/40 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Thousands of Professionals Started Exactly Where You Are
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you&apos;re a fresher, an early-career professional, or someone
              feeling the growth ceiling — an Online MBA is a proven path forward. You
              just need to take the first step.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { stat: '500+', label: 'Students Guided', color: 'text-blue-600' },
              { stat: '15+', label: 'Partner Universities', color: 'text-indigo-600' },
              { stat: '10+', label: 'MBA Specializations', color: 'text-purple-600' },
              { stat: 'Free', label: 'Consultation — Always', color: 'text-green-600' },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-6 rounded-xl backdrop-blur-md bg-white/50 border border-white/70 hover:shadow-md transition-all"
              >
                <div className={`text-4xl font-bold ${item.color} mb-2`}>{item.stat}</div>
                <p className="text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <blockquote className="p-8 rounded-xl backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-cyan-50/50 border border-blue-200/60 hover:shadow-lg transition-all">
              <p className="text-gray-700 italic leading-relaxed mb-4">
                &ldquo;I was stuck as a Senior Analyst for 3 years. Within 6 months of
                starting my Online MBA, I was promoted to Assistant Manager. The degree
                gave me the confidence — and the credential — I was missing.&rdquo;
              </p>
              <footer className="text-sm font-semibold text-gray-900">
                Rahul K., Working Professional, Bangalore
              </footer>
            </blockquote>
            <blockquote className="p-8 rounded-xl backdrop-blur-md bg-gradient-to-br from-purple-50/70 to-indigo-50/50 border border-purple-200/60 hover:shadow-lg transition-all">
              <p className="text-gray-700 italic leading-relaxed mb-4">
                &ldquo;As a fresher, I had no idea which MBA would actually help me.
                Whiteboard short-listed 3 programs within my budget and explained
                everything in plain language. I started within 2 months.&rdquo;
              </p>
              <footer className="text-sm font-semibold text-gray-900">
                Ananya S., MBA Aspirant, Mumbai
              </footer>
            </blockquote>
          </div>
        </div>
      </section>
    </>
  );
}
