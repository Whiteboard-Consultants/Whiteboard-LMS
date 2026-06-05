
import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact-page-client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact Us | Whiteboard Consultants',
  description:
    'Contact Whiteboard Consultants in Kolkata for expert guidance on study abroad, test prep, and college admissions. Free consultation available today.',
  path: '/contact',
});

export default function ContactPage() {

    const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.whiteboardconsultant.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Contact",
                "item": "https://www.whiteboardconsultant.com/contact"
            }
        ]
    };
    
    const contactPointLd = {
      "@context": "https://schema.org",
      "@type": "ContactPoint",
      "telephone": "+91-8583035656",
      "contactType": "customer service",
      "areaServed": "IN",
      "availableLanguage": "en"
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPointLd) }}
            />
            <ContactPageClient />
        </>
    );
}
