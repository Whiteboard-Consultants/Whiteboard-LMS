import { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";

import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Study Abroad FAQs Guide',
  description:
    'Answers to FAQs on study abroad, IELTS/TOEFL/aptitude test prep, work permits, and career growth from expert education consultants in Kolkata.',
  path: '/faqs',
});

const faqCategories = [
  {
    title: "Study Abroad",
    icon: "🌍",
    description: "Questions about studying abroad destinations, procedures, and costs",
    faqs: [
      {
        question: "Which is the best country to study abroad from India?",
        answer: "The best country depends on your goals and priorities:\n• Ireland - Top 5% globally ranked Universities, offering world-class research opportunities and academic excellence.\n• USA - Top-ranked universities and diverse opportunities\n• UK - Shorter, specialized programs (1-2 years)\n• Canada - Better immigration pathways and PR options\n• Germany - Affordable education with quality standards\n• Australia - Combines quality education with lifestyle\n\nConsider your budget, field of study, post-study work rights, and long-term visa options when deciding."
      },
      {
        question: "How much does it cost to study abroad?",
        answer: "Annual costs vary significantly by country and university:\n• Ireland: €12,000-30,000/year \n• USA: $30,000-70,000/year\n• UK: £25,000-45,000/year\n• Canada: $20,000-40,000/year\n• Germany: €10,000-20,000/year\n• Australia: $25,000-50,000/year\n\nThese include tuition, accommodation, and living expenses. Financial aid, scholarships, and part-time work can reduce costs substantially. Plan for total 2-4 year costs ranging from $40,000 to $300,000+ depending on country and program."
      },
      {
        question: "What is the procedure to study abroad?",
        answer: "The typical study abroad procedure:\n1. Research universities and programs aligned with your goals\n2. Prepare for entrance exams (IELTS, GMAT, GRE)\n3. Prepare application documents (transcripts, certificates, portfolio)\n4. Write Statement of Purpose (SOP) and get Letters of Recommendation (LOR)\n5. Apply to universities (usually Sept-Dec)\n6. Receive acceptances and financial aid offers\n7. Choose university and pay deposit\n8. Apply for student visa\n9. Arrange accommodation and finances\n\nThe entire process typically takes 6-12 months."
      },
      {
        question: "How long does it take to prepare for studying abroad?",
        answer: "Total preparation timeline is typically 6-12 months:\n• Test preparation (IELTS/TOEFL/GMAT/GRE): 3-4 months\n• Application document preparation: 2-3 months\n• Application submission and waiting: 3-4 months\n• Visa processing: 2-3 months\n\nStart planning 12 months before your intended start date to have ample time for test prep, applications, and visa processing. Beginning earlier improves your university choices and scholarship opportunities."
      },
      {
        question: "Which test is required for studying abroad?",
        answer: "Test requirements vary by country and program:\n• English-speaking countries: IELTS or TOEFL required\n• USA graduate studies: GMAT (for MBA/business) or GRE (for science/engineering) + TOEFL/IELTS\n• Alternative options: Duolingo English Test (DET) accepted by many universities\n\nMost universities accept both IELTS and TOEFL. Always check specific university requirements as they vary by institution and program."
      },
      {
        question: "What is the minimum IELTS and TOEFL score for studying abroad?",
        answer: "Minimum IELTS score requirements:\n• Undergraduate: 6.0-6.5\n• Postgraduate: 6.5-7.0\n• Top UK universities: 7.0-8.0+\n• Australian universities: 6.5-7.5+\n• Canadian universities: 6.5-7.0+\n• USA universities: 7.0+\n• Scholarships: 7.0-8.0+\n\nMinimum TOEFL score requirements:\n• Undergraduate: 79-87\n• Postgraduate: 87-100\n• Top UK universities: 100-120+\n• Australian universities: 87-105+\n• Canadian universities: 87-100+\n• USA universities: 90-100+\n• Scholarships: 100-120+\n\nNote: IELTS bands convert to TOEFL scores (6.5 IELTS ≈ 79-93 TOEFL, 7.0 IELTS ≈ 93-101 TOEFL, 7.5 IELTS ≈ 102-110 TOEFL)\n\nHigher scores significantly improve admission chances and scholarship opportunities."
      },
      {
        question: "Can I study abroad without IELTS?",
        answer: "Alternative English proficiency tests and options:\n• TOEFL - Accepted globally, especially in USA\n• Pearson English Test (PTE) - Growing acceptance\n• Duolingo English Test (DET) - Increasingly accepted\n• CEFR certification - European standard\n• Conditional admission - Complete pre-university English courses\n• Test waiver - If you studied in English-medium schools/universities\n\nAlways check specific university requirements as policies vary by institution."
      }
    ]
  },
  {
    title: "Test Preparation",
    icon: "📚",
    description: "Questions about IELTS, TOEFL, GMAT, and GRE preparation",
    faqs: [
      {
        question: "What is the difference between IELTS and TOEFL?",
        answer: "Key differences between IELTS and TOEFL:\n\nIELTS:\n• British English accent and spelling\n• Focuses on practical communication\n• 3-hour exam duration\n• Paper or computer-based options available\n• Widely accepted in UK, Australia, Canada, New Zealand\n\nTOEFL:\n• American English accent and spelling\n• More academic focus\n• 3-hour computer-based exam only\n• Primarily accepted in USA\n\nBoth are valid globally. For Indian students, IELTS is often considered easier due to British English familiarity and more relaxed pace."
      },
      {
        question: "How long does it take to prepare for IELTS and TOEFL?",
        answer: "IELTS preparation timeline depends on current English level:\n• Beginner: 6 months\n• Intermediate: 3-4 months\n• Advanced: 1-2 months\n\nTOEFL preparation timeline depends on current English level:\n• Beginner: 6-8 months\n• Intermediate: 4-6 months\n• Advanced: 2-3 months\n\nRecommended preparation approach (both tests):\n• Most students achieve target scores in 2-3 months with dedicated preparation\n• Daily study: 2-3 hours for 8-12 weeks\n• Intensive coaching: 3-4 hours/day for 4-6 weeks\n• IELTS: Allow extra time for practicing speaking with native speakers\n• TOEFL: Practice listening and note-taking skills, important for academic focus\n• Start preparation 3-4 months before your application deadline for optimal results"
      },
      {
        question: "What is the average IELTS and TOEFL score?",
        answer: "IELTS scoring benchmarks:\n• Global average: 5.8-6.0 (Band score out of 9)\n• India average: 5.9\n• Undergraduate requirement: 6.5-7.0\n• Postgraduate requirement: 7.0+\n• Top universities: 7.5-8.0+\n• Scholarships: 7.0-8.0+\n\nTOEFL scoring benchmarks:\n• Global average: 84-87 (Score out of 120)\n• USA university average: 79-90\n• Undergraduate requirement: 79-87\n• Postgraduate requirement: 87-100\n• Top universities: 100-120\n• Scholarships: 100-120+\n\nScore interpretation tips:\n• IELTS: Aim for at least 1.5 bands above minimum for better opportunities\n• TOEFL: Target 15-20 points above minimum requirement for competitive edge\n• Both tests: Higher scores significantly improve scholarship chances"
      },
      {
        question: "Is GMAT or GRE better for MBA?",
        answer: "Test comparison for MBA admissions:\n\nGMAT - Preferred for MBA:\n• Accepted by 88% of MBA programs\n• Focuses on business mathematics and reasoning\n• More relevant for business programs\n• Standard test for top MBA programs (Stanford, Harvard, etc.)\n\nGRE - Increasingly accepted:\n• Better for graduate science/engineering programs\n• Tests vocabulary and analytical skills\n• Flexible but GMAT remains the standard for MBA\n\nRecommendation: For MBA, choose GMAT. Always check your target university's specific requirements."
      },
      {
        question: "How to prepare for GMAT/GRE?",
        answer: "Recommended GMAT/GRE preparation strategy:\n\n1. Diagnostic test - Assess current level (2-3 weeks)\n2. Quantitative section - Study intensively (2-3 months)\n3. Verbal section - Study intensively (2-3 months)\n4. Mock tests - Practice weekly (8-12 weeks)\n5. Resources - Use Manhattan Prep, Kaplan, or coaching institutes\n6. Final prep - Full-length tests daily (final 2 weeks)\n7. Strategy - Develop exam day strategy and time management\n\nTotal timeline: 3-4 months for average preparation, 6+ months for top scores (750+/330+)"
      },
      {
        question: "What score do I need for top universities?",
        answer: "Target scores by program type:\n\nTop MBA Programs:\n• GMAT: 700-750+\n• Average at top 50 schools: 710-730\n\nGraduate Programs:\n• GRE: 320-330+ (Verbal: 160-167, Quant: 160-170)\n\nLanguage Tests:\n• IELTS/TOEFL: 7.0-8.5+ for top universities\n\nScholarship Requirements:\n• GMAT: 750+\n• GRE: 330+\n• IELTS: 8.0+\n\nNote: Score requirements vary by university and program. Always check specific requirements for your target institutions."
      }
    ]
  },
  {
    title: "Career & Study Abroad Benefits",
    icon: "💼",
    description: "Questions about career impact and opportunities",
    faqs: [
      {
        question: "How does studying abroad help career growth?",
        answer: "Key career benefits of studying abroad:\n• International exposure and global perspective\n• Strong international network of alumni and professionals\n• Higher salary prospects (typically 20-30% more than domestic graduates in many fields)\n• Better job opportunities, especially in tech and finance\n• Visa sponsorship pathways available (Canada, Australia, USA)\n• Quality education and degree recognition worldwide\n• Developed country work experience\n• Enhanced resume with international qualifications\n\nROI is significant, especially for STEM fields."
      },
      {
        question: "Can I work while studying abroad?",
        answer: "Work permissions by country:\n\nCanada:\n• 20 hours/week on-campus\n• Full-time during official breaks\n\nUK:\n• 20 hours/week at university\n• Full-time during official breaks\n\nIreland:\n• 20 hours/week during academic year\n• Full-time during official breaks\n• Can work more than 20 hours with employer permission\n• Highly student-friendly work policies\n\nUSA:\n• 20 hours/week on-campus\n• Some off-campus work with authorization\n\nGermany:\n• 120 days/year of full-time work\n• Or 240 days/year of half-time work\n\nAustralia:\n• 20 hours/week during studies\n• Full-time during official breaks\n\nNote: Regulations vary by visa type and university. Always check current requirements before enrollment. Ireland offers particularly student-friendly work policies with flexibility for higher hours with employer approval."
      },
      {
        question: "Is it possible to get admission without GPA?",
        answer: "Universities may consider applications with low or no GPA if you have:\n• Exceptional GMAT/GRE scores (750+/330+)\n• Strong work experience (5+ years in relevant field)\n• Compelling Statement of Purpose explaining your goals\n• Strong Letters of Recommendation from professionals\n• Excellent IELTS/TOEFL scores (8.0+/110+)\n• Relevant certifications or achievements\n• Demonstrated passion for the field\n\nMany universities now use holistic admission policies that focus on overall profile rather than single metrics. Check your target university's flexible admission options."
      },
      {
        question: "How to improve chances of getting scholarship?",
        answer: "Scholarship strategy for maximum chances:\n1. Achieve high test scores - GMAT 750+, GRE 330+, IELTS 8.0+\n2. Maintain excellent academic record - GPA 3.5+\n3. Write compelling SOP - Highlight unique goals and achievements\n4. Obtain strong LOR - Get recommendations from professors/employers\n5. Showcase work/internship experience - Relevant to your field\n6. Align with university strengths - Research their programs and faculty\n7. Apply early - First waves have more scholarship funds\n8. Apply to multiple universities - Increase your chances\n9. Consider graduate assistantship - Teaching or research roles\n10. Explore scholarships - Look for country/organization-specific opportunities"
      },
      {
        question: "What are post-study work visa options?",
        answer: "Post-study work visa options by country:\n\nCanada:\n• Post-Graduation Work Permit (PGWP)\n• Duration: 3-5 years for Canadian degree holders\n\nAustralia:\n• Temporary Graduate visa\n• Duration: 2-4 years depending on degree\n\nUK:\n• Graduate visa\n• Duration: 2-3 years to work after studies\n\nIreland:\n• Third Level Graduate Work Visa\n• Duration: 2 years to find employment and upskill\n• Easy pathway to permanent residency\n• EU access for career opportunities\n\nUSA:\n• Optional Practical Training (OPT)\n• Duration: 1-3 years of work experience\n\nGermany:\n• Job search visa: 18 months to find employment\n• Work visa available after securing job\n\nThese pathways help international graduates gain local experience and transition to permanent residency. Ireland offers particularly attractive options for EU market access and long-term settlement."
      }
    ]
  },
  {
    title: "Application & Documents",
    icon: "📝",
    description: "Questions about application process and required documents",
    faqs: [
      {
        question: "What documents do I need for study abroad applications?",
        answer: "Essential documents for study abroad applications:\n1. Passport - Valid for at least 2 years\n2. Academic transcripts - From high school and bachelor's degree\n3. Score reports - IELTS, TOEFL, GMAT, GRE\n4. Letters of Recommendation - 2-3 from professors/employers\n5. Statement of Purpose (SOP) - Personal essay about your goals\n6. Curriculum Vitae/Resume - Highlighting relevant experience\n7. Proof of financial support - Bank statements, sponsor letters\n8. Medical exam results - If required by university\n9. Police clearance certificate - For visa purposes\n10. Passport-size photographs - Per university specifications\n\nTip: Compile these early as some documents take time to obtain."
      },
      {
        question: "How to write a strong Statement of Purpose (SOP)?",
        answer: "Key components of a strong SOP:\n1. Clear introduction - Provide your background (1-2 lines)\n2. Field choice - Explain why you chose this field/program (specific reasons)\n3. Career goals - Include both short-term and long-term objectives\n4. University research - Explain why this specific university\n5. Program alignment - How the program matches your goals\n6. Achievements - Highlight relevant skills and accomplishments\n7. Challenges - Address gaps or low scores positively\n8. Enthusiasm - Conclude with determination and passion\n9. Length - Keep it 500-800 words\n10. Quality - Proofread multiple times\n\nImportant: Make each SOP unique to each university and program."
      },
      {
        question: "How important are Letters of Recommendation?",
        answer: "Letters of Recommendation (LOR) are very important because they:\n• Provide third-party validation of your abilities\n• Offer insights universities cannot get from your application\n• Often influence admission decisions significantly\n\nTypical requirements:\n• Number: 2-3 LORs required\n• From whom: Academic professors or previous employers\n• Best for grad programs: Direct supervisors who know your work\n• Content: Should include specific examples of your achievements\n\nTips for getting strong LORs:\n• Give recommenders 2-3 weeks notice\n• Provide your SOP, resume, and program details\n• Choose recommenders who know you well and can speak specifically\n• Follow up politely closer to the deadline"
      },
      {
        question: "When should I start applying?",
        answer: "Application timeline - Start 12 months before intended start date:\n\nMonths 1-3:\n• Research universities and programs\n• Prepare documents\n\nMonths 3-6:\n• Take entrance exams (IELTS/GMAT/GRE)\n• Study intensively\n\nMonths 6-8:\n• Finalize SOP\n• Collect Letters of Recommendation\n• Complete remaining documents\n\nMonths 8-12:\n• Submit applications (deadline usually Sept-Dec)\n• Receive admission decisions\n• Compare offers\n\nKey tips:\n• Early application increases admission and scholarship chances\n• Most universities follow rolling admissions\n• Earlier applicants have better selection and funding\n• Apply to mix of reach, target, and safety universities"
      }
    ]
  }
];

