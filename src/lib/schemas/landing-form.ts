import { z } from 'zod';

export const landingFormSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must not exceed 100 characters'),
  
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must not exceed 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address'),
  
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  
  careerStage: z.enum([
    'actively_job_hunting',
    'planning_1_3_months',
    'casually_looking',
    'exploring_brand'
  ], {
    errorMap: () => ({ message: 'Please select your career stage' })
  }),
  
  currentStruggle: z.string()
    .min(10, 'Please describe your challenge in at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters'),
  
  experienceLevel: z.enum([
    'entry_level_0_2',
    'mid_level_2_5',
    'experienced_5_plus',
    'leadership'
  ], {
    errorMap: () => ({ message: 'Please select an experience level' })
  }),
  
  jobTarget: z.string()
    .min(2, 'Job target must be at least 2 characters')
    .max(100, 'Job target must not exceed 100 characters'),
  
  atsAwareness: z.enum([
    'never_heard',
    'heard_not_know',
    'know_struggle',
    'well_versed'
  ], {
    errorMap: () => ({ message: 'Please select your ATS familiarity level' })
  }),
  
  linkedinAlignment: z.enum([
    'completely_disconnected',
    'partially_aligned',
    'mostly_aligned',
    'fully_aligned'
  ], {
    errorMap: () => ({ message: 'Please select your LinkedIn alignment' })
  }),
  
  timeline: z.enum([
    'two_weeks',
    'one_two_months',
    'three_six_months',
    'exploring'
  ], {
    errorMap: () => ({ message: 'Please select your timeline' })
  }),
  
  decisionMaker: z.enum([
    'self_funded',
    'discuss_family',
    'employer_funding',
    'exploring_cost'
  ], {
    errorMap: () => ({ message: 'Please select the decision maker' })
  }),
  
  outcomeExpectation: z.string()
    .min(10, 'Please describe your goal in at least 10 characters')
    .max(1000, 'Goal must not exceed 1000 characters'),
});

export type LandingFormData = z.infer<typeof landingFormSchema>;

// Enum options for display
export const careerStageOptions = [
  { value: 'actively_job_hunting', label: 'I\'m actively job hunting and need help NOW' },
  { value: 'planning_1_3_months', label: 'I\'m planning to apply in the next 1-3 months' },
  { value: 'casually_looking', label: 'I\'m casually looking but open to opportunities' },
  { value: 'exploring_brand', label: 'I\'m exploring how to improve my professional brand' },
];

export const experienceLevelOptions = [
  { value: 'entry_level_0_2', label: 'Entry level (0-2 years)' },
  { value: 'mid_level_2_5', label: 'Mid-level experience (2-5 years)' },
  { value: 'experienced_5_plus', label: 'Experienced (5+ years)' },
  { value: 'leadership', label: 'Looking to move into leadership/senior roles' },
];

export const atsAwarenessOptions = [
  { value: 'never_heard', label: 'I\'ve never heard of it before' },
  { value: 'heard_not_know', label: 'I\'ve heard of it but don\'t know how to optimize' },
  { value: 'know_struggle', label: 'I know about ATS but struggle to implement it' },
  { value: 'well_versed', label: 'I\'m well-versed in ATS optimization' },
];

export const linkedinAlignmentOptions = [
  { value: 'completely_disconnected', label: 'They\'re completely disconnected' },
  { value: 'partially_aligned', label: 'Partially aligned but inconsistent' },
  { value: 'mostly_aligned', label: 'Mostly aligned with minor gaps' },
  { value: 'fully_aligned', label: 'Fully aligned across all platforms' },
];

export const timelineOptions = [
  { value: 'two_weeks', label: 'Within the next 2 weeks' },
  { value: 'one_two_months', label: 'Within the next 1-2 months' },
  { value: 'three_six_months', label: 'Within 3-6 months' },
  { value: 'exploring', label: 'Just exploring, no timeline' },
];

export const decisionMakerOptions = [
  { value: 'self_funded', label: 'Just me (self-funded)' },
  { value: 'discuss_family', label: 'I\'ll discuss with my family/partner' },
  { value: 'employer_funding', label: 'My employer is funding professional development' },
  { value: 'exploring_cost', label: 'I\'m exploring options, cost is a concern' },
];
