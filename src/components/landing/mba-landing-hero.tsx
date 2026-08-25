'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface MbaLandingHeroProps {
  onCtaClick: () => void;
}

const HERO_FEATURES = [
  'UGC / AICTE Recognized Partner Universities',
  'Flexible Schedules for Working Professionals',
  'Specializations in Finance, Marketing, HR & Analytics',
  'EMI & Budget-Friendly Options',
  'Dedicated Counsellor Support',
];

export function MbaLandingHero({ onCtaClick }: MbaLandingHeroProps) {
  return (
    <section className="relative bg-primary text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/40 text-sm font-medium">
                Online MBA · Career Reframe
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-6">
              Still doing the same job, three years later?
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              You didn&apos;t stop growing. You stopped being considered for the next
              level — and the degree is usually the reason. See exactly what an online
              MBA changes for someone in your position.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-blue-400/30">
              <div>
                <div className="text-3xl font-bold text-white">2 Years</div>
                <div className="text-sm text-blue-100">Typical Duration</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-sm text-blue-100">Online Learning</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">Free</div>
                <div className="text-sm text-blue-100">Program-Fit Report</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-3">
              <Button
                onClick={onCtaClick}
                className="bg-white hover:bg-gray-100 text-primary h-12 px-8 text-lg font-semibold rounded-lg group"
              >
                Get My Free Program-Fit Report
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Button>
            </div>
            <p className="text-sm text-blue-200 mb-8">
              Free · No obligation · 15-minute call with a counsellor
            </p>

            <div className="space-y-3">
              {HERO_FEATURES.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/40 shadow-2xl backdrop-blur-sm">
              <Image
                src="/landing/online_mba_hero.png"
                alt="Mid-career professional considering the next step up the career ladder"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="space-y-3">
              <div className="bg-gradient-to-br from-red-500/30 to-rose-500/20 border border-red-300/50 rounded-xl p-4 backdrop-blur-md shadow-sm">
                <div className="text-xs font-semibold text-red-200 mb-2">
                  WITHOUT CLARITY
                </div>
                <div className="text-xs text-blue-50 space-y-1">
                  <p>Stuck in the same role for 3+ years</p>
                  <p>Passed over for leadership roles</p>
                  <p>Too many programs, no clear fit</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/20 border border-green-300/50 rounded-xl p-4 backdrop-blur-md shadow-sm">
                <div className="text-xs font-semibold text-green-200 mb-2">
                  WITH A PROGRAM-FIT REPORT
                </div>
                <div className="text-xs text-blue-50 space-y-1">
                  <p>2–3 programs matched to your goals</p>
                  <p>Realistic ROI & salary projection</p>
                  <p>1-on-1 counsellor debrief included</p>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md border border-blue-300/40 rounded-xl p-5 shadow-xl">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-1">
                  Guided by
                </p>
                <p className="font-bold text-white text-lg">Whiteboard Consultants</p>
                <p className="text-sm text-blue-100 mt-1">
                  Education & Career Advisory Experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
