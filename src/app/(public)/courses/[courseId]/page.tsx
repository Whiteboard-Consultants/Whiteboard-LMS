
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
import { RichTextRenderer } from "@/components/rich-text-renderer";
import { Breadcrumb } from "@/components/breadcrumb";
import { CoursePurchaseCard } from "@/components/course-purchase-card";

// Cache course details for 1 hour - Improves TTFB significantly
export const revalidate = 3600;

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

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://www.whiteboardconsultant.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Courses",
                "item": "https://www.whiteboardconsultant.com/courses"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": course.title,
                "item": `https://www.whiteboardconsultant.com/courses/${course.id}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="bg-background text-foreground">
                <div className="w-full bg-slate-100 dark:bg-slate-dark">
                    <div className="container mx-auto px-4 py-12 md:py-20">
                        <Breadcrumb items={[
                            { name: 'Courses', href: '/courses' },
                            { name: course.title, href: `/courses/${course.id}` }
                        ]} />
                        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                            <div className="order-2 md:order-1">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-headline mb-4">{course.title}</h1>
                                <div className="prose dark:prose-invert max-w-none text-lg text-muted-foreground mb-6">
                                    <RichTextRenderer content={course.description} />
                                </div>
                                <div className="flex items-center mb-6">
                                    <div className="flex items-center gap-1 text-amber-500">
                                        <span className="font-bold text-lg">{course.rating?.toFixed(1) || 'N/A'}</span>
                                        <Star className="h-5 w-5 fill-current" />
                                    </div>
                                    <span className="text-muted-foreground ml-2">({course.ratingCount || 0} ratings)</span>
                                    <span className="text-muted-foreground ml-4 flex items-center gap-1.5">
                                        <Users className="h-5 w-5" /> {course.studentCount} students
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">Created by <Link href={`/instructors/${course.instructor?.id || '#'}`} className="text-primary hover:underline">{course.instructor?.name || 'Unknown Instructor'}</Link></p>
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
                                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                                <RichTextRenderer content={course.programOutcome} />
                                            </div>
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
                                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                                <RichTextRenderer content={course.courseStructure} />
                                            </div>
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
                                            <div className="prose dark:prose-invert max-w-none text-muted-foreground">
                                                <RichTextRenderer content={course.faqs} />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <CoursePurchaseCard course={course} />
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
