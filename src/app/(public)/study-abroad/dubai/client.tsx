
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, BookOpen, Briefcase, Building, Globe, Shield, Sun, Users, Telescope, Milestone, ListChecks, Clock, UserRound, TrendingUp, MapPin, Plane } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';

const whyStudyInDubai = [
    { icon: Globe, title: 'Global Business Hub', description: 'Study in a dynamic, international city that is a central hub for trade, finance, and tourism, offering immense networking opportunities.', color: 'text-blue-500' },
    { icon: Building, title: 'International University Campuses', description: 'Access globally recognized degrees from UK, Australian, and US universities at their state-of-the-art Dubai campuses.', color: 'text-green-500' },
    { icon: Sun, title: 'Vibrant & Multicultural Lifestyle', description: 'Experience a high quality of life, a diverse and cosmopolitan environment, and sunny weather year-round.', color: 'text-orange-500' },
    { icon: Briefcase, title: 'Excellent Career Prospects', description: 'Benefit from a strong, growing economy with opportunities in various sectors, and a tax-free income environment.', color: 'text-purple-500' },
    { icon: Shield, title: 'Safe & Modern Environment', description: 'Live and study in one of the safest and most modern cities in the world with world-class infrastructure and services.', color: 'text-red-500' },
    { icon: Users, title: 'Diverse Student Community', description: 'Join a large and diverse international student body, enriching your academic and social experience.', color: 'text-yellow-500' },
    { icon: Telescope, title: 'Focus on Innovation', description: 'Engage with a city that is at the forefront of innovation, from smart technology to sustainable development.', color: 'text-teal-500' },
    { icon: BookOpen, title: 'English is Widely Spoken', description: 'While Arabic is the official language, English is the primary language for business, education, and daily life.', color: 'text-indigo-500' }
];

const whyDubaiIsPopular = [
    {
        icon: Plane,
        title: "Proximity to India",
        description: "Short, affordable flights make it easy and convenient for students to travel home, and for parents to visit.",
        color: "text-blue-500",
    },
    {
        icon: UserRound,
        title: "Simplified Visa Process",
        description: "The student visa is typically sponsored and managed by the university, making the application process much simpler and more streamlined compared to other countries.",
        color: "text-green-500",
    },
    {
        icon: Building,
        title: "Access to International Universities",
        description: "Students can earn a degree from a prestigious UK, Australian, or US university while studying in a location that is closer to home and culturally familiar.",
        color: "text-orange-500",
    },
    {
        icon: TrendingUp,
        title: "Growing Career Opportunities",
        description: "The booming economy, especially in sectors like tech, finance, and hospitality, provides excellent internship and post-graduation job prospects.",
        color: "text-purple-500",
    }
];

const topUniversities = [
    { 
        name: "Khalifa University", 
        location: "Abu Dhabi", 
        image: "/college/college-19.webp", 
        dataAiHint: "modern university campus", 
        programs: { 
            ug: [{ name: "B.Sc. Mechanical Engineering", fee: "~AED 100,000" }
            ], 
            pg: [{ name: "M.Sc. Computer Science", fee: "~AED 110,000" }
            ] 
        } 
    },
    
    { 
        name: "American University of Sharjah (AUS)", 
        location: "Sharjah", 
        image: "/college/college-10.webp", 
        dataAiHint: "sharjah university building", 
        programs: { 
            ug: [{ name: "B.S. Business Administration", fee: "~AED 98,000" }
            ], 
            pg: [{ name: "Master of Urban Planning", fee: "~AED 96,000" }
            ] 
        } 
    },
    
    { 
        name: "University of Wollongong, Dubai Campus", 
        location: "Dubai", 
        image: "/college/college-18.webp", 
        dataAiHint: "wollongong dubai campus", 
        programs: { 
            ug: [{ name: "Bachelor of Computer Science", fee: "~AED 65,000" }
            ], 
            pg: [{ name: "Master of Business Administration (MBA)", fee: "~AED 115,000" }
            ] 
        } 
    },
    
    { 
        name: "University of Birmingham, Dubai Campus", 
        location: "Dubai", 
        image: "/college/college-17.webp", 
        dataAiHint: "birmingham dubai campus", 
        programs: { 
            ug: [{ name: "B.Sc. Business Management", fee: "~AED 102,000" }
            ], 
            pg: [{ name: "M.Sc. Artificial Intelligence", fee: "~AED 130,000" }
            ] 
        }
    },
    
    { 
        name: "Heriot-Watt University, Dubai Campus", 
        location: "Dubai", 
        image: "/college/college-16.webp", 
        dataAiHint: "heriot-watt dubai building", 
        programs: { 
            ug: [{ name: "B.Eng. Mechanical Engineering", fee: "~AED 66,000" }
            ], 
            pg: [{ name: "M.Sc. Construction Project Management", fee: "~AED 80,000" }
            ] 
        } 
    },
    
    { name: "Middlesex University, Dubai Campus", 
        location: "Dubai", 
        image: "/college/college-15.webp", 
        dataAiHint: "middlesex dubai students", 
        programs: { 
            ug: [{ name: "B.A. International Business", fee: "~AED 57,000" }
            ], 
            pg: [{ name: "M.A. Human Resource Management", fee: "~AED 70,000" }
            ] 
        }
    },
    
    { 
        name: "Canadian University Dubai", 
        location: "Dubai", 
        image: "/college/college-14.webp", 
        dataAiHint: "canadian university dubai", 
        programs: { 
            ug: [{ name: "B.B.A. e-Business", fee: "~AED 66,000" }
            ], 
            pg: [{ name: "Master of Information Technology Management", fee: "~AED 85,000" }
            ] 
        } 
    },
    
    { 
        name: "RIT Dubai (Rochester Institute of Technology)", 
        location: "Dubai", 
        image: "/college/college-13.webp", 
        dataAiHint: "rit dubai technology campus", 
        programs: { 
            ug: [{ name: "B.S. Computing Security", fee: "~AED 65,000" }
            ], 
            pg: [{ name: "M.S. in Data Analytics", fee: "~AED 80,000" }
            ] 
        } 
    },
    
    {
         name: "Murdoch University, Dubai Campus", 
         location: "Dubai", 
         image: "/college/college-12.webp", 
         dataAiHint: "murdoch dubai students", 
         programs: { 
            ug: [{ name: "Bachelor of Business (Marketing)", fee: "~AED 50,000" }
            ], 
            pg: [{ name: "Master of Health Care Management", fee: "~AED 75,000" }
            ] 
        } 
    },
    
    {
        name: "Amity University, Dubai Campus",
        location: "Dubai",
        image: "/college/college-11.webp",
        dataAiHint: "modern university building",
        programs: {
            ug: [
                { name: "B.Tech Computer Science", fee: "~AED 55,000" },
                { name: "BBA (Bachelor of Business Administration)", fee: "~AED 50,000" }
            ],
            pg: [
                { name: "MBA (Master of Business Administration)", fee: "~AED 75,000" },
                { name: "M.Sc. Data Science", fee: "~AED 65,000" }
            ]
        }
    },
];

