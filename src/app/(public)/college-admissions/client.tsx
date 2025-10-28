
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, FileText, BookOpen, Landmark, Plane, Users, University } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import DomesticCtaSection from "@/components/sections/DomesticCtaSection";
import { CollegeAdmissionsData } from "@/lib/content";
import React from "react";
import { cn } from "@/lib/utils";

const icons: { [key: string]: React.ElementType } = {
    Users,
    University,
    FileText,
    BookOpen,
    Plane,
    Landmark
};

const iconColors: { [key: string]: string } = {
    Users: "text-blue-500",
    University: "text-green-500",
    FileText: "text-orange-500",
    BookOpen: "text-purple-500",
    Plane: "text-red-500",
    Landmark: "text-teal-500",
};


interface CollegeAdmissionsClientProps {
    pageData: CollegeAdmissionsData;
}

export default function CollegeAdmissionsClient({ pageData }: CollegeAdmissionsClientProps) {
    const { admissionServices, partnerColleges, admissionProcessSteps } = pageData;
    
    return (
        <>
            <section className="bg-slate-100 py-16 sm:py-24 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl dark:text-white">
                        Domestic College Admissions in India - <span className="text-primary dark:text-white">Your Gateway to Success</span>
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground">
                        With expert admission guidance from Whiteboard Consultants - Best Education Consultant in Kolkata, secure your place in India&apos;s leading institutions. We partner with top colleges to ensure your application journey is both seamless and successful.
                        </p>
                        <div className="mt-10">
                            <Button asChild size="lg" className="dark:bg-black dark:text-white dark:border dark:border-white">
                                <Link href="/contact">
                                    <>
                                        Get Admission Help
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
                        <Image
                            src="https://images.pexels.com/photos/207691/pexels-photo-207691.jpeg"
                            alt="Students walking on a university campus in India for college admissions"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover"
                            data-ai-hint="university students campus"
                        />
                    </div>
                    </div>
                </div>
            </section>
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Our Admission Services for Indian Colleges</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Comprehensive support for every step of your college admission journey
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {admissionServices.map((service) => (
                            <Card key={service.title} className="dark:bg-slate-dark">
                                <CardHeader>
                                    <CardTitle className="font-headline text-xl">{service.title}</CardTitle>
                                    <CardDescription>{service.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <h4 className="font-semibold mb-2">What&apos;s Included:</h4>
                                    <ul className="space-y-2">
                                        {service.items.map((item) => (
                                            <li key={item} className="flex items-center">
                                                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Our Partner Institutions in India</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                        We have collaborated with premier universities to simplify your admissions process.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
                    {partnerColleges.map((college, index) => (
                    <Card key={college.name} className="overflow-hidden shadow-lg dark:bg-black">
                        <div className="grid grid-cols-1 lg:grid-cols-2">
                            <div className={cn("relative h-96 w-full", index % 2 !== 0 && "lg:order-last")}>
                            <Image
                                src={college.image}
                                alt={`Campus of ${college.name} for direct admission`}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-cover"
                                data-ai-hint={college.dataAiHint}
                                />
                            </div>
                            <div className="p-8 flex flex-col justify-center">
                                {college.logo && <Image src={college.logo} alt={`${college.name} Logo`} width={150} height={80} className="mb-4 object-contain self-start" />}
                                <h3 className="font-headline text-2xl font-bold mb-4">{college.name}</h3>
                                <p className="text-muted-foreground mb-6">{college.description}</p>
                                
                                <Accordion type="single" collapsible className="w-full mb-6">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger className="font-semibold">View Popular Programs</AccordionTrigger>
                                        <AccordionContent>
                                            <ul className="space-y-4 mt-2">
                                            {college.programs.map((program, pIndex) => (
                                                <li key={pIndex}>
                                                    <p className="font-semibold">{program.name}</p>
                                                    <p className="text-sm text-muted-foreground">{program.details}</p>
                                                </li>
                                            ))}
                                            </ul>
                                            <p className="text-xs text-muted-foreground mt-4">*Fee information is approximate and subject to change. Please contact us for the latest details.</p>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                
                                <Button asChild className="w-fit dark:bg-slate-dark dark:text-white dark:border dark:border-white">
                                    <Link
                                        href={college.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <>
                                            Visit Website <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                    ))}
                </div>
                </div>
            </section>
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Our Domestic Admission Process</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                        A structured approach to secure your college admission in India
                    </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {admissionProcessSteps.map((step) => {
                             const Icon = icons[step.icon];
                             const color = iconColors[step.icon] || "text-primary";
                             return (
                                <Card key={step.step} className="text-center p-6 border-0 shadow-lg hover:shadow-2xl transition-shadow duration-300 dark:bg-slate-900">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                        {Icon && <Icon className={cn("h-8 w-8", color)} />}
                                    </div>
                                    <CardHeader className="p-0">
                                        <CardTitle className="font-headline text-xl">{step.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0 pt-2">
                                        <p className="text-muted-foreground">{step.description}</p>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </div>
            </section>
            <section className="bg-background dark:bg-black">
                <DomesticCtaSection />
            </section>
        </>
    );
}
