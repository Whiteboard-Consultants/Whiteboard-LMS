'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  gccDestinationOptions,
  gccFormSchema,
  gccStudyAreaOptions,
  gccYearOptions,
  splitFullName,
  type GccFormData,
} from '@/lib/schemas/gcc-form';

type FormStep = 1 | 2 | 3 | 4;

const STEPS = [
  {
    number: 1,
    title: 'Personal information',
    description: 'Name, phone, and email so we can send your pass.',
  },
  {
    number: 2,
    title: 'Your studies',
    description: 'Department or stream, and your current year.',
  },
  {
    number: 3,
    title: 'Preferred Destination',
    description: 'Select every country you want to explore.',
  },
  {
    number: 4,
    title: 'Preferred Study Area',
    description: 'Select every area you want to discuss on campus.',
  },
] as const;

const FIELDS_BY_STEP: Record<FormStep, (keyof GccFormData)[]> = {
  1: ['fullName', 'mobileNumber', 'email'],
  2: ['departmentStream', 'currentSemesterYear'],
  3: ['preferredDestinations'],
  4: ['preferredStudyAreas'],
};

function CheckboxGroup({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <label
            key={option}
            className="flex items-start gap-3 rounded-xl border border-white/70 dark:border-slate-700 bg-white/50 dark:bg-slate-900/40 p-3 cursor-pointer"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(next) => {
                onChange(
                  next
                    ? [...value, option]
                    : value.filter((item) => item !== option)
                );
              }}
              className="mt-0.5"
            />
            <span className="text-sm text-gray-800 dark:text-slate-100 leading-snug">
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export function GccForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const form = useForm<GccFormData>({
    resolver: zodResolver(gccFormSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      email: '',
      departmentStream: '',
      currentSemesterYear: undefined,
      preferredDestinations: [],
      preferredStudyAreas: [],
    },
  });

  const currentStepMeta = STEPS[currentStep - 1];
  const isLastStep = currentStep === 4;

  const handleNext = async () => {
    const valid = await form.trigger(FIELDS_BY_STEP[currentStep]);
    if (!valid || currentStep >= 4) return;
    setCurrentStep((prev) => (prev + 1) as FormStep);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const onSubmit = async (data: GccFormData) => {
    try {
      setIsSubmitting(true);
      const eventId = crypto.randomUUID();
      const { firstName, lastName } = splitFullName(data.fullName);

      FacebookPixelEvents.lead(data.email, data.mobileNumber, firstName, lastName, eventId);

      const response = await fetch('/api/landing/gcc-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, eventId }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setIsConfirmed(true);
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error('Global Career Camp form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isConfirmed) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Your free pass is reserved.
        </h3>
        <p className="text-gray-700 dark:text-slate-200 leading-relaxed max-w-xl mx-auto">
          A confirmation is on its way to your email. Global Career Camp 2026 is on
          30 September and 1 October at Bhawanipur Global Campus, Kolkata.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <div className="flex justify-between gap-2 mb-4">
          {STEPS.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {currentStepMeta.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">
              {currentStepMeta.description}
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500 dark:text-slate-400 whitespace-nowrap">
            Step {currentStep} of 4
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base dark:text-slate-200">Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" autoComplete="name" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base dark:text-slate-200">Phone Number *</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        placeholder="10-digit Indian mobile"
                        autoComplete="tel"
                        className="h-10"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        className="h-10"
                        {...field}
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
                name="departmentStream"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base dark:text-slate-200">Department / Stream *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. BBA, B.Com, Computer Science" className="h-10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentSemesterYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base dark:text-slate-200">Current Year *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gccYearOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {currentStep === 3 && (
            <FormField
              control={form.control}
              name="preferredDestinations"
              render={({ field }) => (
                <FormItem>
                  <CheckboxGroup
                    options={gccDestinationOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="preferredStudyAreas"
              render={({ field }) => (
                <FormItem>
                  <CheckboxGroup
                    options={gccStudyAreaOptions}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isSubmitting}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {isLastStep ? (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Reserving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Reserve Your Free Pass
                  </>
                )}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
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
