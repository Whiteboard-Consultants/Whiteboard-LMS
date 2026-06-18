'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  addMonths,
  startOfDay,
  startOfMonth,
  endOfMonth,
  isBefore,
  isSunday,
  format,
} from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { submitApplication } from '@/app/(landing)/apply/actions';
import { FacebookPixelEvents } from '@/lib/facebook-pixel';
import type { ApplicationFormData } from '@/lib/application-email-service';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const TOTAL_STEPS = 10;

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

const STRUGGLE_OPTIONS = [
  "I'm highly confused and don't know where to start",
  'I have a rough idea and feel lost without guidance',
  'I have researched a lot yet I feel overwhelmed and stuck',
  'I am completely clear about my next steps',
] as const;

const TIMELINE_OPTIONS = [
  'Immediately',
  'In the next 6 months',
  'In the next 1 year',
  'Not yet decided',
] as const;

type FormState = {
  fullName: string;
  email: string;
  whatsapp: string;
  currentEducation: string;
  pursueLevel: string;
  pursueProgram: string;
  preferredLocation: string;
  locationDetail: string;
  confusionArea: string;
  currentStruggle: string;
  planningTimeline: string;
  callbackDate: Date | undefined;
  callbackTime: string;
};

const initialFormState: FormState = {
  fullName: '',
  email: '',
  whatsapp: '',
  currentEducation: '',
  pursueLevel: '',
  pursueProgram: '',
  preferredLocation: '',
  locationDetail: '',
  confusionArea: '',
  currentStruggle: '',
  planningTimeline: '',
  callbackDate: undefined,
  callbackTime: '',
};

function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, MMMM d, yyyy');
}

