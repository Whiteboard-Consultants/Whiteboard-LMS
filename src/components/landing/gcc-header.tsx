'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';

const NAV_ITEMS = [
  { id: 'why-attend', label: 'Why Attend' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'universities', label: 'Universities' },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function GccHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-white/60 dark:border-slate-700/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <Link href={MAIN_SITE_URL} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <Image
            src="/logo.png"
            alt="Whiteboard Consultants"
            width={160}
            height={51}
          />
        </Link>

        <nav className="hidden lg:flex gap-8">
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
          href="#register"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('register');
          }}
          className="px-4 py-2 bg-primary dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          Reserve Free Pass
        </a>
      </div>
    </header>
  );
}
