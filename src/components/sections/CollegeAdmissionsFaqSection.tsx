'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { collegeAdmissionsFaqs } from '@/lib/college-admissions-faqs';

export default function CollegeAdmissionsFaqSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Common questions about college admissions in India with Whiteboard Consultants, Kolkata.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {collegeAdmissionsFaqs.map((faq, index) => (
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
      </div>
    </section>
  );
}
