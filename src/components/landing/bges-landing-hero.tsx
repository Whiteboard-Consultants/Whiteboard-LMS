'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';

export function BgesLandingHero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-[hsl(209,100%,29%)] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 85% 20%, rgba(56,189,248,0.35), transparent 55%), radial-gradient(ellipse 70% 50% at 10% 90%, rgba(14,165,233,0.22), transparent 50%), linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 45%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 75%)',
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href={MAIN_SITE_URL}
          className="transition-opacity hover:opacity-90"
          aria-label="Whiteboard Consultants"
        >
          <Image
            src="/logo.png"
            alt="Whiteboard Consultants"
            width={168}
            height={53}
            className="h-9 sm:h-11"
            style={{ width: 'auto' }}
            priority
          />
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 md:gap-12 lg:grid-cols-2 lg:gap-14 lg:px-8 lg:pb-20 lg:pt-14">
        {/* Text — left on desktop; after visual on mobile */}
        <div className="order-2 lg:order-1">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
            Future of Jobs · Fintech · AI/ML · Management
          </p>

          <h1 className="text-balance text-3xl font-bold leading-[1.35] tracking-tight sm:text-4xl sm:leading-[1.3] xl:text-5xl xl:leading-[1.28]">
            Is your career aligned with the future of jobs?
          </h1>

          <p className="mt-5 text-[18px] leading-relaxed text-sky-50/95">
            By 2030, global shifts in AI, automation and digital finance will create
            millions of new roles and transform nearly{' '}
            <span className="font-semibold text-[#E8A020]">
              1 in 5 existing jobs. The fastest‑growing roles already include Big
              Data Specialists, Fintech Engineers and AI &amp; Machine Learning
              Specialists
            </span>
            —plus leaders who can navigate these changes through future‑ready MBAs.
          </p>

          <p className="mt-5 text-[16px] leading-relaxed text-sky-100/85">
            The World Economic Forum&apos;s Future of Jobs Report 2025 shows that
            broadening digital access and AI adoption will reshape business, finance
            and technology, with{' '}
            <span className="font-semibold text-[#E8A020]">
              86% of employers expecting AI and information‑processing technologies
            </span>{' '}
            to transform their business by 2030. This event helps you understand how
            to position yourself for careers in fintech, AI/ML and management, and how
            global education and upskilling can turn these trends into real
            opportunities for you.
          </p>

          <div className="mt-8">
            <Button
              asChild
              className="h-auto min-h-12 whitespace-normal bg-white px-6 py-3 text-base font-semibold text-[hsl(209,100%,29%)] hover:bg-sky-50 sm:text-lg"
            >
              <a href="#RIASEC" className="group inline-flex items-center gap-2 text-left">
                <Sparkles className="h-5 w-5 shrink-0 text-[#E8A020]" aria-hidden />
                <span className="leading-snug">
                  Discover your Career Path &amp; Get a{' '}
                  <span className="font-extrabold text-[#E8A020]">FREE</span>{' '}
                  Participation Certificate.
                </span>
                <ArrowRight className="h-24 w-24 shrink-0 stroke-[3] text-[hsl(209,100%,29%)] transition group-hover:translate-x-2" />
              </a>
            </Button>
          </div>
        </div>

        {/* Infographic — right column */}
        <div className="order-1 lg:order-2">
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-[2rem] bg-sky-300/20 blur-2xl sm:-inset-6"
              aria-hidden
            />
            <figure className="relative overflow-hidden rounded-2xl border border-white/25 bg-white/10 shadow-2xl shadow-sky-950/30 backdrop-blur-sm">
              <Image
                src="/landing/bges-careers-infographic.png"
                alt="Infographic of future career paths in Fintech, AI & Machine Learning, and Management for 2030"
                width={1376}
                height={768}
                className="h-auto w-full"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
