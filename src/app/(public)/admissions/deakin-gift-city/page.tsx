import { Metadata } from 'next';
import DeakinGiftCityClient from './deakin-gift-city-client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Deakin GIFT City Admissions',
  description:
    "As the official East India partner for Deakin University, we provide expert guidance for admissions to Deakin's GIFT City campus in Gandhinagar. Explore postgraduate programs in Business, Technology, and FinTech.",
  path: '/admissions/deakin-gift-city',
  keywords: [
    'Deakin University',
    'Deakin GIFT City',
    'Deakin India',
    'study in India',
    'Australian university in India',
    'Whiteboard Consultants Deakin',
  ],
});

async function getDeakinPageData() {
    try {
        const content = await import('@/content/deakin-gift-city.json');
        return content.default;
    } catch (error) {
        console.error('Error loading Deakin content:', error);
        return {
            programs: [],
            whyDeakinGiftCity: [],
            whyApplyWithUs: [],
            industryPartners: [],
            studentLife: []
        };
    }
}

export default async function DeakinGiftCityPage() {
    const pageData = await getDeakinPageData();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "Deakin University, GIFT City India Campus",
        "url": "https://www.whiteboardconsultant.com/admissions/deakin-gift-city",
        "logo": "https://www.deakin.edu.au/etc.clientlibs/deakin/responsive/images/logo.svg",
        "parentOrganization": {
            "@type": "CollegeOrUniversity",
            "name": "Deakin University",
            "sameAs": "https://www.deakin.edu.au/"
        },
        "description": "The Deakin University GIFT City campus in Gandhinagar, India, offering world-class Australian postgraduate degrees in India.",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "Whiteboard Consultants",
            "url": "https://www.whiteboardconsultant.com"
        },
        "hasCourse": pageData.programs.map((program: any) => ({
            "@type": "Course",
            "name": program.title,
            "description": program.description,
            "provider": {
                "@type": "EducationalOrganization",
                "name": "Deakin University, GIFT City India Campus"
            }
        }))
    };
    
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <DeakinGiftCityClient data={pageData} />
        </>
    );
}
