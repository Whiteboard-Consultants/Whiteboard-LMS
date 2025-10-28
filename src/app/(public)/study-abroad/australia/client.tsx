
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Globe, School, Sun, Users, Star, FileText, BarChart, Telescope, CalendarCheck, Landmark, MapPin, XCircle, Plane, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const faqsForSchema = [
    {
        questionName: "Why is Australia a good study destination for Indian students?",
        acceptedAnswerText: "Australia is an excellent choice for its world-class universities, high quality of life, multicultural cities, and generous post-study work opportunities. The education system is globally recognized for its focus on practical skills and research."
    },
    {
        questionName: "What are the requirements to study in Australia for Indian students?",
        acceptedAnswerText: "For undergraduate courses, you typically need a Higher Secondary Certificate with 65-80%. For postgraduate courses, a relevant bachelor's degree is required. You also need to prove English proficiency via IELTS (typically 6.0-6.5 for UG, 6.5-7.0 for PG) or an equivalent test."
    },
    {
        questionName: "What is the cost of studying in Australia?",
        acceptedAnswerText: "Tuition fees for international students generally range from AUD $25,000 to $45,000 per year. Living costs are estimated to be around AUD $21,041 per year as per Australian government guidelines."
    },
    {
        questionName: "Can I work in Australia after my studies?",
        acceptedAnswerText: "Yes, Australia's Temporary Graduate visa (subclass 485) allows eligible graduates of Bachelor's, Master's, or PhD programs to stay and work in Australia for two to four years, and even longer for specific degrees or regional study."
    }
];

const whyStudyInAustralia = [
    { icon: Award, title: 'Globally Ranked Universities', description: 'Australian universities are consistently ranked among the top in the world, renowned for quality teaching and research.', color: 'text-blue-500' },
    { icon: Sun, title: 'High Quality of Life', description: 'Enjoy a safe, friendly, and multicultural environment with a high standard of living and vibrant cities.', color: 'text-orange-500' },
    { icon: Briefcase, title: 'Post-Study Work Rights', description: 'Generous post-study work visa options allow you to gain valuable international work experience.', color: 'text-green-500' },
    { icon: Users, title: 'Multicultural Society', description: 'Australia is a diverse country that welcomes students from all over the world, offering a rich cultural experience.', color: 'text-purple-500' },
    { icon: BookOpen, title: 'Focus on Practical Learning', description: 'The education system emphasizes practical, hands-on experience and skills development for the modern workplace.', color: 'text-red-500' },
    { icon: Telescope, title: 'Innovation and Research', description: 'Australia is a leader in research and innovation, offering excellent opportunities in fields like technology, health, and science.', color: 'text-yellow-500' },
    { icon: School, title: 'Work While You Study', description: 'International students can work part-time (up to 48 hours per fortnight) to support their living expenses.', color: 'text-teal-500' },
    { icon: Globe, title: 'Stunning Natural Beauty', description: 'From beaches to deserts, explore a beautiful and diverse country during your studies.', color: 'text-indigo-500' }
];

