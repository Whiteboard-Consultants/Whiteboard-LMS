'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { careerSolutionsFaqs } from '@/lib/career-solutions-faqs';

export default function CareerSolutionsFaqSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white font-headline">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-foreground/70 dark:text-slate-300/70">
            Career internships, upskilling, and professional development with Whiteboard Consultants.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {careerSolutionsFaqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-lg">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
