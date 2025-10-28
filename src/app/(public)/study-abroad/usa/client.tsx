
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Building, Globe, Lightbulb, Plane, Telescope, Users, DollarSign, FileText, CalendarCheck, Landmark, XCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import UsaVisaGuide from "@/components/sections/UsaVisaGuide";

const whyStudyInUsa = [
    { icon: Award, title: 'Unmatched Academic Excellence', description: 'Home to the majority of the world\'s top-ranked universities, offering prestigious degrees recognized globally.', color: 'text-blue-500' },
    { icon: Telescope, title: 'Pioneering Research & Innovation', description: 'Access cutting-edge research facilities and opportunities to work alongside leading scholars and innovators.', color: 'text-orange-500' },
    { icon: BookOpen, title: 'Flexible Education System', description: 'Customize your learning path with a wide variety of courses, majors, and minors to explore your interests.', color: 'text-green-500' },
    { icon: Users, title: 'Vibrant & Diverse Campus Life', description: 'Experience a melting pot of cultures, ideas, and extracurricular activities on expansive, well-equipped campuses.', color: 'text-purple-500' },
    { icon: Briefcase, title: 'Global Career Opportunities', description: 'Gain access to a huge job market and valuable work experience through OPT and CPT programs.', color: 'text-red-500' },
    { icon: Globe, title: 'Global Networking', description: 'Build a powerful global network of peers, mentors, and industry leaders that will last a lifetime.', color: 'text-yellow-500' },
    { icon: Lightbulb, title: 'Focus on Practical Skills', description: 'Emphasis on hands-on learning, internships, and real-world projects to ensure job-readiness.', color: 'text-teal-500' },
    { icon: Building, title: 'Vast Program Variety', description: 'Choose from an unparalleled range of programs and specializations across all fields of study.', color: 'text-indigo-500' }
];

const admissionRequirements = {
    undergraduate: [
        "High school diploma with transcripts (GPA is crucial).",
        "Standardized test scores: SAT or ACT (many universities are test-optional, but good scores can help).",
        "English proficiency test scores: TOEFL (typically 80-100 iBT) or IELTS (typically 6.5-7.5).",
        "A compelling Personal Essay or Common App essay.",
        "Letters of Recommendation (LORs) from teachers or counselors.",
        "Proof of financial ability to cover tuition and living costs.",
    ],
    postgraduate: [
        "A 4-year Bachelor's degree from a recognized institution.",
        "Standardized test scores: GRE for most MS programs, GMAT for MBA programs.",
        "English proficiency test scores: TOEFL (typically 90-100+ iBT) or IELTS (typically 7.0-7.5).",
        "A strong Statement of Purpose (SOP).",
        "Letters of Recommendation (LORs) from professors or employers.",
        "A professional resume or CV.",
        "Proof of financial ability to cover tuition and living costs.",
    ]
};

const studyCosts = [
    { item: "Public University Tuition Fee", cost: "$25,000 - $45,000 per year" },
    { item: "Private University Tuition Fee", cost: "$35,000 - $70,000+ per year" },
    { item: "Living Expenses (Accommodation, Food, etc.)", cost: "$15,000 - $25,000 per year" },
    { item: "Health Insurance", cost: "$2,000 - $5,000 per year" },
    { item: "Books & Supplies", cost: "$1,000 - $2,000 per year" },
];


