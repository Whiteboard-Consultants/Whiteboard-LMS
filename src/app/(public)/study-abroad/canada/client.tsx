
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, DollarSign, MapPin, Shield, Users, Star, FileText, BarChart, Book, Clock, XCircle, Plane, Landmark, Telescope, CalendarCheck, School } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const faqsForSchema = [
    {
        questionName: "Why is Canada a top choice for Indian students?",
        acceptedAnswerText: "Canada is highly popular due to its world-class education, multicultural and welcoming society, affordable tuition fees compared to other Western countries, and clear pathways to permanent residency through programs like the Post-Graduation Work Permit (PGWP)."
    },
    {
        questionName: "What are the requirements to study in Canada for Indian students?",
        acceptedAnswerText: "For undergraduate diploma/degree programs, you typically need 65-80% in your Higher Secondary Certificate (HSC). For postgraduate programs, a relevant bachelor's degree with good scores is required. You also need to prove English proficiency via IELTS (typically 6.0-6.5 for UG, 6.5-7.0 for PG) or an equivalent test."
    },
    {
        questionName: "What is the cost of studying in Canada?",
        acceptedAnswerText: "Tuition fees for international students generally range from CAD $18,000 to $40,000 per year for most courses. Living costs are estimated to be around CAD $10,000 - $15,000 per year, and you need to show proof of funds via a Guaranteed Investment Certificate (GIC) of CAD $20,635."
    },
    {
        questionName: "What is the Post-Graduation Work Permit (PGWP)?",
        acceptedAnswerText: "The PGWP allows eligible graduates from Canadian Designated Learning Institutions (DLIs) to obtain an open work permit. The permit's length depends on your study program duration, up to a maximum of 3 years. It's a key step towards gaining Canadian work experience and applying for permanent residency."
    }
];

const whyStudyInCanada = [
    { icon: Award, title: 'Quality Education', description: 'Canadian degrees are recognized globally, with universities known for their high academic standards and research output.', color: 'text-blue-500' },
    { icon: Users, title: 'Multicultural & Welcoming', description: 'Canada is one of the most diverse countries, offering a safe and inclusive environment for international students.', color: 'text-green-500' },
    { icon: Briefcase, title: 'Work While You Study', description: 'Most international students are eligible to work up to 20 hours per week during semesters and full-time during breaks.', color: 'text-orange-500' },
    { icon: Landmark, title: 'Pathway to Immigration', description: 'The Post-Graduation Work Permit (PGWP) provides a clear route to gaining work experience and applying for permanent residency.', color: 'text-purple-500' },
    { icon: DollarSign, title: 'Affordable Cost of Living', description: 'Tuition fees and living expenses are generally lower compared to other major English-speaking destinations like the USA and UK.', color: 'text-red-500' },
    { icon: Shield, title: 'High Quality of Life', description: 'Canada consistently ranks high for safety, political stability, and quality of life, offering a great student experience.', color: 'text-yellow-500' },
    { icon: Telescope, title: 'Focus on Research & Innovation', description: 'Strong government and industry investment in research provides excellent opportunities in various fields.', color: 'text-teal-500' },
    { icon: BookOpen, title: 'Practical Learning Approach', description: 'Many programs, especially at colleges, offer co-op terms and internships for hands-on experience.', color: 'text-indigo-500' }
];

