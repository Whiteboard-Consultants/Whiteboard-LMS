'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  Clock,
  Cpu,
  Gift,
  Globe,
  GraduationCap,
  Layers,
  Linkedin,
  MapPin,
  Plane,
  User,
} from 'lucide-react';
import { FutureOfJobsHeader } from '@/components/landing/future-of-jobs-header';
import { FutureOfJobsForm } from '@/components/landing/future-of-jobs-form';
import {
  AUDIENCE,
  FUTURE_OF_JOBS_FAQS,
  LANES,
  PAIN_POINTS,
  SESSION_DETAILS,
  STATS,
} from '@/components/landing/future-of-jobs-content';
import { Button } from '@/components/ui/button';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';
import { cn } from '@/lib/utils';

const PAIN_ICONS = [Briefcase, BookOpen, Building2, Award, Cpu, Globe];
const LANE_ICONS = [Briefcase, Layers, GraduationCap, Plane];
const DETAIL_ICONS = [User, Calendar, MapPin, Clock, Gift];

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

function scrollToForm() {
  document.getElementById('register-section')?.scrollIntoView({ behavior: 'smooth' });
  window.setTimeout(() => {
    document
      .querySelector<HTMLInputElement>('#register-section input')
      ?.focus({ preventScroll: true });
  }, 400);
}

