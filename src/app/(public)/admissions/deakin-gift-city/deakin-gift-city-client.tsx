'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, GraduationCap, Building, Zap, Users, CalendarDays, Award, Percent, CalendarClock, Feather, Briefcase, Home, HeartHandshake, CheckCircle2, LucideIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import CtaSection from "@/components/sections/CtaSection";
import React from "react";

const icons: { [key: string]: LucideIcon } = {
    GraduationCap, Building, Zap, Users, Award, Percent, CalendarClock, Feather, Briefcase, Home, HeartHandshake
};

interface Program {
    title: string;
    description: string;
    duration: string;
    intake: string;
    cost: string;
    eligibility: string[];
}

interface DeakinGiftCityPageData {
    programs: Program[];
    whyDeakinGiftCity: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    whyApplyWithUs: string[];
    industryPartners: string[];
    studentLife: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
}

interface DeakinGiftCityClientProps {
    data: DeakinGiftCityPageData;
}

export default function DeakinGiftCityClient({ data }: DeakinGiftCityClientProps) {
    const { programs, whyDeakinGiftCity, whyApplyWithUs, industryPartners, studentLife } = data;

    return (
        <>
            {/* Hero Section */}
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        Deakin University - <span className="text-primary">Official East India Partner</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        Experience a future-ready Australian education in the heart of India's first smart financial hub. Deakin University's GIFT City campus brings globally recognized Australian postgraduate education to Gandhinagar, with the same academic standards as its campuses in Australia.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4">
                        <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="https://www.deakin.edu.au/gift-city-campus-india/enquiry-form?utm_source=Institutional%20Marketing&utm_medium=Whiteboard%20consultant&utm_campaign=Institutions" target="_blank">
                            <>
                                Apply Now for Deakin
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          </Link>
                        </Button>
                    </div>
                  </div>
                  <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                    <Image
                      src="/deakin-india.jpg"
                      alt="Diverse students collaborating on a project at Deakin University GIFT City campus"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      data-ai-hint="students collaborating project"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* About Deakin Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="/deakin_India_about.jpg"
                                alt="Modern learning spaces at Deakin University GIFT City Campus"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="lecture hall students campus"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                                About Deakin University
                            </h2>
                            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                                <p>
                                    Deakin University is one of Australia's leading universities, known for strong graduate employment outcomes, student satisfaction, and world-class facilities. With the GIFT City campus, Deakin becomes the first international university to open a teaching campus in India and launches its first international branch campus.
                                </p>
                                <p>
                                    Located in Gujarat International Finance Tec-City (GIFT City) – India's first operational greenfield smart city and a fast-growing international financial and IT hub – the campus is surrounded by leading fintech and technology companies, creating an ideal environment for ambitious postgraduate students.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Deakin GIFT City Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose Deakin at GIFT City?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Unlock the advantages of studying at a top Australian university while staying in India.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {whyDeakinGiftCity.map((reason) => {
                            const Icon = icons[reason.icon];
                            return(
                            <Card key={reason.title} className="text-center p-6 dark:bg-black">
                                <div className="flex justify-center">{Icon && <Icon className="w-8 h-8 text-primary" />}</div>
                                <CardTitle className="mt-4 font-headline text-xl">{reason.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{reason.description}</CardDescription>
                            </Card>
                        )})}
                    </div>
                </div>
            </section>

            {/* Deakin India Partnership Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="/deakin_india_partnership.jpg"
                                alt="Global partnership and leadership at Deakin University"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="partnership global leadership"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                                Deakin in India: A Proven Partnership
                            </h2>
                            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                                <p>
                                    Deakin was the first foreign university to establish operations in India in 1994. Over almost 30 years, it has built deep partnerships across Indian industry and academia, leading to joint research, innovation, and talent development.
                                </p>
                                <p>
                                    In 2024, Deakin opened its GIFT City campus in Gujarat – its first international branch campus and India’s first international university branch campus – expanding access to high‑quality Australian postgraduate education within India and preparing graduates for India’s high‑growth sectors in finance, technology, business analytics, and cyber security.
                                </p>
                                <blockquote className="border-l-4 border-primary pl-4 italic mt-6 text-base text-foreground">
                                    "Our India partnership is one of the jewels in the crown of our growth and success over the almost 50 years of Deakin's existence." – Professor Iain Martin, Vice‑Chancellor, Deakin University
                                </blockquote>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Student Life Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Student Life at Deakin GIFT City Campus</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Experience a safe, inclusive, and welcoming learning environment designed to give you the best possible experience.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {studentLife.map((item) => {
                            const Icon = icons[item.icon];
                            return(
                            <Card key={item.title} className="text-center p-6 dark:bg-black">
                                <div className="flex justify-center">{Icon && <Icon className="w-8 h-8 text-primary"/>}</div>
                                <CardTitle className="mt-4 font-headline text-xl">{item.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                            </Card>
                        )})}
                    </div>
                </div>
            </section>

            {/* Programs Offered Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Available Programs at Deakin GIFT City</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Choose from a range of postgraduate programs tailored to local and global industry needs.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {programs.map((program) => (
                            <Card key={program.title} className="flex flex-col dark:bg-slate-dark">
                                <CardHeader className="p-6">
                                    <h3 className="font-headline text-xl font-bold">{program.title}</h3>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 flex-grow flex flex-col">
                                    <p className="text-muted-foreground mt-2 flex-grow">{program.description}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                        <div>
                                            <div className="flex items-center text-muted-foreground">
                                                <CalendarDays className="w-4 h-4 mr-2" />
                                                <span>Duration</span>
                                            </div>
                                            <p className="font-semibold">{program.duration}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center text-muted-foreground">
                                                <CalendarDays className="w-4 h-4 mr-2" />
                                                <span>Intake</span>
                                            </div>
                                            <p className="font-semibold">{program.intake}</p>
                                        </div>
                                    </div>
                                    <Accordion type="single" collapsible className="w-full mt-4">
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="font-semibold">Eligibility</AccordionTrigger>
                                            <AccordionContent>
                                                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                                                  {program.eligibility.map((item, index) => <li key={index}>{item}</li>)}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                    <div className="flex items-center justify-between mt-6">
                                        <p className="text-lg font-bold text-primary">{program.cost}</p>
                                        <Button asChild className="dark:bg-black dark:text-white dark:border dark:border-white">
                                            <Link href="https://www.deakin.edu.au/gift-city-campus-india/enquiry-form?utm_source=Institutional%20Marketing&utm_medium=Whiteboard%20consultant&utm_campaign=Institutions" target="_blank">Apply Now</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Campus Snapshot Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Campus Snapshot: GIFT City, Gandhinagar</h2>
                    </div>
                    <Card className="overflow-hidden dark:bg-black max-w-3xl mx-auto">
                        <CardContent className="p-8">
                            <ul className="space-y-4 list-disc pl-6 text-lg text-muted-foreground">
                                <li>India's first operational greenfield smart city and designated International Financial Services Centre (IFSC)</li>
                                <li>Home to leading financial, fintech, and technology organisations</li>
                                <li>World-class urban infrastructure, business ecosystem, and professional networking opportunities</li>
                            </ul>
                            <p className="mt-6 text-base text-foreground">
                                Deakin's location inside this ecosystem means students learn close to where innovation is happening, building networks and skills relevant to India's growth sectors.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Apply with Whiteboard Section */}
            <section id="apply" className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg"
                                alt="An education consultant from Whiteboard Consultants helping a student with their Deakin GIFT City application"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="consultant student"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                                Apply with Whiteboard Consultants
                            </h2>
                            <p className="mt-4 text-lg text-muted-foreground">
                                As the Official East India Partner for Deakin University GIFT City, Whiteboard Consultants offers complete, end-to-end assistance for your application.
                            </p>
                            <ul className="mt-8 space-y-4">
                                {whyApplyWithUs.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                                <Button asChild size="lg" className="dark:bg-black dark:text-white dark:border dark:border-white">
                                    <Link href="https://www.deakin.edu.au/gift-city-campus-india/enquiry-form?utm_source=Institutional%20Marketing&utm_medium=Whiteboard%20consultant&utm_campaign=Institutions" target="_blank">Apply Now for Deakin GIFT City</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href="/contact">Schedule Free Consultation</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <CtaSection headline="Ready to Start Your Deakin GIFT City Journey?" />
            </section>
        </>
    );
}
