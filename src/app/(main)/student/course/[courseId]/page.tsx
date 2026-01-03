

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Course, Enrollment } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentCourseView } from '@/components/student-course-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getCourseById, getStudentEnrollmentForCourse } from '../../dashboard/actions';

export default function StudentCoursePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }
    
    if (!courseId) {
        setError("Course ID is missing.");
        setLoading(false);
        return;
    }


        const fetchCourseAndEnrollment = async () => {
            try {
                setLoading(true);
                
                // Fetch course using server action
                const courseResult = await getCourseById(courseId);
                if (!courseResult.success || !courseResult.data) {
                    throw new Error('Course not found.');
                }
                setCourse(courseResult.data as Course);

                // Fetch enrollment using server action
                const enrollmentResult = await getStudentEnrollmentForCourse(user.id, courseId);
                if (!enrollmentResult.success) {
                    setError(enrollmentResult.error);
                    setEnrollment(null);
                } else {
                    setEnrollment(enrollmentResult.data as Enrollment);
                    setError(null);
                }
            } catch (e) {
                console.error(e);
                setError('Failed to load course or enrollment data.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseAndEnrollment();

        // No real-time subscription for now (can add Supabase channel if needed)
        return () => {};

  }, [courseId, user, authLoading, router]);

  if (loading) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  if (error) {
    return <p className="text-center text-destructive">{error}</p>;
  }

  if (!course || !enrollment) {
    return <p className="text-center">Could not load course. Please try again.</p>;
  }


  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/student/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
        <StudentCourseView course={course} enrollment={enrollment} />
    </div>
  );
}


