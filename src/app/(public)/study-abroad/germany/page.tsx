
import type { Metadata } from 'next';
import GermanyPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';

export const metadata: Metadata = {
  title: "Study in Germany from India | Top German Education Consultants",
  description: "Study in Germany with expert guidance from Kolkata's leading consultants. Learn about public universities with no tuition fees, admission requirements (APS, Studienkolleg), and the visa process (Blocked Account).",
  alternates: {
    canonical: '/study-abroad/germany',
  },
  openGraph: {
    title: "Study in Germany: The Complete Guide for Indian Students | Whiteboard Consultants",
    description: "Your guide to tuition-free education in Germany. Explore top universities, English-taught programs, and career opportunities with our expert consultants.",
    url: '/study-abroad/germany',
  },
};

export default async function GermanyPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-germany.json");
    return (
        <GermanyPageClient>
             <WhyChooseUsSection id="why-choose-us-germany" data={whyChooseUsData} />
        </GermanyPageClient>
    );
}
