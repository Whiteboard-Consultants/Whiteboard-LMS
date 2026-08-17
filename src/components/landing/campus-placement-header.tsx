'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MAIN_SITE_URL } from '@/lib/application-subdomain';

const NAV_ITEMS = [
  { id: 'assessment-section', label: 'Assessment' },
  { id: 'batch-section', label: 'Batch Program' },
  { id: 'faq-section', label: 'FAQ' },
] as const;

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function CampusPlacementHeader() {
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
              className="text-sm font-bold text-gray-700 hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#assessment-section"
          onClick={(e) => {
            e.preventDefault();
            scrollTo('assessment-section');
          }}
          className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Free Assessment
        </a>
      </div>
    </header>
  );
}
