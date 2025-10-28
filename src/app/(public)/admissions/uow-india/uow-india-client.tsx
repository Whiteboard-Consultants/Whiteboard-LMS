
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
import { UowIndiaPageData } from "@/types";
import FutureOfFintechAndDataSection from "@/components/sections/FutureOfFintechAndDataSection";

const icons: { [key: string]: LucideIcon } = {
    GraduationCap, Building, Zap, Users, Award, Percent, CalendarClock, Feather, Briefcase, Home, HeartHandshake
};

interface UowIndiaClientProps {
    data: UowIndiaPageData;
}

export default function UowIndiaClient({ data }: UowIndiaClientProps) {
    const { programs: uowPrograms, whyUowIndia, scholarships, whyApplyWithUs, industryPartners, studentLife } = data;

    return (
        <>
            {/* Hero Section */}
            <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        University of Wollongong - <span className="text-primary">Official East India Partner</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-muted-foreground">
                        Experience world-class Australian education right here in India. UOW&apos;s GIFT City campus offers internationally recognized degrees with the same quality and standards as its Australian counterpart.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-start gap-4">
                        <Button asChild size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/admissions/uow-india/apply">
                            <>
                                Apply Now for UOW
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                           <Link href="#">
                                Download Brochure
                           </Link>
                        </Button>
                    </div>
                  </div>
                  <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                    <Image
                      src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg"
                      alt="Diverse students collaborating on a project at the University of Wollongong India campus"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      data-ai-hint="students collaborating project"
                    />
                  </div>
                </div>
              </div>
            </section>
            {/* About UOW Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="/UOW.jpeg"
                                alt="Students in a modern lecture hall at University of Wollongong GIFT City Campus"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="lecture hall students"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                                About University of Wollongong (UOW)
                            </h2>
                            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                                <p>
                                    The University of Wollongong (UOW) is a leading global university, ranked among the top 1% of universities worldwide. With a history of producing high-quality research and graduates who are ready to make a real impact, UOW has established a strong international presence.
                                </p>
                                <p>
                                    UOW India brings this legacy of academic excellence to a state-of-the-art campus in GIFT City, Gandhinagar. It is the first foreign university to be approved to operate in this new financial hub, offering the same world-class curriculum and teaching standards as its Australian counterpart.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Why UOW India Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Why Choose UOW India at GIFT City?</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Discover the unique advantages of studying at a top Australian university in India.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {whyUowIndia.map((reason) => {
                            const Icon = icons[reason.icon];
                            return(
                            <Card key={reason.title} className="text-center p-6 dark:bg-black">
                                <div className="flex justify-center">{Icon && <Icon className="w-8 h-8 text-blue-500" />}</div>
                                <CardTitle className="mt-4 font-headline text-xl">{reason.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{reason.description}</CardDescription>
                            </Card>
                        )})}
                    </div>
                </div>
            </section>
            
            <FutureOfFintechAndDataSection />

            {/* Industry Partnership Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg"
                                alt="Team discussing a project with technology, highlighting UOW India's industry partnerships"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                data-ai-hint="technology partnership meeting"
                            />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                                Industry Partnerships: UOW & IBM
                            </h2>
                            <div className="mt-6 space-y-4 text-lg text-muted-foreground">
                                <p>
                                    UOW India has partnered with IBM to bridge the gap between academia and industry. This collaboration provides students with unparalleled access to IBM&apos;s cutting-edge software, online resources, and real-world case studies.
                                </p>
                                <p>
                                    Through guest lectures from IBM experts and hands-on workshops, students gain invaluable insights into the latest industry trends and technologies. This partnership is designed to enhance practical skills and boost career readiness, ensuring UOW India graduates are prepared to excel in the global workforce.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* Work Integrated Learning Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Work Integrated Learning & Placement</h2>
                        <p className="mt-4 max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                            Gain practical experience and a competitive edge with the Master of Computing (Data Analytics) program, featuring guaranteed placement interviews.
                        </p>
                    </div>
                    <Card className="overflow-hidden dark:bg-black">
                        <CardContent className="p-0">
                           <div className="grid grid-cols-1 md:grid-cols-3">
                                <div className="md:col-span-2 p-8">
                                    <h3 className="font-headline text-2xl font-bold mb-4">Professional Capstone Project</h3>
                                    <ul className="space-y-3 mb-6 list-disc pl-5">
                                        <li>Work in a group on a professional project.</li>
                                        <li>Elicit and justify project requirements, research, design and evaluate a solution, and communicate results of the project.</li>
                                        <li>Demonstrate an understanding of the professional practice and ethical considerations.</li>
                                    </ul>
                                    <p className="text-muted-foreground mb-6">
                                        Experience both a coursework and a work-related opportunity that includes interaction and feedback with industry.
                                    </p>
                                    <Card className="bg-primary/10 border-primary/20">
                                        <CardContent className="p-4">
                                            <p className="font-semibold text-primary">
                                                Guaranteed work-related opportunity is approx. 6 months duration and may be unpaid.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="bg-blue-900 text-white p-8">
                                     <h3 className="font-headline text-2xl font-bold mb-4 text-white">Industry Partners</h3>
                                     <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-6">
                                        {industryPartners.map(partner => (
                                            <p key={partner}>{partner}</p>
                                        ))}
                                     </div>
                                      <div className="bg-white text-blue-900 rounded-lg p-4">
                                        <h4 className="font-bold text-lg">Post-graduate placement</h4>
                                        <p>Placement Interviews with industry partners guaranteed.</p>
                                     </div>
                                </div>
                           </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
            {/* Programs Offered Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Available Programs at UOW India</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Choose from a range of graduate and postgraduate programs in Computing and FinTech.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {uowPrograms.map((program) => (
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
                                            <Link href="/admissions/uow-india/apply">Apply Now</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
            {/* Scholarships Section */}
            <section className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Scholarships & Financial Aid for UOW India</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            UOW India is committed to making education accessible. Explore the scholarships available for eligible students.
                        </p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {scholarships.map((scholarship) => {
                            const Icon = icons[scholarship.icon];
                            return (
                            <Card key={scholarship.title} className="text-center p-6 flex flex-col items-center shadow-lg dark:bg-black">
                                <div className="flex justify-center mb-4">{Icon && <Icon className="w-10 h-10 text-orange-500"/>}</div>
                                <CardTitle className="font-headline text-xl mb-2">{scholarship.title}</CardTitle>
                                <p className="text-2xl font-bold text-primary mb-3">{scholarship.value}</p>
                                <CardDescription className="text-base flex-grow">{scholarship.description}</CardDescription>
                            </Card>
                        )})}
                    </div>
                </div>
            </section>
            {/* Student Life Section */}
            <section className="py-16 sm:py-24 bg-background">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">Student Life & Resources at UOW India</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                            Experience a supportive and enriching environment that fosters both academic and personal growth.
                        </p>
                    </div>
                    <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {studentLife.map((item) => {
                            const Icon = icons[item.icon];
                            return(
                            <Card key={item.title} className="text-center p-6 dark:bg-slate-dark">
                                <div className="flex justify-center">{Icon && <Icon className="w-8 h-8 text-blue-500"/>}</div>
                                <CardTitle className="mt-4 font-headline text-xl">{item.title}</CardTitle>
                                <CardDescription className="mt-2 text-base">{item.description}</CardDescription>
                            </Card>
                        )})}
                    </div>
                </div>
            </section>
            {/* Why Apply Through Us Section */}
            <section id="apply" className="py-16 sm:py-24 bg-muted/20 dark:bg-slate-dark">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                         <div className="relative h-96 w-full overflow-hidden rounded-lg shadow-xl">
                            <Image
                                src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg"
                                alt="An education consultant from Whiteboard Consultants helping a student with their UOW India application"
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
                                As official partners of UOW India, we provide dedicated, end-to-end support to ensure your application stands out.
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
                                    <Link href="/admissions/uow-india/apply">Apply Now for UOW</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href="https://www.uow.edu.au/india/courses/find-an-agent/" target="_blank">Verify Our Partnership</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="py-16 sm:py-24 bg-background dark:bg-black">
                <CtaSection headline="Ready to Start Your UOW India Journey?" />
            </section>
        </>
    );
}

    