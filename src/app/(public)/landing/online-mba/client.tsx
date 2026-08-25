'use client';

import { LandingHeader } from '@/components/landing/landing-header';
import { MbaLandingFAQ } from '@/components/landing/mba-landing-faq';
import { MbaLandingForm } from '@/components/landing/mba-landing-form';
import { MbaLandingHero } from '@/components/landing/mba-landing-hero';
import { MbaLandingSections } from '@/components/landing/mba-landing-sections';

export function OnlineMbaLandingClient() {
  const handleCtaClick = () => {
    document
      .getElementById('mba-form-section')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white min-h-screen">
      <LandingHeader
        ctaLabel="Check My Fit – Free"
        formSectionId="mba-form-section"
      />

      <MbaLandingHero onCtaClick={handleCtaClick} />

      <MbaLandingSections />

      <section id="faq-section" className="scroll-mt-16">
        <MbaLandingFAQ />
      </section>

      <section
        id="mba-form-section"
        className="py-20 bg-gradient-to-br from-blue-50/80 via-indigo-50/60 to-blue-50/80 scroll-mt-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Get My Free Program-Fit Report
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill in a few details and we&apos;ll match you with programmes that fit your
              career stage, budget, and timeline. A counsellor will walk you through the
              report on a 15-minute call.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Free · No obligation · Takes a few minutes
            </p>
          </div>

          <div className="backdrop-blur-md bg-white/60 border border-white/80 rounded-2xl p-6 sm:p-10 shadow-lg">
            <MbaLandingForm />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Your next promotion cycle starts before you feel ready.
          </h3>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            The professionals who make the jump don&apos;t wait for certainty — they get
            clarity first, then act. The Program-Fit Consultation takes 15 minutes and
            tells you exactly what this move would look like for you.
          </p>
          <button
            type="button"
            onClick={handleCtaClick}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-primary rounded-lg font-semibold text-lg transition-colors"
          >
            Get My Free Program-Fit Report
          </button>
          <p className="text-sm text-blue-200 mt-6">
            Already spoken to a counsellor?{' '}
            <button
              type="button"
              onClick={handleCtaClick}
              className="underline hover:text-white transition-colors"
            >
              Apply directly →
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
