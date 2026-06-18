import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, BarChart, Book, Briefcase, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { PartnerProgram } from './types';

const iconBgClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
  orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300',
  purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
  green: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
  indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  violet: 'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300',
  fuchsia: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300',
};

const providerClasses: Record<string, string> = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  orange: 'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  teal: 'from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 text-teal-700 dark:text-teal-200 border-teal-200 dark:border-teal-800',
  purple: 'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  cyan: 'from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
  emerald: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
  green: 'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800',
  rose: 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800',
  indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
  amber: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  violet: 'from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 text-violet-700 dark:text-violet-200 border-violet-200 dark:border-violet-800',
  fuchsia: 'from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950 dark:to-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-200 border-fuchsia-200 dark:border-fuchsia-800',
  pink: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 text-pink-700 dark:text-pink-200 border-pink-200 dark:border-pink-800',
  sky: 'from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 text-sky-700 dark:text-sky-200 border-sky-200 dark:border-sky-800',
};

function getIcon(program: PartnerProgram, index: number): LucideIcon {
  if (!program.isFree) return Briefcase;
  return index % 2 === 0 ? BarChart : Book;
}

interface ProgramCardProps {
  program: PartnerProgram;
  index?: number;
}

export function ProgramCard({ program, index = 0 }: ProgramCardProps) {
  const Icon = getIcon(program, index);
  const iconBg = iconBgClasses[program.iconColor] ?? iconBgClasses.blue;
  const providerStyle = providerClasses[program.iconColor] ?? providerClasses.blue;

  return (
    <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center',
              iconBg
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          {program.isFree ? (
            <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full font-semibold">
              FREE
            </span>
          ) : (
            <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 px-2 py-1 rounded-full font-semibold">
              DEGREE
            </span>
          )}
        </div>
        <CardTitle className="text-xl mb-2">{program.title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">
          {program.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">{program.duration}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Level:</span>
            <span className="font-medium">{program.level}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Certificate:</span>
            <span
              className={cn(
                'font-medium',
                program.certificate === 'Yes' && 'text-green-600 dark:text-green-400'
              )}
            >
              {program.certificate}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm gap-2">
            <span className="font-bold text-foreground">Provider:</span>
            <span
              className={cn(
                'font-bold bg-gradient-to-br px-3 py-2 rounded-lg shadow-md border transform hover:scale-105 transition-transform text-right',
                providerStyle
              )}
            >
              {program.provider}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            <strong>What you&apos;ll learn:</strong>
            <ul className="mt-1 space-y-1">
              {program.learnPoints.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </div>
          <Link href={program.riseuppUrl} target="_blank">
            <Button className="w-full mt-8 h-12">
              Enroll Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
