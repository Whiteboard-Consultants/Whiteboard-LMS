'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';

const NAV_ITEMS = [
  { id: 'session-section', label: 'The Bridge' },
  { id: 'faq-section', label: 'FAQ' },
  { id: 'register-section', label: 'Register' },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  if (id === 'register-section') {
    window.setTimeout(() => {
      document
        .querySelector<HTMLInputElement>('#register-section input')
        ?.focus({ preventScroll: true });
    }, 400);
  }
}

export function FutureOfJobsHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/60 dark:border-slate-700/60 shadow-sm">
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
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(item.id);
              }}
              className="text-sm font-bold text-gray-700 dark:text-slate-200 hover:text-primary dark:hover:text-blue-300 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#register-section"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('register-section');
          }}
          className="px-4 py-2 bg-primary dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Reserve My Seat
        </a>
      </div>
    </header>
  );
}
