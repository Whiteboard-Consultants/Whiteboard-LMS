
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

interface CtaSectionProps {
    headline?: string;
}

export default function CtaSection({ headline }: CtaSectionProps) {
    return (
        <section>
            <div className="container">
                <div className="bg-primary text-primary-foreground dark:bg-slate-dark rounded-lg p-8 md:p-12 mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-6">
                            <h2 className="font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
                                {headline || "Ready to Start Your Journey?"}
                            </h2>
                            <p className="text-lg text-primary-foreground/90 dark:text-slate-300">
                                Get expert guidance for your education and career goals. Our experienced counselors are here to help you every step of the way.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="h-5 w-5 text-primary-foreground dark:text-slate-300" />
                                    <a href="tel:+918583035656" className="text-primary-foreground/90 dark:text-slate-300 hover:text-primary-foreground dark:hover:text-white">+91 85830 35656</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail className="h-5 w-5 text-primary-foreground dark:text-slate-300" />
                                    <a href="mailto:success@whiteboardconsultant.com" className="text-primary-foreground/90 dark:text-slate-300 hover:text-primary-foreground dark:hover:text-white">success@whiteboardconsultant.com</a>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary-foreground dark:text-slate-300" />
                                    <span className="text-primary-foreground/90 dark:text-slate-300">Serving students across India</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right md:flex md:flex-col md:items-end">
                            <Button asChild size="lg" className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                <Link href="/contact">
                                    <>
                                        Schedule Free Consultation
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                </Link>
                            </Button>
                            <p className="mt-4 text-sm text-primary-foreground/90 dark:text-slate-300">
                                Free consultation • Expert guidance • Personalized roadmap
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
