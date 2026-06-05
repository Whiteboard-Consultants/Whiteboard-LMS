'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { coursesFaqs } from '@/lib/courses-faqs';

export default function CoursesFaqSection() {
  return (
    <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Common questions about our test prep, upskilling, and online courses in Kolkata.
          </p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {coursesFaqs.map((faq, index) => (
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
