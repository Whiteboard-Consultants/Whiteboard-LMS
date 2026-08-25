'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Is the program-fit consultation really free?',
    answer:
      'Yes — no cost, no obligation, no credit card. The personalised report and 15-minute counsellor debrief are included at no charge.',
  },
  {
    question: "I'm not from a business background — will this work for me?",
    answer:
      "Yes. Many of our partner programmes accept graduates from non-commerce backgrounds. We'll match you to programmes that fit your academic profile and career goals — not assume you're already in management.",
  },
  {
    question: "How is this different from just Googling 'best online MBA'?",
    answer:
      "Google gives you ranked lists. We give you a counsellor and a personalised shortlist based on your role, budget, timeline, and goals — plus a live debrief so you can ask the questions lists don't answer.",
  },
  {
    question: 'My timeline is tight — is it too late to apply for this cohort?',
    answer:
      "It depends on the programme. Some have rolling admissions; others have fixed cohort dates. Tell us your preferred start window in the form and we'll confirm what's still open — without pressure.",
  },
  {
    question: 'How many hours a week does the program actually require?',
    answer:
      'Most working professionals plan for roughly 8–12 hours a week, depending on the university and pace. We explain the real weekly commitment for each shortlisted programme so you can choose what fits your job.',
  },
  {
    question: "What if I go through the consultation and decide it's not the right fit?",
    answer:
      "That's a perfectly fine outcome. The consultation exists to give you clarity — including clarity that now isn't the right time, or that a different path fits better. No catch, no hard sell.",
  },
];

export function MbaLandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-slate-50/80">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Questions We Get Asked Every Day
          </h2>
          <p className="text-xl text-gray-600">
            Short answers in plain language — not marketing-department phrasing.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="backdrop-blur-md bg-white/50 border border-white/70 rounded-xl overflow-hidden hover:border-blue-200/80 hover:shadow-md transition-all duration-300"
            >
              <button
                type="button"
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
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
