'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  BadgePercent,
  Calendar,
  ChevronDown,
  Clock,
  GraduationCap,
  Landmark,
  MapPin,
  MessagesSquare,
  Presentation,
  Users,
} from 'lucide-react';
import { GccForm } from '@/components/landing/gcc-form';
import { GccHeader } from '@/components/landing/gcc-header';
import {
  GCC_HERO_DESTINATIONS,
  GCC_EVENT_FACTS,
  GCC_FAQS,
  GCC_SCHEDULE,
  GCC_SPEAKER,
  GCC_WHY_ATTEND,
  GCC_ZONES,
} from '@/components/landing/gcc-content';
import { Button } from '@/components/ui/button';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';
import { cn } from '@/lib/utils';

const WHY_ICONS = [Users, Presentation, GraduationCap, BadgePercent, Landmark];
const FACT_ICONS = [Calendar, Clock, MapPin, Landmark];

const GLASS_PANEL =
  'rounded-2xl bg-white/55 dark:bg-slate-900/45 backdrop-blur-xl border border-white/80 dark:border-white/10 shadow-[0_8px_32px_rgba(15,40,80,0.08)]';
const GLASS_CARD =
  'rounded-xl bg-white/50 dark:bg-slate-900/40 backdrop-blur-xl border border-white/75 dark:border-white/10 shadow-sm';
const GLASS_CARD_HOVER =
  'hover:bg-white/70 dark:hover:bg-slate-900/55 hover:border-white dark:hover:border-white/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300';
const BAND_MIST =
  'relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950';
const BAND_TINT =
  'relative overflow-hidden bg-gradient-to-br from-blue-100 via-indigo-50 to-sky-100 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900';

function SectionWash({ tone }: { tone: 'mist' | 'tint' }) {
  const orbs =
    tone === 'tint'
      ? [
          'absolute -top-24 -left-16 h-72 w-72 rounded-full bg-blue-400/35 blur-3xl',
          'absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl',
        ]
      : [
          'absolute top-8 right-8 h-64 w-64 rounded-full bg-sky-200/70 blur-3xl',
          'absolute -bottom-20 left-8 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl',
        ];

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {orbs.map((orb) => (
        <div key={orb} className={orb} />
      ))}
    </div>
  );
}
const PRIMARY_CARD =
  'rounded-2xl bg-primary dark:bg-[hsl(209,100%,29%)] text-white shadow-xl border border-white/20 min-w-0 overflow-hidden';
const MOBILE_CTA =
  'w-full max-w-full min-w-0 h-auto py-3 px-4 sm:px-6 whitespace-normal flex-wrap gap-2 text-sm sm:text-base justify-center text-center leading-snug';
const ICON_BOX =
  'flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 dark:bg-blue-500/25 border border-primary/20 dark:border-blue-400/40 flex items-center justify-center';
const ICON_COLOR = 'w-5 h-5 text-primary dark:text-blue-300';
const ACCENT_TEXT = 'text-primary dark:text-blue-300';
const BRAND_SURFACE = 'bg-primary dark:bg-[hsl(209,100%,29%)]';

function scrollToRegister() {
  document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
}

