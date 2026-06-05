
import type { Metadata } from 'next';
import UKPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from '@/lib/content';
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Study in the UK - Premier Consultants in Kolkata | Whiteboard Consultants',
  description:
    'Study in UK with expert consultants in Kolkata. Top universities, IELTS/TOEFL prep, Graduate Route visa, and career guidance for Indian students.',
  path: '/study-abroad/uk',
  openGraphTitle: 'Study in the UK: The Ultimate Guide for Indian Students | Whiteboard Consultants',
  openGraphDescription:
    'Explore top UK universities, courses, and Graduate Route visa options. Get free counseling from our expert UK education consultants in Kolkata.',
});


export default async function UKPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-uk.json");
    return (
        <UKPageClient>
            <WhyChooseUsSection id="why-choose-us-uk" data={whyChooseUsData} />
        </UKPageClient>
    )
}
