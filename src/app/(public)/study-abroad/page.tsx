
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import PopularDestinationsSection from "@/components/sections/PopularDestinationsSection";
import StudyAbroadServicesSection from "@/components/sections/StudyAbroadServicesSection";
import WhyChooseUsSection from "@/components/sections/why-choose-us-section";
import StudyAbroadTestimonials from "@/components/sections/StudyAbroadTestimonials";
import StudyAbroadFaqSection from "@/components/sections/StudyAbroadFaqSection";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from 'next';
import { getWhyChooseUsData, WhyChooseUsData, getCountriesData, Country } from "@/lib/content";

export const metadata: Metadata = {
  title: "Expert Study Abroad Consultants in Kolkata | Whiteboard Consultants",
  description: "Your expert guide to studying abroad. We offer comprehensive counseling, university selection, application assistance, and visa guidance for students in Kolkata. Explore top destinations like the USA, UK, Canada, and more.",
  alternates: {
    canonical: '/study-abroad',
  },
  openGraph: {
    title: "Study Abroad with Whiteboard Consultants - Kolkata's Premier Guide",
    description: "Dreaming of studying overseas? Get expert help with university admissions, test prep, and visa applications from Kolkata's top-rated study abroad consultants.",
    url: '/study-abroad',
  },
};

export default async function StudyAbroadPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-study-abroad.json");
    const destinations: Country[] = await getCountriesData();
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "Study Abroad Counseling",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Whiteboard Consultants",
         "url": "https://whiteboard-consultants-mock.com"
      },
      "areaServed": {
        "@type": "City",
        "name": "Kolkata"
       },
      "description": "End-to-end study abroad services including university and course selection, application assistance, SOP/LOR writing, visa guidance, and pre-departure support.",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Study Abroad Destinations",
        "itemListElement": [
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in USA", "url": "/study-abroad/usa" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in Canada", "url": "/study-abroad/canada" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in UK", "url": "/study-abroad/uk" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in Australia", "url": "/study-abroad/australia" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in New Zealand", "url": "/study-abroad/new-zealand" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in Ireland", "url": "/study-abroad/ireland" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in Germany", "url": "/study-abroad/germany" } },
          { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Study in Dubai", "url": "/study-abroad/dubai" } }
        ]
      }
    };
    
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://whiteboard-consultants-mock.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Study Abroad",
          "item": "https://whiteboard-consultants-mock.com/study-abroad"
        }
      ]
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Study Abroad in 6 Steps",
      "description": "Your step-by-step guide to successfully studying abroad, from choosing your destination to applying for a visa. Follow our proven roadmap to make your study abroad dreams a reality.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Choose Your Destination",
          "text": "Select the country and university that aligns with your academic goals and career aspirations.",
          "itemListElement": [
            { "@type": "HowToDirection", "text": "Research top universities worldwide" },
            { "@type": "HowToDirection", "text": "Compare education systems and costs" },
            { "@type": "HowToDirection", "text": "Consider climate and cultural factors" },
            { "@type": "HowToDirection", "text": "Evaluate post-graduation opportunities" }
          ]
        },
        {
          "@type": "HowToStep",
          "name": "Select Your Course",
          "text": "Find the perfect program that matches your interests, career goals, and academic background.",
           "itemListElement": [
            { "@type": "HowToDirection", "text": "Explore various fields of study" },
            { "@type": "HowToDirection", "text": "Check course curriculum and duration" },
            { "@type": "HowToDirection", "text": "Verify accreditation and rankings" },
            { "@type": "HowToDirection", "text": "Consider specialization options" }
          ]
        },
        {
          "@type": "HowToStep",
          "name": "Prepare for Tests",
          "text": "Take standardized tests like IELTS, TOEFL, GRE, GMAT, or SAT based on your chosen destination.",
           "itemListElement": [
            { "@type": "HowToDirection", "text": "Identify required standardized tests" },
            { "@type": "HowToDirection", "text": "Enroll in preparation courses" },
            { "@type": "HowToDirection", "text": "Practice with mock tests" },
            { "@type": "HowToDirection", "text": "Achieve target scores" }
          ]
        },
        {
          "@type": "HowToStep",
          "name": "Apply to Universities",
          "text": "Submit compelling applications with all required documents to your shortlisted universities.",
           "itemListElement": [
            { "@type": "HowToDirection", "text": "Complete application forms" },
            { "@type": "HowToDirection", "text": "Write statement of purpose" },
            { "@type": "HowToDirection", "text": "Gather recommendation letters" },
            { "@type": "HowToDirection", "text": "Submit academic transcripts" }
          ]
        },
        {
          "@type": "HowToStep",
          "name": "Secure Funding",
          "text": "Explore scholarships, education loans, and financial aid options to fund your education.",
           "itemListElement": [
            { "@type": "HowToDirection", "text": "Research scholarship opportunities" },
            { "@type": "HowToDirection", "text": "Apply for education loans" },
            { "@type": "HowToDirection", "text": "Calculate total expenses" },
            { "@type": "HowToDirection", "text": "Plan financial resources" }
          ]
        },
        {
          "@type": "HowToStep",
          "name": "Apply for Visa",
          "text": "Complete visa application process and prepare for your journey to study abroad.",
           "itemListElement": [
            { "@type": "HowToDirection", "text": "Gather visa documentation" },
            { "@type": "HowToDirection", "text": "Schedule visa interview" },
            { "@type": "HowToDirection", "text": "Prepare for departure" },
            { "@type": "HowToDirection", "text": "Arrange accommodation" }
          ]
        }
      ]
    };

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
    ];

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    return (
        <>
          <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
          <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                      Your Gateway to <span className="text-primary dark:text-white">Global Education</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground">
                      Navigate the path to international education with confidence. As the best education consultant in Kolkata, we provide expert guidance for top universities worldwide, test preparation, and visa assistance.
                    </p>
                    <div className="mt-10 flex items-center gap-4">
                        <Button asChild size="lg" className="dark:bg-black dark:text-white dark:border dark:border-white">
                            <Link href="/contact">
                                Get Started Today
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                         <Button asChild size="lg" variant="outline" className="dark:bg-slate-dark dark:text-white dark:hover:bg-slate-800 dark:border dark:border-white">
                            <Link href="#services">
                                View Services
                            </Link>
                        </Button>
                    </div>
                  </div>
                  <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
                      <Image
                        src="/study-abroad/study-abroad-hero.webp"
                        alt="Students in a lecture hall"
                        fill
                        className="object-cover"
                        data-ai-hint="university students lecture hall"
                       />
                  </div>
                </div>
            </div>
          </section>
          
          <section id="services" className="bg-background dark:bg-black">
            <StudyAbroadServicesSection />
          </section>
          
          <section className="dark:bg-slate-dark">
            <PopularDestinationsSection destinations={destinations} />
          </section>
          
          <section className="bg-muted dark:bg-black">
            <WhyChooseUsSection id="why-choose-us-study-abroad" data={whyChooseUsData} />
          </section>
           <section className="py-16 sm:py-24 bg-background dark:bg-slate-dark">
            <StudyAbroadTestimonials />
          </section>
          <section className="py-16 sm:py-24 bg-muted dark:bg-black">
             <StudyAbroadFaqSection />
          </section>
          <section className="bg-background dark:bg-slate-dark">
            <StudyAbroadCtaSection />
          </section>
        </>
    )
}