const admissionRequirements = {
    undergraduate: [
        "High school transcripts with a good academic record (typically 60-80%).",
        "Proof of English proficiency: IELTS (5.5 - 6.5) or TOEFL (70-85 iBT).",
        "Some universities may require a personal statement or interview.",
        "Passport copy and passport-sized photographs."
    ],
    postgraduate: [
        "A Bachelor's degree from a recognized institution with good grades.",
        "Proof of English proficiency: IELTS (6.0 - 7.0) or TOEFL (80-100 iBT).",
        "Statement of Purpose (SOP) and Letters of Recommendation (LORs).",
        "CV/Resume detailing academic and professional experience.",
        "Some MBA programs may require GMAT scores and work experience."
    ]
};

const studyCosts = [
    { item: "Undergraduate Tuition Fee", cost: "AED 50,000 - 100,000 per year" },
    { item: "Postgraduate Tuition Fee", cost: "AED 60,000 - 120,000 per year" },
    { item: "Accommodation", cost: "AED 25,000 - 50,000 per year" },
    { item: "Living Expenses", cost: "AED 15,000 - 25,000 per year" },
    { item: "Health Insurance", cost: "AED 2,000 - 5,000 per year" },
];

const visaProcessSteps = [
    { title: "Receive Admission Letter", description: "Get your official acceptance letter from the university in Dubai." },
    { title: "University Sponsors Visa", description: "The university will typically sponsor your student visa. You need to provide them with the required documents." },
    { title: "Submit Documents", description: "Provide passport copies, photographs, admission letter, and proof of tuition fee payment to your university." },
    { title: "Medical Test & Biometrics", description: "After arriving in the UAE on an entry permit, you will undergo a medical fitness test and provide biometrics." },
    { title: "Emirates ID & Visa Stamping", description: "Upon successful completion of the medical test, your Emirates ID will be processed and the student residence visa will be stamped in your passport." },
];

const requiredVisaDocs = [
    "Passport valid for at least six months",
    "Passport-sized photographs with a white background",
    "Copy of the university's admission letter",
    "Proof of payment for tuition and visa fees",
    "Accommodation details (e.g., tenancy contract or university housing letter)",
    "Travel and health insurance valid in the UAE",
    "For postgraduate students, certified copies of undergraduate degree and transcripts"
];

interface DubaiPageClientProps {
    children: React.ReactNode;
}