const topUniversities = [
    {
        name: "The University of Melbourne",
        qsRanking: "13",
        webometricsWorldRanking: "30",
        location: "Melbourne, VIC",
        image: "/college/college-2.webp",
        dataAiHint: "historic university building",
        programs: {
            ug: [{ name: "Bachelor of Science", fee: "AUD 50,000" }, { name: "Bachelor of Commerce", fee: "AUD 52,000" }],
            pg: [{ name: "Master of Management", fee: "AUD 53,000" }, { name: "Master of Data Science", fee: "AUD 53,000" }]
        }
    },

    {
        name: "The University of Sydney",
        qsRanking: "18",
        webometricsWorldRanking: "29",
        location: "Sydney, NSW",
        image: "/college/college-4.webp",
        dataAiHint: "university campus fall",
        programs:
        {
            ug: [{ name: "Bachelor of Engineering (Hons)", fee: "AUD 56,000" }, { name: "Bachelor of Arts/Advanced Studies", fee: "AUD 52,000" }],
            pg: [{ name: "Master of Commerce", fee: "AUD 56,500" }, { name: "Master of Information Technology", fee: "AUD 54,500" }]
        }
    },

    {
        name: "The University of New South Wales (UNSW)",
        qsRanking: "19",
        webometricsWorldRanking: "40",
        location: "Sydney, NSW",
        image: "/college/college-6.webp",
        dataAiHint: "modern campus library",
        programs: {
            ug: [{ name: "Bachelor of Engineering (Hons)", fee: "AUD 54,000" }, { name: "Bachelor of Commerce", fee: "AUD 51,500" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 79,000" }, { name: "Master of Data Science", fee: "AUD 52,000" }]
        }
    },

    {
        name: "The University of Queensland (UQ)",
        qsRanking: "40",
        webometricsWorldRanking: "50",
        location: "Brisbane, QLD",
        image: "/college/college-8.webp",
        dataAiHint: "brisbane campus",
        programs: {
            ug: [{ name: "Bachelor of Engineering (Hons)", fee: "AUD 51,000" }, { name: "Bachelor of Business Management", fee: "AUD 48,000" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 88,000" }, { name: "Master of Data Science", fee: "AUD 51,000" }]
        }
    },

    {
        name: "Monash University",
        qsRanking: "37",
        webometricsWorldRanking: "55",
        location: "Melbourne, VIC",
        image: "/college/college-10.webp",
        dataAiHint: "engineering students team",
        programs: {
            ug: [{ name: "Bachelor of Computer Science", fee: "AUD 53,000" }, { name: "Bachelor of Pharmacy (Hons)", fee: "AUD 51,000" }],
            pg: [{ name: "Master of Business Analytics", fee: "AUD 54,000" }, { name: "Master of Advanced Engineering", fee: "AUD 53,000" }]
        }
    },

    {
        name: "Australian National University (ANU)",
        qsRanking: "30",
        webometricsWorldRanking: "90",
        location: "Canberra, ACT",
        image: "/college/college-12.webp",
        dataAiHint: "university students on lawn",
        programs: {
            ug: [{ name: "Bachelor of Advanced Computing (Hons)", fee: "AUD 53,000" }, { name: "Bachelor of Politics, Philosophy & Economics", fee: "AUD 48,000" }],
            pg: [{ name: "Master of Computing", fee: "AUD 53,000" }, { name: "Master of International Relations", fee: "AUD 50,000" }]
        }
    },

    {
        name: "The University of Western Australia (UWA)",
        qsRanking: "77",
        webometricsWorldRanking: "100",
        location: "Perth, WA",
        image: "/college/college-14.webp",
        dataAiHint: "diverse team meeting",
        programs: {
            ug: [{ name: "Bachelor of Science (Comp Sci)", fee: "AUD 47,000" }, { name: "Bachelor of Commerce", fee: "AUD 45,500" }],
            pg: [{ name: "Master of Professional Engineering", fee: "AUD 47,000" }, { name: "Master of Business Analytics", fee: "AUD 48,000" }]
        }
    },

    {
        name: "University of Adelaide",
        qsRanking: "82",
        webometricsWorldRanking: "130",
        location: "Adelaide, SA",
        image: "/college/college-16.webp",
        dataAiHint: "students outdoors",
        programs: {
            ug: [{ name: "Bachelor of Engineering (Hons)", fee: "AUD 50,000" }, { name: "Bachelor of Computer Science", fee: "AUD 49,500" }],
            pg: [{ name: "Master of Data Science", fee: "AUD 51,000" }, { name: "Master of Wine Business", fee: "AUD 49,500" }]
        }
    },

    {
        name: "University of Technology Sydney (UTS)",
        qsRanking: "88",
        webometricsWorldRanking: "150",
        location: "Sydney, NSW",
        image: "/college/college-18.webp",
        dataAiHint: "students working together",
        programs: {
            ug: [{ name: "Bachelor of Business", fee: "AUD 48,000" }, { name: "Bachelor of Computing Science (Hons)", fee: "AUD 51,000" }],
            pg: [{ name: "Master of Information Technology", fee: "AUD 49,000" }, { name: "Master of Engineering Management", fee: "AUD 50,000" }]
        }
    },

    {
        name: "Queensland University of Technology (QUT)",
        qsRanking: "199",
        webometricsWorldRanking: "179",
        location: "Brisbane, QLD",
        image: "/college/college-20.webp",
        dataAiHint: "technology campus",
        programs: {
            ug: [{ name: "Bachelor of Engineering (Honours)", fee: "AUD 41,300" }, { name: "Bachelor of Business", fee: "AUD 36,800" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 37,800" }, { name: "Master of IT", fee: "AUD 37,800" }]
        }
    },

    {
        name: "RMIT University",
        qsRanking: "123",
        webometricsWorldRanking: "183", 
        location: "Melbourne, VIC", 
        image: "/college/college-3.webp", 
        dataAiHint: "urban university", 
        programs: { 
            ug: [{ name: "Bachelor of Engineering (Aerospace Eng) (Hons)", fee: "AUD 43,200" }, { name: "Bachelor of Design (Communication Design)", fee: "AUD 38,400" }], 
            pg: [{ name: "Master of Analytics", fee: "AUD 40,320" }, { name: "Master of Architecture", fee: "AUD 44,160" }] }
    },

    { name: "University of Wollongong", 
        qsRanking: "167", 
        webometricsWorldRanking: "185", 
        location: "Wollongong, NSW", 
        image: "/college/college-6.webp", 
        dataAiHint: "coastal campus", 
        programs: { 
            ug: [{ name: "Bachelor of Engineering (Honours)", fee: "AUD 38,500" }, { name: "Bachelor of Computer Science", fee: "AUD 36,500" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 35,000" }, { name: "Master of Computer Science", fee: "AUD 37,000" }] } },

    { name: "Macquarie University", 
        qsRanking: "133", 
        webometricsWorldRanking: "197", 
        location: "Sydney, NSW", 
        image: "/college/college-9.webp", 
        dataAiHint: "modern campus", 
        programs: { 
            ug: [{ name: "Bachelor of Commerce", fee: "AUD 43,200" }, { name: "Bachelor of IT", fee: "AUD 44,000" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 46,000" }, { name: "Master of Data Science", fee: "AUD 44,000" }] } },

    { name: "Deakin University", 
        qsRanking: "197", 
        webometricsWorldRanking: "216", 
        location: "Melbourne, VIC", 
        image: "/college/college-11.webp", 
        dataAiHint: "deakin campus life", 
        programs: { 
            ug: [{ name: "Bachelor of Commerce", fee: "AUD 37,000" }, { name: "Bachelor of Nursing", fee: "AUD 38,400" }], 
            pg: [{ name: "Master of Business Analytics", fee: "AUD 41,400" }, { name: "Master of IT", fee: "AUD 37,600" }] } },

    { name: "University of Newcastle", 
        qsRanking: "179", 
        webometricsWorldRanking: "220", 
        location: "Newcastle, NSW", 
        image: "/college/college-13.webp", 
        dataAiHint: "newcastle university building", 
        programs: { 
            ug: [{ name: "Bachelor of Engineering (Honours)", fee: "AUD 43,000" }, { name: "Bachelor of Medical Science", fee: "AUD 40,000" }],
            pg: [{ name: "Master of Business Administration (MBA)", fee: "AUD 43,500" }, { name: "Master of Information Technology", fee: "AUD 40,000" }] } }

].sort((a, b) => parseInt(a.webometricsWorldRanking) - parseInt(b.webometricsWorldRanking));


const admissionRequirements = {
    undergraduate: [
        "Higher Secondary Certificate (HSC) / All India Senior School Certificate (AISSC) with an average of 65-80%.",
        "Proof of English proficiency: IELTS (typically 6.0-6.5 overall) or TOEFL (typically 70-90 iBT), or equivalent.",
        "Some programs may require specific subject prerequisites or a portfolio."
    ],
    postgraduate: [
        "A Bachelor's degree from a recognized institution (Section 1, 2, or 3) with good academic standing.",
        "Proof of English proficiency: IELTS (typically 6.5-7.0 overall) or TOEFL (typically 85-100 iBT).",
        "Some programs, especially MBAs, may require GMAT scores and relevant work experience."
    ]
};

const studyCosts = [
    { item: "Undergraduate Tuition Fee", cost: "AUD 25,000 - 45,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "AUD 28,000 - 50,000 per year" },
    { item: "Annual Living Costs (Govt. Estimate)", cost: "AUD 24,505" },
    { item: "Overseas Student Health Cover (OSHC)", cost: "AUD 500 - 700 per year" }
];

const visaProcessSteps = [
    { title: "Receive CoE", description: "Receive your Confirmation of Enrolment (CoE) from your university after accepting the offer and paying the deposit." },
    { title: "Create ImmiAccount", description: "Create an account on the Australian Department of Home Affairs website." },
    { title: "Gather Documents", description: "Prepare all required documents, including CoE, financial proof, OSHC, English test results, and a Genuine Student (GS) statement." },
    { title: "Lodge Application", description: "Complete the online Student visa (subclass 500) application form." },
    { title: "Pay Visa Fee", description: "Pay the visa application fee (currently AUD 710)." },
    { title: "Health & Biometrics", description: "Undergo a health examination and provide biometrics at a designated centre." },
    { title: "Await Decision", description: "Wait for the visa grant notification. Processing times vary." },
];

const workQuiz = {
    question: "What is the standard post-study work visa duration for a Master's by coursework degree?",
    options: ["1 Year", "2 Years", "3 Years", "4 Years"],
    correctAnswer: "2 Years",
};

const ugTimeline = [
    { range: "10-14 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: ["Research Australian universities and courses.", "Start preparing for IELTS/TOEFL.", "Check admission requirements."] },
    { range: "8-12 Months Before Intake", title: "Test Prep & Shortlisting", icon: BookOpen, tasks: ["Take English proficiency tests.", "Finalize a list of universities.", "Start drafting your Statement of Purpose (SOP)."] },
    { range: "6-10 Months Before Intake", title: "Application Submission", icon: FileText, tasks: ["Submit online application forms.", "Pay application fees.", "Send required documents."] },
    { range: "4-8 Months Before Intake", title: "Acceptance & Finances", icon: Landmark, tasks: ["Receive admission offers.", "Accept your chosen offer.", "Arrange for funds and apply for loans."] },
    { range: "3-5 Months Before Intake", "title": "Visa Process", icon: CalendarCheck, tasks: ["Receive Confirmation of Enrolment (CoE).", "Apply for the Student visa (subclass 500).", "Attend medical and biometrics appointments."] },
    { range: "1-2 Months Before Intake", title: "Pre-Departure", icon: Plane, tasks: ["Arrange for accommodation.", "Book your flight tickets.", "Attend pre-departure briefings."] }
];

const pgTimeline = [
    { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: ["Finalize your field of specialization and research potential universities.", "Prepare for and take the IELTS/TOEFL.", "Update your CV/Resume and identify recommenders."] },
    { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: ["Take English proficiency tests.", "Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Provide your recommenders with all necessary documents for LORs."] },
    { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: ["Submit all online applications.", "Follow up with recommenders to ensure LORs are submitted on time.", "Prepare for any potential admission interviews."] },
    { range: "3-4 Months Before Intake", title: "Admission & Finances", icon: Landmark, tasks: ["Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Arrange finances and get your CoE."] },
    { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: ["Complete the visa application.", "Attend biometrics and health check-ups.", "Wait for visa grant."] },
    { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: ["Book flights and secure accommodation.", "Attend pre-departure orientations.", "Pack for your new life in Australia!"] }
];

interface AustraliaPageClientProps {
    children: React.ReactNode;
}

export default function AustraliaPageClient({ children }: AustraliaPageClientProps) {
    const [isPostgraduate, setIsPostgraduate] = useState(false);
    const [activePhase, setActivePhase] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

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
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Study in Australia: <span className="text-primary dark:text-white">Innovation Down Under</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Experience a world-class education, vibrant multicultural cities, and stunning natural landscapes. Australia offers a perfect blend of academic excellence and an unbeatable lifestyle.
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
                                src="/destinations/studying-in-australia.webp"
                                alt="Scenic view of the Sydney Opera House, representing study in Australia."
                                fill
                                className="object-cover"
                                data-ai-hint="sydney opera house"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Study in Australia?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the advantages that make Australia a top-tier destination for international students from India.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyStudyInAustralia.map((reason) => (
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

            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in Australia</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore Australia&apos;s leading universities, renowned for their research, teaching quality, and graduate employability.
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
                                    <div className="flex items-center text-muted-foreground mt-2 text-sm"><MapPin className="h-4 w-4 mr-2 flex-shrink-0" /><span>{uni.location}</span></div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm"><Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" /><span>QS Ranking: {uni.qsRanking}</span></div>
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm"><BarChart className="h-4 w-4 mr-2 flex-shrink-0" /><span>Webometrics World: {uni.webometricsWorldRanking}</span></div>
                                </CardHeader>
                                <CardContent className="flex-grow flex flex-col">
                                    <Accordion type="single" collapsible className="w-full">
                                        <AccordionItem value="ug-programs"><AccordionTrigger className="font-semibold text-base">Popular UG Programs</AccordionTrigger><AccordionContent><ul className="space-y-3 mt-2 text-sm">{uni.programs.ug.map(p => (<li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center"><span className="truncate">{p.name}</span><span className="font-mono text-muted-foreground">{p.fee}</span></li>))}</ul></AccordionContent></AccordionItem>
                                        <AccordionItem value="pg-programs"><AccordionTrigger className="font-semibold text-base">Popular PG Programs</AccordionTrigger><AccordionContent><ul className="space-y-3 mt-2 text-sm">{uni.programs.pg.map(p => (<li key={p.name} className="grid grid-cols-[1fr,auto] gap-x-2 items-center"><span className="truncate">{p.name}</span><span className="font-mono text-muted-foreground">{p.fee}</span></li>))}</ul></AccordionContent></AccordionItem>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">Admission & Costs for Studying in Australia</h2>
                            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                                <AccordionItem value="item-1"><AccordionTrigger className="text-xl font-headline">Undergraduate Requirements</AccordionTrigger><AccordionContent><ul className="space-y-3 pt-2">{admissionRequirements.undergraduate.map(req => (<li key={req} className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>{req}</span></li>))}</ul></AccordionContent></AccordionItem>
                                <AccordionItem value="item-2"><AccordionTrigger className="text-xl font-headline">Postgraduate Requirements</AccordionTrigger><AccordionContent><ul className="space-y-3 pt-2">{admissionRequirements.postgraduate.map(req => (<li key={req} className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" /><span>{req}</span></li>))}</ul></AccordionContent></AccordionItem>
                            </Accordion>
                        </div>
                        <div>
                            <Card className="bg-primary/5">
                                <CardHeader><CardTitle className="font-headline text-2xl flex items-center"><span className="font-bold mr-2">AUD</span> Estimated Costs</CardTitle><CardDescription>An overview of the annual expenses for Indian students in Australia.</CardDescription></CardHeader>
                                <CardContent><ul className="space-y-3">{studyCosts.map(item => (<li key={item.item} className="flex justify-between items-center text-sm"><span>{item.item}</span><span className="font-semibold text-right">{item.cost}</span></li>))}</ul><p className="text-xs text-muted-foreground mt-4">*Costs are approximate and subject to change.</p></CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Your Study Abroad Timeline
                        </h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Plan your journey step-by-step! Use the toggle below to view the recommended timeline for Undergraduate (UG) or Postgraduate (PG) programs, helping you stay on track with your application process.
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

            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Australian Student Visa Guide</h2><p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">A step-by-step guide to securing your Student visa (subclass 500).</p></div>
                    <Card className="dark:bg-slate-900"><CardContent className="p-6 md:p-8"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{visaProcessSteps.map((step, index) => (<div key={index} className="flex items-start space-x-4"><div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground dark:bg-white dark:text-black font-bold text-lg">{index + 1}</div><div><h4 className="font-semibold">{step.title}</h4><p className="text-sm text-muted-foreground dark:text-white/80">{step.description}</p></div></div>))}</div></CardContent></Card>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12"><h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Australia</h2><p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">Australia&apos;s supportive policies provide ample opportunities for students to work during and after their studies.</p></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="shadow-lg flex flex-col dark:bg-slate-900"><CardHeader><CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary" />Post-Study Work Visa</CardTitle><CardDescription>Temporary Graduate visa (subclass 485).</CardDescription></CardHeader><CardContent className="space-y-4 flex-grow flex flex-col"><p>The standard duration is 2 years for Bachelor&apos;s and Master&apos;s by coursework, 3 years for Master&apos;s by research, and 4 years for PhDs. Recent changes can extend this by 2 years for specific degrees.</p><div className="mt-auto pt-4"><h4 className="font-semibold text-lg mb-2">Key Benefits:</h4><ul className="space-y-2"><li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">Gain valuable work experience in the Australian job market.</span></li><li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">Provides a pathway towards permanent residency for eligible graduates.</span></li></ul></div></CardContent></Card>
                        <Card className="shadow-lg flex flex-col dark:bg-slate-900"><CardHeader><CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary" />Part-Time Work While Studying</CardTitle><CardDescription>Earn while you learn and build your network.</CardDescription></CardHeader><CardContent className="flex-grow flex flex-col"><div className="p-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg text-center"><p className="font-bold text-2xl text-indigo-700 dark:text-indigo-300">48 hours</p><p className="text-sm text-indigo-600 dark:text-indigo-200">per fortnight during term-time</p></div><p className="text-sm text-muted-foreground dark:text-white/80 mt-4">This helps you cover living expenses, gain local experience, and build a professional network.</p></CardContent></Card>
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 dark:bg-black border-primary/20 dark:border dark:border-white/20">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Quiz: Work Rights!</CardTitle>
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
                                    <XCircle className="mr-2 h-5 w-5" />Not quite. Check the section above!
                                </p>
                            )}
                            {selectedAnswer && isCorrect && (
                                <p className="mt-6 text-primary font-semibold flex items-center justify-center">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />Correct! It&apos;s 2 years for a Master&apos;s by coursework.
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
