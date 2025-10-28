
import { Metadata } from 'next';
import { getUowIndiaPageData } from '@/lib/content';
import UowIndiaClient from './uow-india-client';

export const metadata: Metadata = {
    title: "University of Wollongong (UOW) India Admissions | Whiteboard Consultants",
    description: "As the official East India partner for the University of Wollongong, we provide expert guidance for admissions to the UOW campus at GIFT City, Gandhinagar. Explore programs in Computing, Data Analytics, and FinTech.",
    keywords: ["University of Wollongong India", "UOW India", "UOW GIFT City", "study in India", "Australian university in India", "Whiteboard Consultants UOW"],
    alternates: {
        canonical: '/admissions/uow-india',
    },
};

export default async function UowIndiaPage() {
    const pageData = await getUowIndiaPageData();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "University of Wollongong, India Campus",
        "url": "https://whiteboard-consultants-mock.com/admissions/uow-india",
        "logo": "https://www.uow.edu.au/media/2023/uow-logo-primary-rgb.svg",
        "parentOrganization": {
            "@type": "CollegeOrUniversity",
            "name": "University of Wollongong",
            "sameAs": "https://www.uow.edu.au/"
        },
        "description": "The University of Wollongong (UOW) India campus at GIFT City, Gandhinagar, offering world-class Australian degrees in India.",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "Whiteboard Consultants",
            "url": "https://whiteboard-consultants-mock.com"
        },
        "hasCourse": pageData.programs.map(program => ({
            "@type": "Course",
            "name": program.title,
            "description": program.description,
            "provider": {
                "@type": "EducationalOrganization",
                "name": "University of Wollongong, India Campus"
            }
        }))
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <UowIndiaClient data={pageData} />
        </>
    );
}