export default function FAQsPage() {
  // FAQPage Schema for Google
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqCategories.flatMap(category =>
      category.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    )
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="bg-background dark:bg-black">
        {/* Hero Section */}
        <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl font-headline">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Find answers to common questions about studying abroad, test preparation, and career development
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16 sm:py-24">
          <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="space-y-6">
                  {/* Category Header */}
                  <div className="flex items-start gap-4 pb-6 border-b border-border">
                    <span className="text-4xl">{category.icon}</span>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold font-headline text-foreground">
                        {category.title}
                      </h2>
                      <p className="mt-2 text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* FAQs Accordion */}
                  <Accordion type="single" collapsible className="w-full space-y-3">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border border-border rounded-lg px-6 bg-card hover:bg-accent/50 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-left font-semibold text-foreground">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground pt-2 pb-4">
                          <div className="whitespace-pre-wrap space-y-2">
                            {faq.answer.split('\n').map((line, lineIndex) => (
                              <div key={lineIndex} className={line.startsWith('•') || /^\d+\./.test(line) ? 'ml-2' : ''}>
                                {line}
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="mt-16 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center border border-primary/20">
              <Lightbulb className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold font-headline text-foreground mb-2">
                Didn't find your answer?
              </h3>
              <p className="text-muted-foreground mb-6">
                Our education consultants are here to help. Get personalized guidance for your study abroad journey.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
