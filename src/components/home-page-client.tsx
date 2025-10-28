
'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import StudyAbroadCtaSection from "@/components/sections/StudyAbroadCtaSection";
import WhyChooseUsSection from "@/components/sections/why-choose-us-section";
import StudyAbroadTestimonials from "@/components/sections/StudyAbroadTestimonials";
import { CounterStat, StatProps } from "@/components/counter-stat";
import { ServiceCard } from "@/components/service-card";
import { services } from "@/lib/services";
import FutureProofCareerSection from "./sections/FutureProofCareerSection";
import JobTrendsChartSection from "./sections/JobTrendsChartSection";
import ResumeEvaluationSection from "./sections/ResumeEvaluationSection";
import { WhyChooseUsData } from "@/lib/content";


const stats: StatProps[] = [
    { icon: "Clock", value: 31, label: "Countries", suffix: "+", color: "text-blue-500" },
    { icon: "Users", value: 850, label: "Partner Institutions", suffix: "+", color: "text-green-500" },
    { icon: "Award", value: 1500, label: "Students Impacted", suffix: "+", color: "text-orange-500" },
    { icon: "Target", value: 98, label: "Test Prep Success Ratio", suffix: "%", color: "text-purple-500" },
];

interface HomePageClientProps {
    whyChooseUsData: WhyChooseUsData;
}

export default function HomePageClient({ whyChooseUsData }: HomePageClientProps) {
    return (
        <>
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                Best Education Consultant in Kolkata for Higher Education & Career Development - <span className="text-primary dark:text-white">Whiteboard Consultants</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted-foreground">
                                As the top Education Consultant in Kolkata, we specialize in <Link href="/study-abroad" className="text-primary underline hover:underline dark:text-white">Study Abroad</Link> guidance, <Link href="/courses" className="text-primary underline hover:underline dark:text-white">TOEFL/IELTS Test Prep</Link>, and <Link href="/college-admissions" className="text-primary underline hover:underline dark:text-white">College Admissions</Link>. Get expert guidance for overseas education, competitive exam training, and career success.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-black dark:text-white dark:border dark:border-white">
                                    <Link href="/contact">
                                        Get Started Today
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full sm:w-auto dark:bg-slate-dark dark:text-white dark:hover:bg-slate-800 dark:border dark:border-white">
                                    <Link href="#services">View Services</Link>
                                </Button>
                            </div>
                        </div>
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"
                                alt="A team of diverse professionals collaborating around a table."
                                fill
                                className="object-cover"
                                data-ai-hint="team collaboration"
                                priority
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </div>
                </div>
            </section>
            
             <section id="services" className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                           Comprehensive Career and Education Solutions
                        </h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            We provide end-to-end support to help you achieve your academic and professional goals, from test preparation to university admissions and beyond.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service) => (
                           <Link key={service.title} href={service.href} className="flex">
                             <ServiceCard {...service} />
                           </Link>
                        ))}
                    </div>
                </div>
            </section>
             
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                 <WhyChooseUsSection id="why-choose-us-home" data={whyChooseUsData} />
            </section>

            <FutureProofCareerSection />
            <JobTrendsChartSection />
            <ResumeEvaluationSection />
             
             <section className="py-16 sm:py-24 bg-[#005CB4] dark:bg-black">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-primary-foreground">
                        {stats.map((stat, index) => (
                            <CounterStat key={index} {...stat} color="text-white" />
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-black">
                 <StudyAbroadTestimonials />
            </section>

            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <StudyAbroadCtaSection />
            </section>
        </>
    );
}
