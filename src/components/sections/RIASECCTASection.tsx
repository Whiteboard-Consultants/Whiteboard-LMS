'use client';

import { RIASECButton } from '@/components/riasec';
import { Sparkles, TrendingUp, Lightbulb } from 'lucide-react';

export default function RIASECCTASection() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-blue-500/10 to-indigo-500/10 dark:from-slate-900/50 dark:to-blue-900/50 backdrop-blur-md">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* Glass Container */}
          <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/20 p-12">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                  Career Discovery
                </span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                Discover Your Career Path
              </h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground dark:text-slate-300">
                Take the RIASEC Career Assessment to uncover your personality type and explore careers that match your interests and strengths.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-md rounded-2xl border border-white/30 dark:border-slate-600/30 p-6 text-center hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100/50 dark:bg-blue-900/30 mx-auto mb-4">
                  <Lightbulb className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Personalized Insights</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Learn about your personality type and career preferences based on science-backed assessment.
                </p>
              </div>

              <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-md rounded-2xl border border-white/30 dark:border-slate-600/30 p-6 text-center hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-purple-100/50 dark:bg-purple-900/30 mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Career Exploration</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Discover which careers align with your profile and explore growth opportunities in those fields.
                </p>
              </div>

              <div className="bg-white/40 dark:bg-slate-700/40 backdrop-blur-md rounded-2xl border border-white/30 dark:border-slate-600/30 p-6 text-center hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-green-100/50 dark:bg-green-900/30 mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Skill Development</h3>
                <p className="text-sm text-muted-foreground dark:text-slate-400">
                  Get personalized recommendations for courses and programs to develop your strengths.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center">
              <RIASECButton />
            </div>

            {/* Info Text */}
            <p className="text-center text-sm text-muted-foreground dark:text-slate-400 mt-8">
              The assessment takes about 10-15 minutes. You'll receive personalized results and career recommendations via email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
