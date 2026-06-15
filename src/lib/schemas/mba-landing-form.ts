import { z } from 'zod';

export const mbaLandingFormSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters'),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters'),

  email: z.string().email('Please enter a valid email address'),

  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .optional()
    .or(z.literal('')),

  careerStage: z.enum(
    ['fresher', 'less_than_1_year', 'one_to_two_years', 'over_2_years'],
    { errorMap: () => ({ message: 'Please select your career stage' }) }
  ),

  mbaReason: z.enum(
    ['kick_start_career', 'stagnated_growth', 'upgrade_skills'],
    { errorMap: () => ({ message: 'Please select a reason' }) }
  ),

  budget: z.enum(
    ['one_to_two_lacs', 'two_to_three_lacs', 'three_to_five_lacs', 'above_five_lacs'],
    { errorMap: () => ({ message: 'Please select your budget' }) }
  ),

  programTimeline: z.enum(
    ['within_month', 'two_to_three_months', 'three_to_six_months', 'yet_to_decide'],
    { errorMap: () => ({ message: 'Please select your timeline' }) }
  ),

  biggestChallenge: z
    .string()
    .min(10, 'Please describe your challenge in at least 10 characters')
    .max(250, 'Description must not exceed 250 characters'),

  callbackDate: z.string().min(1, 'Please select a preferred date'),

  callbackTime: z.string().min(1, 'Please select a preferred time'),
});

export type MbaLandingFormData = z.infer<typeof mbaLandingFormSchema>;

export const careerStageOptions = [
  { value: 'fresher', label: 'I am a Fresher' },
  {
    value: 'less_than_1_year',
    label: 'I am a Working Professional with less than 1 year experience',
  },
  {
    value: 'one_to_two_years',
    label: 'I am a Working Professional with 1–2 years experience',
  },
  {
    value: 'over_2_years',
    label: 'I am a Working Professional with over 2 years experience',
  },
] as const;

export const mbaReasonOptions = [
  { value: 'kick_start_career', label: 'I wish to kick-start my career' },
  {
    value: 'stagnated_growth',
    label: 'I am working, but my career growth is stagnated',
  },
  {
    value: 'upgrade_skills',
    label: 'I wish to upgrade my skill level, for better career growth',
  },
] as const;

export const budgetOptions = [
  { value: 'one_to_two_lacs', label: '₹1 Lac to ₹2 Lacs' },
  { value: 'two_to_three_lacs', label: '₹2 Lacs to ₹3 Lacs' },
  { value: 'three_to_five_lacs', label: '₹3 Lacs to ₹5 Lacs' },
  { value: 'above_five_lacs', label: 'Above ₹5 Lacs' },
] as const;

export const programTimelineOptions = [
  { value: 'within_month', label: 'Within a month' },
  { value: 'two_to_three_months', label: 'Within the next 2–3 months' },
  { value: 'three_to_six_months', label: 'Within 3–6 months' },
  { value: 'yet_to_decide', label: 'Yet to decide' },
] as const;

export function getCareerStageLabel(value: string): string {
  return careerStageOptions.find((o) => o.value === value)?.label ?? value;
}

export function getMbaReasonLabel(value: string): string {
  return mbaReasonOptions.find((o) => o.value === value)?.label ?? value;
}

export function getBudgetLabel(value: string): string {
  return budgetOptions.find((o) => o.value === value)?.label ?? value;
}

export function getProgramTimelineLabel(value: string): string {
  return programTimelineOptions.find((o) => o.value === value)?.label ?? value;
}
