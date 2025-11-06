
import type { Metadata } from 'next';
import ContactPageClient from '@/components/contact-page-client';

export const metadata: Metadata = {
  title: 'Contact Us | Whiteboard Consultants',
  description: 'Contact Whiteboard Consultants in Kolkata for expert guidance on study abroad, test prep, and college admissions. Free consultation available today.',
    alternates: {
        canonical: '/contact',
    },
};

export default function ContactPage() {

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
                "name": "Contact",
                "item": "https://whiteboard-consultants-mock.com/contact"
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
