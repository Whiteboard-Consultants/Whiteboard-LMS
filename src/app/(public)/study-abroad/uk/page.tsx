
import type { Metadata } from 'next';
import UKPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from '@/lib/content';
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';


export const metadata: Metadata = {
  title: "Study in the UK - Premier Consultants in Kolkata | Whiteboard Consultants",
  description: "Your guide to studying in the United Kingdom. Get assistance with top UK universities, courses, student visas, and the new Graduate Route from our experts in Kolkata.",
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
