
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, DollarSign, School, Shield, Sun, Users, Star, FileText, Clock, Lightbulb, Plane, Telescope, CalendarCheck, Landmark, MapPin, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import WhyChooseUsSection from '@/components/sections/why-choose-us-section';
import { WhyChooseUsData } from '@/lib/content';

const ugTimeline = [
    { range: "10-14 Months Before Intake", title: "Research & Exploration", icon: Telescope, tasks: ["Define your academic and career goals.", "Research New Zealand universities and polytechnics.", "Check admission requirements for desired courses.", "Start preparing for your IELTS/TOEFL test."] },
    { range: "8-12 Months Before Intake", title: "Test Prep & Shortlisting", icon: BookOpen, tasks: ["Take your IELTS/TOEFL to get the required score.", "Finalize a list of 5-8 institutions.", "Start drafting your Statement of Purpose (SOP).", "Request Letters of Recommendation (LORs) if required."] },
    { range: "6-10 Months Before Intake", title: "Application Submission", icon: FileText, tasks: ["Complete and submit online application forms.", "Pay application fees.", "Ensure all required academic documents are uploaded."] },
    { range: "4-8 Months Before Intake", title: "Receive & Accept Offers", icon: Landmark, tasks: ["Receive your Offer of Place from institutions.", "Accept your chosen offer and pay the tuition fee deposit.", "Start arranging financial documents for your student visa."] },
    { range: "3-5 Months Before Intake", "title": "Visa Preparation", icon: CalendarCheck, tasks: ["Gather all documents for the student visa application.", "Show proof of funds for tuition and living costs (NZD $20,000).", "Complete an upfront medical examination."] },
    { range: "1-3 Months Before Intake", title: "Visa & Pre-Departure", icon: Plane, tasks: ["Lodge your student visa application online.", "Once visa is approved, book flights and arrange your travel.", "Attend pre-departure briefings."] }
];

const pgTimeline = [
    { range: "8-12 Months Before Intake", title: "Research & Test Prep", icon: Telescope, tasks: ["Finalize your specialization and research potential universities.", "Prepare for and take the IELTS/TOEFL.", "Update your CV/Resume and identify recommenders."] },
    { range: "6-8 Months Before Intake", title: "Application Crafting", icon: BookOpen, tasks: ["Draft a tailored Statement of Purpose (SOP) for each university.", "Request official transcripts from your undergraduate institution.", "Provide your recommenders with all necessary documents."] },
    { range: "4-6 Months Before Intake", title: "Submit Applications", icon: FileText, tasks: ["Submit all online applications well before the deadlines.", "Follow up with recommenders to ensure LORs are submitted on time.", "Prepare for potential admission interviews."] },
    { range: "3-4 Months Before Intake", title: "Offers & Finances", icon: Landmark, tasks: ["Evaluate admission offers and any scholarship awards.", "Accept the offer from your chosen university.", "Arrange proof of funds (NZD $20,000 for living costs plus tuition)."] },
    { range: "2-3 Months Before Intake", title: "Visa Application", icon: CalendarCheck, tasks: ["Pay the tuition deposit and receive your fee receipt.", "Complete the online visa application and upload documents.", "Undergo medical examinations."] },
    { range: "1-2 Months Before Intake", title: "Final Preparations", icon: Plane, tasks: ["Book flights and secure accommodation.", "Attend pre-departure sessions.", "Organize foreign currency and travel insurance."] }
];

const workQuiz = {
    question: "How long is the Post-Study Work Visa for graduates of a Bachelor's degree?",
    options: ["1 Year", "2 Years", "3 Years", "Depends on job offer"],
    correctAnswer: "3 Years",
};

const faqsForSchema = [
    {
        questionName: "Why is New Zealand a good study destination for Indian students?",
        acceptedAnswerText: "New Zealand offers a world-class, UK-based education system in a safe, English-speaking country. It is known for its practical, hands-on learning approach, stunning natural environment, and generous post-study work rights for graduates."
    },
    {
        questionName: "What are the requirements to study in New Zealand?",
        acceptedAnswerText: "For undergraduate degrees, you typically need a good score in your Higher Secondary Certificate (around 70-80%). For postgraduate studies, a relevant bachelor's degree is required. You must also prove English proficiency with IELTS (typically 6.0-6.5 for UG, 6.5-7.0 for PG) or an equivalent test."
    },
    {
        questionName: "What is the cost of studying in New Zealand?",
        acceptedAnswerText: "Tuition fees for international students usually range from NZD $25,000 to $45,000 per year. The government requires you to show proof of funds for living expenses, which is NZD $20,000 for your first year."
    },
    {
        questionName: "Can I work in New Zealand after my studies?",
        acceptedAnswerText: "Yes, New Zealand's Post-Study Work Visa allows eligible graduates to work in the country for up to three years, depending on the level and location of their qualification. This provides a great opportunity to gain international work experience."
    }
];

