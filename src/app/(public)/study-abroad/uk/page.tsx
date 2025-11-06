
import type { Metadata } from 'next';
import UKPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from '@/lib/content';
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';


export const metadata: Metadata = {
  title: "Study in the UK - Premier Consultants in Kolkata | Whiteboard Consultants",
  description: "Study in UK with expert consultants in Kolkata. Top universities, IELTS/TOEFL prep, Graduate Route visa, and career guidance for Indian students.",
  alternates: {
    canonical: '/study-abroad/uk',
  },
};


export default async function UKPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-uk.json");
    return (
        <UKPageClient>
            <WhyChooseUsSection id="why-choose-us-uk" data={whyChooseUsData} />
        </UKPageClient>
    )
}
