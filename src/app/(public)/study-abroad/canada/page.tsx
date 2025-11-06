
import type { Metadata } from 'next';
import CanadaPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';

export const metadata: Metadata = {
  title: "Study in Canada from India | Top Canada Education Consultants in Kolkata",
  description: "Study in Canada with expert consultants in Kolkata. Top universities, PGWP, SDS visa, IELTS/TOEFL prep, and career guidance for Indian students.",
  alternates: {
    canonical: '/study-abroad/canada',
  },
  openGraph: {
    title: "Study in Canada: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top Canadian universities, colleges, and post-study work options (PGWP). Get free counseling from our expert Canada education consultants in Kolkata.",
    url: '/study-abroad/canada',
  },
};

export default async function CanadaPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-canada.json");
    return (
        <CanadaPageClient>
            <WhyChooseUsSection id="why-choose-us-canada" data={whyChooseUsData} />
        </CanadaPageClient>
    )
}
