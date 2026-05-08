import type { Metadata } from 'next';
import PartnerProgramsClient from './client';

export const metadata: Metadata = {
  title: "Partner Programs | Global Education Partners | Whiteboard Consultants",
  description: "Explore our exclusive partner programs with leading universities and institutions worldwide. Get access to special benefits and streamlined admission processes through our global partnerships.",
  alternates: {
    canonical: '/partner-programs',
  },
  openGraph: {
    title: "Partner Programs: Exclusive Global Education Opportunities | Whiteboard Consultants",
    description: "Discover exclusive partner programs with top universities and institutions worldwide. Special benefits and streamlined admissions through Whiteboard Consultants.",
    url: '/partner-programs',
  },
};

export default async function PartnerProgramsPage() {
    return (
        <PartnerProgramsClient />
    );
}
