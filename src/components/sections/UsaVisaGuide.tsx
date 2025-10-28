
'use client';

import { Card, CardContent } from "../ui/card";

const visaProcessSteps = [
    { 
        title: "Receive Form I-20", 
        description: "After being accepted, your university will send you the Form I-20, which is a certificate of eligibility." 
    },
    { 
        title: "Pay the SEVIS Fee", 
        description: "Pay the I-901 SEVIS (Student and Exchange Visitor Information System) fee online." 
    },
    { 
        title: "Complete DS-160 Form", 
        description: "Fill out the non-immigrant visa application form (DS-160) online and print the confirmation page." 
    },
    { 
        title: "Pay Visa Application Fee", 
        description: "Pay the non-refundable visa application fee (MRV fee)." 
    },
    { 
        title: "Schedule Appointments", 
        description: "Schedule two appointments: one for biometrics (fingerprints and photo) at a VAC, and one for the visa interview at the embassy or consulate." 
    },
    { 
        title: "Attend Biometrics & Interview", 
        description: "Attend your appointments. During the interview, you must demonstrate your intent to return to India after your studies." 
    },
    { 
        title: "Receive Passport & Visa", 
        description: "If approved, your passport with the F-1 visa will be returned to you via courier or pickup." 
    },
];

export default function UsaVisaGuide() {
    return (
        <section className="py-16 sm:py-24 bg-muted dark:bg-slate-dark">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground font-headline sm:text-4xl">
                        F-1 Student Visa Guide
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                        Your step-by-step guide to successfully obtaining your US student visa.
                    </p>
                </div>
                <Card className="dark:bg-black dark:text-white">
                    <CardContent className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {visaProcessSteps.map((step, index) => (
                                <div key={index} className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground dark:text-white/80">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
