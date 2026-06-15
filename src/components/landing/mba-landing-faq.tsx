'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Do these carry the same weight as a full-time MBA?',
    answer: (
      <div className="space-y-4">
        <p>
          <strong>The Official Position: Yes (with conditions)</strong>
        </p>
        <p>
          The UGC has officially notified that online and distance learning degrees are
          equivalent to conventional degrees at all levels. UGC&apos;s 2020 regulations
          explicitly state this equivalence.
        </p>
        <p>
          An online MBA from a UGC-DEB recognized university is treated as equivalent
          for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Government jobs (including UPSC)</li>
          <li>Higher education admissions (PhD eligibility)</li>
          <li>Private sector employment</li>
        </ul>
        <p>
          NEP 2020 further reinforced this by promoting flexible learning pathways —
          online degrees are part of the same academic credit framework.
        </p>
      </div>
    ),
  },
  {
    question: 'Are online MBA degrees recognized by employers?',
    answer:
      'Yes. Online MBA degrees from UGC/AICTE-recognized universities carry the same validity as on-campus degrees. Employers evaluate the institution and specialization — not the delivery mode.',
  },
  {
    question: 'Can I do an MBA while working full-time?',
    answer:
      'Absolutely. Our partner programs are designed for working professionals with flexible schedules, recorded lectures, and weekend live sessions.',
  },
  {
    question: 'How much does an online MBA cost in India?',
    answer:
      'Programs in our portfolio range from ₹1 Lac to ₹5 Lacs+, depending on the university and specialization. We\'ll help you find options within your stated budget.',
  },
  {
    question: 'How long does an online MBA take?',
    answer:
      'Most programs are 2 years. Some universities offer accelerated or extended timelines depending on your pace.',
  },
  {
    question: 'Do I need work experience to apply?',
    answer:
      'It depends on the program. Some accept fresh graduates; others prefer 1–2 years of experience. We\'ll match you to programs suited to your profile.',
  },
  {
    question: 'Is the consultation really free?',
    answer:
      'Yes. Our initial guidance and program shortlisting are completely free, with no obligation to enroll.',
  },
];

export function MbaLandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about Online MBA programs
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-white/50 border border-white/70 rounded-xl overflow-hidden hover:border-blue-200/80 hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 flex justify-between items-start text-left hover:bg-white/40 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-blue-500 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 bg-gradient-to-br from-blue-50/50 to-white/30 border-t border-white/60">
                  <div className="text-gray-700 leading-relaxed">
                    {typeof faq.answer === 'string' ? <p>{faq.answer}</p> : faq.answer}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 p-8 backdrop-blur-md bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/60 rounded-xl text-center shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-4">
            Reach out to our support team or schedule a consultation call.
          </p>
          <a
            href="mailto:info@whiteboardconsultant.com"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
}