export default function ApplicationFormClient() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [form, setForm] = useState<FormState>(initialFormState);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());

  const today = useMemo(() => startOfDay(new Date()), []);
  const minMonth = useMemo(() => startOfMonth(today), [today]);
  const maxMonth = useMemo(() => startOfMonth(addMonths(today, 1)), [today]);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setFieldError(null);
    },
    []
  );

  const validateStep = useCallback((): boolean => {
    switch (step) {
      case 1:
        if (!form.fullName.trim()) {
          setFieldError('Please enter your full name.');
          return false;
        }
        break;
      case 2:
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          setFieldError('Please enter a valid email address.');
          return false;
        }
        break;
      case 3:
        if (!/^\d{10}$/.test(form.whatsapp)) {
          setFieldError('Please enter a valid 10-digit Indian mobile number.');
          return false;
        }
        break;
      case 4:
        if (!form.currentEducation.trim()) {
          setFieldError('Please enter your current education.');
          return false;
        }
        break;
      case 5:
        if (!form.pursueLevel) {
          setFieldError('Please select Undergraduation or Masters.');
          return false;
        }
        if (!form.pursueProgram.trim()) {
          setFieldError('Please specify which program you wish to pursue.');
          return false;
        }
        break;
      case 6:
        if (!form.preferredLocation) {
          setFieldError('Please select India or Abroad.');
          return false;
        }
        if (!form.locationDetail.trim()) {
          setFieldError('Please mention your preferred city or country.');
          return false;
        }
        break;
      case 7:
        if (!form.confusionArea.trim()) {
          setFieldError('Please share where you feel the most confusion.');
          return false;
        }
        break;
      case 8:
        if (!form.currentStruggle) {
          setFieldError('Please select the option that best describes your struggle.');
          return false;
        }
        break;
      case 9:
        if (!form.planningTimeline) {
          setFieldError('Please select your planning timeline.');
          return false;
        }
        break;
      case 10:
        if (!form.callbackDate) {
          setFieldError('Please select a preferred callback date.');
          return false;
        }
        if (!form.callbackTime) {
          setFieldError('Please select a preferred callback time.');
          return false;
        }
        break;
    }
    setFieldError(null);
    return true;
  }, [step, form]);

  const goNext = () => {
    if (!validateStep()) return;
    if (step < TOTAL_STEPS) {
      setDirection('forward');
      setStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setDirection('back');
      setStep((s) => s - 1);
      setFieldError(null);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setFieldError(null);

    const payload: ApplicationFormData = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim(),
      currentEducation: form.currentEducation.trim(),
      pursueLevel: form.pursueLevel,
      pursueProgram: form.pursueProgram.trim(),
      preferredLocation: form.preferredLocation,
      locationDetail: form.locationDetail.trim(),
      confusionArea: form.confusionArea.trim(),
      currentStruggle: form.currentStruggle,
      planningTimeline: form.planningTimeline,
      callbackDate: format(form.callbackDate!, 'yyyy-MM-dd'),
      callbackTime: form.callbackTime,
      submittedAt: new Date().toISOString(),
    };

    const result = await submitApplication(payload);
    setIsSubmitting(false);

    if (result.success) {
      const nameParts = payload.fullName.split(/\s+/);
      FacebookPixelEvents.lead(
        payload.email,
        payload.whatsapp,
        nameParts[0],
        nameParts.slice(1).join(' ') || undefined
      );
      setIsSuccess(true);
    } else {
      setFieldError(result.error || 'Submission failed. Please try again.');
    }
  };

  const isDateDisabled = (date: Date) => {
    const day = startOfDay(date);
    if (isBefore(day, today)) return true;
    if (isSunday(date)) return true;
    const monthStart = startOfMonth(day);
    if (monthStart < minMonth || monthStart > maxMonth) return true;
    return false;
  };

  const progressPercent = (step / TOTAL_STEPS) * 100;

  if (isSuccess && form.callbackDate) {
    return (
      <div className="min-h-[70vh] bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6 text-center">
          <div className="bg-background dark:bg-card rounded-2xl shadow-lg p-8 sm:p-12 border border-border">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="font-headline text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Thank you!
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We&apos;ve received your application and will connect with you on{' '}
              <strong className="text-foreground">
                {formatDisplayDate(form.callbackDate)}
              </strong>{' '}
              at <strong className="text-foreground">{form.callbackTime}</strong>.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              A confirmation email has been sent to {form.email}.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-dark">
      <section className="bg-primary dark:bg-black py-10 sm:py-14">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-primary-foreground">
            Start Your Education Journey
          </h1>
          <p className="mt-3 text-primary-foreground/80 text-sm sm:text-base max-w-lg mx-auto">
            Answer a few quick questions so our counselors can guide you with
            personalized advice.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 pb-16">
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Step {step} of {TOTAL_STEPS}
              </span>
              <span className="text-sm font-medium text-primary">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="bg-background dark:bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div
              key={step}
              className={cn(
                'p-6 sm:p-8 min-h-[320px] flex flex-col',
                direction === 'forward'
                  ? 'animate-in fade-in slide-in-from-right-4 duration-300'
                  : 'animate-in fade-in slide-in-from-left-4 duration-300'
              )}
            >
              {step === 1 && (
                <StepContent
                  label="Full Name"
                  description="Let's start with your name."
                >
                  <Input
                    autoFocus
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && goNext()}
                    className="text-base h-12"
                  />
                </StepContent>
              )}

              {step === 2 && (
                <StepContent
                  label="Email ID"
                  description="We'll send your confirmation here."
                >
                  <Input
                    autoFocus
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && goNext()}
                    className="text-base h-12"
                  />
                </StepContent>
              )}

              {step === 3 && (
                <StepContent
                  label="WhatsApp Number"
                  description="10-digit Indian mobile number (no +91 needed)."
                >
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 rounded-md border bg-muted text-muted-foreground text-sm font-medium">
                      +91
                    </span>
                    <Input
                      autoFocus
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="9876543210"
                      value={form.whatsapp}
                      onChange={(e) =>
                        updateField(
                          'whatsapp',
                          e.target.value.replace(/\D/g, '').slice(0, 10)
                        )
                      }
                      onKeyDown={(e) => e.key === 'Enter' && goNext()}
                      className="text-base h-12 flex-1"
                    />
                  </div>
                </StepContent>
              )}

              {step === 4 && (
                <StepContent
                  label="Current Education"
                  description='e.g. "12th Grade", "B.Com 2nd Year"'
                >
                  <Input
                    autoFocus
                    placeholder="Your current education level"
                    value={form.currentEducation}
                    onChange={(e) =>
                      updateField('currentEducation', e.target.value)
                    }
                    onKeyDown={(e) => e.key === 'Enter' && goNext()}
                    className="text-base h-12"
                  />
                </StepContent>
              )}

              {step === 5 && (
                <StepContent
                  label="You wish to pursue?"
                  description="Select your level and specify your program."
                >
                  <RadioGroup
                    value={form.pursueLevel}
                    onValueChange={(v) => updateField('pursueLevel', v)}
                    className="gap-3 mb-6"
                  >
                    {['Undergraduation', 'Masters'].map((option) => (
                      <label
                        key={option}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                          form.pursueLevel === option
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value={option} id={`pursue-${option}`} />
                        <span className="font-medium">{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                  <div className="space-y-2">
                    <Label htmlFor="pursue-program">
                      You wish to pursue which program?
                    </Label>
                    <Input
                      id="pursue-program"
                      placeholder='e.g. "MBA", "MS Computer Science"'
                      value={form.pursueProgram}
                      onChange={(e) =>
                        updateField('pursueProgram', e.target.value)
                      }
                      className="text-base h-12"
                    />
                  </div>
                </StepContent>
              )}

              {step === 6 && (
                <StepContent
                  label="Your preferred location"
                  description="Where would you like to study?"
                >
                  <Select
                    value={form.preferredLocation}
                    onValueChange={(v) => updateField('preferredLocation', v)}
                  >
                    <SelectTrigger className="h-12 text-base mb-6">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Abroad">Abroad</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="space-y-2">
                    <Label htmlFor="location-detail">Mention city or country</Label>
                    <Input
                      id="location-detail"
                      placeholder="e.g. Mumbai, UK, Canada"
                      value={form.locationDetail}
                      onChange={(e) =>
                        updateField('locationDetail', e.target.value)
                      }
                      className="text-base h-12"
                    />
                  </div>
                </StepContent>
              )}

              {step === 7 && (
                <StepContent
                  label="Maximum confusion area"
                  description="Where exactly do you feel the maximum confusion — is it about selecting universities, location, or programs?"
                >
                  <Textarea
                    autoFocus
                    placeholder="Share your thoughts..."
                    value={form.confusionArea}
                    onChange={(e) => updateField('confusionArea', e.target.value)}
                    className="min-h-[140px] text-base resize-none"
                  />
                </StepContent>
              )}

              {step === 8 && (
                <StepContent
                  label="How would you describe your current struggle regarding your plans?"
                >
                  <RadioGroup
                    value={form.currentStruggle}
                    onValueChange={(v) => updateField('currentStruggle', v)}
                    className="gap-3"
                  >
                    {STRUGGLE_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          'flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                          form.currentStruggle === option
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`struggle-${option.slice(0, 8)}`}
                          className="mt-0.5"
                        />
                        <span className="text-sm leading-snug">{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </StepContent>
              )}

              {step === 9 && (
                <StepContent
                  label="When are you planning your Undergraduation or Post Graduation?"
                >
                  <RadioGroup
                    value={form.planningTimeline}
                    onValueChange={(v) => updateField('planningTimeline', v)}
                    className="gap-3"
                  >
                    {TIMELINE_OPTIONS.map((option) => (
                      <label
                        key={option}
                        className={cn(
                          'flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                          form.planningTimeline === option
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem
                          value={option}
                          id={`timeline-${option.slice(0, 6)}`}
                        />
                        <span className="font-medium">{option}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </StepContent>
              )}

              {step === 10 && (
                <StepContent
                  label="If you wish to take our help, when and what time would you like us to connect with you?"
                  description="Our Official Working Hours: Mon–Sat, 10:30 AM to 6:00 PM"
                >
                  <div className="flex justify-center mb-4">
                    <Calendar
                      mode="single"
                      selected={form.callbackDate}
                      onSelect={(date) => updateField('callbackDate', date)}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      disabled={isDateDisabled}
                      fromMonth={minMonth}
                      toMonth={endOfMonth(maxMonth)}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Select a time slot</Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => updateField('callbackTime', slot)}
                          className={cn(
                            'text-xs sm:text-sm py-2 px-1 rounded-md border transition-colors',
                            form.callbackTime === slot
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'border-border hover:border-primary/50 bg-background'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </StepContent>
              )}

              {fieldError && (
                <p className="mt-4 text-sm text-destructive" role="alert">
                  {fieldError}
                </p>
              )}

              <div className="mt-auto pt-6 flex gap-3">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={goBack}
                    disabled={isSubmitting}
                    className="flex-1 h-11"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
                {step < TOTAL_STEPS ? (
                  <Button
                    type="button"
                    onClick={goNext}
                    className={cn('h-11', step === 1 ? 'w-full' : 'flex-1')}
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-11"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Your information is kept confidential and used only to provide
            counseling support.
          </p>
        </div>
      </section>
    </div>
  );
}

function StepContent({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col">
      <h2 className="font-headline text-xl sm:text-2xl font-semibold text-foreground mb-2">
        {label}
      </h2>
      {description && (
        <p className="text-muted-foreground text-sm sm:text-base mb-6">
          {description}
        </p>
      )}
      {!description && <div className="mb-6" />}
      <div className="flex-1">{children}</div>
    </div>
  );
}
