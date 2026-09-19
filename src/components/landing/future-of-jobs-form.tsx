'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';
import {
  bridgePlanOptions,
  futureOfJobsFormSchema,
  isHigherEducationPlan,
  splitFullName,
  yearOfStudyOptions,
  type FutureOfJobsFormData,
} from '@/lib/schemas/future-of-jobs-form';

const DEFAULT_COLLEGE = 'Bhawanipur Global Campus';

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const BASE_STEPS = [
  { number: 1, title: 'Your Name', description: "Let's start with your name" },
  { number: 2, title: 'Phone Number', description: 'How can we reach you?' },
  { number: 3, title: 'Email ID', description: 'Where should we send your confirmation?' },
  { number: 4, title: 'College Name', description: 'Which campus are you from?' },
  { number: 5, title: 'Year of Study', description: 'Where are you in your degree?' },
  {
    number: 6,
    title: 'Crossing the Bridge',
    description: 'How do you plan to cross the bridge?',
  },
  {
    number: 7,
    title: 'Choice of Program',
    description: 'If it is higher education, what is your choice of program?',
  },
] as const;

export function FutureOfJobsForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const form = useForm<FutureOfJobsFormData>({
    resolver: zodResolver(futureOfJobsFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      email: '',
      collegeName: DEFAULT_COLLEGE,
      yearOfStudy: undefined,
      bridgePlan: undefined,
      programChoice: '',
    },
  });

  const selectedPlan = form.watch('bridgePlan');
  const needsProgram = isHigherEducationPlan(selectedPlan);
  const totalSteps = needsProgram ? 7 : 6;
  const visibleSteps = BASE_STEPS.slice(0, totalSteps);
  const currentStepMeta = BASE_STEPS[currentStep - 1];
  const isLastStep = currentStep === totalSteps;

  const canGoNext = () => {
    const fieldsByStep: Record<FormStep, (keyof FutureOfJobsFormData)[]> = {
      1: ['fullName'],
      2: ['mobileNumber'],
      3: ['email'],
      4: ['collegeName'],
      5: ['yearOfStudy'],
      6: ['bridgePlan'],
      7: ['programChoice'],
    };

    return fieldsByStep[currentStep].every((field) => {
      const value = form.getValues(field);
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const onSubmit = async (data: FutureOfJobsFormData) => {
    try {
      setIsSubmitting(true);
      const eventId = crypto.randomUUID();
      const { firstName, lastName } = splitFullName(data.fullName);

      FacebookPixelEvents.lead(data.email, data.mobileNumber, firstName, lastName, eventId);

      const response = await fetch('/api/landing/future-of-jobs-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          programChoice: needsProgram ? data.programChoice : '',
          eventId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsConfirmed(true);
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error('Future of Jobs form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  if (isConfirmed) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">You&apos;re in.</h3>
        <p className="text-gray-700 dark:text-slate-200 leading-relaxed max-w-xl mx-auto">
          Seat confirmed for Future of Jobs — 21 September, Bhawanipur Global Campus.
          We&apos;ll WhatsApp/email your reminder and the pre-session prep sheet 24 hours
          before. See you there.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between gap-2 mb-4">
          {visibleSteps.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentStepMeta.title}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{currentStepMeta.description}</p>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your full name"
                      autoComplete="name"
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 2 && (
            <FormField
              control={form.control}
              name="mobileNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">Phone No. *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="10-digit Indian mobile"
                      autoComplete="tel"
                      autoFocus
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 3 && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">Email ID *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@college.edu"
                      autoComplete="email"
                      autoFocus
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="collegeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">College Name *</FormLabel>
                  <FormControl>
                    <Input autoFocus className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 5 && (
            <FormField
              control={form.control}
              name="yearOfStudy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">Year of Study *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {yearOfStudyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 6 && (
            <FormField
              control={form.control}
              name="bridgePlan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">
                    How do you plan to cross the bridge? *
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (!isHigherEducationPlan(value)) {
                        form.setValue('programChoice', '');
                      }
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your plan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bridgePlanOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 7 && (
            <FormField
              control={form.control}
              name="programChoice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base dark:text-slate-200">
                    What is your choice of program? *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. MBA, MSc Finance, CFA"
                      autoFocus
                      className="h-10"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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

            {isLastStep ? (
              <Button
                type="submit"
                disabled={isSubmitting || !canGoNext()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirm My Seat
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
    </div>
  );
}
