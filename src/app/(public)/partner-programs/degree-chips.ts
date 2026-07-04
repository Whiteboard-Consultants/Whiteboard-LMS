import { cn } from '@/lib/utils';
import type { DegreeType } from './types';

type DegreeChipKey = DegreeType | 'all';

const chipStyles: Record<
  DegreeChipKey,
  { idle: string; selected: string }
> = {
  all: {
    idle: 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-800 dark:hover:border-slate-500',
    selected:
      'bg-slate-800 text-white border-slate-800 shadow-sm shadow-slate-800/25 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100 dark:shadow-slate-100/20',
  },
  masters: {
    idle: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50 dark:hover:border-purple-700',
    selected:
      'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/30 dark:bg-purple-500 dark:border-purple-500 dark:shadow-purple-500/25',
  },
  bachelors: {
    idle: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 hover:border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 dark:hover:bg-sky-900/50 dark:hover:border-sky-700',
    selected:
      'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-600/30 dark:bg-sky-500 dark:border-sky-500 dark:shadow-sky-500/25',
  },
  'pg-diploma': {
    idle: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/50 dark:hover:border-indigo-700',
    selected:
      'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30 dark:bg-indigo-500 dark:border-indigo-500 dark:shadow-indigo-500/25',
  },
  doctorate: {
    idle: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 hover:border-violet-300 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/50 dark:hover:border-violet-700',
    selected:
      'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-600/30 dark:bg-violet-500 dark:border-violet-500 dark:shadow-violet-500/25',
  },
};

export function degreeChipClass(
  chip: DegreeChipKey,
  isSelected: boolean
): string {
  const styles = chipStyles[chip];
  return cn(
    'px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200',
    isSelected ? styles.selected : styles.idle
  );
}
