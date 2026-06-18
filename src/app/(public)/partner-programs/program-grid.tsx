'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { PartnerProgram } from './types';
import { ProgramCard } from './program-card';

const PAGE_SIZE = 12;

interface ProgramGridProps {
  programs: PartnerProgram[];
  filterKey: string;
  emptyMessage?: string;
}

export function ProgramGrid({
  programs,
  filterKey,
  emptyMessage = 'More programs coming soon. Speak with an advisor to explore options in this category.',
}: ProgramGridProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterKey]);

  if (programs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground max-w-xl mx-auto mb-6">
          {emptyMessage}
        </p>
        <Link href="/contact">
          <Button variant="outline">Speak with an Advisor</Button>
        </Link>
      </div>
    );
  }

  const visiblePrograms = programs.slice(0, visibleCount);
  const hasMore = visibleCount < programs.length;

  return (
    <div>
      <p className="text-sm text-muted-foreground text-center mb-8">
        Showing {visiblePrograms.length} of {programs.length} programs
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visiblePrograms.map((program, index) => (
          <ProgramCard key={program.id} program={program} index={index} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-12">
          <Button
            variant="outline"
            size="lg"
            className="border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Load more ({programs.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
