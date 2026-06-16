'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function CourseFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How long does it take to complete this course?',
      answer:
        'The course contains 10 hours of live and on-demand video content. Most students complete it in 2-3 weeks, but you have lifetime access to review materials anytime.',
    },
    {
      question: 'Will I get guaranteed job offers after this course?',
      answer:
        'While we can\'t guarantee job offers, this course provides proven strategies used by candidates landing interviews at top companies. Success depends on your application effort and industry.',
    },

    {
      question: 'Can I access the course on mobile?',
      answer:
        'Yes! The course is fully responsive and works on all devices. Download lessons for offline viewing wherever you are.',
    },
    {
      question: 'Do I need special software or tools?',
      answer:
        'No special software needed. A computer, tablet, or smartphone with internet access is all you need. For resume editing, we recommend Word or Google Docs (both free).',
    },
    {
      question: 'Is this course updated for the latest ATS changes?',
      answer:
        'Yes, this is the 2026 edition specifically updated for current ATS algorithms and job market trends. We continuously update content as hiring practices evolve.',
    },
    {
      question: 'Can I apply this to career transitions?',
      answer:
        'Absolutely! This course includes a special module for translating experience across industries and positioning yourself for career changes.',
    },
    {
      question: 'What industries does this apply to?',
      answer:
        'The principles work across tech, finance, consulting, marketing, operations, and more. We provide industry-specific examples throughout the course.',
    },
  ];

  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-300">
            Everything you need to know about the course
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex justify-between items-start text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
                  <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 p-8 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 rounded-lg text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 dark:text-slate-300 mb-4">
            Reach out to our support team or schedule a consultation call.
          </p>
          <a
            href="mailto:support@whiteboardconsultant.com"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
