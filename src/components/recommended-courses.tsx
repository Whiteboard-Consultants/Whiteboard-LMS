
'use client';

import { useEffect, useState } from 'react';
import { getCourses } from "@/lib/supabase-data";
import { CourseList } from "@/components/course-list";
import { CourseListSkeleton } from "@/components/course-list";
import type { Course, CourseCategory } from "@/types";

interface RecommendedCoursesProps {
    categories?: CourseCategory[];
    excludeIds?: string[];
}

export function RecommendedCourses({ categories, excludeIds }: RecommendedCoursesProps) {
    const [courses, setCourses] = useState<Course[] | null>(null);

    useEffect(() => {
        const fetchRecommendedCourses = async () => {
            console.log('🔍 RecommendedCourses - categories:', categories);
            console.log('🔍 RecommendedCourses - excludeIds:', excludeIds);
            
            // No categories to fetch for, so fetch general popular courses
            if (!categories || categories.length === 0) {
                 try {
                    const popularCourses = await getCourses({ excludeIds });
                    setCourses(popularCourses);
                } catch (error) {
                    console.error("Failed to fetch popular courses:", error);
                    setCourses([]);
                }
                return;
            }

            try {
                console.log('🔍 RecommendedCourses - Fetching courses for categories:', categories);
                
                // First, let's get all courses to see what's available
                const allAvailableCourses = await getCourses({ excludeIds });
                console.log('🔍 All available courses (excluding enrolled):', allAvailableCourses?.map(c => ({ 
                    id: c.id, 
                    title: c.title, 
                    category: c.category 
                })));

                const coursePromises = categories.map(category => {
                    console.log('🔍 RecommendedCourses - Fetching for category:', category);
                    return getCourses({
                        category: category,
                        excludeIds
                    });
                });

                const coursesByCat = await Promise.all(coursePromises);
                console.log('🔍 RecommendedCourses - Courses by category:', coursesByCat);
                
                const allCourses = coursesByCat.flat();
                console.log('🔍 RecommendedCourses - All courses flattened:', allCourses);
                
                // If no courses found for the specific categories, show some general recommendations
                if (allCourses.length === 0) {
                    console.log('🔍 No courses found for specific categories, showing general recommendations');
                    setCourses(allAvailableCourses?.slice(0, 6) || []);
                } else {
                    // Remove duplicates in case a course belongs to multiple recommended categories
                    const uniqueCourses = Array.from(new Map(allCourses.map(course => [course.id, course])).values());
                    console.log('🔍 RecommendedCourses - Unique courses:', uniqueCourses);
                    setCourses(uniqueCourses);
                }
            } catch (error) {
                console.error("Failed to fetch recommended courses:", error);
                setCourses([]); // Set to empty on error to prevent crash
            }
        };

        fetchRecommendedCourses();
    }, [categories, excludeIds]);

    if (courses === null) {
        return <CourseListSkeleton />;
    }

    return <CourseList courses={courses} />;
}