function AdmissionRequirements() {
    return (
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">
                            Admission & Costs for Studying in the USA
                        </h2>
                        <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-xl font-headline">Undergraduate Requirements</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="space-y-3 pt-2">
                                        {admissionRequirements.undergraduate.map(req => (
                                            <li key={req} className="flex items-start">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-xl font-headline">Postgraduate Requirements</AccordionTrigger>
                                <AccordionContent>
                                     <ul className="space-y-3 pt-2">
                                        {admissionRequirements.postgraduate.map(req => (
                                            <li key={req} className="flex items-start">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                <span>{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                    <div>
                         <Card className="bg-primary/5 dark:bg-slate-900">
                             <CardHeader>
                                 <CardTitle className="font-headline text-2xl flex items-center">
                                     <DollarSign className="h-6 w-6 mr-2"/> Estimated Study Cost
                                 </CardTitle>
                                 <CardDescription>
                                     An overview of the annual expenses for Indian students in the USA.
                                 </CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <ul className="space-y-3">
                                     {studyCosts.map(item => (
                                         <li key={item.item} className="flex justify-between items-center text-sm">
                                             <span>{item.item}</span>
                                             <span className="font-semibold text-right">{item.cost}</span>
                                         </li>
                                     ))}
                                 </ul>
                                 <p className="text-xs text-muted-foreground mt-4">*Costs are approximate and vary significantly by university and location.</p>
                             </CardContent>
                         </Card>
                    </div>
                </div>
            </div>
        </section>
    )
}
const ugTimeline = [
  { range: "18-24 Months Before Intake", title: "Early Research & Test Prep", icon: Telescope, tasks: [ "Start exploring different US universities and majors.", "Begin light preparation for the SAT/ACT and TOEFL/IELTS.", "Focus on maintaining a strong academic record and participating in extracurriculars." ] },
  { range: "12-18 Months Before Intake", title: "Intensive Test Prep & Shortlisting", icon: BookOpen, tasks: [ "Take your first serious mock tests for SAT/ACT.", "Shortlist around 15-20 universities of interest.", "Deep dive into university websites and admission requirements." ] },
  { range: "10-12 Months Before Intake", title: "Finalizing Applications", icon: FileText, tasks: [ "Finalize your list of 8-12 universities.", "Start drafting your Common App essay and supplements.", "Take your first official SAT/ACT." ] },
  { range: "8-10 Months Before Intake", title: "Application Submission", icon: Landmark, tasks: [ "Submit Early Decision or Early Action applications if applicable.", "Request official transcripts and LORs from your school.", "Finalize and submit all regular decision applications." ] },
  { range: "4-6 Months Before Intake", title: "Admission Decisions & Finances", icon: CalendarCheck, tasks: [ "Receive admission decisions.", "Compare financial aid offers from different universities.", "Make your final university choice and pay the deposit." ] },
  { range: "2-4 Months Before Intake", title: "Visa & Pre-Departure", icon: Plane, tasks: [ "Receive your I-20 form from the university.", "Pay the SEVIS fee and book your F-1 visa interview.", "Attend the visa interview and arrange flights upon approval." ] }
];

const pgTimeline = [
  { range: "18-24 Months Before Intake", title: "Foundation Building", icon: Telescope, tasks: [ "Finalize your area of specialization.", "Undertake research projects or internships to build your profile.", "Start light preparation for GRE/GMAT." ] },
  { range: "12-18 Months Before Intake", title: "Intensive Test Prep", icon: BookOpen, tasks: [ "Focus on intensive GMAT/GRE preparation and take mock tests.", "Begin shortlisting universities and professors of interest.", "Take the TOEFL/IELTS exam." ] },
  { range: "10-12 Months Before Intake", title: "Application Material Prep", icon: FileText, tasks: [ "Take your official GMAT/GRE test.", "Draft a strong Statement of Purpose (SOP) and resume.", "Request Letters of Recommendation (LORs) from professors." ] },
  { range: "8-10 Months Before Intake", title: "Application Submission", icon: Landmark, tasks: [ "Submit applications to your shortlisted universities.", "Ensure all documents, including test scores and LORs, are received.", "Prepare for any potential admission interviews." ] },
  { range: "4-6 Months Before Intake", title: "Admission Decisions", icon: CalendarCheck, tasks: [ "Receive admission and funding/scholarship decisions.", "Finalize your choice and accept the offer.", "Begin the process of arranging your finances." ] },
  { range: "2-4 Months Before Intake", title: "Visa & Pre-Departure", icon: Plane, tasks: [ "Receive your I-20 form.", "Book your F-1 visa interview slot and prepare documents.", "Arrange flights and accommodation upon visa approval." ] }
];

function ApplicationProcess() {
  const [isPostgraduate, setIsPostgraduate] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const timelineData = isPostgraduate ? pgTimeline : ugTimeline;
  const activePhaseData = timelineData[activePhase];

  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
            Your USA Study Abroad Timeline
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
            The US application process starts early. Use our timeline to stay ahead, switching between Undergraduate (UG) and Postgraduate (PG) routes.
          </p>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-8">
          <Label htmlFor="timeline-toggle" className={cn("font-medium", !isPostgraduate && "text-primary dark:text-white")}>
            Undergraduate
          </Label>
          <Switch
            id="timeline-toggle"
            checked={isPostgraduate}
            onCheckedChange={setIsPostgraduate}
            className="dark:border dark:border-white"
            aria-label="Toggle between undergraduate and postgraduate timelines"
          />
          <Label htmlFor="timeline-toggle" className={cn("font-medium", isPostgraduate && "text-primary dark:text-white")}>
            Postgraduate
          </Label>
        </div>

        <div className="text-center mb-10">
          <h3 className="text-2xl font-bold tracking-tight text-foreground font-headline">Planning Phases</h3>
        </div>

        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 overflow-x-auto pb-4 -mx-4 px-4 py-4">
          {timelineData.map((phase, index) => (
            <div key={index} className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setActivePhase(index)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full border-2 transition-all duration-300 text-center p-2",
                  activePhase === index
                  ? "bg-primary text-primary-foreground border-primary dark:bg-white dark:text-primary shadow-lg scale-105"
                  : "bg-background border-border hover:border-primary hover:bg-primary/5 dark:bg-transparent dark:border-white"
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
                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary dark:bg-white dark:text-primary">
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

const topUniversities = [
    { name: "Johns Hopkins University", qsRanking: "28", nationalRanking: "9", ugPrograms: ["Biomedical Engineering", "Public Health"], pgPrograms: ["MBA", "M.S. in Data Science"], image: "/college/college-2.webp", dataAiHint: "university building" },
    { name: "Arizona State University", qsRanking: "200", nationalRanking: "105", ugPrograms: ["Business", "Engineering"], pgPrograms: ["M.S. in Computer Science", "M.A. in Communication"], image: "/college/college-4.webp", dataAiHint: "modern architecture arizona" },
    { name: "UMass Amherst", qsRanking: "275", nationalRanking: "67", ugPrograms: ["Computer Science", "Psychology"], pgPrograms: ["M.S. in Business Analytics", "M.Ed. in Education"], image: "/college/college-6.webp", dataAiHint: "massachusetts landscape" },
    { name: "University of Arizona", qsRanking: "295", nationalRanking: "115", ugPrograms: ["Astronomy", "Management Information Systems"], pgPrograms: ["J.D. Law", "M.S. in Optical Sciences"], image: "/college/college-8.webp", dataAiHint: "abstract art arizona" },
    { name: "UC Riverside", qsRanking: "404", nationalRanking: "76", ugPrograms: ["Entomology", "Ethnic Studies"], pgPrograms: ["M.S. in Engineering", "MBA"], image: "/college/college-10.webp", dataAiHint: "california cityscape" },
    { name: "Washington State University", qsRanking: "419", nationalRanking: "178", ugPrograms: ["Hospitality Business Management", "Agriculture"], pgPrograms: ["Doctor of Veterinary Medicine", "M.S. in Electrical Engineering"], image: "/college/college-12.webp", dataAiHint: "modern building washington" },
    { name: "UIC (Illinois at Chicago)", qsRanking: "323", nationalRanking: "82", ugPrograms: ["Nursing", "Pharmacy"], pgPrograms: ["M.D. Doctor of Medicine", "M.S. in Public Health"], image: "/college/college-14.webp", dataAiHint: "chicago architecture" },
    { name: "University of Connecticut, Storrs", qsRanking: "444", nationalRanking: "58", ugPrograms: ["Kinesiology", "Pharmacy"], pgPrograms: ["M.S. in Financial Risk Management", "MBA"], image: "/college/college-16.webp", dataAiHint: "mountain landscape connecticut" },
    { name: "University of Oregon", qsRanking: "305", nationalRanking: "124", ugPrograms: ["Business", "Psychology"], pgPrograms: ["M.Arch Architecture", "J.D. Law"], image: "/college/college-18.webp", dataAiHint: "oregon sculpture" },
    { name: "Lehigh University", qsRanking: "592", nationalRanking: "47", ugPrograms: ["Engineering", "Business"], pgPrograms: ["M.Eng. in Structural Engineering", "M.S. in Financial Engineering"], image: "/college/college-20.webp", dataAiHint: "lehigh university building" },
    { name: "Drexel University", qsRanking: "641-650", nationalRanking: "98", ugPrograms: ["Engineering", "Business"], pgPrograms: ["M.S. in Information Systems", "MBA"], image: "/college/college-1.webp", dataAiHint: "abstract background philadelphia" },
    { name: "University of Delaware", qsRanking: "661-670", nationalRanking: "76", ugPrograms: ["Chemical Engineering", "Physical Therapy"], pgPrograms: ["M.S. in Cybersecurity", "Ph.D. in Biomechanics"], image:"/college/college-3.webp", dataAiHint: "colorful art delaware" },
    { name: "Rochester Institute of Technology", qsRanking: "771-780", nationalRanking: "98", ugPrograms: ["Game Design & Development", "Engineering"], pgPrograms: ["M.S. in Data Science", "M.F.A. in Film and Animation"], image: "/college/college-5.webp", dataAiHint: "new york interior design" },
    { name: "New Jersey Institute of Technology", qsRanking: "851-900", nationalRanking: "86", ugPrograms: ["Engineering", "Computer Science"], pgPrograms: ["M.S. in Data Science", "M.S. in Cybersecurity"], image: "/college/college-7.webp", dataAiHint: "new jersey architecture" },
    { name: "Worcester Polytechnic Institute", qsRanking: "851-900", nationalRanking: "82", ugPrograms: ["Robotics Engineering", "Computer Science"], pgPrograms: ["M.S. in Robotics Engineering", "M.S. in Data Science"], image: "/college/college-9.webp", dataAiHint: "city landscape massachusetts" },
];

function TopUniversities() {
  return (
    <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in the USA</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
            Explore a selection of excellent US universities offering a wide range of popular programs for international students.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {topUniversities.map((uni) => (
            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <div className="relative h-56 w-full bg-muted">
                <Image src={uni.image} alt={`Campus of ${uni.name}`} fill className="object-cover" data-ai-hint={uni.dataAiHint} />
              </div>
              <CardHeader>
                <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                <div className="flex items-center text-muted-foreground mt-1 text-sm">
                  <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                  <span>QS Ranking: {uni.qsRanking}</span>
                </div>
                <div className="flex items-center text-muted-foreground mt-1 text-sm">
                  <Building className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>US National Rank: {uni.nationalRanking}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="ug-programs">
                    <AccordionTrigger className="font-semibold text-base">Popular UG Programs</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 mt-2 text-sm list-disc pl-5">
                        {uni.ugPrograms.map(p => <li key={p}>{p}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="pg-programs">
                    <AccordionTrigger className="font-semibold text-base">Popular PG Programs</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2 mt-2 text-sm list-disc pl-5">
                        {uni.pgPrograms.map(p => <li key={p}>{p}</li>)}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkOpportunities() {
    return (
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                        Work Opportunities in the USA
                    </h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                        The US offers valuable work experience opportunities for F-1 students through CPT and OPT, helping you apply your knowledge and build your career.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Card className="shadow-lg flex flex-col dark:bg-slate-dark">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center">
                                <BookOpen className="mr-3 h-6 w-6 text-primary"/>
                                Curricular Practical Training (CPT)
                            </CardTitle>
                            <CardDescription>Work experience integrated into your curriculum.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <p className="text-muted-foreground">
                                CPT allows you to work off-campus in a job, co-op, or internship directly related to your major. It must be a required or integral part of your study program.
                            </p>
                            <div className="mt-auto pt-4">
                                <h4 className="font-semibold text-lg mb-2">Key Features:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                        <span>Can be part-time (up to 20 hrs/week) or full-time.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                        <span>Using 12 months or more of full-time CPT may make you ineligible for OPT.</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                     <Card className="shadow-lg flex flex-col dark:bg-slate-dark">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center">
                                <Briefcase className="mr-3 h-6 w-6 text-primary"/>
                                Optional Practical Training (OPT)
                            </CardTitle>
                            <CardDescription>Post-graduation work authorization.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                           <p className="text-muted-foreground mb-4">
                             OPT allows you to work for up to 12 months in a job related to your major after you graduate. It's a key pathway to gaining US work experience.
                           </p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
                                    <p className="font-bold text-2xl text-blue-700 dark:text-blue-300">12 Months</p>
                                    <p className="text-sm text-blue-600 dark:text-blue-200">Standard OPT for all graduates</p>
                                </div>
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                                    <p className="font-bold text-2xl text-green-700 dark:text-green-300">+24 Months</p>
                                    <p className="text-sm text-green-600 dark:text-green-200">Extension for STEM graduates</p>
                                </div>
                            </div>
                           <p className="text-sm text-muted-foreground mt-auto">
                                The 24-month STEM extension makes the USA a very attractive destination for students in science, technology, engineering, and math fields.
                           </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

function OptQuiz() {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const workQuiz = {
        question: "How long is the standard post-graduation OPT period for a non-STEM Master's degree?",
        options: ["6 Months", "12 Months", "24 Months", "36 Months"],
        correctAnswer: "12 Months",
    };

    const handleAnswerSelection = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const isCorrect = selectedAnswer === workQuiz.correctAnswer;

    return (
        <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20 dark:border-white/20">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: OPT Knowledge!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-lg mb-6 dark:text-white">{workQuiz.question}</p>
                        <div className="grid grid-cols-2 gap-4">
                            {workQuiz.options.map((option) => {
                                const isSelected = selectedAnswer === option;
                                const isCorrectAnswer = option === workQuiz.correctAnswer;
                                
                                return (
                                    <Button
                                        key={option}
                                        variant="outline"
                                        className={cn(
                                            "h-auto py-4 text-lg",
                                            isSelected && isCorrectAnswer && "bg-primary text-primary-foreground hover:bg-primary/90",
                                            isSelected && !isCorrectAnswer && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                            !isSelected && "bg-background hover:bg-primary/20 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white"
                                        )}
                                        onClick={() => handleAnswerSelection(option)}
                                    >
                                        {option}
                                    </Button>
                                );
                            })}
                        </div>
                        {selectedAnswer && !isCorrect && (
                            <p className="mt-6 text-destructive font-semibold flex items-center justify-center">
                                <XCircle className="mr-2 h-5 w-5" />
                                Not quite. A standard OPT period is 12 months.
                            </p>
                        )}
                        {selectedAnswer && isCorrect && (
                            <p className="mt-6 text-green-600 font-semibold flex items-center justify-center">
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Correct! A non-STEM Master's degree typically qualifies for 12 months of OPT.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

interface UsaPageClientProps {
  children: React.ReactNode;
}

export default function UsaPageClient({ children }: UsaPageClientProps) {
  return (
    <>
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Study in the USA: <span className="text-primary dark:text-white">Land of Innovation & Opportunity</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Home to the world's top universities, the USA offers unparalleled academic excellence, cutting-edge research, and a clear path to a successful global career.
                    </p>
                    <div className="mt-10">
                        <Button asChild size="lg" className="dark:bg-black dark:text-white dark:border dark:border-white">
                            <Link href="/contact">
                                Get Free Consultation
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                    <Image
                        src="/destinations/studying-in-usa.webp"
                        alt="The Statue of Liberty, representing the opportunity to study in the USA."
                        fill
                        className="object-cover"
                        data-ai-hint="statue of liberty"
                    />
                </div>
            </div>
        </div>
      </section>
       <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose the USA for Your Studies?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Discover the unique advantages that make the United States the world's most popular destination for international students.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyStudyInUsa.map((reason) => (
                    <Card key={reason.title} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-900">
                        <div className={cn('mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10')}>
                            <reason.icon className={cn('h-8 w-8', reason.color)} />
                        </div>
                        <CardTitle className="mt-6 font-headline text-xl">{reason.title}</CardTitle>
                        <CardDescription className="mt-2 text-base">{reason.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
      </section>
      <TopUniversities />
      <AdmissionRequirements />
      <ApplicationProcess />
      <UsaVisaGuide />
      <WorkOpportunities />
      <OptQuiz />
      {children}
      <StudyAbroadCtaSection headline="Ready to Start Your American Dream?" />
    </>
  );
}
