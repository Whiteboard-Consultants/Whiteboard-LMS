import { z } from 'zod';

export const UOW_PROGRAMS = [
  'Bachelor of Business (Business Analytics & Finance)',
  'Graduate Certificate in Computing',
  'Master of Computing (Data Analytics)',
  'Master of Computing (Applied Artificial Intelligence)',
  'Graduate Certificate in Financial Technology',
  'Master of Financial Technology (FinTech)',
  'Master of Financial Technology (FinTech) Extension',
] as const;

export const uowApplyFormSchema = z.object({
  firstName: z.string().min(1, 'First Name is required.'),
  lastName: z.string().min(1, 'Last Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone: z.string().min(10, 'A valid phone number is required.'),
  degreeOfInterest: z.enum(UOW_PROGRAMS, {
    errorMap: () => ({ message: 'Program of interest is required.' }),
  }),
  state: z.string().min(1, 'State is required.'),
  enquiryMessage: z.string().optional(),
});

export type UowApplyFormData = z.infer<typeof uowApplyFormSchema>;