const whyStudyInNz = [
    { icon: Award, title: 'Globally Recognised Education', description: 'All eight NZ universities rank in the top 3% worldwide, offering a British-based education model known for quality.', color: 'text-blue-500' },
    { icon: Lightbulb, title: 'Practical Learning Approach', description: 'The education system focuses on real-world skills, critical thinking, and practical application of knowledge.', color: 'text-orange-500' },
    { icon: Briefcase, title: 'Post-Study Work Rights', description: 'Generous work visa options for up to 3 years after graduation, providing a pathway to a global career.', color: 'text-green-500' },
    { icon: Shield, title: 'Safe & Welcoming Environment', description: 'Consistently ranked as one of the safest and most peaceful countries, offering a friendly, multicultural society.', color: 'text-purple-500' },
    { icon: Sun, title: 'Unbeatable Quality of Life', description: 'Enjoy a balanced lifestyle with stunning natural landscapes, from mountains to beaches, perfect for exploration.', color: 'text-red-500' },
    { icon: Users, title: 'Supportive Student Environment', description: 'Universities provide excellent support services for international students to help them succeed academically and socially.', color: 'text-yellow-500' },
    { icon: Telescope, title: 'Focus on Research', description: 'Opportunities to engage in innovative research in fields like agriculture, sustainability, and technology.', color: 'text-teal-500' },
    { icon: School, title: 'Work While Studying', description: 'Students can work up to 20 hours per week during their studies to support their expenses and gain experience.', color: 'text-indigo-500' }
];

