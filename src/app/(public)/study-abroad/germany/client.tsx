
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Euro, BookOpen, Briefcase, Globe, School, Shield, Users, Telescope, FileText, CalendarCheck, Landmark, Plane, Clock, UserCheck, University, Info, XCircle, HeartHandshake, MapPin, DollarSign, Star, BarChart, Book } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const faqsForSchema = [
    {
        questionName: "Can I study in Germany for free?",
        acceptedAnswerText: "Yes, the majority of public universities in Germany do not charge tuition fees for Bachelor's and Master's programs for all students, including internationals. You only need to pay a semester contribution of around €150-€350, which covers administrative costs and often includes a public transport ticket."
    },
    {
        questionName: "What is the APS certificate for Indian students?",
        acceptedAnswerText: "The Academic Evaluation Centre (Akademische Prüfstelle - APS) certificate is a mandatory document for Indian students wishing to study in Germany. It verifies the authenticity of your academic documents and your eligibility for German university studies. You must obtain this before applying for a student visa."
    },
    {
        questionName: "What is a Blocked Account (Sperrkonto)?",
        acceptedAnswerText: "A Blocked Account is a special bank account required for the German student visa. You must deposit sufficient funds to cover your living expenses for the first year of your studies (currently €11,208). You can only withdraw a fixed monthly amount from this account after arriving in Germany."
    },
    {
        questionName: "Can I study in Germany in English?",
        acceptedAnswerText: "Absolutely. German universities offer a large and growing number of degree programs taught entirely in English, especially at the Master's level. This means you don't need to be fluent in German to study in Germany, although learning some German is highly recommended for daily life."
    }
];

const whyStudyInGermany = [
    { icon: Euro, title: 'Affordable Education', description: 'Public universities offer world-class education with minimal semester fees, making it a cost-effective choice.', color: 'text-blue-500' },
    { icon: Briefcase, title: 'Strong Economy & Job Market', description: 'Germany is Europe’s economic powerhouse, offering excellent internship and job opportunities, especially in engineering and technology.', color: 'text-green-500' },
    { icon: Telescope, title: 'Research & Innovation Hub', description: 'Germany is a global leader in research and development, providing a stimulating environment for aspiring researchers and innovators.', color: 'text-orange-500' },
    { icon: Globe, title: 'Central European Location', description: 'Its prime location makes it easy and affordable to travel and explore other European countries during your studies.', color: 'text-purple-500' },
    { icon: Shield, title: 'Safe & High Quality of Life', description: 'Enjoy a safe, modern, and efficient society with a high standard of living and excellent public infrastructure.', color: 'text-red-500' },
    { icon: School, title: 'English-Taught Programs', description: 'A wide variety of courses, especially at the Master’s level, are offered entirely in English, removing the language barrier.', color: 'text-yellow-500' },
    { icon: Users, title: 'Welcoming to Internationals', description: 'Germany has a long tradition of welcoming international students and offers strong support systems to help them integrate.', color: 'text-teal-500' },
    { icon: BookOpen, title: 'Practical, Hands-On Learning', description: "The 'Fachhochschulen' (Universities of Applied Sciences) offer a practical, industry-focused education alongside traditional research universities.", color: 'text-indigo-500' }
];

