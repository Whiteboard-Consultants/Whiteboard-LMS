import type { Metadata } from 'next';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import HomePageClient from "@/components/home-page-client";

// Cache homepage for 1 hour - Improves TTFB significantly
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Whiteboard Consultants | Best Study Abroad & Test Prep in Kolkata',
  description: 'Expert study abroad & test prep consultant in Kolkata. IELTS, TOEFL, GMAT coaching + college admissions. 1000+ success stories. Start your global journey today.',
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

    return <HomePageClient whyChooseUsData={whyChooseUsData} />;
}
