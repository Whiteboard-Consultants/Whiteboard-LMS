import { freePrograms } from './free-programs-data';
import { managementPrograms } from './management-programs-data';
import type {
  DegreeType,
  MenuNavItem,
  PartnerProgram,
  ProgramCategory,
  ProgramFilter,
  ProgramGoal,
} from './types';

export type { ProgramFilter, ProgramGoal, DegreeType };

export const allPartnerPrograms: PartnerProgram[] = [
  ...freePrograms,
  ...managementPrograms,
];

export const PREVIEW_LIMIT = 4;

export const degreeTypeOptions: { value: DegreeType; label: string }[] = [
  { value: 'masters', label: "Master's" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'pg-diploma', label: 'PG Diploma' },
];

export const programGoals: MenuNavItem[] = [
  {
    id: 'goal-free',
    label: 'Free Courses',
    filter: 'free',
    type: 'goal',
  },
  {
    id: 'goal-degree',
    label: 'Degrees',
    filter: 'degree',
    type: 'goal',
  },
  {
    id: 'goal-certificate',
    label: 'Certificate',
    filter: 'certificate',
    type: 'goal',
  },
];

export const courseSubjects: MenuNavItem[] = [
  {
    id: 'subject-management',
    label: 'Management',
    filter: 'management',
    type: 'subject',
  },
  {
    id: 'subject-computer-science',
    label: 'Computer Science',
    filter: 'computer-science',
    type: 'subject',
  },
  {
    id: 'subject-finance',
    label: 'Finance',
    filter: 'finance',
    type: 'subject',
  },
  {
    id: 'subject-marketing',
    label: 'Marketing',
    filter: 'marketing',
    type: 'subject',
  },
  {
    id: 'subject-web-development',
    label: 'Web Development',
    filter: 'web-development',
    type: 'subject',
  },
];

interface FilterOptions {
  degreeType?: DegreeType | null;
}

function applyDegreeTypeFilter(
  programs: PartnerProgram[],
  degreeType?: DegreeType | null
): PartnerProgram[] {
  if (!degreeType) return programs;
  return programs.filter((program) => program.degreeType === degreeType);
}

export function filterPrograms(
  filter: ProgramFilter,
  options?: FilterOptions
): PartnerProgram[] {
  let programs: PartnerProgram[];

  switch (filter) {
    case 'all':
      programs = allPartnerPrograms;
      break;
    case 'free':
      programs = allPartnerPrograms.filter((program) => program.isFree);
      break;
    case 'degree':
      programs = allPartnerPrograms.filter(
        (program) => !program.isFree && program.certificate === 'Degree'
      );
      programs = applyDegreeTypeFilter(programs, options?.degreeType);
      break;
    case 'certificate':
      programs = allPartnerPrograms.filter(
        (program) =>
          !program.isFree &&
          program.certificate !== 'Degree' &&
          !program.categories.includes('free')
      );
      break;
    default:
      programs = allPartnerPrograms.filter((program) =>
        program.categories.includes(filter as ProgramCategory)
      );
  }

  return programs;
}

export function getProgramCount(
  filter: ProgramFilter,
  options?: FilterOptions
): number {
  return filterPrograms(filter, options).length;
}

export function getPreviewPrograms(
  filter: ProgramFilter,
  options?: FilterOptions
): PartnerProgram[] {
  return filterPrograms(filter, options).slice(0, PREVIEW_LIMIT);
}

export const categoryMeta: Record<
  ProgramFilter,
  { title: string; description: string; exploreLabel: string }
> = {
  all: {
    title: 'All Partner Programs',
    description:
      'Browse our full catalogue of free courses and curated online degrees from leading universities — powered by RiseUpp.',
    exploreLabel: 'Explore all programs',
  },
  free: {
    title: 'Free Courses',
    description:
      'Access high-quality free courses from partner institutions — no cost, just learning.',
    exploreLabel: 'Explore all free courses',
  },
  degree: {
    title: 'Degrees',
    description:
      'Explore our degree programs from leading institutions worldwide, designed to support your career advancement and transformation.',
    exploreLabel: 'Explore all Degrees',
  },
  certificate: {
    title: 'Certificate Programs',
    description:
      'Build job-ready skills with curated online certificate programmes from leading institutions.',
    exploreLabel: 'Explore all certificates',
  },
  management: {
    title: 'Management Programs',
    description:
      "Compare curated online MBA and executive management degrees from India's top universities and IIMs.",
    exploreLabel: 'Explore all management programs',
  },
  'computer-science': {
    title: 'Computer Science Programs',
    description:
      'Explore curated online degrees and certificates in computer science, software development, and emerging technologies.',
    exploreLabel: 'Explore all computer science programs',
  },
  finance: {
    title: 'Finance Programs',
    description:
      'Discover online finance, accounting, and FinTech programmes from leading universities and institutions.',
    exploreLabel: 'Explore all finance programs',
  },
  marketing: {
    title: 'Marketing Programs',
    description:
      'Build expertise in digital marketing, brand management, and growth strategy through curated online programmes.',
    exploreLabel: 'Explore all marketing programs',
  },
  'web-development': {
    title: 'Web Development Programs',
    description:
      'Learn full-stack development, UI/UX, and modern web technologies through hand-picked online courses and degrees.',
    exploreLabel: 'Explore all web development programs',
  },
};

export function parseCategoryParam(value: string | null): ProgramFilter {
  const valid: ProgramFilter[] = [
    'all',
    'free',
    'degree',
    'certificate',
    'management',
    'computer-science',
    'finance',
    'marketing',
    'web-development',
  ];
  if (value && valid.includes(value as ProgramFilter)) {
    return value as ProgramFilter;
  }
  return 'all';
}

export function parseDegreeTypeParam(value: string | null): DegreeType | null {
  const valid: DegreeType[] = ['masters', 'doctorate', 'bachelors', 'pg-diploma'];
  if (value && valid.includes(value as DegreeType)) {
    return value as DegreeType;
  }
  return null;
}

export function goalFromFilter(filter: ProgramFilter): ProgramGoal | null {
  if (filter === 'free') return 'free';
  if (filter === 'degree') return 'degree';
  if (filter === 'certificate') return 'certificate';
  return null;
}

export function degreeTypeLabel(degreeType: DegreeType): string {
  return (
    degreeTypeOptions.find((option) => option.value === degreeType)?.label ??
    degreeType
  );
}
