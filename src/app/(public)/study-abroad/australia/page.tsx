
import type { Metadata } from 'next';
import AustraliaPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';

export const metadata: Metadata = {
  title: "Study in Australia from India | Australian Education Consultants",
  description: "Your complete guide to studying in Australia. Get expert advice from Kolkata's leading consultants on top universities, courses, admission requirements, student visa (subclass 500), and costs for Indian students.",
  alternates: {
    canonical: '/study-abroad/australia',
  },
  openGraph: {
    title: "Study in Australia: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top Australian universities, courses, and post-study work options. Get free counseling from our expert Australia education consultants in Kolkata.",
    url: '/study-abroad/australia',
  },
};

export default async function AustraliaPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-australia.json");
    return (
        <AustraliaPageClient>
             <WhyChooseUsSection id="why-choose-us-australia" data={whyChooseUsData} />
        </AustraliaPageClient>
    );
}
