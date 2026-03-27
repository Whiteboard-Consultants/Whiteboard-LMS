'use client';

import Link from 'next/link';
import Image from 'next/image';

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.png"
            alt="Whiteboard Consultants"
            width={160}
            height={60}
            className="h-auto w-auto"
          />
        </Link>

        {/* Anchor Links */}
        <nav className="hidden md:flex gap-8">
          <a
            href="#course-form-section"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('course-form-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            Enroll
          </a>
          <a
            href="#faq-section"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Enroll CTA - Mobile */}
        <a
          href="#course-form-section"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('course-form-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="md:hidden px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Enroll
        </a>
      </div>
    </header>
  );
}
