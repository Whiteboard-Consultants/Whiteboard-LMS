import { z } from 'zod';

const indianMobileRegex = /^(?:\+?91[\s-]?)?[6-9]\d{9}$/;

export const gccDestinationOptions = [
  'USA',
  'Canada',
  'UK',
  'Ireland',
  'Netherlands',
  'Sweden',
  'Spain',
  'France',
  'Italy',
  'Germany',
  'Malta',
  'Dubai/ UAE',
  'India',
  'Malaysia',
  'Singapore',
  'Australia',
  'New Zealand',
] as const;

export const gccYearOptions = ['2nd Year', '3rd Year', 'Final Year'] as const;

export const gccStudyAreaOptions = [
  'Business & General Management',
  'Marketing, Brand & Communication',
  'Finance, Accounting & Risk',
  'Data Science, Business Analytics, AI/ML, & Cybersecurity',
  'Supply Chain, Logistics & Operations',
  'Health, Medicine & Sports Sciences',
  'Creative, Luxury, Media & Events',
  'Strategy, Human Resources & Public Policy',
] as const;

const destinationEnum = z.enum(gccDestinationOptions);
const studyAreaEnum = z.enum(gccStudyAreaOptions);
const yearEnum = z.enum(gccYearOptions, {
  errorMap: () => ({ message: 'Please select your current year' }),
});

export const gccFormSchema = z.object({
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
  departmentStream: z
    .string()
    .trim()
    .min(2, 'Please enter your department or stream')
    .max(200, 'Department or stream must not exceed 200 characters'),
  currentSemesterYear: yearEnum,
  preferredDestinations: z
    .array(destinationEnum)
    .min(1, 'Select at least one destination'),
  preferredStudyAreas: z
    .array(studyAreaEnum)
    .min(1, 'Select at least one study area'),
});

export type GccFormData = z.infer<typeof gccFormSchema>;

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
