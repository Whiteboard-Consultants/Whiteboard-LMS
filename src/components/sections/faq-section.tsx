'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type Faq = { readonly question: string; readonly answer: string };

export function FaqSection({
  title = 'Frequently Asked Questions',
  description,
  faqs,
}: {
  title?: string;
  description: string;
  faqs: readonly Faq[];
}) {
  return (
    <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
            {title}
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">{description}</p>
        </div>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`item-${index}`}>
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