export function FutureOfJobsLanding() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <FutureOfJobsHeader />

      <section className="relative bg-primary text-white overflow-hidden pt-28">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
          <div className="absolute -top-40 right-10 w-72 h-72 bg-red-400 rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="relative z-10 min-w-0">
              <span className="inline-block px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-medium mb-6">
                Free campus session · 21 September 2026
              </span>

              <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Future of Jobs: How to Cross the Bridge
              </h1>
              <h2 className="text-xl md:text-2xl font-semibold text-blue-100 mb-6 leading-snug">
                What the 2026 entry-level market actually rewards — and the four routes
                across it.
              </h2>

              <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                56.35% of Indian graduates are rated &ldquo;job-ready&rdquo; this year — the
                highest score in a decade. In that same hiring season, 84% of
                undergraduates are still unplaced. Both numbers are true at once. This
                session is about the gap between them, and what you can do about it before
                you graduate.
              </p>
              <p className="text-base text-blue-50 mb-8">
                A free, 90-minute session for BBA students by Whiteboard Consultants, live
                at Bhawanipur Global Campus.
              </p>

              <div className="flex flex-col gap-3 mb-4 max-w-xl">
                <Button
                  onClick={scrollToForm}
                  className={cn(MOBILE_CTA, 'bg-red-600 hover:bg-red-700 text-white font-semibold')}
                  size="lg"
                >
                  <span>Reserve My Seat</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </div>
              <p className="text-sm text-blue-200">
                Free · Seats limited to your campus · Takes 45 seconds to register
              </p>
            </div>

            <div className="relative z-0 min-w-0 lg:pl-4">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/25">
                <Image
                  src="/landing/future-of-jobs-hero.png"
                  alt="A bridge at sunrise — the crossing from degree to first job"
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

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-10 p-6 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              The Numbers Behind the Session
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
              India Skills Report 2026 (ETS with CII, AICTE, AIU, Taggd) · Unstop Talent
              Report 2026 · Nomura research on Indian entry-level hiring
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.value}
                className={`text-center p-8 ${PRIMARY_CARD} hover:-translate-y-0.5 transition-all duration-300`}
              >
                <div className="text-4xl md:text-5xl font-bold mb-3 text-white">
                  {stat.value}
                </div>
                <p className="text-sm text-blue-100 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className={`max-w-4xl mx-auto p-8 md:p-12 ${GLASS_PANEL}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
            Does Any of This Sound Like You?
          </h2>
          <p className="text-lg text-gray-600 dark:text-slate-300 mb-10 leading-relaxed text-center">
            Six specific reasons the jump from degree to job is harder right now — not a
            personal failing, a market shift.
          </p>
          <ul className="space-y-4 mb-8">
            {PAIN_POINTS.map((point, index) => {
              const Icon = PAIN_ICONS[index];
              return (
                <li
                  key={point.text}
                  className={`flex gap-4 items-start p-4 ${GLASS_CARD} ${GLASS_CARD_HOVER}`}
                >
                  <div className={ICON_BOX}>
                    <Icon className={ICON_COLOR} />
                  </div>
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed pt-1.5">
                    {point.text}
                  </p>
                </li>
              );
            })}
          </ul>
          <p className="text-lg font-medium text-gray-900 dark:text-white text-center leading-relaxed">
            This session names each of these precisely, with the data behind it, and gives
            you a concrete route across.
          </p>
        </div>
      </section>

      <section id="session-section" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center max-w-3xl mx-auto mb-12 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What You&apos;ll Walk Away With
            </h2>
            <h3 className="text-xl font-semibold text-primary mb-3">The Four-Lane Bridge</h3>
            <p className="text-lg text-gray-600 dark:text-slate-300 leading-relaxed">
              Four concrete, combinable routes from degree to first job — not generic
              motivation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {LANES.map((lane, index) => {
              const Icon = LANE_ICONS[index];
              return (
                <div key={lane.title} className={`p-6 ${GLASS_CARD} ${GLASS_CARD_HOVER}`}>
                  <div className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                    {lane.lane}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {lane.title}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300 text-sm leading-relaxed">
                    {lane.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className={`p-8 md:p-10 ${GLASS_PANEL}`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              A 90-Day Plan You Can Start Today
            </h3>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              Separate, specific action plans for third-years and final-years — because the
              two groups are solving different problems on different clocks.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8">
          <div className={`p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Who Should Attend
            </h2>
            <ul className="space-y-4">
              {AUDIENCE.map((item) => (
                <li key={item} className={`flex gap-3 p-3 ${GLASS_CARD}`}>
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                  <span className="text-gray-700 dark:text-slate-300 leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              Session Details
            </h2>
            <ul className="space-y-4">
              {SESSION_DETAILS.map((item, index) => {
                const Icon = DETAIL_ICONS[index];
                return (
                  <li key={item.label} className="flex gap-3 items-start">
                    <div className={ICON_BOX}>
                      <Icon className={ICON_COLOR} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                        {item.label}
                      </p>
                      <p className="text-gray-800 dark:text-slate-200">{item.value}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className={`p-8 md:p-10 ${GLASS_PANEL}`}>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Image
                src="/Navnit.png"
                alt="Navnit Daniel Alley"
                width={96}
                height={96}
                className="rounded-full object-cover border-2 border-primary/30 w-24 h-24"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  Navnit Daniel Alley
                </h2>
                <p className="text-sm font-semibold text-primary mb-3">
                  Co-Founder — Career Coach &amp; Sales Trainer
                </p>
                <p className="text-gray-600 dark:text-slate-300 leading-relaxed mb-4">
                  I help students, parents, and early professionals make confident,
                  future-ready career decisions through personalized education consulting,
                  practical real-world training, career development support, and sales
                  coaching.
                </p>
                <Link
                  href="https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
                >
                  <Linkedin className="w-5 h-5" />
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>

          <div className={`p-8 md:p-10 ${GLASS_PANEL}`}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              About Whiteboard Consultants
            </h2>
            <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
              Whiteboard Consultants provides career counselling, placement preparation
              and global education advisory to Indian students — helping them turn a
              degree into a defensible, evidence-backed first job or postgraduate plan.
            </p>
          </div>
        </div>
      </section>

      <section id="faq-section" className="py-16 px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="max-w-3xl mx-auto">
          <div className={`text-center mb-10 p-8 ${GLASS_PANEL}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Questions Before You Register
            </h2>
          </div>
          <div className="space-y-4">
            {FUTURE_OF_JOBS_FAQS.map((faq, index) => (
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
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-6 bg-white/20 dark:bg-slate-900/20 border-t border-white/40 dark:border-slate-700/40">
                    <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="register-section"
        className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Save My Seat — Future of Jobs Session
            </h2>
            <p className="text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Tell us a little about where you are, and how you plan to cross the
              bridge. It helps the speaker tailor the session&apos;s examples to this
              room, and it takes under a minute.
            </p>
          </div>
          <div className={`p-6 sm:p-10 ${GLASS_PANEL}`}>
            <FutureOfJobsForm />
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Reserve Your Seat</h2>
          <p className="text-lg text-blue-100 leading-relaxed mb-8">
            Seats are limited to registered students of your campus. Registration takes
            under a minute.
          </p>
          <Button
            onClick={scrollToForm}
            size="lg"
            className={cn(MOBILE_CTA, 'bg-red-600 hover:bg-red-700 text-white font-semibold mb-4')}
          >
            <span>Register Now — It&apos;s Free</span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Button>
          <p className="text-sm text-blue-200">
            Free · 21 September 2026 · Bhawanipur Global Campus
          </p>
          <p className="text-xs text-blue-200/80 mt-8">
            A Whiteboard Consultants session.{' '}
            <Link href={MAIN_SITE_URL} className="underline hover:text-white">
              Visit whiteboardconsultant.com
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
