
"use client";

import * as React from "react"
import Autoplay from "embla-carousel-autoplay"

import type { TestimonialProps } from "@/components/testimonial-card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { TestimonialCard } from "@/components/testimonial-card";

const testimonials: TestimonialProps[] = [
    {
        name: "Priya Sharma",
        university: "Heidelberg University, Germany",
        quote: "Whiteboard Consultants transformed my dream of studying in Germany into a reality. Their step-by-step guidance on everything from university selection, to APS, visa process was flawless. I felt supported at every stage!",
    },
    {
        name: "Rohan Banerjee",
        university: "University of Glasgow, UK",
        quote: "The study abroad framework promised by Whiteboard Consultants during the 1st interaction, became the game changer for me. Not only the application process was flawless, they helped me to manage my financials, scrutinizing, every transactions and providing solutions.",
    },
    {
        name: "Anika Singh",
        university: "University of Sydney, Australia",
        quote: "Navigating the Australian student visa process seemed daunting, but Whiteboard Consultants made it incredibly simple. Their attention to detail is remarkable. Highly recommended for any aspiring student.",
    },
    {
        name: "Rakesh Agarwala",
        university: "University of Wollongong, GIFT City, India",
        quote: "The support from Whiteboard Consultants was phenomenal. They handled everything from applications to TOEFL, making the entire process stress-free. My journey to UOW, GIFT City, India wouldn't have been possible without them.",
    },
    {
        name: "KISHAN KUMAR SINGH",
        university: "National College, Ireland",
        quote: "The English proficiency Training at Whiteboard Consultants is top-notch! The instructors are experienced and provide tailored guidance to help improve speaking, writing, and overall language skills. The mock tests and interactive sessions helped me score high on my TOEFL exam. Their tips and strategies made all the difference! I’m grateful for their support and highly recommend their services to anyone preparing for TOEFL.",
    },
];

export default function StudyAbroadTestimonials() {
     const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    )
    return (
        <section>
            <div className="container">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter font-headline">Success Stories from Our Students</h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Hear from students who have successfully navigated their path to top global universities with our expert guidance.
                    </p>
                </div>
                <Carousel
                    plugins={[plugin.current]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-6xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-2 h-full">
                                <TestimonialCard {...testimonial} />
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>
            </div>
        </section>
    );
}
