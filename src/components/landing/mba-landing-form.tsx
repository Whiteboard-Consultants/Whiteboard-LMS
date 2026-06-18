'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  addMonths,
  endOfMonth,
  format,
  isBefore,
  isSunday,
  startOfDay,
  startOfMonth,
} from 'date-fns';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';
import {
  budgetOptions,
  careerStageOptions,
  mbaLandingFormSchema,
  mbaReasonOptions,
  programTimelineOptions,
  type MbaLandingFormData,
} from '@/lib/schemas/mba-landing-form';

const TIME_SLOTS = [
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '1:00 PM',
  '1:30 PM',
  '2:00 PM',
  '2:30 PM',
  '3:00 PM',
  '3:30 PM',
  '4:00 PM',
  '4:30 PM',
  '5:00 PM',
  '5:30 PM',
] as const;

type FormStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const steps = [
  { number: 1, title: 'Your Details', description: "Let's start with your name" },
  { number: 2, title: 'Contact Info', description: 'How can we reach you?' },
  { number: 3, title: 'Career Stage', description: 'Where are you in your career right now?' },
  {
    number: 4,
    title: 'Why an MBA?',
    description: 'Why are you planning to do an MBA?',
  },
  { number: 5, title: 'Your Budget', description: 'What is your approximate budget?' },
  {
    number: 6,
    title: 'Program Start Timeline',
    description: 'When are you planning to start?',
  },
  {
    number: 7,
    title: 'Your Biggest Challenge',
    description: "What's holding you back from starting your MBA?",
  },
  {
    number: 8,
    title: 'Schedule Your Call',
    description: 'When would you like us to connect with you?',
  },
];

export function MbaLandingForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const today = useMemo(() => startOfDay(new Date()), []);
  const minMonth = useMemo(() => startOfMonth(today), [today]);
  const maxMonth = useMemo(() => startOfMonth(addMonths(today, 1)), [today]);

  const form = useForm<MbaLandingFormData>({
    resolver: zodResolver(mbaLandingFormSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      careerStage: undefined,
      mbaReason: undefined,
      budget: undefined,
      programTimeline: undefined,
      biggestChallenge: '',
      callbackDate: '',
      callbackTime: '',
    },
  });

  const selectedCallbackDate = form.watch('callbackDate');

  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    if (isBefore(day, today)) return true;
    if (isSunday(date)) return true;
    const monthStart = startOfMonth(day);
    if (monthStart < minMonth || monthStart > maxMonth) return true;
    return false;
  };

  const canGoNext = () => {
    const fieldsByStep: { [key in FormStep]: (keyof MbaLandingFormData)[] } = {
      1: ['firstName', 'lastName'],
      2: ['email'],
      3: ['careerStage'],
      4: ['mbaReason'],
      5: ['budget'],
      6: ['programTimeline'],
      7: ['biggestChallenge'],
      8: ['callbackDate', 'callbackTime'],
    };

    const fieldsToCheck = fieldsByStep[currentStep];
    return fieldsToCheck.every((field) => {
      const value = form.getValues(field);
      return value !== undefined && value !== '' && value !== null;
    });
  };

  const onSubmit = async (data: MbaLandingFormData) => {
    try {
      setIsSubmitting(true);

      FacebookPixelEvents.lead(data.email, data.phone, data.firstName, data.lastName);

      const response = await fetch('/api/landing/mba-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      toast.success(
        "🎉 Thank you! We've received your enquiry. A counsellor will connect with you at your preferred time."
      );
      form.reset();
      setCurrentStep(1);
    } catch (error) {
      console.error('MBA form submission error:', error);
      toast.error('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 8) {
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
      <div className="mb-8">
        <div className="flex justify-between gap-2 mb-4">
          {steps.map((step) => (
            <div key={step.number} className="flex-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>
          <div className="text-sm font-medium text-gray-500">
            Step {currentStep} of {steps.length}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
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
                      <Input placeholder="Your last name" {...field} className="h-10" />
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
                      We&apos;ll send you program recommendations and updates
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
                      <Input placeholder="+91 98765 43210" {...field} className="h-10" />
                    </FormControl>
                    <FormDescription>For counsellor follow-up and support</FormDescription>
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
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {careerStageOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
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

          {currentStep === 4 && (
            <FormField
              control={form.control}
              name="mbaReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    Why am I planning to do an MBA? *
                  </FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {mbaReasonOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
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

          {currentStep === 5 && (
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Your Budget *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {budgetOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
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

          {currentStep === 6 && (
            <FormField
              control={form.control}
              name="programTimeline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Program Start Timeline *</FormLabel>
                  <FormControl>
                    <RadioGroup value={field.value} onValueChange={field.onChange}>
                      <div className="space-y-3">
                        {programTimelineOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={option.value} id={option.value} />
                            <label
                              htmlFor={option.value}
                              className="text-sm font-medium text-gray-700 cursor-pointer flex-1"
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

          {currentStep === 7 && (
            <FormField
              control={form.control}
              name="biggestChallenge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">
                    What&apos;s Your Biggest Challenge? *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., I'm unsure which university is recognized and fits my budget..."
                      {...field}
                      maxLength={250}
                      className="min-h-32 resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length ?? 0}/250 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {currentStep === 8 && (
            <div className="space-y-6">
              <FormDescription className="text-sm text-gray-600">
                Our Official Working Hours: Mon–Sat, 10:30 AM to 6:00 PM
              </FormDescription>

              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={
                    selectedCallbackDate
                      ? new Date(selectedCallbackDate + 'T12:00:00')
                      : undefined
                  }
                  onSelect={(date) => {
                    form.setValue(
                      'callbackDate',
                      date ? format(date, 'yyyy-MM-dd') : '',
                      { shouldValidate: true }
                    );
                  }}
                  month={calendarMonth}
                  onMonthChange={setCalendarMonth}
                  disabled={isDateDisabled}
                  fromMonth={minMonth}
                  toMonth={endOfMonth(maxMonth)}
                  className="rounded-md border"
                />
              </div>

              <FormField
                control={form.control}
                name="callbackTime"
                render={({ field }) => (
                  <FormItem>
                    <Label>Select a time slot *</Label>
                    <FormControl>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                        {TIME_SLOTS.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() =>
                              form.setValue('callbackTime', slot, {
                                shouldValidate: true,
                              })
                            }
                            className={cn(
                              'text-xs sm:text-sm py-2 px-1 rounded-md border transition-colors',
                              field.value === slot
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-gray-200 hover:border-blue-300 bg-white'
                            )}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="callbackDate" render={() => <FormMessage />} />
            </div>
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

            {currentStep === 8 ? (
              <Button
                type="submit"
                disabled={isSubmitting || !canGoNext()}
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
                    Get My Free MBA Guidance
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

      <p className="text-xs text-gray-500 text-center mt-6">
        By submitting this form, you agree to our{' '}
        <a href="/privacy" className="underline hover:text-gray-700">
          Privacy Policy
        </a>
        . We&apos;ll send you program recommendations and helpful guidance — no spam.
      </p>
    </div>
  );
}