export function GccLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <GccHeader />

      <section className={`relative ${BRAND_SURFACE} text-white overflow-hidden pt-28`}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute -top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative z-10 min-w-0">
              <span className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-medium mb-6">
                September 30 &amp; October 1, 2026 · Kolkata
              </span>

              <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Global Career Camp 2026: Explore. Compare. Connect.
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                Map your international education journey with direct, face-to-face access
                to top global universities and expert career advisors—live on campus.
              </p>

              <p className="text-xs font-semibold uppercase tracking-wide text-blue-200 mb-3">
                Featured study destinations
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {GCC_HERO_DESTINATIONS.map((destination) => (
                  <span
                    key={destination}
                    className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-sm"
                  >
                    {destination}
                  </span>
                ))}
              </div>

              <div className="flex flex-col gap-3 mb-4 max-w-xl">
                <Button
                  onClick={scrollToRegister}
                  className={cn(MOBILE_CTA, 'bg-red-600 hover:bg-red-700 text-white font-semibold')}
                  size="lg"
                >
                  <span>Reserve Your Free Pass</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
              <p className="text-sm text-blue-200">
                Free · Bhawanipur Global Campus · Undergraduate &amp; postgraduate students
              </p>
            </div>

            <div className="relative z-0 min-w-0">
              <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 p-6 sm:p-8 shadow-2xl">
                <p className="text-sm font-semibold uppercase tracking-wide text-blue-200 mb-6">
                  Event overview
                </p>
                <ul className="space-y-5">
                  {GCC_EVENT_FACTS.map((fact, index) => {
                    const Icon = FACT_ICONS[index];
                    return (
                      <li key={fact.label} className="flex gap-4 items-start">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/15 border border-white/25 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-blue-200 font-semibold">
                            {fact.label}
                          </p>
                          <p className="text-white leading-snug whitespace-pre-line">{fact.value}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="why-attend" className={`py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24 ${BAND_TINT}`}>
        <SectionWash tone="tint" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-10 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Why Attend Global Career Camp 2026?
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-200 leading-relaxed">
              Two days on campus with university delegates, counsellors, and a fintech
              masterclass — built for students comparing international options.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GCC_WHY_ATTEND.map((item, index) => {
              const Icon = WHY_ICONS[index];
              return (
                <div
                  key={item.title}
                  className={`p-6 ${index === 4 ? 'md:col-span-2 lg:col-span-1' : ''} ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
                >
                  <div className={`${ICON_BOX} mb-4`}>
                    <Icon className={ICON_COLOR} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-200 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="schedule" className={`py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24 ${BAND_MIST}`}>
        <SectionWash tone="mist" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-10 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              2-Day Event Schedule &amp; Format
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-200 leading-relaxed">
              An open expo on Day 1, then a curated fintech masterclass on Day 2.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {GCC_SCHEDULE.map((session) => (
              <article key={session.day} className={`p-6 sm:p-8 ${GLASS_PANEL}`}>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold uppercase tracking-wide ${ACCENT_TEXT}`}>
                    {session.day}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-slate-300">
                    {session.date}
                  </span>
                  <span className="text-sm font-medium text-gray-800 dark:text-slate-100">
                    {session.time}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {session.track}
                </h3>
                {'question' in session && session.question ? (
                  <p className="text-base font-medium text-gray-800 dark:text-slate-100 mb-4 leading-snug">
                    {session.question}
                  </p>
                ) : (
                  <div className="mb-2" />
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-2">
                  What to expect
                </p>
                <ul className="space-y-2 mb-6">
                  {session.expect.map((item) => (
                    <li key={item} className="flex gap-3 text-gray-700 dark:text-slate-200 leading-relaxed">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400 mb-1">
                  Target audience
                </p>
                <p className="text-gray-900 dark:text-white font-medium">{session.audience}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="highlights" className={`py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24 ${BAND_TINT}`}>
        <SectionWash tone="tint" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-12 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Event Highlights &amp; Interactive Zones
            </h2>
          </div>

          <div id="day-1" className="scroll-mt-24">
            <div className={`mb-6 px-6 py-5 ${PRIMARY_CARD}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Day 1</p>
              <h3 className="text-2xl font-bold mt-1">September 30, 2026</h3>
              <p className="text-sm text-blue-100 mt-1">
                10:00 AM – 5:00 PM · Global Career Camp expo
              </p>
            </div>
            <div className="space-y-6">
              {GCC_ZONES.filter((zone) => zone.when === 'Day 1').map((zone) => (
                <article key={zone.number} className={`p-6 sm:p-8 ${GLASS_PANEL}`}>
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <span className={`text-sm font-bold ${ACCENT_TEXT}`}>{zone.number}</span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {zone.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-slate-200 leading-relaxed mb-4">
                    {zone.intro}
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {zone.points.map((point) => (
                      <li key={point} className={`flex gap-3 p-4 ${GLASS_CARD}`}>
                        <MessagesSquare className={`${ICON_COLOR} w-4 h-4 mt-1 flex-shrink-0`} />
                        <span className="text-gray-700 dark:text-slate-200 text-sm leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div id="universities" className={`scroll-mt-24 mt-6 p-6 sm:p-8 text-center ${GLASS_PANEL}`}>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Participating Universities
              </h3>
              <p className="text-gray-600 dark:text-slate-200 leading-relaxed mb-6">
                Official representatives from leading international universities will be on
                campus for briefings and 1-on-1 counselling.
              </p>
              <div className="max-w-2xl mx-auto rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/landing/Uni-Logos.jpg"
                  alt="Participating institutions: University of Wollongong Australia in India, Amity University, Amity University Dubai, ISM International School of Management, University of Winchester, Deakin University GIFT City India, TOEFL, Lincoln Bishop University, TBS Education, Aberystwyth University, Berlin, ISC Paris, and Health Sciences University"
                  width={2200}
                  height={900}
                  className="w-full h-auto"
                  sizes="(max-width: 672px) 100vw, 672px"
                />
              </div>
            </div>
          </div>

          <div id="day-2" className="scroll-mt-24 mt-16">
            <div className={`mb-6 px-6 py-5 ${PRIMARY_CARD}`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Day 2</p>
              <h3 className="text-2xl font-bold mt-1">October 1, 2026</h3>
              <p className="text-sm text-blue-100 mt-1">
                10:30 AM - 1:30 PM. FinTech Rewired Masterclass
              </p>
            </div>

            <article className={`p-6 sm:p-8 ${GLASS_PANEL}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide ${ACCENT_TEXT} mb-2`}>
                Speaker Profile
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {GCC_SPEAKER.name}
              </h3>
              <p className="text-gray-600 dark:text-slate-200 leading-relaxed">
                {GCC_SPEAKER.bio}
              </p>
            </article>

            <div className="space-y-6 mt-6">
              {GCC_ZONES.filter((zone) => zone.when === 'Day 2').map((zone) => (
                <article key={zone.number} className={`p-6 sm:p-8 ${GLASS_PANEL}`}>
                  <div className="flex flex-wrap items-baseline gap-3 mb-3">
                    <span className={`text-sm font-bold ${ACCENT_TEXT}`}>{zone.number}</span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {zone.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-slate-200 leading-relaxed mb-4">
                    {zone.intro}
                  </p>
                  <ul className="grid md:grid-cols-2 gap-3">
                    {zone.points.map((point) => (
                      <li key={point} className={`flex gap-3 p-4 ${GLASS_CARD}`}>
                        <MessagesSquare className={`${ICON_COLOR} w-4 h-4 mt-1 flex-shrink-0`} />
                        <span className="text-gray-700 dark:text-slate-200 text-sm leading-relaxed">
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className={`py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24 ${BAND_MIST}`}>
        <SectionWash tone="mist" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className={`text-center mb-10 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Questions Before You Reserve
            </h2>
          </div>
          <div className="space-y-4">
            {GCC_FAQS.map((faq, index) => (
              <div key={faq.question} className={`overflow-hidden ${GLASS_CARD} ${GLASS_CARD_HOVER}`}>
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full p-6 flex justify-between items-start text-left hover:bg-white/30 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 dark:text-slate-300 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 bg-white/20 dark:bg-slate-900/20 border-t border-white/40 dark:border-slate-700/40">
                    <p className="text-gray-700 dark:text-slate-200 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="register" className={`py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24 ${BAND_TINT}`}>
        <SectionWash tone="tint" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Reserve Your Free Pass
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-200 max-w-2xl mx-auto leading-relaxed">
              Four short steps. We&apos;ll email your free pass confirmation as soon as you finish.
            </p>
          </div>
          <div className={`p-6 sm:p-10 ${GLASS_PANEL}`}>
            <GccForm />
          </div>
        </div>
      </section>

      <section className={`py-20 px-4 sm:px-6 lg:px-8 ${BRAND_SURFACE} text-white`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Reserve Your Free Pass</h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            September 30 &amp; October 1, 2026 · Bhawanipur Global Campus, Kolkata
          </p>
          <Button
            onClick={scrollToRegister}
            size="lg"
            className={cn(MOBILE_CTA, 'bg-red-600 hover:bg-red-700 text-white font-semibold mb-4')}
          >
            <span>Reserve Your Free Pass</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>
          <p className="text-sm text-blue-200">
            Organized by HEDC, Bhawanipur Global Campus in partnership with Whiteboard Consultants
          </p>
          <p className="text-xs text-blue-200/80 mt-8">
            <Link href={MAIN_SITE_URL} className="underline hover:text-white">
              Visit whiteboardconsultant.com
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
