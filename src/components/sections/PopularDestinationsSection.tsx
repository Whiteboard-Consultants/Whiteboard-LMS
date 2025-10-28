
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Country } from "@/lib/content";

interface PopularDestinationsSectionProps {
    destinations: Country[];
}

export default function PopularDestinationsSection({ destinations }: PopularDestinationsSectionProps) {
    
    return (
    <section className="py-16 sm:py-24 bg-background dark:bg-slate-dark">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl font-headline">
            Popular Study Destinations
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
            Explore top countries for international education
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {destinations.map((destination) => (
            <Card key={destination.name} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 bg-card text-card-foreground">
              <div className="relative h-56 w-full">
                <Image
                  src={destination.image}
                  alt={`Studying in ${destination.name}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={destination.dataAiHint}
                />
              </div>
              <CardHeader className="p-6">
                <h3 className="font-headline text-2xl font-bold">{destination.name}</h3>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-col flex-grow">
                <div className="space-y-4 text-muted-foreground flex-grow">
                    <div className="flex justify-between items-baseline">
                        <span>Universities:</span>
                        <span className="font-bold text-foreground">{destination.universities}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                        <span>Average Cost:</span>
                        <span className="font-bold text-foreground text-right">{destination.cost}</span>
                    </div>
                     <div className="flex justify-between items-baseline">
                        <span>Popular Intakes:</span>
                        <span className="font-bold text-foreground text-right">{destination.intakes}</span>
                    </div>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="font-semibold text-sm py-2">View Popular Programs</AccordionTrigger>
                        <AccordionContent>
                           <ul className="space-y-2 pt-2">
                                {destination.subjects.map((subject, index) => (
                                    <li key={index}>
                                      <div className="flex items-start text-xs">
                                        <CheckCircle2 className="h-3 w-3 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{typeof subject === 'string' ? subject : subject.name}</span>
                                            {typeof subject === 'object' && subject.description && <p className="text-xs text-muted-foreground mt-1">{subject.description}</p>}
                                        </div>
                                      </div>
                                      {typeof subject === 'object' && subject.subPrograms && (
                                          <ul className="pl-5 mt-1 space-y-1">
                                              {subject.subPrograms.map((sub, subIndex) => (
                                                  <li key={subIndex} className="flex items-center text-xs text-muted-foreground">
                                                      <span className="h-3 w-3 mr-2">-</span>
                                                      <span>{sub}</span>
                                                  </li>
                                              ))}
                                          </ul>
                                      )}
                                    </li>
                                ))}
                            </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                    
                    <div>
                        <h4 className="font-semibold text-foreground mb-2">Key Highlights:</h4>
                        <ul className="space-y-2">
                            {destination.highlights.map((highlight, index) => (
                                <li key={index} className="flex items-center">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="mt-auto pt-6">
                    <Button asChild className="w-full dark:bg-slate-dark dark:text-white dark:border dark:border-white">
                        <Link href={destination.href}>Learn More</Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
