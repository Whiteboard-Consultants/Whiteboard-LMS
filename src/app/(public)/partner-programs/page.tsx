import type { Metadata } from 'next';
import { Suspense } from 'react';
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

function ProgramsGridSkeleton() {
  return (
    <div className="container mx-auto px-4 py-16 animate-pulse">
      <div className="h-8 bg-muted rounded w-64 mx-auto mb-4" />
      <div className="h-4 bg-muted rounded w-96 max-w-full mx-auto mb-12" />
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-96 bg-muted rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default async function PartnerProgramsPage() {
  return (
    <Suspense fallback={<ProgramsGridSkeleton />}>
      <PartnerProgramsClient />
    </Suspense>
  );
}
