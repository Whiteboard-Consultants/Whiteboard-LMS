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
import {
  getProviderColor,
  iconBgClasses,
  providerClasses,
} from './provider-colors';
import type { PartnerProgram } from './types';

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
  const providerColor = getProviderColor(program.provider);
  const iconBg = iconBgClasses[providerColor];
  const providerStyle = providerClasses[providerColor];

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
