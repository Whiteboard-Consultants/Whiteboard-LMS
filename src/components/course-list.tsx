
'use client';

import type { Course, CourseCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCard } from "./course-card";
import { getCourses } from "@/lib/supabase-data";
import { useEffect, useState } from "react";
import { convertToDate } from "@/lib/date-utils";
import { mapCategoryForDatabase, type CategoryKey } from "@/lib/course-categories";

interface CourseListProps {
  courses?: Course[];
  searchTerm?: string;
  category?: CategoryKey | CategoryKey[];
  excludeIds?: string[];
}

export function CourseList({ courses: initialCourses, searchTerm, category, excludeIds }: CourseListProps) {
    const [courses, setCourses] = useState<Course[] | undefined>(initialCourses);
    const [loading, setLoading] = useState(!initialCourses);

    useEffect(() => {
        const fetchAndSetCourses = async () => {
            if (!initialCourses) {
                setLoading(true);
                // Convert category to database format using helper function
                const categoryParam = Array.isArray(category) 
                    ? mapCategoryForDatabase(category[0])
                    : mapCategoryForDatabase(category || 'All Programs');
                    
                const fetchedCourses = await getCourses({ searchTerm, category: categoryParam, excludeIds });
                setCourses(fetchedCourses);
                setLoading(false);
            } else {
                 setCourses(initialCourses);
                 setLoading(false);
            }
        };
        fetchAndSetCourses();
    }, [initialCourses, searchTerm, category, excludeIds]);

    if (loading) {
        return <CourseListSkeleton />;
    }

    if (!courses || courses.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
                <div className="flex flex-col items-center gap-2">
                    <h3 className="text-xl font-bold tracking-tight">No Courses Found</h3>
                    <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filter criteria.
                    </p>
                </div>
            </div>
        );
    }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {courses.map((course) => {
        const plainCourse = {
          ...course,
          createdAt: (() => {
            const date = convertToDate(course.createdAt);
            return date ? date.toISOString() : course.createdAt;
          })(),
        };
        return <CourseCard key={course.id} course={plainCourse} context="listing" />;
      })}
    </div>
  );
}

export function CourseListSkeleton() {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden shadow-lg">
                <div className="relative h-48 w-full bg-muted animate-pulse"></div>
                <CardContent className="p-4">
                    <div className="h-5 w-3/4 bg-muted animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-muted animate-pulse mb-4"></div>
                    <div className="flex items-center justify-between">
                        <div className="h-4 w-1/4 bg-muted animate-pulse"></div>
                        <div className="h-4 w-1/4 bg-muted animate-pulse"></div>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    );
}
