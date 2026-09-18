import { z } from 'zod';

export const yearOfStudyValues = ['third_year', 'fourth_year'] as const;

export const bridgePlanValues = [
  'start_working',
  'join_family_business',
  'start_a_business',
  'higher_education_india',
  'higher_education_abroad',
  'upskill_certification',
] as const;

export const yearOfStudyOptions = [
  { value: 'third_year', label: '3rd Year' },
  { value: 'fourth_year', label: '4th Year' },
] as const;

export const bridgePlanOptions = [
  { value: 'start_working', label: 'Start Working' },
  { value: 'join_family_business', label: 'Join Family Business' },
  { value: 'start_a_business', label: 'Start a Business' },
  { value: 'higher_education_india', label: 'Pursue Higher Education in India' },
  { value: 'higher_education_abroad', label: 'Pursue Higher Education Abroad' },
  { value: 'upskill_certification', label: 'Upskill with certification courses' },
] as const;

export const HIGHER_EDUCATION_PLANS: readonly (typeof bridgePlanValues)[number][] = [
  'higher_education_india',
  'higher_education_abroad',
];

export function isHigherEducationPlan(plan?: string): boolean {
  return plan === 'higher_education_india' || plan === 'higher_education_abroad';
}

const indianMobileRegex = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

export const futureOfJobsFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Please enter your name')
      .max(100, 'Name must not exceed 100 characters'),
    mobileNumber: z
      .string()
      .trim()
      .regex(indianMobileRegex, 'Enter a valid 10-digit Indian mobile number'),
    email: z.string().trim().email('Please enter a valid email address'),
    collegeName: z
      .string()
      .trim()
      .min(2, 'Please enter your college name')
      .max(200, 'College name must not exceed 200 characters'),
    yearOfStudy: z.enum(yearOfStudyValues, {
      errorMap: () => ({ message: 'Please select your year of study' }),
    }),
    bridgePlan: z.enum(bridgePlanValues, {
      errorMap: () => ({ message: 'Please select how you plan to cross the bridge' }),
    }),
    programChoice: z.string().trim().max(200).optional().or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    if (isHigherEducationPlan(data.bridgePlan) && !data.programChoice?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['programChoice'],
        message: 'Please tell us your choice of program',
      });
    }
  });

export type FutureOfJobsFormData = z.infer<typeof futureOfJobsFormSchema>;

export function getYearOfStudyLabel(value: string): string {
  return yearOfStudyOptions.find((option) => option.value === value)?.label ?? value;
}

export function getBridgePlanLabel(value: string): string {
  return bridgePlanOptions.find((option) => option.value === value)?.label ?? value;
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' ') || (parts[0] ?? ''),
  };
}

export function normalizeIndianMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits;
}
