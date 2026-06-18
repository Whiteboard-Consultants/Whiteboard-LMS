'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Check, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';
import {
  landingFormSchema,
  LandingFormData,
  careerStageOptions,
  experienceLevelOptions,
  atsAwarenessOptions,
  linkedinAlignmentOptions,
  timelineOptions,
  decisionMakerOptions,
} from '@/lib/schemas/landing-form';

interface CourseLandingFormProps {
  courseId: string;
  courseName?: string;
}

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const steps = [
  { number: 1, title: 'Your Details', description: 'Let\'s start with your name' },
  { number: 2, title: 'Contact Info', description: 'How can we reach you?' },
  { number: 3, title: 'Career Stage', description: 'Where are you in your job search?' },
  { number: 4, title: 'Current Challenge', description: 'What\'s your biggest struggle?' },
  { number: 5, title: 'Experience', description: 'Tell us about your background' },
  { number: 6, title: 'Job Target', description: 'What role are you targeting?' },
  { number: 7, title: 'ATS Knowledge', description: 'How familiar are you with ATS?' },
  { number: 8, title: 'Professional Alignment', description: 'LinkedIn & Resume alignment' },
  { number: 9, title: 'Timeline', description: 'When are you planning to apply?' },
  { number: 10, title: 'Decision & Outcome', description: 'Final questions' },
];

export function CourseLandingForm({ courseId, courseName }: CourseLandingFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LandingFormData>({
    resolver: zodResolver(landingFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      careerStage: undefined,
      currentStruggle: '',
      experienceLevel: undefined,
      jobTarget: '',
      atsAwareness: undefined,
      linkedinAlignment: undefined,
      timeline: undefined,
      decisionMaker: undefined,
      outcomeExpectation: '',
    },
  });

  const onSubmit = async (data: LandingFormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/landing/course-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseName,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      FacebookPixelEvents.lead(data.email, data.phone, data.firstName, data.lastName);

      toast.success('🎉 Form submitted successfully! We\'ll be in touch soon.');
      form.reset();
      setCurrentStep(1);

      // Optional: redirect to thank you page
      // window.location.href = `/thank-you?course=${courseId}`;
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canGoNext = () => {
    const fieldsByStep: { [key in FormStep]: (keyof LandingFormData)[] } = {
      1: ['firstName', 'lastName'],
      2: ['email', 'phone'],
      3: ['careerStage'],
      4: ['currentStruggle'],
      5: ['experienceLevel'],
      6: ['jobTarget'],
      7: ['atsAwareness'],
      8: ['linkedinAlignment'],
      9: ['timeline'],
      10: ['decisionMaker', 'outcomeExpectation'],
    };

    const fieldsToCheck = fieldsByStep[currentStep];
    return fieldsToCheck.every(field => {
      const value = form.getValues(field);
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const handleNext = () => {
    if (currentStep < 10) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const handleSubmit = form.handleSubmit(onSubmit);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between gap-2 mb-4">
          {steps.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-blue-600 dark:bg-blue-400' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-slate-400">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Name */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">First Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your first name"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your last name"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 2: Contact Info */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...field}
                        className="h-10"
                        autoFocus
                      />
                    </FormControl>
                    <FormDescription>
                      We'll send you course updates and application tips
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">WhatsApp/Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+1 (555) 000-0000"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormDescription>
                      For course updates and support
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 3: Career Stage */}
          {currentStep === 3 && (
            <FormField
              control={form.control}
              name="careerStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Career Stage *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {careerStageOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 4: Current Struggle */}
          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="currentStruggle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What's Your Biggest Challenge? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., My resume keeps getting rejected by ATS systems..."
                      {...field}
                      className="min-h-32 resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Share your main concern with resumes or cover letters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 5: Experience Level */}
          {currentStep === 5 && (
            <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Experience Level *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {experienceLevelOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 6: Job Target */}
          {currentStep === 6 && (
            <FormField
              control={form.control}
              name="jobTarget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">What Industry/Role Are You Targeting? *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g., Product Manager at Tech Companies"
                      {...field}
                      className="h-10"
                      autoFocus
                    />
                  </FormControl>
                  <FormDescription>
                    Help us personalize the course content for you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 7: ATS Awareness */}
          {currentStep === 7 && (
            <FormField
              control={form.control}
              name="atsAwareness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">ATS Familiarity *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {atsAwarenessOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 8: LinkedIn Alignment */}
          {currentStep === 8 && (
            <FormField
              control={form.control}
              name="linkedinAlignment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Professional Platform Alignment *</FormLabel>
                  <FormDescription className="mb-4">
                    Are your resume, cover letter, and LinkedIn profile aligned?
                  </FormDescription>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {linkedinAlignmentOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 9: Timeline */}
          {currentStep === 9 && (
            <FormField
              control={form.control}
              name="timeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Job Application Timeline *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {timelineOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                            >
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Step 10: Decision Maker & Outcome */}
          {currentStep === 10 && (
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="decisionMaker"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Who Will Decide on This Investment? *</FormLabel>
                    <FormControl>
                      <RadioGroup value={field.value} onValueChange={field.onChange}>
                        <div className="space-y-3">
                          {decisionMakerOptions.map((option) => (
                            <div key={option.value} className="flex items-center space-x-3">
                              <RadioGroupItem value={option.value} id={option.value} />
                              <label
                                htmlFor={option.value}
                                className="text-sm font-medium text-gray-700 dark:text-slate-300 cursor-pointer flex-1"
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="outcomeExpectation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Your Ultimate Goal *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="E.g., Land interviews at top tech companies within 3 months..."
                        {...field}
                        className="min-h-24 resize-none"
                      />
                    </FormControl>
                    <FormDescription>
                      What do you hope to achieve after completing this course?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep === 10 ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit & Enroll
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </form>
      </Form>

      {/* Privacy Notice */}
      <p className="text-xs text-gray-500 dark:text-slate-400 text-center mt-6">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="underline hover:text-gray-700 dark:hover:text-slate-200">
          Privacy Policy
        </a>
        . We'll send you course updates and helpful tips.
      </p>
    </div>
  );
}