export default function DubaiPageClient({ children }: DubaiPageClientProps) {
    return (
        <>
            {/* Hero Section */}
            <section className="bg-muted dark:bg-slate-dark py-16 sm:py-24">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <p className="text-base font-semibold text-primary uppercase tracking-wide">Study Abroad</p>
                            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Study in Dubai (UAE): <span className="text-primary">Your Gateway to a Global Career</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                Experience a fusion of tradition and modernity in Dubai. We are the top study in Dubai consultants in Kolkata, offering guidance for international university campuses, a vibrant multicultural lifestyle, and outstanding career prospects.
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
                                src="/destinations/studying-in-dubai.webp"
                                alt="A modern cityscape of Dubai, a hero image for studying in Dubai."
                                fill
                                className="object-cover"
                                data-ai-hint="dubai cityscape"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Study in Dubai Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose Dubai for Your Studies?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the advantages that make Dubai a dynamic and attractive destination for international students from India.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {whyStudyInDubai.map((reason) => (
                            <Card key={reason.title} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300">
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
            
             {/* Why Dubai is Popular with Indian Students Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Dubai is a Top Choice for Indian Students</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Several key factors make the UAE an increasingly popular and practical choice for students from India.
                        </p>
                    </div>
                    <Card className="max-w-4xl mx-auto">
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {whyDubaiIsPopular.map((reason) => (
                                <div key={reason.title} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                                        <reason.icon className={cn("h-6 w-6", reason.color)} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{reason.title}</h3>
                                        <p className="text-muted-foreground mt-1">{reason.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Top Universities Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Top Universities in the UAE for Indian Students</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Explore a range of excellent universities in Dubai and across the UAE, including international branch campuses.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topUniversities.map((uni) => (
                           <Card key={uni.name} className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
                                <div className="relative h-56 w-full">
                                    <Image src={uni.image} alt={`Campus of ${uni.name}, a top university to study in Dubai`} fill className="object-cover" data-ai-hint={uni.dataAiHint} />
                                </div>
                                <CardHeader>
                                    <h3 className="font-headline text-xl font-bold">{uni.name}</h3>
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
            
            {/* Admission & Cost Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl mb-8">
                                Admission Requirements & Costs for Studying in Dubai
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
                                         <Clock className="h-6 w-6 mr-2"/> Estimated Study Cost
                                     </CardTitle>
                                     <CardDescription>
                                         An overview of the annual expenses for Indian students in Dubai.
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
                                     <p className="text-xs text-muted-foreground mt-4">*Costs are in AED and are approximate. They can vary by university and lifestyle.</p>
                                 </CardContent>
                             </Card>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Visa Guide Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Dubai Student Visa Guide for Indian Students</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            A simplified guide to the student visa process, which is typically handled by the university.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Visa Application Process */}
                        <div className="lg:col-span-1">
                             <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><Milestone className="mr-3 h-6 w-6 text-primary"/>Visa Application Process</h3>
                             <div className="relative">
                                {visaProcessSteps.map((step, index) => (
                                    <div key={index} className="pl-8 relative pb-8 border-l border-border">
                                        <div className="absolute -left-4 top-0 flex items-center justify-center w-8 h-8 bg-background border-2 border-primary rounded-full">
                                            <span className="font-bold text-primary">{index + 1}</span>
                                        </div>
                                        <h4 className="font-semibold">{step.title}</h4>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                ))}
                             </div>
                        </div>

                         {/* Required Documents */}
                        <div className="lg:col-span-1">
                            <h3 className="font-headline text-2xl font-bold mb-6 flex items-center"><ListChecks className="mr-3 h-6 w-6 text-primary"/>Typical Required Documents</h3>
                             <Card className="bg-primary/5">
                                <CardContent className="p-6">
                                    <ul className="space-y-3">
                                        {requiredVisaDocs.map((doc, index) => (
                                            <li key={index} className="flex items-start">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                                <span>{doc}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Work Opportunities Section */}
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Opportunities in Dubai</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                           The UAE offers various opportunities for students to gain work experience and for talented graduates to build a career.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                        <Card className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Briefcase className="mr-3 h-6 w-6 text-primary"/>Post-Graduation Opportunities</CardTitle>
                                <CardDescription>Pathways to a career after your degree.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 flex-grow flex flex-col">
                                <p>While there is not a standardized post-study work visa like in other countries, the UAE government encourages talented graduates to stay. Opportunities include:</p>
                                <ul className="space-y-2">
                                    <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>**Employer Sponsorship:** Most common route where your employer sponsors your work visa.</span></li>
                                    <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>**Golden Visa:** Outstanding students may be eligible for a 10-year Golden Visa, allowing them to live, work, and study without a national sponsor.</span></li>
                                </ul>
                            </CardContent>
                        </Card>
                        
                        <Card className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className="font-headline text-2xl flex items-center"><Clock className="mr-3 h-6 w-6 text-primary"/>Part-Time Work While Studying</CardTitle>
                                <CardDescription>Gain experience and earn while you learn.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                               <p>Students can work part-time, typically up to 15-20 hours per week during semesters and full-time during breaks. This is often done through:</p>
                                <ul className="space-y-2 mt-4">
                                    <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>**University-approved internships and co-op programs.**</span></li>
                                    <li className="flex items-start"><CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" /><span>**Working within university free zones or for specific employers.**</span></li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>
             
            {children}
            <StudyAbroadCtaSection />
        </>
    );
}
