
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
  },
  {
    question: "What is the ideal IELTS score for studying abroad?",
    answer: "IELTS requirements vary significantly by university and destination country. Most UK universities require a band score of 6.5-7.0, Australian institutions typically require 6.5+, while USA universities usually accept 6.0+. We assess your target universities' requirements and provide coaching tailored to your specific needs. Our expert instructors design personalized study plans to help you achieve the band score you need."
  },
  {
    question: "How much time should I dedicate to TOEFL preparation?",
    answer: "Most students benefit from 2-3 months of focused preparation, dedicating 15-20 hours per week to study. However, this varies based on your current English proficiency level. Our accelerated programs can achieve results in 4-6 weeks with intensive coaching for committed students. We offer flexible scheduling including evening and weekend classes to accommodate your academic schedule."
  },
  {
    question: "What's the difference between IELTS and TOEFL?",
    answer: "IELTS (International English Language Testing System) focuses on British English and is the preferred test in the UK, Australia, Canada, and New Zealand. TOEFL (Test of English as a Foreign Language) emphasizes American English and is widely accepted in the USA and Canada. IELTS involves a face-to-face speaking component, while TOEFL is entirely computer-based. We offer coaching for both exams and help you choose the test that aligns with your target universities."
  },
  {
    question: "How much does studying abroad typically cost?",
    answer: "Costs vary significantly by country: USA averages $30,000-60,000 per academic year, UK ranges from £15,000-35,000 annually, Canada costs approximately $20,000-35,000 yearly, and Australia typically ranges from $20,000-45,000 per year. These figures include tuition and living expenses. However, many students reduce costs by 20-100% through scholarships, grants, and financial aid. We help you explore all funding options to make studying abroad affordable."
  },
  {
    question: "What is the GMAT and who should take it?",
    answer: "The GMAT (Graduate Management Admission Test) is required for MBA and business-related master's programs. The test evaluates analytical, writing, quantitative, verbal, and reading skills essential for graduate business studies. If you're planning an MBA from a top business school worldwide, the GMAT is essential. Scores are valid for 5 years. Our GMAT prep courses include intensive training, practice tests, and personalized study strategies to optimize your performance."
  },
  {
    question: "How long does the visa process typically take?",
    answer: "Visa processing times vary by country: USA F-1 student visas typically take 3-5 weeks post-interview, UK student visas usually take 3-8 weeks from application, Canada Study Permits generally require 4-8 weeks, and Australia eVisas can be processed within 1-14 days. The timeline depends on your application completeness, background checks, and current processing volumes. We prepare you thoroughly to avoid delays and rejections, ensuring timely visa approval before your program starts."
  },
  {
    question: "Can I work while studying abroad?",
    answer: "Work permissions vary significantly by country and visa type. Most UK student visas allow 20 hours/week during semester and full-time during holidays. USA F-1 visas permit limited on-campus work (up to 20 hours/week). Canada allows international students to work up to 20 hours/week during studies and full-time during breaks. Australia permits 20 hours/week during studies. We advise students on work regulations, tax implications, and how to balance work with academics to maximize earnings while maintaining academic excellence."
  },
  {
    question: "How do I maintain my student visa status?",
    answer: "To maintain valid student visa status, you must maintain full-time enrollment (typically 12+ credit hours/semester), achieve satisfactory academic progress (GPA varies by institution), and comply with work hour restrictions if applicable. You must also maintain your status as a full-time student and notify immigration authorities of any address changes. We guide students on compliance requirements and help them understand immigration regulations to ensure their visa remains valid throughout their studies."
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
