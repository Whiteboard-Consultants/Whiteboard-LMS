'use client';

import Image from 'next/image';
import { LandingHeader } from '@/components/landing/landing-header';
import { UowApplyForm } from '@/components/uow-apply-form';

export function UowApplicationClient() {
  return (
    <div className="w-full bg-white dark:bg-slate-dark min-h-screen">
      <LandingHeader ctaLabel="Apply Now" formSectionId="uow-form-section" />

      <div className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Image
              src="/landing/UTF-8UOW INDIA Logo PRIMARY NAVY.svg"
              alt="University of Wollongong India"
              width={262}
              height={242}
              className="mx-auto mb-6 h-28 w-auto sm:h-32"
              priority
            />
            <h1 className="font-headline text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Apply to University of Wollongong, India
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Complete the form below to begin your application journey with our expert guidance.
            </p>
          </div>

          <div id="uow-form-section" className="scroll-mt-24">
            <UowApplyForm />
          </div>
        </div>
      </div>
    </div>
  );
}