const topUniversities = [
    {
        name: "University of Toronto",
        qsRanking: "21",
        webometricsWorldRanking: "18",
        webometricsNationalRanking: "1",
        location: "Toronto, ON",
        image: "/college/college-1.webp",
        dataAiHint: "historic university building",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "CAD $60,510" }, { name: "BCom Rotman Commerce", fee: "CAD $60,510+" }, { name: "BASc Engineering Science", fee: "CAD $69,550" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $29,150" }, { name: "Rotman Full-Time MBA", fee: "CAD $72,550" }, { name: "MASc Mechanical Engineering", fee: "CAD $29,150" } ]
        }
    },
    {
        name: "McGill University",
        qsRanking: "30",
        webometricsWorldRanking: "57",
        webometricsNationalRanking: "3",
        location: "Montreal, QC",
        image: "/college/college-3.webp",
        dataAiHint: "university campus fall",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "CAD $58,160" }, { name: "BEng Mechanical Engineering", fee: "CAD $58,160" }, { name: "BCom Management", fee: "CAD $65,580" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $10,146" }, { name: "MBA", fee: "CAD $52,500" }, { name: "MEng Electrical Engineering", fee: "CAD $10,146" } ]
        }
    },
    {
        name: "University of British Columbia",
        qsRanking: "34",
        webometricsWorldRanking: "42",
        webometricsNationalRanking: "2",
        location: "Vancouver, BC",
        image: "/college/college-5.webp",
        dataAiHint: "modern campus library",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "CAD $48,800" }, { name: "BCom Sauder School of Business", fee: "CAD $58,500" }, { name: "BASc Applied Science (Engineering)", fee: "CAD $59,500" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $9,650" }, { name: "Full-time MBA", fee: "CAD $51,400" }, { name: "MEng Civil Engineering", fee: "CAD $23,700" } ]
        }
    },
    {
        name: "University of Alberta",
        qsRanking: "91",
        webometricsWorldRanking: "110",
        webometricsNationalRanking: "5",
        location: "Edmonton, AB",
        image: "/college/college-7.webp",
        dataAiHint: "university students on lawn",
        programs: {
            ug: [ { name: "BSc Computing Science", fee: "CAD $31,500" }, { name: "BEng Engineering", fee: "CAD $42,000" }, { name: "BCom Business", fee: "CAD $35,000" } ],
            pg: [ { name: "MSc Computing Science", fee: "CAD $9,400" }, { name: "MBA", fee: "CAD $34,000" }, { name: "MEng Engineering Management", fee: "CAD $12,700" } ]
        }
    },
    {
        name: "University of Waterloo",
        qsRanking: "112",
        webometricsWorldRanking: "159",
        webometricsNationalRanking: "7",
        location: "Waterloo, ON",
        image: "/college/college-9.webp",
        dataAiHint: "engineering students team",
        programs: {
            ug: [ { name: "BMath Computer Science (Co-op)", fee: "CAD $52,000" }, { name: "BASc Software Engineering (Co-op)", fee: "CAD $70,000" }, { name: "BMath Financial Analysis & Risk Mgmt (Co-op)", fee: "CAD $52,000" } ],
            pg: [ { name: "MMath Computer Science", fee: "CAD $8,500/term" }, { name: "MBET Business, Entrepreneurship and Technology", fee: "CAD $27,000/term" }, { name: "MEng Electrical & Computer Engineering", fee: "CAD $10,500/term" } ]
        }
    },
    {
        name: "University of Calgary",
        qsRanking: "182",
        webometricsWorldRanking: "167",
        webometricsNationalRanking: "8",
        location: "Calgary, AB",
        image: "/college/college-11.webp",
        dataAiHint: "calgary campus",
        programs: {
            ug: [ { name: "BComm Haskayne School of Business", fee: "CAD $32,000" }, { name: "BSc Engineering", fee: "CAD $30,000" }, { name: "BSc Computer Science", fee: "CAD $28,000" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $18,000" }, { name: "MBA", fee: "CAD $35,000" }, { name: "MEng Software Engineering", fee: "CAD $20,000" } ]
        }
    },
    {
        name: "McMaster University",
        qsRanking: "189",
        webometricsWorldRanking: "135",
        webometricsNationalRanking: "6",
        location: "Hamilton, ON",
        image: "/college/college-13.webp",
        dataAiHint: "diverse team meeting",
        programs: {
            ug: [ { name: "BEng Engineering I", fee: "CAD $60,000 - $67,000" }, { name: "BCom Business I", fee: "CAD $45,000 - $52,000" }, { name: "BSc Computer Science I", fee: "CAD $50,000 - $57,000" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $20,000" }, { name: "MBA (Co-op)", fee: "CAD $45,000" }, { name: "MASc Electrical & Computer Eng.", fee: "CAD $20,000" } ]
        }
    },
    {
        name: "University of Ottawa",
        qsRanking: "203",
        webometricsWorldRanking: "172",
        webometricsNationalRanking: "9",
        location: "Ottawa, ON",
        image: "/college/college-15.webp",
        dataAiHint: "students outdoors",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "CAD $53,000" }, { name: "BASc Mechanical Engineering", fee: "CAD $64,000" }, { name: "BCom (Option in Finance)", fee: "CAD $50,000" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $10,000/term" }, { name: "Telfer MBA", fee: "CAD $36,000" }, { name: "MEng Engineering Management", fee: "CAD $12,000/term" } ]
        }
    },
    {
        name: "Dalhousie University",
        qsRanking: "272",
        webometricsWorldRanking: "270",
        webometricsNationalRanking: "12",
        location: "Halifax, NS",
        image: "/college/college-17.webp",
        dataAiHint: "students working together",
        programs: {
            ug: [ { name: "BCS Computer Science", fee: "CAD $28,000" }, { name: "BEng Engineering", fee: "CAD $28,000" }, { name: "BComm Commerce (Co-op)", fee: "CAD $27,000" } ],
            pg: [ { name: "MACS Applied Computer Science", fee: "CAD $33,000" }, { name: "Corporate Residency MBA", fee: "CAD $45,000" }, { name: "MEng Internetworking", fee: "CAD $33,000" } ]
        }
    },
    {
        name: "Simon Fraser University",
        qsRanking: "319",
        webometricsWorldRanking: "284",
        webometricsNationalRanking: "11",
        location: "Burnaby, BC",
        image: "/college/college-19.webp",
        dataAiHint: "university library books",
        programs: {
            ug: [ { name: "BSc Computing Science", fee: "CAD $34,000" }, { name: "BBA Beedie School of Business", fee: "CAD $33,000" }, { name: "BA Communication", fee: "CAD $32,000" } ],
            pg: [ { name: "MSc Computing Science (Big Data)", fee: "CAD $21,000" }, { name: "Beedie MBA", fee: "CAD $61,000 total" }, { name: "MEng Engineering Science", fee: "CAD $18,000" } ]
        }
    },
    {
        name: "University of Saskatchewan",
        qsRanking: "340",
        webometricsWorldRanking: "351",
        webometricsNationalRanking: "15",
        location: "Saskatoon, SK",
        image: "/college/college-10.webp",
        dataAiHint: "university graduation",
        programs: {
            ug: [ { name: "BSc Computer Science", fee: "CAD $25,000" }, { name: "BComm Edwards School of Business", fee: "CAD $26,000" }, { name: "BEng Engineering", fee: "CAD $30,000" } ],
            pg: [ { name: "MSc Computer Science", fee: "CAD $9,500" }, { name: "MBA", fee: "CAD $40,000" }, { name: "MEng Electrical Engineering", fee: "CAD $10,000" } ]
        }
    },
    {
        name: "Concordia University",
        qsRanking: "387",
        webometricsWorldRanking: "450",
        webometricsNationalRanking: "18",
        location: "Montreal, QC",
        image: "/college/college-18.webp",
        dataAiHint: "modern university city",
        programs: {
            ug: [ { name: "BEng Software Engineering", fee: "CAD $27,000" }, { name: "BComm (JMSB)", fee: "CAD $28,000" }, { name: "BCompSci Computer Science", fee: "CAD $27,000" } ],
            pg: [ { name: "MEng Software Engineering", fee: "CAD $22,000" }, { name: "MBA", fee: "CAD $48,000" }, { name: "MAppSc Computer Science", fee: "CAD $22,000" } ]
        }
    }
];

const admissionRequirements = {
    undergraduate: [
        "Higher Secondary School Certificate (HSC), with an average of 65-80% for most programs.",
        "Proof of English proficiency: IELTS (typically 6.0-6.5 overall) or TOEFL (typically 80-90 iBT), or equivalent.",
        "Letters of Recommendation (LORs) and a Statement of Purpose (SOP) may be required.",
        "For top-tier universities and competitive programs, higher academic scores and supplementary applications may be necessary."
    ],
    postgraduate: [
        "A Bachelor's degree (usually 4 years) from a recognized institution with good academic standing.",
        "Proof of English proficiency: IELTS (typically 6.5-7.0 overall) or TOEFL (typically 90-100 iBT).",
        "A strong Statement of Purpose (SOP) and academic/professional Letters of Recommendation (LORs).",
        "Some programs, especially MBAs, may require GMAT/GRE scores and relevant work experience."
    ]
};

const studyCosts = [
    { item: "UG Diploma/Degree Tuition Fee", cost: "CAD $18,000 - $35,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "CAD $20,000 - $45,000 per year" },
    { item: "GIC (Guaranteed Investment Certificate)", cost: "CAD $20,635 (for SDS visa stream)" },
    { item: "Living Expenses (non-GIC)", cost: "CAD $10,000 - $15,000 per year" },
    { item: "Health Insurance", cost: "CAD $600 - $1,000 per year" },
];

const visaProcessSteps = [
    { title: "Receive Letter of Acceptance (LOA)", description: "Get your LOA from a Designated Learning Institution (DLI) in Canada." },
    { title: "Pay Tuition & Get GIC", description: "Pay your first year's tuition fees and purchase a Guaranteed Investment Certificate (GIC) of $20,635 CAD." },
    { title: "Undergo Medical Examination", description: "Complete an upfront medical exam from a panel physician approved by IRCC." },
    { title: "Prepare Documents", description: "Gather all required documents, including academic transcripts, financial proofs, SOP, and language test results." },
    { title: "Apply Online for Study Permit", description: "Create an IRCC secure account and submit your study permit application online." },
    { title: "Give Biometrics", description: "Visit a Visa Application Centre (VAC) to provide your fingerprints and photograph." },
    { title: "Await Decision & Passport Request", description: "Wait for the application decision. If approved, you will be asked to submit your passport for the visa stamping." },
];

const ugTimeline = [
  { range: "10-14 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: [ "Define your academic and career goals.", "Research Canadian universities, colleges, and programs.", "Check admission requirements and eligibility.", "Start preparing for IELTS/TOEFL." ] },
  { range: "8-12 Months Before Intake", title: "Test Prep & Shortlisting", icon: BookOpen, tasks: [ "Take your IELTS/TOEFL to get your desired score.", "Finalize a list of 5-8 Designated Learning Institutions (DLIs).", "Begin drafting your Statement of Purpose (SOP).", "Request Letters of Recommendation (LORs) if required." ] },
  { range: "6-10 Months Before Intake", title: "Application Submission", icon: FileText, tasks: [ "Complete and submit online application forms.", "Pay application fees.", "Ensure all required documents are uploaded correctly." ] },
  { range: "4-8 Months Before Intake", title: "Receive & Accept Offers", icon: Landmark, tasks: [ "Receive your Letter of Acceptance (LOA) from institutions.", "Accept your chosen offer.", "Start arranging financial documents for your study permit.", "Apply for scholarships and accommodation." ] },
  { range: "3-5 Months Before Intake", "title": "Pay Deposit & Visa Prep", icon: CalendarCheck, tasks: [ "Pay the tuition fee deposit as required by the institution.", "Purchase a Guaranteed Investment Certificate (GIC) of CAD $20,635.", "Gather all documents for the study permit application.", "Complete an upfront medical examination." ] },
  { range: "1-3 Months Before Intake", title: "Visa & Pre-Departure", icon: Plane, tasks: [ "Submit your study permit application and biometrics.", "Once approved, submit your passport for visa stamping.", "Book flights and arrange your travel.", "Attend pre-departure briefings and finalize packing." ] }
];

const pgTimeline = [
  { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: [ "Finalize your specialization and research potential universities.", "Prepare for and take the IELTS/TOEFL.", "Update your CV/Resume and identify recommenders." ] },
  { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: [ "Take English proficiency tests.", "Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Provide your recommenders with all necessary documents for LORs." ] },
  { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: [ "Submit all online applications well before the deadlines.", "Follow up with recommenders to ensure LORs are submitted on time.", "Prepare for any potential admission interviews." ] },
  { range: "3-4 Months Before Intake", title: "Offers & Finances", icon: Landmark, tasks: [ "Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Arrange proof of funds (GIC, loan sanction letter).", "Pay the tuition deposit." ] },
  { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: [ "Complete the study permit application online.", "Undergo an upfront medical exam.", "Schedule and attend your biometrics appointment.", "Wait for the visa decision." ] },
  { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: [ "Book flights and secure accommodation.", "Attend pre-departure sessions.", "Organize foreign currency and inform your bank of travel plans." ] }
];

const workQuiz = {
    question: "What is the maximum duration of a Post-Graduation Work Permit (PGWP) for a 2-year Master's program?",
    options: ["1 Year", "2 Years", "3 Years", "Same as study length"],
    correctAnswer: "3 Years",
};

interface CanadaPageClientProps {
  children: React.ReactNode;
}

export default function CanadaPageClient({ children }: CanadaPageClientProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isPostgraduate, setIsPostgraduate] = useState(false);
    const [activePhase, setActivePhase] = useState(0);

    const handleAnswerSelection = (answer: string) => {
        setSelectedAnswer(answer);
    };

    const isCorrect = selectedAnswer === workQuiz.correctAnswer;
    
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
                                Study in Canada: <span className="text-primary dark:text-white">Your Destination for a Bright Future</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Embrace a world-class education in a welcoming, multicultural nation. As the best study in Canada consultants in Kolkata, we guide you to high-quality institutions, vibrant cities, and clear pathways to a successful global career.
                            </p>
                            <div className="mt-10">
                                <Button asChild size="lg" className="dark:bg-slate-dark dark:text-white dark:border dark:border-white">
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
                                src="/destinations/studying-in-canada.webp"
                                alt="A scenic view of a Canadian city, a hero image for studying in Canada."
                                fill
                                className="object-cover"
                                data-ai-hint="canada city landscape"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Study in Canada Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose Canada for Your Studies?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the unique advantages that make Canada a top-tier destination for international students from India.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyStudyInCanada.map((reason) => (
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
            
            {/* Top Universities Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in Canada for Indian Students</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore Canada's leading universities, renowned for their academic excellence and vibrant student life.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topUniversities.map((uni) => (
                            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <div className="relative h-56 w-full">
                                    <Image src={uni.image} alt={`Campus of ${uni.name}, a top university to study in Canada for Indian students`} width={600} height={400} className="object-cover w-full h-full" data-ai-hint={uni.dataAiHint} />
                                </div>
                                <CardHeader>
                                    <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                                    <div className="flex items-center text-muted-foreground mt-2 text-sm">
                                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{uni.location}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                        <span>QS World Ranking: {uni.qsRanking}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <BarChart className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>Webometrics World: {uni.webometricsWorldRanking}</span>
                                    </div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <Book className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>Webometrics National: {uni.webometricsNationalRanking}</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <Accordion type="single" collapsible className="w-full">
                                        {uni.programs.ug.length > 0 && (
                                            <AccordionItem value="ug-programs">
                                                <AccordionTrigger className="font-semibold text-base">Popular UG Programs</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-3 mt-2 text-sm">
                                                        {uni.programs.ug.map(p => (
                                                            <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                                                <span className="truncate">{p.name}</span>
                                                                <span className="font-mono text-muted-foreground">{p.fee}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                        {uni.programs.pg.length > 0 && (
                                            <AccordionItem value="pg-programs">
                                                <AccordionTrigger className="font-semibold text-base">Popular PG Programs</AccordionTrigger>
                                                <AccordionContent>
                                                    <ul className="space-y-3 mt-2 text-sm">
                                                        {uni.programs.pg.map(p => (
                                                            <li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center">
                                                                <span className="truncate">{p.name}</span>
                                                                <span className="font-mono text-muted-foreground">{p.fee}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )}
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Admission, Cost Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">
                                Admission Requirements & Costs for Indian Students
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
                             <Card className="bg-primary/5">
                                 <CardHeader>
                                     <CardTitle className="font-headline text-2xl flex items-center">
                                         <DollarSign className="h-6 w-6 mr-2"/> Estimated Costs
                                     </CardTitle>
                                     <CardDescription>
                                         An overview of the annual expenses for Indian students in Canada.
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
                                     <p className="text-xs text-muted-foreground mt-4">*Costs are approximate and subject to change. GIC is a key part of the SDS visa route for proving living expenses.</p>
                                 </CardContent>
                             </Card>
                        </div>
                    </div>
                </div>
            </section>

             {/* Study Abroad Timeline Section */}
             <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Your Canada Study Abroad Timeline
                        </h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Plan your journey with our step-by-step timeline. Use the toggle to switch between Undergraduate (UG) and Postgraduate (PG) application routes.
                        </p>
                    </div>

                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <Label htmlFor="timeline-toggle" className={cn("font-medium", !isPostgraduate && "text-primary dark:text-white")}>Undergraduate</Label>
                        <Switch id="timeline-toggle" checked={isPostgraduate} onCheckedChange={setIsPostgraduate} className="dark:data-[state=unchecked]:bg-slate-700 dark:border dark:border-white" aria-label="Toggle between undergraduate and postgraduate timelines" />
                        <Label htmlFor="timeline-toggle" className={cn("font-medium", isPostgraduate && "text-primary dark:text-white")}>Postgraduate</Label>
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
                                        ? "bg-primary text-primary-foreground border-primary dark:bg-white dark:text-black shadow-lg scale-105"
                                        : "bg-background border-border hover:border-primary hover:bg-primary/5 dark:bg-transparent dark:border-white"
                                    )}
                                    >
                                    <span className="font-bold text-sm sm:text-base">{phase.range.split(' ')[0]}</span>
                                    <span className="text-xs sm:text-sm">{phase.range.split(' ').slice(1).join(' ')}</span>
                                </button>
                                {index < timelineData.length - 1 && (<div className="hidden sm:block w-8 sm:w-12 h-px bg-border flex-shrink-0" />)}
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
                                    {timelineData[activePhase].tasks.map((task, index) => (
                                        <li key={index} className="text-muted-foreground">{task}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

             {/* Canadian Student Visa Guide */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Canadian Study Permit Guide for Indian Students (SDS Stream)</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            The Student Direct Stream (SDS) is an expedited process for students from select countries, including India.
                        </p>
                    </div>
                    <Card className="dark:bg-black dark:text-white">
                        <CardContent className="p-6 md:p-8">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {visaProcessSteps.map((step, index) => (
                                    <div key={index} className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground dark:bg-white dark:text-black font-bold text-lg">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">{step.title}</h4>
                                            <p className="text-sm text-muted-foreground dark:text-white/80">{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            
            {/* Work Opportunities Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Canada for Indian Students</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                           Canada's friendly policies allow students to work during their studies and provide a clear path to gaining valuable Canadian work experience after graduation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="shadow-lg flex flex-col dark:bg-black">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary"/>Post-Graduation Work Permit (PGWP)</CardTitle>
                                <CardDescription>Your gateway to a Canadian career.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow flex flex-col">
                                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <h4 className="font-semibold mb-1 dark:text-green-300">Duration</h4>
                                    <p className="text-green-800 dark:text-green-200">The length of your PGWP depends on your study program's duration, up to a <span className="font-bold">maximum of 3 years</span>. A program of 2 years or more typically makes you eligible for a 3-year PGWP.</p>
                                </div>
                                <div className="mt-auto pt-4">
                                    <h4 className="font-semibold text-lg mb-2">Key Benefits:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">It's an open work permit – you can work for any employer in Canada.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">Canadian work experience gained on a PGWP is crucial for many permanent residency pathways.</span></li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-lg flex flex-col dark:bg-black">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary"/>Part-Time Work While Studying</CardTitle>
                                <CardDescription>Earn while you learn and build your network.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl text-indigo-700 dark:text-indigo-300">20</p>
                                        <p className="text-sm text-indigo-600 dark:text-indigo-200">Hours/week during term-time</p>
                                    </div>
                                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl text-purple-700 dark:text-purple-400">Full-time</p>
                                        <p className="text-sm text-purple-600 dark:text-purple-300">During scheduled breaks</p>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-lg">Minimum Wage: <span className="font-bold">Varies by province (e.g., ~$15-17/hr)</span></p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-auto dark:text-white/80">This helps cover living expenses, provides valuable local work experience, and helps you integrate into Canadian society.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
            
            {/* Quick Check Quiz Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20 dark:border-primary/50">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: PGWP Knowledge!</CardTitle>
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
                                                !isSelected && "bg-background hover:bg-primary/20 dark:bg-slate-800 dark:hover:bg-slate-700"
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
                                    Not quite. A program of 2+ years makes you eligible for a 3-year PGWP.
                                </p>
                            )}
                            {selectedAnswer && isCorrect && (
                                <p className="mt-6 text-primary font-semibold flex items-center justify-center">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Correct! A 2-year Master's makes you eligible for a 3-year PGWP.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

             {children}
            <StudyAbroadCtaSection />
        </>
    );
}
