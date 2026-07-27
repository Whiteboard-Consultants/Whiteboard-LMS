'use client';

import { ArrowRight, CheckCircle2, Clock, Users, Trophy, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CourseLandingHeroProps {
  courseTitle: string;
  courseDescription: string;
  courseDuration: string;
  enrolledCount: number;
  instructorName: string;
  price: number;
  onEnrollClick: () => void;
}

export function CourseLandingHero({
  courseTitle,
  courseDescription,
  courseDuration,
  enrolledCount,
  instructorName,
  price,
  onEnrollClick,
}: CourseLandingHeroProps) {
  return (
    <section className="relative bg-primary dark:bg-[hsl(209,100%,29%)] text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -top-40 right-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl" />
      </div>

      {/* pt-28 clears the fixed LandingHeader so the badge isn't clipped */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/40 text-sm font-medium">
                🎓 Career Development Course
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold leading-tight mb-6">
              {courseTitle}
            </h1>

            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              {courseDescription}
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b border-blue-400/30">
              <div>
                <div className="text-3xl font-bold text-white">{courseDuration}</div>
                <div className="text-sm text-blue-100">of Live Sessions</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">{enrolledCount}+</div>
                <div className="text-sm text-blue-100">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">₹{price ?? '0'}</div>
                <div className="text-sm text-blue-100">One-time Investment</div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={onEnrollClick}
                className="bg-white hover:bg-gray-100 text-primary dark:text-slate-900 h-12 px-8 text-lg font-semibold rounded-lg group"
              >
                Enroll Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition" />
              </Button>
            </div>

            {/* Features List */}
            <div className="space-y-3">
              {[
                '✓ ATS Optimization Techniques',
                '✓ Quantification Framework',
                '✓ Professional Brand Alignment',
                '✓ Certificate of Completion',
                '✓ Lifetime Course Access',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-blue-100">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            {/* Hero Image Placeholder */}
            <div className="relative h-96 md:h-full min-h-96 rounded-2xl bg-gradient-to-br from-blue-400/20 to-purple-400/20 border border-blue-400/30 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-300 opacity-50" />
                  <p className="text-2xl font-bold text-white/50">Resume Transformation</p>
                  <p className="text-sm text-white/30 mt-2">Before & After Examples</p>
                </div>
              </div>

              {/* Floating Cards - Before/After Preview */}
              <div className="absolute top-8 left-4 right-4 space-y-4">
                {/* Before Card */}
                <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-400/40 rounded-lg p-4 backdrop-blur-md hover:from-red-500/30 hover:to-red-600/20 transition-all duration-300">
                  <div className="text-xs font-semibold text-red-300 mb-2">❌ REJECTED BY ATS</div>
                  <div className="text-xs text-white/70 space-y-1">
                    <p className="line-through">Worked on company projects</p>
                    <p className="line-through">Responsible for team management</p>
                  </div>
                </div>

                {/* After Card */}
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-400/40 rounded-lg p-4 backdrop-blur-md hover:from-green-500/30 hover:to-emerald-500/20 transition-all duration-300">
                  <div className="text-xs font-semibold text-green-300 mb-2">✓ ATS OPTIMIZED</div>
                  <div className="text-xs text-white/70 space-y-1">
                    <p>📊 Led 5-person team resulting in 30% efficiency gain</p>
                    <p>💰 Reduced project costs by $150K through process optimization</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructor Info Card */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/60 backdrop-blur-md border border-blue-400/30 rounded-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Instructor Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src="/Navnit.png"
                      alt={instructorName}
                      width={80}
                      height={80}
                      className="rounded-full object-cover border-2 border-blue-400/50 w-20 h-20"
                    />
                  </div>
                  
                  {/* Instructor Details */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-1">Conducted by</p>
                    <p className="font-bold text-white text-lg">{instructorName}</p>
                    <p className="text-sm text-blue-100 mt-1">Career Coach & Resume Optimization Expert</p>
                  </div>
                </div>

                {/* LinkedIn Link */}
                <Link
                  href="https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 transition-colors duration-300"
                  aria-label="Connect on LinkedIn"
                >
                  <Linkedin className="w-6 h-6 text-blue-300 hover:text-blue-100 transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