const topUniversities = [
    { 
        name: "University of Auckland", 
        qsRanking: "68", 
        location: "Auckland", 
        image: "/college/college-3.webp", 
        dataAiHint: "auckland university campus", 
        programs: { 
            ug: [{ name: "B.Com", fee: "~NZD 38,000" }, { name: "B.E. (Hons)", fee: "~NZD 49,000" }], 
            pg: [{ name: "Master of Business", fee: "~NZD 50,000" }, { name: "Master of Engineering", fee: "~NZD 48,000" }, { name: "Master of Health Sciences", fee: "~NZD 45,000" }]
        } 
    },
    { 
        name: "University of Otago", 
        qsRanking: "206", 
        location: "Dunedin", 
        image: "/college/college-5.webp", 
        dataAiHint: "otago university building", 
        programs: { 
            ug: [{ name: "B.Biomed.Sc.", fee: "~NZD 37,000" }, { name: "B.A. (Psychology)", fee: "~NZD 35,000" }], 
            pg: [{ name: "Master of Health Sciences", fee: "~NZD 42,000" }, { name: "Master of Arts (Humanities)", fee: "~NZD 38,000" }, { name: "Master of Business", fee: "~NZD 40,000" }]
        } 
    },
    { 
        name: "Victoria University of Wellington", 
        qsRanking: "241", 
        location: "Wellington", 
        image: "/college/college-7.webp", 
        dataAiHint: "wellington university library", 
        programs: { 
            ug: [{ name: "B.Sc. Computer Science", fee: "~NZD 36,000" }, { name: "B.Arch.St.", fee: "~NZD 40,000" }], 
            pg: [{ name: "Master of Laws (LLM)", fee: "~NZD 38,000" }, { name: "Master of Arts (Humanities)", fee: "~NZD 37,000" }, { name: "Master of Business", fee: "~NZD 42,000" }]
        } 
    },
    { 
        name: "University of Canterbury", 
        qsRanking: "256", 
        location: "Christchurch", 
        image: "/college/college-9.webp", 
        dataAiHint: "canterbury university students", 
        programs: { 
            ug: [{ name: "B.E. (Hons) Civil Eng.", fee: "~NZD 48,000" }, { name: "B.Sc. Data Science", fee: "~NZD 38,000" }], 
            pg: [{ name: "Master of Engineering", fee: "~NZD 50,000" }, { name: "Master of Science", fee: "~NZD 40,000" }, { name: "Master of Business", fee: "~NZD 45,000" }]
        } 
    },
    { 
        name: "Massey University", 
        qsRanking: "239", 
        location: "Palmerston North/Auckland/Wellington", 
        image: "/college/college-11.webp", 
        dataAiHint: "massey university campus", 
        programs: { 
            ug: [{ name: "B.Agri.Sc.", fee: "~NZD 37,000" }, { name: "B.Des. (Hons)", fee: "~NZD 36,000" }],
            pg: [{ name: "Master of Agriculture", fee: "~NZD 39,000" }, { name: "Master of Veterinary Medicine", fee: "~NZD 45,000" }, { name: "Master of Arts", fee: "~NZD 38,000" }]
        } 
    },
    { 
        name: "Lincoln University", 
        qsRanking: "362", 
        location: "Lincoln", 
        image: "/college/college-13.webp", 
        dataAiHint: "lincoln university agriculture", 
        programs: { 
            ug: [{ name: "B.Agri. (Farm Management)", fee: "~NZD 34,000" }, { name: "B.Sc. Food Science", fee: "~NZD 35,000" }], 
            pg: [{ name: "Master of Agriculture", fee: "~NZD 38,000" }, { name: "Master of Environmental Science", fee: "~NZD 36,000" }, { name: "Master of Business", fee: "~NZD 37,000" }]
         } 
    },
    {
        name: "University of Waikato",
        qsRanking: "250",
        location: "Hamilton",
        image: "/college/college-15.webp",
        dataAiHint: "waikato university modern building",
        programs: {
            ug: [{ name: "B.Comp.Sc.", fee: "~NZD 36,000" }, { name: "B.Bus.", fee: "~NZD 34,000" }],
            pg: [{ name: "Master of Computer Science", fee: "~NZD 40,000" }, { name: "Master of Engineering", fee: "~NZD 42,000" }, { name: "Master of Business", fee: "~NZD 38,000" }]
        }
    },
    { 
        name: "Auckland University of Technology (AUT)", 
        qsRanking: "412", 
        location: "Auckland", 
        image: "/college/college-17.webp", 
        dataAiHint: "aut university city campus", 
        programs: { 
            ug: [{ name: "B.H.Sc. (Physiotherapy)", fee: "~NZD 41,000" }, { name: "B.Comm. (Marketing)", fee: "~NZD 37,000" }], 
            pg: [{ name: "Master of Business", fee: "~NZD 40,000" }, { name: "Master of Health Sciences", fee: "~NZD 42,000" }, { name: "Master of Engineering", fee: "~NZD 45,000" }]
         } 
    },
    { 
        name: "Unitec Institute of Technology", 
        qsRanking: "N/A", 
        location: "Auckland", 
        image: "/college/college-19.webp", 
        dataAiHint: "unitec campus building", 
        programs: { 
            ug: [{ name: "Bachelor of Applied Technology (Transport Management)", fee: "~NZD 24,000" }], 
            pg: [{ name: "Master of Engineering", fee: "~NZD 26,000" }, { name: "Master of Architecture", fee: "~NZD 28,000" }, { name: "Master of Creative Practice", fee: "~NZD 25,000" }]
         } 
    },
    { 
        name: "Otago Polytechnic", 
        qsRanking: "N/A", 
        location: "Dunedin", 
        image: "/college/college-1.webp",
        dataAiHint: "otago polytechnic design", 
        programs: { 
            ug: [{ name: "Bachelor of Design (Communication)", fee: "~NZD 24,000" }], 
            pg: [{ name: "Master of Nursing", fee: "~NZD 27,000" }, { name: "Master of Design", fee: "~NZD 26,000" }, { name: "Master of Culinary Arts", fee: "~NZD 28,000" }]
         } 
    },
    { 
        name: "Manukau Institute of Technology (MIT)", 
        qsRanking: "N/A", 
        location: "Auckland", 
        image: "/college/college-4.webp", 
        dataAiHint: "manukau tech park",
         programs: { 
            ug: [{ name: "Bachelor of Digital Technologies", fee: "~NZD 23,000" }], 
            pg: [{ name: "Master of Business", fee: "~NZD 25,000" }, { name: "Master of Information Technology", fee: "~NZD 26,000" }, { name: "Master of Social Work", fee: "~NZD 24,000" }]
         } 
    },
    { 
        name: "Ara Institute of Canterbury", 
        qsRanking: "N/A", 
        location: "Christchurch", 
        image: "/college/college-8.webp", 
        dataAiHint: "ara institute campus", 
        programs: { 
            ug: [{ name: "Bachelor of Information & Communication Technologies", fee: "~NZD 24,500" }],
            pg: [{ name: "Master of Nursing", fee: "~NZD 26,000" }, { name: "Master of IT", fee: "~NZD 27,000" }, { name: "Master of Business", fee: "~NZD 25,000" }]
         } 
    },
    { 
        name: "Eastern Institute of Technology (EIT)", 
        qsRanking: "N/A", 
        location: "Hawke's Bay/Tairāwhiti", 
        image: "/college/college-12.webp", 
        dataAiHint: "eit hawkes bay", 
        programs: { 
            ug: [{ name: "Bachelor of Viticulture and Wine Science", fee: "~NZD 23,000" }],
            pg: [{ name: "Master of Wine Science", fee: "~NZD 25,000" }, { name: "Master of Business", fee: "~NZD 24,000" }, { name: "Master of Nursing", fee: "~NZD 26,000" }]
         } 
    },
    { 
        name: "Waikato Institute of Technology (Wintec)", 
        qsRanking: "N/A", 
        location: "Hamilton", 
        image: "/college/college-16.webp", 
        dataAiHint: "wintec campus students", 
        programs: { 
            ug: [{ name: "Bachelor of Engineering Technology", fee: "~NZD 24,000" }], 
            pg: [{ name: "Master of Physiotherapy", fee: "~NZD 28,000" }, { name: "Master of Media Arts", fee: "~NZD 26,000" }, { name: "Master of Engineering", fee: "~NZD 27,000" }]
         } 
    },
    { 
        name: "Wellington Institute of Technology (WelTec)", 
        qsRanking: "N/A", 
        location: "Wellington", 
        image: "/college/college-20.webp", 
        dataAiHint: "weltec engineering lab",
        programs: { 
            ug: [{ name: "Bachelor of Information Technology", fee: "~NZD 23,500" }], 
            pg: [{ name: "Master of Engineering", fee: "~NZD 28,000" }, { name: "Master of IT", fee: "~NZD 27,000" }, { name: "Master of Health Science", fee: "~NZD 29,000" }]
         } 
    },
];

