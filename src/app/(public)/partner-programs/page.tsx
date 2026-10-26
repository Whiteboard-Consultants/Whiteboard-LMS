import type { Metadata } from 'next';
import PartnerProgramsClient from './client';
import { pageMetadata } from '@/lib/seo';
import {
  getAvailableDegreeTypes,
  parseCategoryParam,
  parseDegreeTypeParam,
  supportsDegreeTypeFilter,
} from './programs-index';

export const metadata: Metadata = pageMetadata({
  title: 'Partner Study Programs',
  description:
    'Explore our exclusive partner programs with leading universities and institutions worldwide. Get access to special benefits and streamlined admission processes through our global partnerships.',
  path: '/partner-programs',
  openGraphTitle: 'Partner Study Programs',
  openGraphDescription:
    'Discover exclusive partner programs with top universities and institutions worldwide. Special benefits and streamlined admissions through Whiteboard Consultants.',
});

type PartnerProgramsPageProps = {
  searchParams?: Promise<{
    category?: string;
    degreeType?: string;
  }>;
};

export default async function PartnerProgramsPage({
  searchParams,
}: PartnerProgramsPageProps) {
  const params = await searchParams;
  const category = parseCategoryParam(params?.category ?? null);
  const requestedDegreeType = parseDegreeTypeParam(params?.degreeType ?? null);
  const degreeType =
    supportsDegreeTypeFilter(category) &&
    requestedDegreeType &&
    getAvailableDegreeTypes(category).includes(requestedDegreeType)
      ? requestedDegreeType
      : null;

  return (
    <PartnerProgramsClient
      initialCategory={category}
      initialDegreeType={degreeType}
    />
  );
}
