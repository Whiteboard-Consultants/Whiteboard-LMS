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
        ctaLabel="Get Guidance"
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
              Ready to Find Your Right Online MBA?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Fill in a few details and we&apos;ll match you with programs that fit your
              career stage, budget, and timeline. A counsellor will reach out at a time
              that works for you.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Step 1 of 8 — takes about 4 minutes. No commitment required.
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
            Your MBA Journey Starts With One Conversation
          </h3>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of professionals who found the right Online MBA program with
            Whiteboard Consultants. Your next career move is closer than you think.
          </p>
          <button
            type="button"
            onClick={handleCtaClick}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-primary rounded-lg font-semibold text-lg transition-colors"
          >
            Get Free MBA Guidance — Start Now
          </button>
        </div>
      </section>
    </div>
  );
}
