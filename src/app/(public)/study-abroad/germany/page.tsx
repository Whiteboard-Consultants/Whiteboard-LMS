
import type { Metadata } from 'next';
import GermanyPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Study in Germany from India | Top German Education Consultants',
  description:
    'Study in Germany with expert consultants in Kolkata. Tuition-free education, APS/Studienkolleg prep, Blocked Account, and career guidance.',
  path: '/study-abroad/germany',
  openGraphTitle: 'Study in Germany: The Complete Guide for Indian Students | Whiteboard Consultants',
  openGraphDescription:
    'Your guide to tuition-free education in Germany. Explore top universities, English-taught programs, and career opportunities with our expert consultants.',
});

export default async function GermanyPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-germany.json");
    return (
        <GermanyPageClient>
             <WhyChooseUsSection id="why-choose-us-germany" data={whyChooseUsData} />
        </GermanyPageClient>
    );
}
