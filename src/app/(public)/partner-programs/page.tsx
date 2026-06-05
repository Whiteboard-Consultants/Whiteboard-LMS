import type { Metadata } from 'next';
import PartnerProgramsClient from './client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Partner Programs | Global Education Partners | Whiteboard Consultants',
  description:
    'Explore our exclusive partner programs with leading universities and institutions worldwide. Get access to special benefits and streamlined admission processes through our global partnerships.',
  path: '/partner-programs',
  openGraphTitle: 'Partner Programs: Exclusive Global Education Opportunities | Whiteboard Consultants',
  openGraphDescription:
    'Discover exclusive partner programs with top universities and institutions worldwide. Special benefits and streamlined admissions through Whiteboard Consultants.',
});

export default async function PartnerProgramsPage() {
    return (
        <PartnerProgramsClient />
    );
}
