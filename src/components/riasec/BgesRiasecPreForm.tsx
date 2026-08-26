'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import {
  bgesCareerStageOptions,
  bgesFuturePlansOptions,
  bgesGraduationProgramOptions,
  bgesHigherStudiesFocusOptions,
  bgesPreQuizSchema,
  type BgesPreQuizFormData,
} from '@/lib/schemas/bges-pre-quiz';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';

type FormStep = 1 | 2 | 3 | 4 | 5 | 6;

const steps = [
  {
    number: 1,
    title: 'Your Details',
    description: "Let's start with your name",
  },
  {
    number: 2,
    title: 'Contact Info',
    description: 'How can we reach you?',
  },
  {
    number: 3,
    title: 'Career Stage',
    description: 'Which year of college are you in?',
  },
  {
    number: 4,
    title: 'Graduation Program',
    description: 'What are you studying?',
  },
  {
    number: 5,
    title: 'Future Plans',
    description: 'What are you planning after graduation?',
  },
  {
    number: 6,
    title: 'Higher Studies Focus',
    description: 'Which area interests you most?',
  },
] as const;

interface BgesRiasecPreFormProps {
  onComplete: (data: {
    userId: string;
    email: string;
    fullName: string;
    assessmentId: string;
    preQuiz: BgesPreQuizFormData;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

function RadioOption({
  value,
  label,
  selected,
}: {
  value: string;
  label: string;
  selected: boolean;
}) {
  return (
    <label
      htmlFor={value}
      className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors ${
        selected
          ? 'border-[hsl(209,100%,29%)] bg-[hsl(209,100%,29%)]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <RadioGroupItem value={value} id={value} />
      <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
    </label>
  );
}

export function BgesRiasecPreForm({
  onComplete,
  isLoading = false,
  error = null,
}: BgesRiasecPreFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BgesPreQuizFormData>({
    resolver: zodResolver(bgesPreQuizSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      whatsappNumber: '',
      careerStage: undefined,
      graduationProgram: undefined,
      futurePlans: undefined,
      higherStudiesFocus: undefined,
    },
  });

  const futurePlans = form.watch('futurePlans');
  const needsHigherStudiesStep =
    futurePlans === 'higher_studies_india' ||
    futurePlans === 'higher_studies_abroad';

  const visibleSteps = needsHigherStudiesStep
    ? steps
    : steps.filter((step) => step.number !== 6);

  const totalVisibleSteps = visibleSteps.length;
  const visibleStepIndex = visibleSteps.findIndex(
    (step) => step.number === currentStep
  );
  const activeStepMeta = visibleSteps[visibleStepIndex] ?? visibleSteps[0];

  const canGoNext = () => {
    const values = form.getValues();
    if (currentStep === 1) {
      return values.firstName.trim().length >= 2 && values.lastName.trim().length >= 2;
    }
    if (currentStep === 2) {
      return (
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()) &&
        values.whatsappNumber.trim().length >= 10
      );
    }
    if (currentStep === 3) return !!values.careerStage;
    if (currentStep === 4) return !!values.graduationProgram;
    if (currentStep === 5) return !!values.futurePlans;
    if (currentStep === 6) return !!values.higherStudiesFocus;
    return false;
  };

  const handleNext = () => {
    if (currentStep === 5 && !needsHigherStudiesStep) {
      void form.handleSubmit(onSubmit)();
      return;
    }

    if (currentStep < 6) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 6) {
      setCurrentStep(5);
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const onSubmit = async (data: BgesPreQuizFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      const eventId = crypto.randomUUID();

      const payload: BgesPreQuizFormData = { ...data };
      if (
        payload.futurePlans !== 'higher_studies_india' &&
        payload.futurePlans !== 'higher_studies_abroad'
      ) {
        delete payload.higherStudiesFocus;
      }

      FacebookPixelEvents.lead(
        payload.email,
        payload.whatsappNumber,
        payload.firstName,
        payload.lastName,
        eventId
      );

      const response = await fetch('/api/riasec/bges-start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          eventId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to start assessment');
      }

      onComplete({
        userId: result.user.id,
        email: result.user.email,
        fullName: result.assessment.fullName,
        assessmentId: result.assessment.id,
        preQuiz: payload,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || isLoading;
  const isFinalStep =
    currentStep === 6 || (currentStep === 5 && !needsHigherStudiesStep);

  return (
    <div className="mx-auto w-full max-w-2xl p-6 sm:p-8">
      <div className="mb-8">
        <div className="mb-4 flex justify-between gap-2">
          {visibleSteps.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  step.number <= currentStep
                    ? 'bg-[hsl(209,100%,29%)]'
                    : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {activeStepMeta.title}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {activeStepMeta.description}
            </p>
          </div>
          <div className="shrink-0 text-sm font-medium text-gray-500">
            Step {visibleStepIndex + 1} of {totalVisibleSteps}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        autoFocus
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

          {currentStep === 2 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Email ID *</FormLabel>
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
                      We&apos;ll send your RIASEC results here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">WhatsApp Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="+91 98765 43210"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormDescription>
                      For event updates and follow-up guidance
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <FormField
              control={form.control}
              name="careerStage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Career Stage *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      {bgesCareerStageOptions.map((option) => (
                        <RadioOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          selected={field.value === option.value}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="graduationProgram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    Graduation Program *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      {bgesGraduationProgramOptions.map((option) => (
                        <RadioOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          selected={field.value === option.value}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 5 && (
            <FormField
              control={form.control}
              name="futurePlans"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Future Plans *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (
                          value !== 'higher_studies_india' &&
                          value !== 'higher_studies_abroad'
                        ) {
                          form.setValue('higherStudiesFocus', undefined);
                        }
                      }}
                      className="space-y-3"
                    >
                      {bgesFuturePlansOptions.map((option) => (
                        <RadioOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          selected={field.value === option.value}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 6 && needsHigherStudiesStep && (
            <FormField
              control={form.control}
              name="higherStudiesFocus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    If Higher Studies *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="space-y-3"
                    >
                      {bgesHigherStudiesFocusOptions.map((option) => (
                        <RadioOption
                          key={option.value}
                          value={option.value}
                          label={option.label}
                          selected={field.value === option.value}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(submitError || error) && (
            <p className="text-sm text-red-600">{submitError || error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || busy}
              className="flex-1"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {isFinalStep ? (
              <Button
                type="submit"
                disabled={!canGoNext() || busy}
                className="flex-1 bg-[hsl(209,100%,29%)] hover:bg-[hsl(209,100%,24%)]"
              >
                {busy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Start Assessment
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext() || busy}
                className="flex-1 bg-[hsl(209,100%,29%)] hover:bg-[hsl(209,100%,24%)]"
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
