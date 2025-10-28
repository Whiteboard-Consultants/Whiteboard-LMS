
'use client';

import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";
import { WhyChooseUsData } from "@/lib/content";

interface WhyChooseUsSectionProps {
    id: string;
    data: WhyChooseUsData;
}

export default function WhyChooseUsSection({ id, data }: WhyChooseUsSectionProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const isTOEFLFeature = (feature: { text: string }) => feature.text.includes("TOEFL");
    
    if (!isClient) {
        return (
            <section id={id} className="py-16 sm:py-24 bg-background dark:bg-black">
                <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <div>
                            <Skeleton className="h-12 w-3/4 mb-4" />
                            <Skeleton className="h-6 w-full mb-8" />
                            <div className="space-y-4">
                                <Skeleton className="h-6 w-5/6" />
                                <Skeleton className="h-6 w-full" />
                                <Skeleton className="h-6 w-4/6" />
                            </div>
                        </div>
                        <Skeleton className="relative h-80 lg:h-96 w-full rounded-lg" />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section id={id} className="py-16 sm:py-24 bg-background dark:bg-black">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                            {data.title}
                        </h2>
                        <p className="mt-4 text-lg text-muted-foreground">
                            {data.description}
                        </p>
                        <ul className="mt-8 space-y-4">
                            {data.features.map((feature, index) => {
                                if (isTOEFLFeature(feature)) {
                                    return (
                                        <Dialog key={index}>
                                            <DialogTrigger asChild>
                                                <li className="flex items-start cursor-pointer hover:text-primary transition-colors">
                                                    <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                                    <span className="hover:underline">{feature.text}</span>
                                                </li>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl">
                                                <DialogHeader className="sr-only">
                                                    <DialogTitle>TOEFL iBT Market Ambassador Certificate</DialogTitle>
                                                    <DialogDescription>An image of the official certificate recognizing Whiteboard Consultants as TOEFL iBT Market Ambassadors.</DialogDescription>
                                                </DialogHeader>
                                                <Image src="/ETS.png" alt="TOEFL iBT Certificate" width={800} height={600} layout="responsive" />
                                            </DialogContent>
                                        </Dialog>
                                    );
                                }
                                return (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-1" />
                                        {feature.href ? (
                                            <Link href={feature.href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                {feature.text}
                                            </Link>
                                        ) : (
                                            <span>{feature.text}</span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="relative h-80 lg:h-96 w-full overflow-hidden rounded-lg shadow-xl">
                        <Image 
                            src={data.image.src}
                            alt={data.image.alt}
                            fill
                            className="object-cover"
                            data-ai-hint={data.image.ai_hint}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
