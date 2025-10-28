
import CollegeAdmissionsClient from "./client";
import { getCollegeAdmissionsData } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "College Admissions India | Whiteboard Consultants",
    description: "Secure your spot in India's top colleges with expert admission guidance from Whiteboard Consultants in Kolkata. We partner with leading institutions like IISM and EIILM, offering comprehensive application support and test preparation.",
    alternates: {
        canonical: '/college-admissions',
    },
     openGraph: {
        title: 'College Admissions India | Whiteboard Consultants',
        description: "Partner with Kolkata's best education consultants for direct admission into top Indian colleges. We specialize in IISM, EIILM, and more.",
        url: '/college-admissions',
    },
};

export default async function CollegeAdmissionsPage() {
    const pageData = await getCollegeAdmissionsData();

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
                "name": "College Admissions",
                "item": "https://whiteboard-consultants-mock.com/college-admissions"
            }
        ]
    };
    
    const serviceLd = {
      "@context": "https://schema.org",
      "@type": "Service",
      "serviceType": "EducationalConsulting",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Whiteboard Consultants"
      },
      "name": "Domestic College Admissions Guidance",
      "description": "Comprehensive college admission services including college selection, application assistance, test preparation for Indian institutions, and scholarship guidance.",
      "areaServed": {
        "@type": "Country",
        "name": "India"
      }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
             <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
            />
            <CollegeAdmissionsClient pageData={pageData} />
        </>
    );
}
