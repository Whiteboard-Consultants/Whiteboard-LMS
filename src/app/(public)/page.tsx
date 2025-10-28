
import type { Metadata } from 'next';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import HomePageClient from "@/components/home-page-client";

export const metadata: Metadata = {
  title: 'Whiteboard Consultants | Best Study Abroad & Test Prep in Kolkata',
  description: 'Top-rated education consultant in Kolkata specializing in study abroad, IELTS/TOEFL/GMAT/GRE test prep, and college admissions. Your journey to global education starts here.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Whiteboard Consultants | Best Study Abroad & Test Prep in Kolkata',
    description: "Unlock your global academic and career potential. Expert guidance for studying abroad, test prep, and admissions from Kolkata's leading education consultants.",
    url: '/',
    images: [
      {
        url: '/og-image-home.png',
        width: 1200,
        height: 630,
        alt: 'Whiteboard Consultants Team and Students',
      },
    ],
  },
  twitter: {
    title: 'Whiteboard Consultants - Kolkata\'s #1 Study Abroad & Test Prep Expert',
    description: 'Planning to study abroad? Need to ace your IELTS, TOEFL, GMAT, or GRE? Whiteboard Consultants in Kolkata is your one-stop solution for success.',
    images: ['/twitter-image-home.png'],
  },
};

export default async function Page() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-home.json");
    
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": ["EducationalOrganization", "LocalBusiness"],
      "name": "Whiteboard Consultants",
      "description": "The premier education consultancy in Kolkata for study abroad, test preparation (IELTS, TOEFL, GMAT, GRE), and college admissions. We provide expert counseling, application assistance, and career development services to students aiming for global universities.",
      "url": "https://whiteboard-consultants-mock.com",
      "logo": "https://whiteboard-consultants-mock.com/logo.png",
      "image": "https://whiteboard-consultants-mock.com/og-image-home.png",
      "telephone": "+91-8583035656",
      "email": "info@whiteboardconsultants.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "'My Cube', 6th Floor, Park Plaza, 71, Park Street",
        "addressLocality": "Kolkata",
        "addressRegion": "WB",
        "postalCode": "700016",
        "addressCountry": "IN"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "22.5514",
        "longitude": "88.3522"
      },
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "22.5726",
          "longitude": "88.3639"
        },
        "geoRadius": "50000" // 50km radius around Kolkata
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday"
          ],
          "opens": "10:00",
          "closes": "18:00"
        },
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": "Saturday",
          "opens": "10:00",
          "closes": "15:00"
        }
      ],
      "founder": [
        {
          "@type": "Person",
          "name": "Navnit Daniel Alley",
          "jobTitle": "Co-Founder",
          "url": "https://www.linkedin.com/in/navnit-daniel-alley-sales-and-career-coach"
        },
        {
          "@type": "Person",
          "name": "Prateek Chaudhuri",
          "jobTitle": "Co-Founder",
          "url": "https://www.linkedin.com/in/prateek-chaudhuri-6a003b23/"
        }
      ],
      "knowsAbout": [
        "Study Abroad",
        "IELTS Preparation",
        "TOEFL Preparation",
        "GMAT Preparation",
        "GRE Preparation",
        "College Admissions",
        "Career Counseling",
        "Student Visa Assistance"
      ],
      "sameAs": [
        "https://www.facebook.com/whiteboardconsultant",
        "https://www.linkedin.com/company/whiteboard-consultant/"
      ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <HomePageClient whyChooseUsData={whyChooseUsData} />
        </>
    );
}
