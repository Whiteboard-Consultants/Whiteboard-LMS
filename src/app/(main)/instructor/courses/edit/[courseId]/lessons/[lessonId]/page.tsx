
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/page-header';
import type { Lesson } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import dynamic from 'next/dynamic';

const EditLessonForm = dynamic(
  () => import('@/components/edit-lesson-form').then(mod => mod.EditLessonForm),
  {
    ssr: false,
    loading: () => <p>Loading form...</p>
  }
);


export default function EditLessonPage() {
  const params = useParams();
  const router = useRouter();
  const { courseId, lessonId } = params;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData, user } = useAuth();

  // Handle auth state changes (like logout) more aggressively
  useEffect(() => {
    if (user === null && !loading) {
      // User is definitely logged out, redirect immediately
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!lessonId || !courseId || !user) {
      // If user is null (logged out), redirect to login
      if (user === null) {
        router.push('/login');
      }
      return;
    }

    const fetchLesson = async () => {
      try {
        // Fetch lesson from Supabase
        const { data: lesson, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId as string)
          .single();
        if (lessonError || !lesson) {
          setError('Lesson not found.');
          setLoading(false);
          return;
        }
        // Security Check: ensure the lesson belongs to the course
        if (lesson.course_id !== courseId) {
          setError('Lesson does not belong to this course.');
          setLoading(false);
          return;
        }
        // Security Check: ensure current user is instructor of the course
        const { data: course, error: courseError } = await supabase
          .from('courses')
          .select('instructor_id')
          .eq('id', courseId as string)
          .single();
        if (courseError || !course) {
          setError('Course not found.');
          setLoading(false);
          return;
        }
  if (course.instructor_id !== user.id && userData?.role !== 'admin') {
          setError('You are not authorized to edit this lesson.');
          router.push('/instructor/dashboard');
          return;
        }
        setLesson({ ...lesson, courseId: lesson.course_id, parentId: lesson.parent_id, assetUrl: lesson.asset_url, order: lesson.order_number });
      } catch (err) {
        setError('Failed to fetch lesson data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, courseId, user, userData, router]);
  
  const backUrl = `/instructor/courses/edit/${courseId}`;

  return (
    <div>
       <div className="mb-4">
        <Button asChild variant="outline" size="sm">
          <Link href={backUrl}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course Content
          </Link>
        </Button>
      </div>
      <PageHeader
        title={loading ? "Loading Lesson..." : `Edit Lesson: ${lesson?.title}`}
        description="Update the details and content for this lesson."
      />
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 rounded-lg">
        {loading && (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-64 w-full" />
                <div className="flex justify-end">
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>
        )}
        {error && <p className="text-destructive text-center">{error}</p>}
        {!loading && !error && lesson && (
            <EditLessonForm lesson={lesson} />
        )}
      </div>
    </div>
  );
}
