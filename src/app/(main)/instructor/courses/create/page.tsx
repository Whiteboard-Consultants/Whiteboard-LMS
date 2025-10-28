
'use client';

import React from 'react';
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const CourseForm = dynamic(
  () => import('@/components/course-form').then(mod => mod.CourseForm),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="flex justify-end">
            <Skeleton className="h-10 w-24" />
        </div>
      </div>
    )
  }
);

export default function CreateCoursePage() {
    const { userData } = useAuth();
    const backUrl = userData?.role === 'admin' ? '/admin/courses' : '/instructor/courses';

    return (
        <div>
           <div className="mb-4">
            <Button asChild variant="outline" size="sm">
              <Link href={backUrl}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Link>
            </Button>
          </div>
          <PageHeader
            title="Create a New Course"
            description="Fill out the details below to get your course started."
          />
          <div className="max-w-4xl mx-auto">
            <CourseForm />
          </div>
        </div>
      );
}
