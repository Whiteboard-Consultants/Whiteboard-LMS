
'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CourseCategoryFilter } from "@/components/course-category-filter";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Globe, MessageSquare, Briefcase } from "lucide-react";
import type { CourseCategory, CourseCategoryData } from '@/types';
import { CourseListSkeleton } from './course-list';

const iconComponents: { [key: string]: React.ElementType } = {
    Globe,
    MessageSquare,
    Briefcase,
};

interface CoursesPageClientProps {
    categories: CourseCategoryData[];
    initialCategory: CourseCategory | "All Programs" | "Free Courses";
    children: React.ReactNode;
}

export default function CoursesPageClient({ categories, initialCategory, children }: CoursesPageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);

    const handleSelectCategory = useCallback((category: string) => {
        setSelectedCategory(category as CourseCategory | "All Programs" | "Free Courses");
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("category", category);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.replace(`${pathname}${query}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const getCategoryIcon = (iconName: string) => {
        const IconComponent = iconComponents[iconName];
        return IconComponent ? <IconComponent className="h-6 w-6 text-blue-500" /> : null;
    };
    
    const staticCategoryInfo = {
        "All Programs": {
          fullTitle: "All Online Programs",
          fullDescription: "Explore our full range of online courses designed for your success",
        },
        "Free Courses": {
          fullTitle: "Free Introductory Courses",
          fullDescription: "Get a taste of our teaching quality with these free courses designed to build essential career skills",
        }
    };
    
    let currentCategoryInfo;
    const dynamicInfo = categories && categories.find(c => c.title === selectedCategory);
    
    if (dynamicInfo) {
        currentCategoryInfo = dynamicInfo;
    } else if (selectedCategory === "All Programs" || selectedCategory === "Free Courses") {
        currentCategoryInfo = staticCategoryInfo[selectedCategory];
    } else {
        currentCategoryInfo = staticCategoryInfo["All Programs"];
    }

    return (
        <div>
            <section className="w-full bg-slate-100 dark:bg-slate-dark">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 md:py-24 lg:py-32">
                <div className="flex flex-col items-start space-y-6">
                    <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl lg:text-5xl font-headline">
                        Online Courses to Master <span className="text-primary dark:text-white">Test Preparation & Professional Skills</span>
                    </h1>
                    <div className="max-w-[700px] text-muted-foreground md:text-lg">
                        Advance your career with expert-led online courses from Whiteboard Consultants, the best <Link href="/study-abroad" className="text-primary hover:underline dark:text-white">Test Prep Consultant in Kolkata</Link>. Our comprehensive Learning Management System features courses in TOEFL, IELTS, GMAT, GRE preparation.
                    </div>
                    <div className="pt-4">
                    <Button asChild size="lg" className="dark:bg-black dark:text-white dark:border dark:border-white">
                        <Link href="/register">
                            Register for Courses
                        </Link>
                    </Button>
                    </div>
                </div>
                <div className="flex items-center justify-center">
                    <Image 
                        src="/images/courses/online-course-hero.webp"
                        alt="A person studying for a test prep course with open books and writing in a notebook."
                        width={600}
                        height={450}
                        className="rounded-lg shadow-xl"
                        data-ai-hint="student studying"
                    />
                </div>
                </div>
            </section>

            <section className="w-full py-12 md:py-24 bg-background dark:bg-black">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                     <h2 className="text-3xl font-bold tracking-tight text-center font-headline">
                        Our Online Course Categories
                    </h2>
                    <p className="text-muted-foreground">
                        Specialized online modules designed for your success in test prep and career skills.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories && categories.map((category) => (
                        <Card key={category.title} className="shadow-lg">
                            <CardHeader className="flex flex-row items-center gap-4">
                                {getCategoryIcon(category.icon)}
                                <div>
                                    <CardTitle className="font-headline text-xl">{category.title}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{category.description}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {category.items.map((item) => (
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
            
            <section className="w-full py-12 md:py-24 bg-muted dark:bg-slate-dark">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <CourseCategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                    />
                    
                    <div className="flex flex-col items-center justify-center space-y-4 text-center my-12">
                        <h2 className="text-3xl font-bold tracking-tight font-headline">
                            {currentCategoryInfo.fullTitle}
                        </h2>
                        <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            {currentCategoryInfo.fullDescription}
                        </p>
                    </div>

                    <div className="mt-8">
                        <Suspense fallback={<CourseListSkeleton />}>
                           {children}
                        </Suspense>
                    </div>

                </div>
            </section>
        </div>
    );
}
