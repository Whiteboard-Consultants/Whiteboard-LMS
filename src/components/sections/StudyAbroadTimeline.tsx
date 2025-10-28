
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { BookOpen, CalendarCheck, FileText, Landmark, Plane, Telescope } from 'lucide-react';

const ugTimeline = [
  {
    range: "10-14 Months Before Intake",
    title: "Research & Exploration",
    icon: Telescope,
    tasks: [
      "Define your academic and career goals.",
      "Research countries, universities, and courses.",
      "Check admission requirements and eligibility.",
      "Start preparing for standardized tests (SAT/ACT/IELTS/TOEFL).",
      "Attend education fairs and connect with consultants."
    ]
  },
  {
    range: "8-12 Months Before Intake",
    title: "Test Prep & Shortlisting",
    icon: BookOpen,
    tasks: [
      "Take standardized tests (SAT/ACT/IELTS/TOEFL).",
      "Finalize a list of 5-8 universities.",
      "Start working on your Statement of Purpose (SOP) and essays.",
      "Request Letters of Recommendation (LORs) from teachers.",
      "Organize all academic transcripts and documents."
    ]
  },
  {
    range: "6-10 Months Before Intake",
    title: "Application Submission",
    icon: FileText,
    tasks: [
      "Fill out and submit online application forms.",
      "Pay application fees.",
      "Ensure LORs and transcripts are sent to universities.",
      "Double-check all application deadlines.",
      "Keep track of your application status online."
    ]
  },
  {
    range: "4-8 Months Before Intake",
    title: "Acceptance & Finances",
    icon: Landmark,
    tasks: [
      "Receive and review admission offers.",
      "Accept your chosen university's offer.",
      "Pay the admission deposit to secure your spot.",
      "Start arranging for funds and apply for education loans.",
      "Gather documents for your student visa application."
    ]
  },
  {
    range: "3-5 Months Before Intake",
    title: "Visa Process",
    icon: CalendarCheck,
    tasks: [
      "Complete the student visa application form.",
      "Schedule and attend your visa interview.",
      "Undergo medical examinations if required.",
      "Wait for the visa decision.",
      "Book flights upon visa approval."
    ]
  },
  {
    range: "1-2 Months Before Intake",
    title: "Pre-Departure",
    icon: Plane,
    tasks: [
      "Arrange for accommodation.",
      "Book your flight tickets.",
      "Attend pre-departure briefing sessions.",
      "Finalize packing and necessary shopping.",
      "Inform the university of your arrival details."
    ]
  }
];

const pgTimeline = [
  {
    range: "8-12 Months Before Intake",
    title: "Research & Test Prep",
    icon: Telescope,
    tasks: [
      "Finalize your field of specialization and career goals.",
      "Research universities and specific PG programs.",
      "Start preparing for GMAT/GRE and IELTS/TOEFL.",
      "Update your resume/CV and identify potential recommenders.",
      "Network with alumni and current students."
    ]
  },
  {
    range: "6-8 Months Before Intake",
    title: "Application Crafting",
    icon: BookOpen,
    tasks: [
      "Take GMAT/GRE and English proficiency tests.",
      "Draft your Statement of Purpose (SOP) and application essays.",
      "Request official transcripts from your undergraduate institution.",
      "Finalize your list of 6-8 universities.",
      "Provide your recommenders with all necessary information for LORs."
    ]
  },
  {
    range: "4-6 Months Before Intake",
    title: "Application Submission",
    icon: FileText,
    tasks: [
      "Submit all online applications before deadlines.",
      "Ensure test scores are officially sent to universities.",
      "Follow up with recommenders to ensure LORs are submitted.",
      "Confirm receipt of all application materials with universities.",
      "Prepare for potential admission interviews."
    ]
  },
  {
    range: "3-4 Months Before Intake",
    title: "Admission & Finances",
    icon: Landmark,
    tasks: [
      "Evaluate admission offers and scholarship awards.",
      "Accept the offer from your chosen university.",
      "Secure funding and apply for education loans.",
      "Begin collecting documents required for the student visa.",
      "Pay the required tuition deposit."
    ]
  },
  {
    range: "2-3 Months Before Intake",
    title: "Visa Application",
    icon: CalendarCheck,
    tasks: [
      "Fill and submit the visa application form.",
      "Pay the visa application fee.",
      "Attend your visa interview/biometrics appointment.",
      "Arrange for medical check-ups if necessary.",
      "Receive your visa."
    ]
  },
  {
    range: "1-2 Months Before Intake",
    title: "Final Preparations",
    icon: Plane,
    tasks: [
      "Book your flights and arrange accommodation.",
      "Complete any pre-arrival registrations with the university.",
      "Attend pre-departure orientations.",
      "Organize foreign currency and international bank accounts.",
      "Pack your bags and prepare for your journey!"
    ]
  }
];


export default function StudyAbroadTimeline() {
  const [isPostgraduate, setIsPostgraduate] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const timelineData = isPostgraduate ? pgTimeline : ugTimeline;
  const activePhaseData = timelineData[activePhase];

  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
            Your Study Abroad Timeline
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
            Plan your journey step-by-step! Use the toggle below to view the recommended timeline for Undergraduate (UG) or Postgraduate (PG) programs, helping you stay on track with your application process.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <Label htmlFor="timeline-toggle" className={cn("font-medium", !isPostgraduate ? "text-primary dark:text-white" : "text-muted-foreground dark:text-gray-400")}>
            Undergraduate
          </Label>
          <Switch
            id="timeline-toggle"
            checked={isPostgraduate}
            onCheckedChange={setIsPostgraduate}
            aria-label="Toggle between undergraduate and postgraduate timelines"
          />
          <Label htmlFor="timeline-toggle" className={cn("font-medium", isPostgraduate ? "text-primary dark:text-white" : "text-muted-foreground dark:text-gray-400")}>
            Postgraduate
          </Label>
        </div>

        <div className="text-center mb-10">
            <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Planning Phases</h3>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
            {timelineData.map((phase, index) => (
                <div key={index} className="flex items-center">
                    <button
                        onClick={() => setActivePhase(index)}
                        className={cn(
                            "flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all duration-300 text-center p-2",
                            activePhase === index
                            ? "bg-primary text-primary-foreground dark:bg-white dark:text-black border-primary dark:border-white shadow-lg scale-105"
                            : "bg-background border-border hover:border-primary hover:bg-primary/5"
                        )}
                        >
                        <span className="font-bold text-sm sm:text-base">{phase.range.split(' ')[0]}</span>
                        <span className="text-xs sm:text-sm">{phase.range.split(' ').slice(1).join(' ')}</span>
                    </button>
                    {index < timelineData.length - 1 && (
                        <div className="hidden sm:block w-8 sm:w-12 h-px bg-border flex-shrink-0" />
                    )}
                </div>
            ))}
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-4">
                 <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                    <activePhaseData.icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{activePhaseData.range}</p>
                    <h4 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
                        {activePhaseData.title}
                    </h4>
                </div>
              </div>
              <ul className="space-y-3 list-disc pl-5">
                {activePhaseData.tasks.map((task, index) => (
                  <li key={index} className="text-muted-foreground">
                    {task}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
