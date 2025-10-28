
import type { Metadata } from 'next';
import NewZealandPageClient from "./client";
import { getWhyChooseUsData, WhyChooseUsData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Study in New Zealand from India | NZ Education Consultants",
  description: "Your complete guide to studying in New Zealand. Get expert advice from Kolkata's leading consultants on top universities, courses, admission requirements, student visas, and costs for Indian students.",
  alternates: {
    canonical: '/study-abroad/new-zealand',
  },
  openGraph: {
    title: "Study in New Zealand: The Ultimate Guide for Indian Students | Whiteboard Consultants",
    description: "Explore top NZ universities, polytechnics, and post-study work options. Get free counseling from our expert New Zealand education consultants in Kolkata.",
    url: '/study-abroad/new-zealand',
  },
};

export default async function NewZealandPage() {
    const whyChooseUsData: WhyChooseUsData = await getWhyChooseUsData("why-choose-us-new-zealand.json");
    return <NewZealandPageClient whyChooseUsData={whyChooseUsData} />;
}
