'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { degreeChipClass } from './degree-chips';
import {
  getProviderColor,
  iconBgClasses,
} from './provider-colors';
import {
  categoryMeta,
  courseSubjects,
  degreeTypeLabel,
  degreeTypeOptions,
  getAvailableDegreeTypes,
  getPreviewPrograms,
  getProgramCount,
  programGoals,
  supportsDegreeTypeFilter,
  type ProgramFilter,
} from './programs-index';
import type { DegreeType, MenuNavItem } from './types';

interface ProgramMegaMenuProps {
  activeCategory: ProgramFilter;
  activeDegreeType: DegreeType | null;
  onSelectCategory: (
    category: ProgramFilter,
    degreeType?: DegreeType | null
  ) => void;
}

function sidebarItemClass(isActive: boolean) {
  return cn(
    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left',
    isActive
      ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white font-semibold'
      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
  );
}

function sidebarChevronClass(isActive: boolean) {
  return cn(
    'w-4 h-4 shrink-0',
    isActive
      ? 'text-slate-700 dark:text-white'
      : 'text-slate-500 dark:text-slate-400'
  );
}

export function ProgramMegaMenu({
  activeCategory,
  activeDegreeType,
  onSelectCategory,
}: ProgramMegaMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<MenuNavItem>(programGoals[1]);
  const [previewDegreeType, setPreviewDegreeType] =
    useState<DegreeType | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const previewFilter = hoveredItem.filter;
  const isDegreePanel = previewFilter === 'degree';
  const supportsDegreeChips = supportsDegreeTypeFilter(previewFilter);
  const availablePreviewDegreeTypes = useMemo(() => {
    if (!supportsDegreeChips) return [];
    if (isDegreePanel) {
      return degreeTypeOptions.map((option) => option.value);
    }
    return getAvailableDegreeTypes(previewFilter);
  }, [previewFilter, supportsDegreeChips, isDegreePanel]);
  const showDegreeChips =
    supportsDegreeChips &&
    (isDegreePanel || availablePreviewDegreeTypes.length > 1);

  const meta = categoryMeta[previewFilter];
  const previewPrograms = getPreviewPrograms(previewFilter, {
    degreeType: supportsDegreeChips ? previewDegreeType : null,
  });
  const totalCount = getProgramCount(previewFilter, {
    degreeType: supportsDegreeChips ? previewDegreeType : null,
  });

  useEffect(() => {
    if (!supportsDegreeChips) {
      setPreviewDegreeType(null);
      return;
    }
    if (
      previewDegreeType &&
      !availablePreviewDegreeTypes.includes(previewDegreeType)
    ) {
      setPreviewDegreeType(null);
    }
  }, [supportsDegreeChips, availablePreviewDegreeTypes, previewDegreeType]);

  const handleExplore = useCallback(
    (filter: ProgramFilter, degreeType?: DegreeType | null) => {
      onSelectCategory(
        filter,
        supportsDegreeTypeFilter(filter)
          ? degreeType !== undefined
            ? degreeType
            : previewDegreeType
          : null
      );
      setIsOpen(false);
    },
    [onSelectCategory, previewDegreeType]
  );

  const toggleDegreeType = (degreeType: DegreeType) => {
    setPreviewDegreeType((current) =>
      current === degreeType ? null : degreeType
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const renderNavItem = (item: MenuNavItem) => {
    const isActive = hoveredItem.id === item.id;
    return (
      <li key={item.id}>
        <button
          type="button"
          className={sidebarItemClass(isActive)}
          onMouseEnter={() => setHoveredItem(item)}
          onFocus={() => setHoveredItem(item)}
          onClick={() => handleExplore(item.filter)}
        >
          {item.label}
          <ChevronRight className={sidebarChevronClass(isActive)} />
        </button>
      </li>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] dark:bg-black/45 animate-in fade-in duration-200"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div ref={panelRef} className="relative z-50 w-full max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-6 gap-2 shadow-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
          >
            <LayoutGrid className="w-5 h-5" />
            Browse Programs
            <ChevronRight
              className={cn(
                'w-4 h-4 transition-transform',
                isOpen && 'rotate-90'
              )}
            />
          </Button>

          <span className="text-sm text-slate-600 dark:text-slate-400">
            Viewing:{' '}
            <strong className="text-slate-900 dark:text-white">
              {categoryMeta[activeCategory].title}
              {activeCategory === 'degree' && activeDegreeType
                ? ` · ${degreeTypeOptions.find((o) => o.value === activeDegreeType)?.label}`
                : ''}
            </strong>
          </span>
        </div>

        {isOpen && (
          <div
            role="dialog"
            aria-label="Browse partner programs"
            className="absolute left-1/2 -translate-x-1/2 top-full mt-3 w-[min(920px,calc(100vw-2rem))] z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col md:flex-row min-h-[420px] max-h-[min(70vh,560px)]">
              {/* Left sidebar */}
              <div className="md:w-[240px] shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
                <div className="p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">
                    Goals
                  </p>
                  <ul className="space-y-0.5">
                    {programGoals.map(renderNavItem)}
                  </ul>
                </div>

                <div className="p-4 pt-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-2">
                    Courses
                  </p>
                  <ul className="space-y-0.5">
                    {courseSubjects.map(renderNavItem)}
                  </ul>
                </div>

                <div className="p-4 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-full border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    onClick={() => handleExplore('all')}
                  >
                    Explore all subjects
                  </Button>
                </div>
              </div>

              {/* Right preview panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-background dark:bg-slate-900">
                <div
                  className={cn(
                    'flex items-start justify-between gap-4 p-5 border-b',
                    isDegreePanel
                      ? 'bg-muted/60 border-border dark:bg-card dark:border-border'
                      : 'border-slate-200 dark:border-slate-700'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <h3
                      className={cn(
                        'text-xl font-bold',
                        isDegreePanel
                          ? 'text-foreground'
                          : 'text-slate-900 dark:text-white'
                      )}
                    >
                      {meta.title}
                    </h3>
                    <p
                      className={cn(
                        'text-sm mt-2 max-w-lg leading-relaxed',
                        isDegreePanel
                          ? 'text-muted-foreground'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {meta.description}
                    </p>

                    {showDegreeChips && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {availablePreviewDegreeTypes.map((degreeType) => (
                          <button
                            key={degreeType}
                            type="button"
                            className={degreeChipClass(
                              degreeType,
                              previewDegreeType === degreeType
                            )}
                            onClick={() => toggleDegreeType(degreeType)}
                          >
                            {degreeTypeOptions.find((o) => o.value === degreeType)
                              ?.label ?? degreeTypeLabel(degreeType)}
                          </button>
                        ))}
                      </div>
                    )}


                    {isDegreePanel && (
                      <Button
                        className="rounded-lg mt-5 font-semibold px-6 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-orange-500 dark:hover:bg-orange-400 dark:text-white"
                        onClick={() =>
                          handleExplore('degree', previewDegreeType)
                        }
                      >
                        {meta.exploreLabel}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <button
                    type="button"
                    className={cn(
                      'p-1.5 rounded-md transition-colors shrink-0',
                      isDegreePanel
                        ? 'text-muted-foreground hover:bg-accent hover:text-foreground'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    )}
                    aria-label="Close menu"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto">
                  {!isDegreePanel && (
                    <Button
                      className="rounded-full mb-5 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white"
                      onClick={() => handleExplore(previewFilter)}
                    >
                      {meta.exploreLabel}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  )}

                  {previewPrograms.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {previewPrograms.map((program) => {
                        const providerColor = getProviderColor(program.provider);
                        return (
                        <Link
                          key={program.id}
                          href={program.riseuppUrl}
                          target="_blank"
                          className="group flex gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <div
                            className={cn(
                              'w-10 h-10 shrink-0 rounded-lg flex items-center justify-center',
                              iconBgClasses[providerColor]
                            )}
                          >
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                              {program.provider}
                            </p>
                            <p className="text-sm font-semibold leading-snug text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors line-clamp-2">
                              {program.title}
                            </p>
                          </div>
                        </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400 py-6 text-center">
                      {isDegreePanel && previewDegreeType
                        ? `No ${degreeTypeOptions.find((o) => o.value === previewDegreeType)?.label} programs yet. Try another option or speak with an advisor.`
                        : 'Programs coming soon in this category. Speak with an advisor to explore options.'}
                    </p>
                  )}

                  {totalCount > previewPrograms.length && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-4 text-center">
                      + {totalCount - previewPrograms.length} more programs
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
