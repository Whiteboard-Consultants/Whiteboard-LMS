'use client';

import Link from 'next/link';
import { LandingHeader } from '@/components/landing/landing-header';
import { UowApplyForm } from '@/components/uow-apply-form';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';
import { ArrowLeft } from 'lucide-react';

export function UowApplicationClient() {
  return (
    <div className="w-full bg-white min-h-screen">
      <LandingHeader ctaLabel="Apply Now" formSectionId="uow-form-section" />

      <div className="pt-24 pb-16">
        <div className="container max-w-3xl mx-auto px-4 sm:px-6">
          <Link
            href={`${MAIN_SITE_URL}/admissions/uow-india`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to UOW program page
          </Link>

          <div className="text-center mb-10">
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
