
import { getCourse, getCourses } from "@/lib/supabase-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, Clock, Users, IndianRupee, ShoppingCart, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseList } from "@/components/course-list";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";

// Disable static generation during migration
export const dynamic = 'force-dynamic';

type CoursePageProps = {
    params: Promise<{
        courseId: string;
    }>;
};

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map(course => ({ courseId: course.id }));
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const { courseId } = await params;
    const course = await getCourse(courseId);
    if (!course) {
        return {
            title: "Course Not Found",
        };
    }
    return {
        title: `${course.title} | Whiteboard Consultants`,
        description: course.description,
        openGraph: {
            title: course.title,
            description: course.description,
            images: [
                {
                    url: course.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: course.title,
                },
            ],
        },
    };
}

export default async function CoursePage({ params }: CoursePageProps) {
    const { courseId } = await params;
    const course = await getCourse(courseId);

    if (!course) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.title,
        "description": course.description,
        "image": course.imageUrl,
        "provider": {
            "@type": "Organization",
            "name": "Whiteboard Consultants",
            "sameAs": "https://whiteboard-consultants-mock.com/"
        },
        "offers": {
            "@type": "Offer",
            "price": course.price ? course.price.toString() : "0",
            "priceCurrency": "INR",
            "category": course.category
        },
        "aggregateRating": course.rating ? {
            "@type": "AggregateRating",
            "ratingValue": course.rating.toFixed(1),
            "reviewCount": course.studentCount.toString()
        } : undefined,
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="bg-background text-foreground">
                <div className="w-full bg-slate-100 dark:bg-slate-dark">
                    <div className="container mx-auto px-4 py-12 md:py-20">
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline mb-4">{course.title}</h1>
                                <p className="text-lg text-muted-foreground mb-6">{course.description}</p>
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <span className="font-bold text-lg">{course.rating?.toFixed(1) || 'N/A'}</span>
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="text-muted-foreground ml-2">({course.studentCount} ratings)</span>
                                    <span className="text-muted-foreground ml-4 flex items-center gap-1.5">
                                        <Users className="h-5 w-5" /> {course.studentCount} students
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Created by <Link href={`/instructors/${course.instructor.id}`} className="text-primary hover:underline">{course.instructor.name}</Link></p>
                            </div>
                            <div className="order-1 md:order-2 relative group">
                                <div className="aspect-video rounded-lg overflow-hidden shadow-2xl">
                                    <Image
                                        src={course.imageUrl}
                                        alt={course.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-12">
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            {course.programOutcome && (
                                <Accordion type="single" collapsible className="w-full mb-8">
                                    <AccordionItem value="program-outcome">
                                        <AccordionTrigger className="text-2xl font-bold font-headline">
                                            What you will learn
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div 
                                                className="prose max-w-none text-muted-foreground"
                                                dangerouslySetInnerHTML={{ __html: course.programOutcome }}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            {course.courseStructure && (
                                <Accordion type="single" collapsible className="w-full mb-8">
                                    <AccordionItem value="course-structure">
                                        <AccordionTrigger className="text-2xl font-bold font-headline">
                                            Course Content
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div 
                                                className="prose max-w-none text-muted-foreground"
                                                dangerouslySetInnerHTML={{ __html: course.courseStructure }}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}

                            {course.faqs && (
                                <Accordion type="single" collapsible className="w-full mb-8">
                                    <AccordionItem value="faqs">
                                        <AccordionTrigger className="text-2xl font-bold font-headline">
                                            Frequently Asked Questions
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div 
                                                className="prose max-w-none text-muted-foreground"
                                                dangerouslySetInnerHTML={{ __html: course.faqs }}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-3xl font-bold text-primary dark:text-white flex items-center gap-1">
                                            {course.type === 'paid' ? (
                                                <>
                                                <IndianRupee className="h-7 w-7" />
                                                {course.price}
                                                </>
                                            ) : (
                                                'Free'
                                            )}
                                        </div>
                                        {course.originalPrice && course.type === 'paid' && (
                                            <span className="text-lg text-muted-foreground line-through"><IndianRupee className="inline h-4 w-4"/>{course.originalPrice}</span>
                                        )}
                                    </div>
                                    {course.type === 'free' ? (
                                        <Button size="lg" className="w-full mb-2" asChild>
                                            <Link href="/auth/register">
                                                Enroll Now - Free
                                            </Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button size="lg" className="w-full mb-2">
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                Add to Cart
                                            </Button>
                                            <Button size="lg" variant="outline" className="w-full">Buy Now</Button>
                                        </>
                                    )}
                                    <div className="text-xs text-center text-muted-foreground mt-2">30-Day Money-Back Guarantee</div>

                                    <div className="mt-6 space-y-3 text-sm">
                                        <h3 className="font-bold text-md">This course includes:</h3>
                                        {course.duration && <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> <span>{course.duration} on-demand video</span></div>}
                                        {course.hasPracticeTests && <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> <span>Practice tests</span></div>}
                                        <div className="flex items-center gap-2 text-muted-foreground"><Award className="h-4 w-4" /> <span>Certificate of completion</span></div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                <div className="bg-muted/40 dark:bg-slate-dark/40 py-16">
                    <div className="container mx-auto px-4">
                        <h2 className="text-2xl font-bold font-headline mb-8 text-center">You might also like</h2>
                        <CourseList category={[course.category]} excludeIds={[course.id]} />
                    </div>
                </div>
            </div>
        </>
    );
}