const topUniversities = [
    { name: "Technical University of Munich (TUM)", location: "Munich", type: "Public University", image: "/college/college-20.webp", dataAiHint: "historic university building", programs: { ug: [{ name: "B.Sc. Mechanical Engineering", fee: "3 Years | €150-€300/sem" }, { name: "B.Sc. Management & Technology", fee: "3 Years | €150-€300/sem" }], pg: [{ name: "M.Sc. Data Engineering and Analytics", fee: "€302/semester" }, { name: "M.Sc. Automotive Engineering", fee: "€6,000/semester" }] }, qsRanking: "37", webometricsWorld: "59", webometricsNational: "1" },
    { name: "Ludwig Maximilian University of Munich (LMU)", location: "Munich", type: "Public University", image: "/college/college-19.webp", dataAiHint: "university campus fall", programs: { ug: [{ name: "B.Sc. Physics", fee: "3 Years | €150-€300/sem" }, { name: "B.A. English Studies", fee: "3 Years | €150-€300/sem" }], pg: [{ name: "M.Sc. Psychology", fee: "~€150/semester" }, { name: "M.Sc. Economics", fee: "~€150/semester" }] }, qsRanking: "54", webometricsWorld: "65", webometricsNational: "2" },
    { name: "Heidelberg University", location: "Heidelberg", type: "Public University", image: "/college/college-18.webp", dataAiHint: "modern campus library", programs: { ug: [{ name: "B.Sc. Molecular Biotechnology", fee: "3 Years | €1500/sem*" }, { name: "B.Sc. Applied Computer Science", fee: "3 Years | €1500/sem*" }], pg: [{ name: "M.Sc. Molecular Biosciences", fee: "~€150/semester" }, { name: "M.A. American Studies", fee: "~€150/semester" }] }, qsRanking: "87", webometricsWorld: "75", webometricsNational: "3" },
    { name: "Freie Universität Berlin", location: "Berlin", type: "Public University", image: "/college/college-17.webp", dataAiHint: "university computer lab", programs: { ug: [{ name: "B.A. North American Studies", fee: "3 Years | ~€313/sem" }, { name: "B.Sc. Bioinformatics", fee: "3 Years | ~€313/sem" }], pg: [{ name: "M.A. Political Science", fee: "~€313/semester" }, { name: "M.Sc. Data Science", fee: "~€313/semester" }] }, qsRanking: "98", webometricsWorld: "118", webometricsNational: "5" },
    { name: "RWTH Aachen University", location: "Aachen", type: "Public University", image: "/college/college-16.webp", dataAiHint: "engineering students team", programs: { ug: [{ name: "B.Sc. Mechanical Engineering", fee: "3 Years | ~€320/sem" }, { name: "B.Sc. Computer Science", fee: "3 Years | ~€320/sem" }], pg: [{ name: "M.Sc. Automotive Engineering", fee: "~€320/semester" }, { name: "M.Sc. Electrical Engineering, IT & Computer Engineering", fee: "~€320/semester" }] }, qsRanking: "106", webometricsWorld: "199", webometricsNational: "10" },
    { name: "Karlsruhe Institute of Technology (KIT)", location: "Karlsruhe", type: "Public University", image: "/college/college-15.webp", dataAiHint: "diverse team meeting", programs: { ug: [{ name: "B.Sc. Mechanical Engineering (ME)", fee: "3 Years | €1500/sem*" }, { name: "B.Sc. Information Engineering and Management", fee: "3 Years | €1500/sem*" }], pg: [{ name: "M.Sc. Computer Science", fee: "€1500/sem*" }, { name: "M.Sc. Industrial Engineering and Management", fee: "€1500/sem*" }] }, qsRanking: "119", webometricsWorld: "189", webometricsNational: "8" },
    { name: "Jacobs University Bremen (Constructor)", location: "Bremen", type: "Private University", image: "/college/college-14.webp", dataAiHint: "university library books", programs: { ug: [{ name: "B.Sc. Computer Science", fee: "€20,000/year" }, { name: "B.A. International Relations", fee: "€20,000/year" }], pg: [{ name: "M.Sc. Data Science for Society & Business", fee: "2 Years | €20,000/year" }, { name: "M.Sc. Supply Chain Management", fee: "2 Years | €20,000/year" }] }, qsRanking: null, webometricsWorld: "1500", webometricsNational: "60" },
    { name: "GISMA Business School", location: "Potsdam/Berlin", type: "Private University", image: "/college/college-13.webp", dataAiHint: "woman with laptop", programs: { ug: [{ name: "B.Sc. Business Management", fee: "3 Years | ~€13,000/year" }, { name: "B.Sc. Computer Science", fee: "3 Years | ~€14,000/year" }], pg: [{ name: "Global MBA", fee: "€25,000/year" }, { name: "M.Sc. Data Science, AI, and Digital Business", fee: "€17,000/year" }] }, qsRanking: null, webometricsWorld: "N/A", webometricsNational: "N/A" },
    { name: "WHU - Otto Beisheim School of Management", location: "Düsseldorf/Vallendar", type: "Private University", image: "/college/college-12.webp", dataAiHint: "group of students collaborating", programs: { ug: [{ name: "B.Sc. International Business Administration", fee: "€16,000/year" }], pg: [{ name: "Master in Management", fee: "€38,000 total" }, { name: "Full-Time MBA", fee: "€45,000 total" }] }, qsRanking: null, webometricsWorld: "1800", webometricsNational: "70" },
    { name: "ESMT Berlin", location: "Berlin", type: "Private University", image: "/college/college-11.webp", dataAiHint: "business handshake", programs: { ug: [], pg: [{ name: "Full-Time MBA", fee: "1 Year | €49,000/total" }, { name: "Master in Global Management", fee: "2 Years | €32,000/total" }, { name: "Master in Analytics and AI", fee: "2 Years | €32,000/total" }] }, qsRanking: null, webometricsWorld: "2500", webometricsNational: "85" },
    { name: "SRH Hochschule Berlin", location: "Berlin/Dresden/Hamburg", type: "Private University", image: "/college/college-10.webp", dataAiHint: "students discussion", programs: { ug: [{ name: "B.A. International Business Administration", fee: "3 Years | ~€9,840/year" }, { name: "B.Sc. Computer Science", fee: "3 Years | ~€11,040/year" }], pg: [{ name: "M.Sc. Supply Chain Management", fee: "2 Years | ~€11,760/year" }, { name: "MBA General Management", fee: "1.5 Years | ~€14,160/year" }] }, qsRanking: null, webometricsWorld: "3000", webometricsNational: "100" },
    { name: "IU International University of Applied Sciences", location: "Berlin/Online", type: "Private University", image: "/college/college-9.webp", dataAiHint: "student writing notes", programs: { ug: [{ name: "B.A. Business Administration", fee: "3 Years | ~€9,500/year" }, { name: "B.Sc. Data Science", fee: "3 Years | ~€9,500/year" }], pg: [{ name: "M.A. Management", fee: "1-2 Years | ~€12,000/year" }, { name: "M.Sc. Artificial Intelligence", fee: "1-2 Years | ~€12,000/year" }] }, qsRanking: null, webometricsWorld: "2000", webometricsNational: "75" }
].sort((a, b) => {
    if (a.webometricsWorld === "N/A" || a.webometricsWorld === null) return 1;
    if (b.webometricsWorld === "N/A" || b.webometricsWorld === null) return -1;
    return parseInt(a.webometricsWorld) - parseInt(b.webometricsWorld);
});

