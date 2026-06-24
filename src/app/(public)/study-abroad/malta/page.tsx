
import type { Metadata } from 'next';
import MaltaPageClient from './client';
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Study in Malta | Top Malta Education Consultants in Kolkata',
  description:
    'Study in Malta with expert guidance from Kolkata. EU-recognised degrees, English-medium education, Schengen access, and post-study work options. Free consultation!',
  path: '/study-abroad/malta',
  openGraphTitle: 'Study in Malta: Your Gateway to Europe\'s Mediterranean Gem | Whiteboard Consultants',
  openGraphDescription:
    'Explore top Maltese universities, courses, and work options. Get free counseling from our expert Malta education consultants in Kolkata.',
});


export default async function MaltaPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-malta.json");
    
    return (
        <MaltaPageClient>
            <WhyChooseUsSection id="why-choose-us-malta" data={whyChooseUsData} />
        </MaltaPageClient>
    );
}
