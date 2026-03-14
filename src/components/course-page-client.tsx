
'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { CourseCategoryFilter } from "@/components/course-category-filter";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Globe, MessageSquare, Briefcase, Lightbulb, Target, Sparkles } from "lucide-react";
import type { CourseCategory, CourseCategoryData } from '@/types';
import { CourseListSkeleton } from './course-list';
import { ProgramsTable } from './programs-table';
import { useAuth } from '@/hooks/use-auth';
import type { Program } from '@/app/admin/programs-actions';

const iconComponents: { [key: string]: React.ElementType } = {
    Globe,
    MessageSquare,
    Briefcase,
    Lightbulb,
    Target,
    Sparkles,
};

interface CoursesPageClientProps {
    categories: CourseCategoryData[];
    initialCategory: CourseCategory | "All Programs" | "Free Courses";
    children: React.ReactNode;
    programs: Program[];
}

export default function CoursesPageClient({ categories, initialCategory, children, programs }: CoursesPageClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<typeof initialCategory | "Mock Tests">(initialCategory);
    const { userData } = useAuth();
    const isAdmin = userData?.role === 'admin';

    const handleSelectCategory = useCallback((category: string) => {
        // Handle Mock Tests navigation
        if (category === "Mock Tests") {
            router.push('/mock-tests');
            setSelectedCategory("Mock Tests" as const);
            return;
        }
        
        setSelectedCategory(category as CourseCategory | "All Programs" | "Free Courses");
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("category", category);
        const search = current.toString();
        const query = search ? `?${search}` : "";
        router.replace(`${pathname}${query}`, { scroll: false });
    }, [pathname, router, searchParams]);

    const getCategoryColors = (iconName: string) => {
        const colorMap: { [key: string]: { bg: string; border: string; icon: string; accent: string } } = {
            Globe: {
                bg: 'bg-blue-50 dark:bg-blue-950',
                border: 'border-blue-200 dark:border-blue-800',
                icon: 'text-blue-600 dark:text-blue-400',
                accent: 'bg-blue-100 dark:bg-blue-900'
            },
            Lightbulb: {
                bg: 'bg-amber-50 dark:bg-amber-950',
                border: 'border-amber-200 dark:border-amber-800',
                icon: 'text-amber-600 dark:text-amber-400',
                accent: 'bg-amber-100 dark:bg-amber-900'
            },
            Target: {
                bg: 'bg-emerald-50 dark:bg-emerald-950',
                border: 'border-emerald-200 dark:border-emerald-800',
                icon: 'text-emerald-600 dark:text-emerald-400',
                accent: 'bg-emerald-100 dark:bg-emerald-900'
            },
            MessageSquare: {
                bg: 'bg-purple-50 dark:bg-purple-950',
                border: 'border-purple-200 dark:border-purple-800',
                icon: 'text-purple-600 dark:text-purple-400',
                accent: 'bg-purple-100 dark:bg-purple-900'
            },
            Sparkles: {
                bg: 'bg-pink-50 dark:bg-pink-950',
                border: 'border-pink-200 dark:border-pink-800',
                icon: 'text-pink-600 dark:text-pink-400',
                accent: 'bg-pink-100 dark:bg-pink-900'
            },
            Briefcase: {
                bg: 'bg-indigo-50 dark:bg-indigo-950',
                border: 'border-indigo-200 dark:border-indigo-800',
                icon: 'text-indigo-600 dark:text-indigo-400',
                accent: 'bg-indigo-100 dark:bg-indigo-900'
            }
        };
        return colorMap[iconName] || colorMap.Globe; // Default to blue
    };

    const getCategoryIcon = (iconName: string) => {
        const IconComponent = iconComponents[iconName];
        const colors = getCategoryColors(iconName);
        return IconComponent ? <IconComponent className={`h-6 w-6 ${colors.icon}`} /> : null;
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
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6 md:py-12 lg:py-16">
                <div className="flex flex-col items-start space-y-6">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl font-headline leading-tight">
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

            <section className="w-full py-8 md:py-16 bg-background dark:bg-black">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                     <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center font-headline leading-tight">
                        Our Online Course Categories
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground">
                        Specialized online modules designed for your success in test prep and career skills.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {categories && categories.map((category) => {
                        const colors = getCategoryColors(category.icon);
                        return (
                        <div key={category.title} className={`group relative ${colors.bg} rounded-lg border ${colors.border} p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                            <div className="flex flex-col h-full">
                                <div className="mb-4 flex items-start justify-between">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${colors.accent} group-hover:scale-110 transition-transform`}>
                                        {getCategoryIcon(category.icon)}
                                    </div>
                                </div>
                                <CardTitle className="font-headline text-lg mb-2 text-foreground">{category.title}</CardTitle>
                                <p className="text-sm text-muted-foreground mb-4 leading-relaxed flex-grow">{category.description}</p>
                                <div className="space-y-2 pt-2 border-t border-current border-opacity-10">
                                    {category.items.map((item) => (
                                        <div key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="line-clamp-1">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </section>
            
            <section className="w-full py-8 md:py-16 bg-muted dark:bg-slate-dark">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Refund Policy Guarantee Banner - always shown */}
                    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 text-center">
                        <p className="text-sm text-blue-900 dark:text-blue-100">
                            <strong>30-Day Money-Back Guarantee:</strong> If you're not satisfied with any course, we'll refund your full payment within 14 days of enrollment. 
                            <Link href="/refund-policy" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                                Learn more about our refund policy
                            </Link>
                        </p>
                    </div>

                    {/* Category Filter - always shown */}
                    <CourseCategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleSelectCategory}
                        showBatchScheduleTab={true}
                        showMockTestsTab={true}
                    />

                    {/* Conditional content based on selected category */}
                    {selectedCategory === "Mock Tests" ? (
                        <div className="mt-12">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline leading-tight">
                                    Mock Test Series
                                </h2>
                                <p className="text-base md:text-lg text-muted-foreground">
                                    Practice with comprehensive mock tests across multiple topics and difficulty levels
                                </p>
                            </div>
                            {/* Redirect to mock-tests page */}
                            <div className="text-center py-12">
                                <p className="text-muted-foreground mb-4">Redirecting to Mock Tests page...</p>
                            </div>
                        </div>
                    ) : selectedCategory === "Batch Schedule" ? (
                        <div className="mt-12">
                            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-4">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline leading-tight">
                                    Batch Start Schedule
                                </h2>
                                <p className="text-base md:text-lg text-muted-foreground">
                                    View all upcoming batch start dates and enrollment deadlines
                                </p>
                            </div>
                            <ProgramsTable isAdmin={isAdmin} programs={programs} hideBatchTitle={true} />
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-col items-center justify-center space-y-4 text-center my-10">
                                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline leading-tight">
                                    {currentCategoryInfo.fullTitle}
                                </h2>
                                <p className="max-w-[900px] text-base md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-muted-foreground">
                                    {currentCategoryInfo.fullDescription}
                                </p>
                            </div>

                            <div className="mt-8">
                                <Suspense fallback={<CourseListSkeleton />}>
                                   {children}
                                </Suspense>
                            </div>
                        </>
                    )}

                </div>
            </section>
        </div>
    );
}