const admissionRequirements = {
    undergraduate: [
        "Higher Secondary Certificate with a strong academic record. Typically, direct entry is not possible for many Indian students.",
        "Successful completion of one or two years of university education in India OR completion of a foundation course (Studienkolleg) in Germany.",
        "Proof of German language proficiency (for German-taught courses) or English proficiency (IELTS/TOEFL for English-taught courses).",
        "Academic Evaluation Centre (APS) Certificate is mandatory."
    ],
    postgraduate: [
        "A Bachelor's degree (3 or 4 years) from a recognized institution that is equivalent to a German bachelor's degree.",
        "Proof of English proficiency (IELTS/TOEFL) for English-taught programs.",
        "A strong Statement of Purpose (SOP) and Letters of Recommendation (LORs).",
        "Academic Evaluation Centre (APS) Certificate is mandatory.",
        "GRE scores may be required for some technical or business programs."
    ]
};

const studyCosts = [
    { item: "Public University Tuition Fee", cost: "€0 per year (mostly)" },
    { item: "Semester Contribution", cost: "€150 - €350 per semester" },
    { item: "Private University Tuition Fee", cost: "€10,000 - €25,000 per year" },
    { item: "Blocked Account (Sperrkonto)", cost: "€11,208 for the first year" },
    { item: "Health Insurance", cost: "~€120 per month" },
];