const admissionRequirements = {
    undergraduate: [
        "Successful completion of All India Senior School Certificate (CBSE) or Indian School Certificate (CISCE) with good grades (typically 70-80%).",
        "Proof of English proficiency: IELTS (typically 6.0 overall with no band less than 5.5) or equivalent.",
        "Some competitive programs may have higher entry requirements or require specific subjects."
    ],
    postgraduate: [
        "A Bachelor's degree from a recognized institution with a good academic record.",
        "Proof of English proficiency: IELTS (typically 6.5 overall with no band less than 6.0) or equivalent.",
        "Some programs may require relevant work experience, a portfolio, or a research proposal."
    ]
};

const studyCosts = [
    { item: "Undergraduate Tuition Fee", cost: "NZD $25,000 - $40,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "NZD $30,000 - $50,000 per year" },
    { item: "Living Cost (Proof of Funds)", cost: "NZD $20,000 for the first year" },
    { item: "Health Insurance", cost: "NZD $600 - $900 per year" },
];

const visaProcessSteps = [
    { title: "Receive Offer of Place", description: "Get your unconditional offer letter from a New Zealand education provider." },
    { title: "Pay Tuition Fees", description: "Pay the tuition fees as stated in your offer letter to receive a receipt." },
    { title: "Arrange Financial Proof", description: "Show proof of funds to cover your living costs (NZD $20,000) and tuition fees." },
    { title: "Undergo Medical Examination", description: "Complete a medical examination from an approved panel physician." },
    { title: "Gather Documents", description: "Prepare all required documents, including academic records, financial proofs, and health certificates." },
    { title: "Lodge Visa Application", description: "Submit your student visa application online through the Immigration New Zealand website." },
    { title: "Await Decision", description: "Wait for the 'Approval in Principle' (AIP) and final visa decision." },
];

interface NewZealandPageClientProps {
    whyChooseUsData: WhyChooseUsData;
}

export default function NewZealandPageClient({ whyChooseUsData }: NewZealandPageClientProps) {
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
            {/* Hero Section */}
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Study in New Zealand: <span className="text-primary dark:text-white">A World-Class Education, A Better Lifestyle</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Experience a globally-ranked, practical education in one of the world&apos;s safest and most beautiful countries. New Zealand offers an unbeatable quality of life and a clear path to a global career.
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
                                src="/destinations/studying-in-new-zealand.webp"
                                alt="A scenic view of mountains in New Zealand, representing study in New Zealand."
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                                data-ai-hint="new zealand mountains"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Study in New Zealand Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose New Zealand for Your Studies?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the unique advantages that make New Zealand a premier destination for international students.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyStudyInNz.map((reason) => (
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
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities & Institutions in New Zealand</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore New Zealand&apos;s leading universities and polytechnics, all offering a world-class education.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topUniversities.map((uni) => (
                            <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <div className="relative h-56 w-full bg-muted">
                                    <Image src={uni.image} alt={`Campus of ${uni.name}`} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover" data-ai-hint={uni.dataAiHint} />
                                </div>
                                <CardHeader>
                                    <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
                                    {uni.qsRanking !== 'N/A' &&
                                        <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                            <Star className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                            <span>QS Ranking: {uni.qsRanking}</span>
                                        </div>
                                    }
                                    <div className="flex items-center text-muted-foreground mt-1 text-sm">
                                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                        <span>{uni.location}</span>
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

            {/* Admission, Cost, and Courses Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">
                                Admission & Costs for Studying in New Zealand
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
                                        <DollarSign className="h-6 w-6 mr-2" /> Estimated Study Cost
                                    </CardTitle>
                                    <CardDescription>
                                        An overview of the annual expenses for Indian students in New Zealand.
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
                                    <p className="text-xs text-muted-foreground mt-4">*Costs are approximate and vary by university and city.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            Your New Zealand Study Abroad Timeline
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
                            className="dark:border-input"
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

            {/* New Zealand Student Visa Guide */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">New Zealand Student Visa Guide</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            A step-by-step guide to securing your Fee Paying Student Visa for New Zealand.
                        </p>
                    </div>
                    <Card className="dark:bg-slate-900">
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
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in New Zealand</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            New Zealand offers excellent opportunities for students to work during their studies and build a career after graduation.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="shadow-lg flex flex-col dark:bg-black">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary" />Post-Study Work Visa</CardTitle>
                                <CardDescription>Stay back and work in NZ after you graduate.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow flex flex-col">
                                <p className='dark:text-white/80'>The duration of your visa depends on your qualification level and location of study. It can be for 1, 2, or 3 years.</p>
                                <div className="mt-auto pt-4">
                                    <h4 className="font-semibold text-lg mb-2">Key Benefits:</h4>
                                    <ul className="space-y-2">
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">Gain valuable New Zealand work experience related to your studies.</span></li>
                                        <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span className="dark:text-white/80">Provides a strong pathway to skilled migration and permanent residency.</span></li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-lg flex flex-col dark:bg-black">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary" />Part-Time Work While Studying</CardTitle>
                                <CardDescription>Earn while you learn and gain local experience.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl dark:text-blue-300">Up to 20</p>
                                        <p className="text-sm dark:text-blue-200">Hours/week during term-time</p>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg text-center">
                                        <p className="font-bold text-2xl dark:text-green-300">Full-time</p>
                                        <p className="text-sm dark:text-green-200">During scheduled holidays</p>
                                    </div>
                                </div>
                                <div className="text-center mb-4">
                                    <p className="text-lg">Minimum Wage: <span className="font-bold">Approx. NZD $23.15/hr</span></p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-auto dark:text-white/80">This helps you cover living costs and integrate into the local community.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Quick Check Quiz Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-2xl mx-auto shadow-lg bg-primary/10 border-primary/20 dark:bg-black dark:border-white/20">
                        <CardHeader className="text-center">
                            <CardTitle className="font-headline text-2xl text-primary dark:text-white">Quick Check: Work Rights!</CardTitle>
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
                                    Not quite. Try again!
                                </p>
                            )}
                            {selectedAnswer && isCorrect && (
                                <p className="mt-6 text-primary font-semibold flex items-center justify-center">
                                    <CheckCircle2 className="mr-2 h-5 w-5" />
                                    Correct! Most bachelor&apos;s degrees make you eligible for a 3-year visa.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            <WhyChooseUsSection id="why-choose-us-new-zealand" data={whyChooseUsData} />
            <StudyAbroadCtaSection />
        </>
    );
}
