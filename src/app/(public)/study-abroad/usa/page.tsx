
import UsaPageClient from "./client";
import type { Metadata } from 'next';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from "@/components/sections/why-choose-us-section";

export const metadata: Metadata = {
  title: "Study in USA from India | Top US University Consultants in Kolkata",
  description: "Your complete guide to studying in the USA. Get expert advice from Kolkata's leading consultants on top universities, courses, admission requirements (SAT, ACT, GRE, GMAT), F-1 visa, and costs for Indian students.",
  alternates: {
    canonical: '/study-abroad/usa',
  },
  openGraph: {
    title: "Study in the USA: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top US universities, admission processes, and post-study work options (OPT/CPT). Get free counseling from our expert USA education consultants in Kolkata.",
    url: '/study-abroad/usa',
  },
};

const faqs = [
    {
        questionName: "Why is the USA a top study destination for Indian students?",
        acceptedAnswerText: "The USA is a top destination due to its world-leading universities, immense research opportunities, flexible curriculum, vibrant campus life, and access to a global network of professionals. It offers unparalleled exposure to innovation and diverse career paths."
    },
    {
        questionName: "What are the requirements to study in the USA?",
        acceptedAnswerText: "For undergraduate programs, you'll need high school transcripts, SAT/ACT scores, essays, and LORs. For graduate programs, you'll need a bachelor's degree, GRE/GMAT scores, a Statement of Purpose (SOP), and Letters of Recommendation (LORs). English proficiency tests like TOEFL or IELTS are required for most students."
    },
    {
        questionName: "What is the cost of studying in the USA?",
        acceptedAnswerText: "Tuition fees can range from $25,000 to $70,000 per year depending on the university (public vs. private) and program. Living costs vary by location but are typically estimated between $15,000 and $25,000 per year."
    },
    {
        questionName: "What are OPT and CPT?",
        acceptedAnswerText: "Curricular Practical Training (CPT) allows F-1 students to gain work experience through employment, internships, or co-op programs that are an integral part of their curriculum. Optional Practical Training (OPT) is a period (typically 12 months) during which F-1 students can work in their field of study after graduation. STEM graduates may be eligible for a 24-month extension."
    }
];

export default async function UsaPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-usa.json");

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.questionName,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.acceptedAnswerText
            }
        }))
    };

    const breadcrumbSchema = {
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
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Study in USA",
                "item": "https://whiteboard-consultants-mock.com/study-abroad/usa"
            }
        ]
    };

    const programSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOccupationalProgram",
        "name": "Undergraduate and Postgraduate Studies in the USA",
        "description": "A comprehensive program designed to assist Indian students in gaining admission to top universities in the United States for various undergraduate and postgraduate degrees, including STEM, Business, Arts, and Humanities.",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "Whiteboard Consultants",
            "sameAs": "https://whiteboard-consultants-mock.com"
        },
        "educationalCredentialAwarded": [
            "Bachelor's Degree",
            "Master's Degree",
            "Doctorate Degree"
        ],
        "programPrequisites": [
            {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "HighSchool"
            },
            {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "Bachelor's"
            },
            "SAT/ACT Scores (for UG)",
            "GRE/GMAT Scores (for PG)",
            "TOEFL/IELTS Scores"
        ],
        "timeToComplete": "P2Y-P4Y", // 2 to 4 years
        "offers": {
            "@type": "Offer",
            "category": "Educational Fee",
            "priceSpecification": {
                "@type": "PriceSpecification",
                "price": "35000",
                "priceCurrency": "USD",
                "valueAddedTaxIncluded": false,
                "description": "Average annual tuition fee. Varies greatly by institution."
            }
        },
        "occupationalCategory": [
            "Computer and Mathematical Occupations",
            "Architecture and Engineering Occupations",
            "Business and Financial Operations Occupations",
            "Arts, Design, Entertainment, Sports, and Media Occupations",
            "Healthcare Practitioners and Technical Occupations"
        ],
        "trainingSalary": {
            "@type": "MonetaryAmountDistribution",
            "name": "Post-Graduation Average Salary",
            "currency": "USD",
            "duration": "P1Y",
            "percentile10": "50000",
            "percentile25": "65000",
            "median": "85000",
            "percentile75": "120000",
            "percentile90": "150000"
        },
        "hasCourse": [
            {
                "@type": "Course",
                "name": "Biomedical Engineering",
                "provider": { "@type": "Organization", "name": "Johns Hopkins University" }
            },
            {
                "@type": "Course",
                "name": "Business Analytics",
                "provider": { "@type": "Organization", "name": "Arizona State University" }
            },
            {
                "@type": "Course",
                "name": "Computer Science",
                "provider": { "@type": "Organization", "name": "University of Massachusetts Amherst" }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(programSchema) }}
            />
            <UsaPageClient>
                <WhyChooseUsSection id="why-choose-us-usa" data={whyChooseUsData} />
            </UsaPageClient>
        </>
    );
}
