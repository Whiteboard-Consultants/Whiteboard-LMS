
'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    question: "Why should I use an education consultant for studying abroad?",
    answer: "An education consultant simplifies the complex process of applying to international universities. At Whiteboard Consultants, we provide expert guidance on university and course selection, application assistance, visa processing, and test preparation, increasing your chances of admission to your dream university."
  },
  {
    question: "Which countries can I study in with your help?",
    answer: "We offer guidance for a wide range of popular study destinations, including the USA, UK, Canada, Australia, Ireland, Germany, New Zealand, and Dubai (UAE). We help you choose the best country based on your academic profile, career goals, and budget."
  },
  {
    question: "What services do you offer for study abroad applicants?",
    answer: "Our comprehensive services cover every step of your journey: personalized counseling, university shortlisting, application and SOP/LOR assistance, visa guidance, test preparation (IELTS, TOEFL, GRE, GMAT), education loan support, and pre-departure orientations."
  },
  {
    question: "How do you help with the visa application process?",
    answer: "We provide end-to-end visa support, including documentation checks, application form filling, mock interview preparation, and staying updated with the latest immigration policies to ensure a high success rate for our students."
  },
  {
    question: "Do you provide test preparation coaching?",
    answer: "Yes, we offer expert coaching for all major standardized tests required for studying abroad, including IELTS, TOEFL, GRE, GMAT, and SAT. Our programs are designed to help you achieve the scores needed for top universities."
  },
  {
    question: "Can you help me find scholarships and financial aid?",
    answer: "Absolutely. Our team helps you identify and apply for relevant scholarships, grants, and other financial aid opportunities. We also assist with the education loan application process to help you manage your finances effectively."
  },
  {
    question: "How much do your services cost?",
    answer: "We believe in transparency. Our initial counseling sessions are completely free to help you understand your options. While some of our premium services like dedicated test preparation or in-depth application support are chargeable, we will provide a clear breakdown of all costs upfront. There are no hidden fees."
  }
]

export default function StudyAbroadFaqSection() {
  return (
    <div className="container">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-xl text-muted-foreground">
          Find answers to common questions about studying abroad and our services.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold text-lg">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
