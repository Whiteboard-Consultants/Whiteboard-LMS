
import type { Metadata } from 'next';
import DubaiPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';

export const metadata: Metadata = {
  title: "Study in Dubai (UAE) from India | Top Dubai Education Consultants",
  description: "Your complete guide to studying in Dubai. Get expert advice from Kolkata's leading consultants on top international university campuses, courses, student visas, and costs.",
  alternates: {
    canonical: '/study-abroad/dubai',
  },
   openGraph: {
    title: "Study in Dubai: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top university branch campuses in Dubai, courses, and career opportunities. Get free counseling from our expert Dubai education consultants in Kolkata.",
    url: '/study-abroad/dubai',
  },
};

const faqsForSchema = [
    {
        questionName: "Why is Dubai a good study destination for Indian students?",
        acceptedAnswerText: "Dubai is an excellent choice for its strategic location, tax-free environment, diverse culture, and presence of many international university branch campuses. It offers world-class infrastructure and strong career opportunities in sectors like business, tourism, and technology."
    },
    {
        questionName: "What are the requirements to study in Dubai for Indian students?",
        acceptedAnswerText: "For undergraduate courses, you typically need a Higher Secondary Certificate with good grades (60-80%). For postgraduate courses, a relevant bachelor's degree is required. English proficiency tests like IELTS (5.5-6.5) or TOEFL are also necessary for most programs."
    },
    {
        questionName: "What is the cost of studying in Dubai?",
        acceptedAnswerText: "Tuition fees for international students generally range from AED 50,000 to AED 100,000 per year for most courses. Living costs are estimated to be around AED 3,000 to AED 6,000 per month, depending on lifestyle and accommodation."
    },
    {
        questionName: "Can I work in Dubai after my studies?",
        acceptedAnswerText: "Yes, Dubai offers various pathways for students to work after graduation. Many free zones offer student and graduate-friendly visa options, and the UAE government has introduced long-term residency visas like the Golden Visa for talented students and professionals."
    }
];


export default async function DubaiPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-dubai.json");
    
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqsForSchema.map(faq => ({
            "@type": "Question",
            "name": faq.questionName,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.acceptedAnswerText
            }
        }))
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <DubaiPageClient>
                 <WhyChooseUsSection id="why-choose-us-dubai" data={whyChooseUsData} />
            </DubaiPageClient>
        </>
    );
}