const visaProcessSteps = [
    { title: "Receive University Admission", description: "Get your official letter of acceptance (Zulassungsbescheid) from the German university." },
    { title: "Open Blocked Account", description: "Open a blocked account (Sperrkonto) and deposit the required amount (€11,208) as proof of financial resources." },
    { title: "Get APS Certificate", description: "Obtain the mandatory Academic Evaluation Centre (APS) certificate which verifies your academic documents." },
    { title: "Arrange Health Insurance", description: "Get valid travel and German health insurance coverage." },
    { title: "Book Visa Appointment", description: "Schedule a national visa (D-visa) appointment at the German embassy or consulate via VFS Global." },
    { title: "Attend Visa Interview", description: "Attend the interview with all your required documents, including application form, photos, passport, admission letter, APS, and financial proofs." },
    { title: "Await Decision", description: "Wait for the visa processing. Upon approval, your passport will be stamped with the student visa." },
];

const ugTimeline = [
  { range: "10-14 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: [ "Research universities and courses.", "Check if your qualifications allow direct entry or if a Studienkolleg (foundation course) is needed.", "Start preparing for IELTS/TOEFL or German language tests (TestDaF/DSH)." ] },
  { range: "8-12 Months Before Intake", title: "Document Preparation", icon: BookOpen, tasks: [ "Take language proficiency tests.", "Begin the process for your APS (Academic Evaluation Centre) certificate application.", "Draft your Statement of Purpose (SOP) and CV/Resume." ] },
  { range: "6-10 Months Before Intake", title: "Application Submission", icon: FileText, tasks: [ "Submit applications via Uni-assist or directly to universities.", "Ensure all documents, including your preliminary APS certificate, are uploaded.", "Complete any required online assessments." ] },
  { range: "4-8 Months Before Intake", title: "Admission & Finances", icon: Landmark, tasks: [ "Receive admission offers.", "Accept your chosen offer.", "Open a Blocked Account (Sperrkonto) and transfer funds (€11,208).", "Arrange for health insurance." ] },
  { range: "3-5 Months Before Intake", title: "Visa Process", icon: CalendarCheck, tasks: [ "Book your student visa appointment.", "Gather all visa documents: passport, photos, admission letter, blocked account confirmation, insurance.", "Attend your visa interview." ] },
  { range: "1-2 Months Before Intake", title: "Pre-Departure", icon: Plane, tasks: [ "Arrange for accommodation.", "Book your flight tickets.", "Attend pre-departure briefings and plan your arrival." ] }
];

const pgTimeline = [
  { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: [ "Finalize your specialization and research potential universities.", "Prepare for and take IELTS/TOEFL and GRE (if required).", "Start your APS (Academic Evaluation Centre) certificate process early." ] },
  { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: [ "Take English proficiency tests.", "Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Provide your recommenders with all necessary documents for LORs." ] },
  { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: [ "Submit all online applications via university portals or Uni-assist.", "Follow up with recommenders to ensure LORs are submitted on time.", "Prepare for any potential admission interviews." ] },
  { range: "3-4 Months Before Intake", title: "Offers & Finances", icon: Landmark, tasks: [ "Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Open your Blocked Account (€11,208) and arrange health insurance." ] },
  { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: [ "Complete the visa application online.", "Undergo an upfront medical exam.", "Schedule and attend your biometrics appointment.", "Wait for the visa decision." ] },
  { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: [ "Book flights and secure accommodation.", "Enroll at the university online.", "Attend pre-departure orientations.", "Organize foreign currency and inform your bank of travel plans." ] }
];

const studentLife = [
    {
        icon: <UserCheck className="w-8 h-8 text-blue-500" />,
        title: "Accommodation",
        description: "Options include student dormitories ('Studentenwohnheim'), shared apartments ('Wohngemeinschaft' or WG), and private apartments."
    },
    {
        icon: <HeartHandshake className="w-8 h-8 text-green-500" />,
        title: "Student Services",
        description: "The 'Studentenwerk' organization in each city provides comprehensive support for housing, meals, and counseling."
    },
    {
        icon: <Users className="w-8 h-8 text-orange-500" />,
        title: "Culture & Diversity",
        description: "Experience a multicultural environment, efficient public transport, and a high standard of living with a great work-life balance."
    },
    {
        icon: <Briefcase className="w-8 h-8 text-purple-500" />,
        title: "Part-Time Work",
        description: "International students can work up to 120 full days or 240 half days per year to support their studies."
    }
];

function KnowledgeQuiz() {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

    const workQuiz = {
        question: "How long is the post-study residence permit for job seekers in Germany?",
        options: ["6 months", "12 months", "18 months", "24 months"],
        correctAnswer: "18 months",
    };

    const handleAnswerSelection = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const isCorrect = selectedAnswer === workQuiz.correctAnswer;

    return (
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20">
                    <CardHeader className="text-center">
                        <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: Test Your Knowledge!</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-lg mb-6">{workQuiz.question}</p>
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
                                            !isSelected && "bg-background hover:bg-primary/20"
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
                                Not quite. The correct answer is 18 months.
                            </p>
                        )}
                        {selectedAnswer && isCorrect && (
                            <p className="mt-6 text-green-600 font-semibold flex items-center justify-center">
                                <CheckCircle2 className="mr-2 h-5 w-5" />
                                Correct! It's 18 months. Well done!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

interface GermanyPageClientProps {
  children: React.ReactNode;
}

export default function GermanyPageClient({ children }: GermanyPageClientProps) {
  const [isPostgraduate, setIsPostgraduate] = useState(false);
  const [activePhase, setActivePhase] = useState(0);

  const timelineData = isPostgraduate ? pgTimeline : ugTimeline;
  const activePhaseData = timelineData[activePhase];
  
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqsForSchema.map(faq => ({
        "@type": "Question",
        "name": faq.questionName,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.acceptedAnswerText
        }
    }))
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* Hero Section */}
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                    <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Study in Germany: <span className="text-primary dark:text-white">World-Class Education, No Tuition Fees</span>
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground">
                        Unlock your potential in the heart of Europe. As the top study in Germany consultants in Kolkata, we guide you through the process of getting into Germany's prestigious public universities.
                    </p>
                    <div className="mt-10">
                        <Button asChild size="lg" className="dark:bg-white dark:text-black dark:hover:bg-white/90">
                            <Link href="/contact">
                                <>
                                    Get Free Consultation
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </>
                            </Link>
                        </Button>
                    </div>
                </div>
                <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                    <Image
                        src="/destinations/studying-in-germany.webp"
                        alt="A student walking through a library, symbolizing education in Germany."
                        fill
                        className="object-cover"
                        data-ai-hint="library books"
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Why Study in Germany Section */}
      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose Germany for Your Higher Education?</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Discover the unique benefits that make Germany a top choice for international students.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {whyStudyInGermany.map((reason) => (
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
      
      {/* Public vs Private Section */}
      <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Public vs. Private Universities</h2>
                  <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                      Germany offers two excellent pathways to a world-class degree. Understand the key differences to find the right fit for your career goals.
                  </p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                  <Card className="dark:bg-black">
                      <CardHeader>
                          <CardTitle className="flex items-center gap-3 text-2xl font-headline text-blue-600 dark:text-blue-400">
                              <University className="h-8 w-8" />
                              Public Universities
                          </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <div><h4 className="font-semibold">Admissions</h4><p className="text-muted-foreground text-sm">Competitive entry, often requiring a foundation course (Studienkolleg) and higher academic scores.</p></div>
                          <div><h4 className="font-semibold">Program Focus</h4><p className="text-muted-foreground text-sm">Emphasis on traditional, research-driven academic programs and theoretical knowledge.</p></div>
                          <div><h4 className="font-semibold">Learning Environment</h4><p className="text-muted-foreground text-sm">Larger class sizes which foster independent, self-driven learning and research.</p></div>
                          <div><h4 className="font-semibold">Internships & Placements</h4><p className="text-muted-foreground text-sm">Opportunities are available, but students are typically responsible for securing their own internships.</p></div>
                          <div><h4 className="font-semibold">Language Requirements</h4><p className="text-muted-foreground text-sm">Many courses are taught in German, requiring high proficiency (TestDaF/DSH). English-taught programs are available but can be very competitive.</p></div>
                          <div><h4 className="font-semibold">Cost</h4><p className="text-muted-foreground text-sm">Highly affordable with low-to-no tuition fees; only a small semester contribution is required.</p></div>
                      </CardContent>
                  </Card>
                   <Card className="dark:bg-black">
                      <CardHeader>
                           <CardTitle className="flex items-center gap-3 text-2xl font-headline text-purple-600 dark:text-purple-400">
                              <UserCheck className="h-8 w-8" />
                              Private Universities
                          </CardTitle>
                      </CardHeader>
                       <CardContent className="space-y-4">
                          <div><h4 className="font-semibold">Admissions</h4><p className="text-muted-foreground text-sm">Simplified, direct entry with more flexible requirements and dedicated support for international students.</p></div>
                          <div><h4 className="font-semibold">Program Focus</h4><p className="text-muted-foreground text-sm">Practical, industry-oriented curriculum designed with corporate partners for direct job-readiness.</p></div>
                          <div><h4 className="font-semibold">Learning Environment</h4><p className="text-muted-foreground text-sm">Smaller, interactive class sizes ensuring personalized attention from professors.</p></div>
                          <div><h4 className="font-semibold">Internships & Placements</h4><p className="text-muted-foreground text-sm">Strong industry connections, often with integrated mandatory internships and proactive career services.</p></div>
                          <div><h4 className="font-semibold">Language Requirements</h4><p className="text-muted-foreground text-sm">Extensive range of programs taught entirely in English, making them highly accessible for international students.</p></div>
                          <div><h4 className="font-semibold">Investment</h4><p className="text-muted-foreground text-sm">Higher tuition fees that represent an investment in specialized programs and strong career services.</p></div>
                      </CardContent>
                  </Card>
              </div>
              <div className="mt-8 p-6 bg-primary/10 border-l-4 border-primary dark:bg-slate-900 dark:border-blue-400 rounded-r-lg">
                  <h3 className="font-bold flex items-center gap-2"><Info className="h-5 w-5 text-primary dark:text-blue-400"/> Which Path is Right for You?</h3>
                  <p className="text-muted-foreground mt-2">
                     While public universities offer an affordable route, **private universities provide a strategic investment in your future**. They offer a more direct path to employment through specialized, English-taught programs, strong industry partnerships, and dedicated career services.
                  </p>
                  <p className="text-muted-foreground mt-2">
                     If your goal is a fast-tracked, career-focused education with personalized support and strong placement opportunities, a private university in Germany is an excellent choice.
                  </p>
              </div>
          </div>
      </section>

      <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                    Your Germany Study Abroad Timeline
                </h2>
                <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                    Plan your journey step-by-step! Use the toggle below to view the recommended timeline for Undergraduate (UG) or Postgraduate (PG) programs.
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

      {/* Top Universities Section */}
      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in Germany</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Explore Germany's leading public and private universities known for their academic and research excellence.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {topUniversities.map((uni) => (
                    <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                        <div className="relative h-56 w-full">
                            <Image src={uni.image} alt={`Campus of ${uni.name}`} fill className="object-cover" data-ai-hint={uni.dataAiHint} />
                        </div>
                        <CardHeader>
                            <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                             <div className="space-y-1 mt-2 text-sm">
                                <div className="flex items-center text-muted-foreground"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /><span>{uni.location}</span></div>
                                {uni.type && <div className="flex items-center mt-1 text-sm"><University className="h-4 w-4 mr-2 flex-shrink-0 text-blue-500" /><span className="font-semibold text-blue-500 dark:text-blue-400">{uni.type}</span></div>}
                                {uni.qsRanking && <div className="flex items-center text-muted-foreground"><Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" /><span>QS Ranking: {uni.qsRanking}</span></div>}
                                {uni.webometricsWorld && <div className="flex items-center text-muted-foreground"><BarChart className="h-4 w-4 mr-2 flex-shrink-0" /><span>Webometrics World: {uni.webometricsWorld}</span></div>}
                                {uni.webometricsNational && <div className="flex items-center text-muted-foreground"><Book className="h-4 w-4 mr-2 flex-shrink-0" /><span>Webometrics National: {uni.webometricsNational}</span></div>}
                            </div>
                        </CardHeader>
                         <CardContent className="flex-grow flex flex-col">
                            <Accordion type="single" collapsible className="w-full">
                                {(uni.programs?.ug?.length || 0) > 0 && (
                                    <AccordionItem value="ug-programs">
                                        <AccordionTrigger className="font-semibold text-base">Popular UG Programs</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-3 mt-2 text-sm">{uni.programs.ug.map(p => (<li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center"><span className="truncate">{p.name}</span><span className="font-mono text-muted-foreground">{p.fee}</span></li>))}</ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                                {(uni.programs?.pg?.length || 0) > 0 && (
                                    <AccordionItem value="pg-programs">
                                        <AccordionTrigger className="font-semibold text-base">Popular PG Programs</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-3 mt-2 text-sm">{uni.programs.pg.map(p => (<li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center"><span className="truncate">{p.name}</span><span className="font-mono text-muted-foreground">{p.fee}</span></li>))}</ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                )}
                            </Accordion>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-8">*For the state of Baden-Württemberg (e.g., Heidelberg, KIT, Freiburg), non-EU students are required to pay tuition fees of €1,500 per semester for Bachelor's, Master's, and other degree programs.</p>
        </div>
      </section>

      {/* Admission & Costs Section */}
      <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">Admission Requirements & Costs</h2>
                     <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                        <AccordionItem value="item-1"><AccordionTrigger className="text-xl font-headline">Undergraduate Requirements</AccordionTrigger><AccordionContent><ul className="space-y-3 pt-2">{admissionRequirements.undergraduate.map(req => (<li key={req} className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>{req}</span></li>))}</ul></AccordionContent></AccordionItem>
                        <AccordionItem value="item-2"><AccordionTrigger className="text-xl font-headline">Postgraduate Requirements</AccordionTrigger><AccordionContent><ul className="space-y-3 pt-2">{admissionRequirements.postgraduate.map(req => (<li key={req} className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>{req}</span></li>))}</ul></AccordionContent></AccordionItem>
                    </Accordion>
                </div>
                <div>
                     <Card className="bg-primary/5">
                         <CardHeader><CardTitle className="font-headline text-2xl flex items-center"><DollarSign className="h-6 w-6 mr-2"/>Estimated Costs</CardTitle><CardDescription>An overview of expenses for Indian students in Germany.</CardDescription></CardHeader>
                         <CardContent><ul className="space-y-3">{studyCosts.map(item => (<li key={item.item} className="flex justify-between items-center text-sm"><span>{item.item}</span><span className="font-semibold text-right">{item.cost}</span></li>))}</ul><p className="text-xs text-muted-foreground mt-4">*Costs are approximate and subject to change. Private university fees vary.</p></CardContent>
                     </Card>
                </div>
            </div>
        </div>
      </section>
      
      {/* German Student Visa Guide */}
      <section className="py-16 sm:py-24 bg-background dark:bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">German Student Visa Guide for Indian Students</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                    Key steps to secure your National (D-type) Student Visa for Germany.
                </p>
            </div>
            <Card className="dark:bg-slate-900">
                <CardContent className="p-6 md:p-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {visaProcessSteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-4">
                                <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                    {index + 1}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{step.title}</h4>
                                    <p className="text-sm text-muted-foreground">{step.description}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </CardContent>
            </Card>
            <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg dark:bg-blue-900/20 dark:border-blue-400">
                <h3 className="font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                    <Plane className="h-5 w-5" />
                    The Schengen Advantage
                </h3>
                <p className="text-blue-700 dark:text-blue-200 mt-2">
                    Once you receive your German residence permit, you gain the fantastic benefit of visa-free travel throughout the 29 countries of the Schengen Area. This allows you to explore the rich culture and history of Europe for up to 90 days in any 180-day period without applying for additional visas.
                </p>
            </div>
        </div>
      </section>

        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Germany</h2>
                    <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                        Germany's strong economy and favorable policies provide ample opportunities for students to work during and after their studies.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <Card className="shadow-lg flex flex-col dark:bg-slate-dark">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center">
                                <Briefcase className="mr-3 h-6 w-6 text-primary"/>
                                Job-Seeker Visa (Post-Graduation)
                            </CardTitle>
                            <CardDescription>Transition from student to professional in Germany.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-grow flex flex-col">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                <p className="font-bold text-4xl text-blue-700 dark:text-blue-300">18 Months</p>
                                <p className="text-sm text-blue-600 dark:text-blue-200">Residence permit to find a job after graduation.</p>
                            </div>
                            <div className="mt-auto pt-4">
                                <h4 className="font-semibold text-lg mb-2">Key Benefits:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                        <span>Work full-time in any job while searching for one related to your qualification.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                        <span>Pathway to obtaining a German Work Permit or an EU Blue Card upon securing a qualified job.</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="shadow-lg flex flex-col dark:bg-slate-dark">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center">
                                <Clock className="mr-3 h-6 w-6 text-primary"/>
                                Part-Time Work While Studying
                            </CardTitle>
                            <CardDescription>Support your studies and gain practical experience.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
                                    <p className="font-bold text-2xl dark:text-blue-300">120</p>
                                    <p className="text-sm dark:text-blue-200">Full days per year</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                                    <p className="font-bold text-2xl dark:text-green-300">240</p>
                                    <p className="text-sm dark:text-green-200">Half days per year</p>
                                </div>
                            </div>
                            <div className="text-center mb-4">
                                <p className="text-lg">Minimum Wage: <span className="font-bold">Approx. €12.41 per hour</span></p>
                                <p className="text-xs text-muted-foreground">(Subject to change)</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-auto">
                                Internships (paid or unpaid) as part of your course are not counted towards this limit. Student assistant jobs at the university ('HiWi' jobs) also have more flexible rules.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
        
        <section className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Student Life in Germany</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                        Experience a blend of rich history, modern innovation, and vibrant multiculturalism.
                    </p>
                </div>
                <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {studentLife.map((item) => (
                        <Card key={item.title} className="text-center p-6 dark:bg-slate-dark">
                            <div className="flex justify-center">{item.icon}</div>
                            <CardTitle className="mt-4 font-headline text-xl">{item.title}</CardTitle>
                            <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
      
      <KnowledgeQuiz />
      {children}
      <StudyAbroadCtaSection headline="Ready to Study in Germany?" />
    </>
  );
}
