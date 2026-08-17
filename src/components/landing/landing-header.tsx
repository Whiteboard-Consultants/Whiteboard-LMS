'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';

interface LandingHeaderProps {
  ctaLabel?: string;
  formSectionId?: string;
}

export function LandingHeader({
  ctaLabel = 'Enroll',
  formSectionId = 'course-form-section',
}: LandingHeaderProps) {
  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById(formSectionId)?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(
        `#${formSectionId} input`
      );
      firstInput?.focus({ preventScroll: true });
    }, 400);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href={MAIN_SITE_URL} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Whiteboard Consultants"
            width={160}
            height={51}
          />
        </Link>

        <nav className="hidden md:flex gap-8">
          <a
            href="#"
            onClick={scrollToForm}
            className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-300 transition-colors"
          >
            {ctaLabel}
          </a>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-primary dark:hover:text-blue-300 transition-colors"
          >
            FAQ
          </a>
        </nav>

        <a
          href="#"
          onClick={scrollToForm}
          className="md:hidden px-4 py-2 bg-primary text-white dark:bg-white dark:text-slate-900 text-sm font-semibold rounded-lg hover:opacity-90 dark:hover:bg-slate-100 transition-opacity"
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
