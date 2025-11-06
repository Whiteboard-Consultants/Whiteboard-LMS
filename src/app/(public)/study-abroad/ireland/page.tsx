
import type { Metadata } from 'next';
import IrelandPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';

export const metadata: Metadata = {
  title: "Study in Ireland | Top Irish Education Consultants in Kolkata",
  description: "Study in Ireland with expert guidance from Kolkata. Top universities, affordable tuition, work permits, and post-study visa options. Free consultation!",
  alternates: {
    canonical: '/study-abroad/ireland',
  },
   openGraph: {
    title: "Study in Ireland: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top Irish universities, courses, and post-study work options. Get free counseling from our expert Ireland education consultants in Kolkata.",
    url: '/study-abroad/ireland',
  },
};


export default async function IrelandPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-ireland.json");
    
    return (
        <IrelandPageClient>
            <WhyChooseUsSection id="why-choose-us-ireland" data={whyChooseUsData} />
        </IrelandPageClient>
    );
}
