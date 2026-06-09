import type { Metadata } from 'next';
import type { WhyChooseUsData } from '@/lib/content';
import whyChooseUsHome from '@/content/why-choose-us-home.json';
import HomePageClient from '@/components/home-page-client';
import { pageMetadata } from '@/lib/seo';

// Pre-render at build time; revalidate content hourly
export const revalidate = 3600;
export const dynamic = 'force-static';

export const metadata: Metadata = {
  ...pageMetadata({
    title: 'Whiteboard Consultants | Best Study Abroad & Test Prep in Kolkata',
    description:
      'Expert study abroad & test prep consultant in Kolkata. IELTS, TOEFL, aptitude test prep, college admissions, and upskilling. 1000+ success stories. Start your global journey today.',
    path: '/',
    openGraphDescription:
      "Unlock your global academic and career potential. Expert guidance for studying abroad, test prep, and admissions from Kolkata's leading education consultants.",
    openGraph: {
      images: [
        {
          url: '/og-image-home.png',
          width: 1200,
          height: 630,
          alt: 'Whiteboard Consultants Team and Students',
        },
      ],
    },
  }),
  twitter: {
    title: "Whiteboard Consultants - Kolkata's #1 Study Abroad & Test Prep Expert",
    description:
      'Planning to study abroad? Need IELTS, TOEFL, or aptitude test prep? Whiteboard Consultants in Kolkata is your one-stop solution for success.',
    images: ['/twitter-image-home.png'],
  },
};

export default function Page() {
    return (
        <HomePageClient whyChooseUsData={whyChooseUsHome as WhyChooseUsData} />
    );
}
