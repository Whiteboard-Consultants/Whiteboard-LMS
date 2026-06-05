
import type { Metadata } from 'next';
import AustraliaPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Study in Australia from India | Australian Education Consultants',
  description:
    'Study in Australia with expert consultants in Kolkata. Top universities, work permits, post-study visa options, and IELTS/TOEFL prep.',
  path: '/study-abroad/australia',
  openGraphTitle: 'Study in Australia: The Ultimate Guide for Indian Students | Whiteboard Consultants',
  openGraphDescription:
    'Explore top Australian universities, courses, and post-study work options. Get free counseling from our expert Australia education consultants in Kolkata.',
});

export default async function AustraliaPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-australia.json");
    return (
        <AustraliaPageClient>
             <WhyChooseUsSection id="why-choose-us-australia" data={whyChooseUsData} />
        </AustraliaPageClient>
    );
}
