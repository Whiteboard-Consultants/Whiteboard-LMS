import { z } from 'zod';

export const bgesPreQuizSchema = z
  .object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .max(100, 'First name must not exceed 100 characters'),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .max(100, 'Last name must not exceed 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    whatsappNumber: z
      .string()
      .min(10, 'WhatsApp number must be at least 10 digits')
      .max(20, 'WhatsApp number must not exceed 20 characters'),
    careerStage: z.enum(['1st_year', '2nd_year', '3rd_year', 'final_year'], {
      errorMap: () => ({ message: 'Please select your career stage' }),
    }),
    graduationProgram: z.enum(['bcom', 'bba'], {
      errorMap: () => ({ message: 'Please select your graduation program' }),
    }),
    futurePlans: z.enum(
      [
        'higher_studies_india',
        'higher_studies_abroad',
        'explore_jobs',
        'family_business',
      ],
      {
        errorMap: () => ({ message: 'Please select your future plans' }),
      }
    ),
    higherStudiesFocus: z
      .enum(['mba', 'fintech', 'ai_ml', 'data_analytics'])
      .optional(),
  })
  .superRefine((data, ctx) => {
    const needsHigherStudiesFocus =
      data.futurePlans === 'higher_studies_india' ||
      data.futurePlans === 'higher_studies_abroad';

    if (needsHigherStudiesFocus && !data.higherStudiesFocus) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select your higher studies focus',
        path: ['higherStudiesFocus'],
      });
    }
  });

export type BgesPreQuizFormData = z.infer<typeof bgesPreQuizSchema>;

export const bgesCareerStageOptions = [
  { value: '1st_year', label: '1st Year' },
  { value: '2nd_year', label: '2nd Year' },
  { value: '3rd_year', label: '3rd Year' },
  { value: 'final_year', label: 'Final Year' },
] as const;

export const bgesGraduationProgramOptions = [
  { value: 'bcom', label: 'B.Com' },
  { value: 'bba', label: 'BBA' },
] as const;

export const bgesFuturePlansOptions = [
  { value: 'higher_studies_india', label: 'Higher studies in India' },
  { value: 'higher_studies_abroad', label: 'Higher studies Abroad' },
  { value: 'explore_jobs', label: 'Explore Jobs/ Career' },
  {
    value: 'family_business',
    label: 'Join Family Business / Entrepreneurship',
  },
] as const;

export const bgesHigherStudiesFocusOptions = [
  { value: 'mba', label: 'MBA' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'ai_ml', label: 'AI & ML' },
  { value: 'data_analytics', label: 'Data Analytics' },
] as const;
