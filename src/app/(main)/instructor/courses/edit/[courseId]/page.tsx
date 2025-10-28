
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageHeader } from '@/components/page-header';
import type { Course } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';

const CourseForm = dynamic(
  () => import('@/components/course-form').then(mod => mod.CourseForm),
  {
    ssr: false,
    loading: () => <p>Loading form...</p>
  }
);

const CourseContentManager = dynamic(
  () => import('@/components/course-content-manager').then(mod => mod.CourseContentManager),
  {
    ssr: false,
    loading: () => <p>Loading content manager...</p>
  }
);


export default function EditCoursePage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();
  
  useEffect(() => {
    if (!courseId) return;

    const fetchCourse = async () => {
      try {
        console.log('Fetching course:', courseId);
        
        // First, try to get the basic course data
        const { data: courseData, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error('Error fetching course:', error);
          setError('Failed to fetch course data.');
          return;
        }

        if (courseData) {
          // Transform the data to match the Course interface
          const course: Course = {
            id: courseData.id,
            title: courseData.title,
            description: courseData.description,
            instructor: courseData.instructor || { id: courseData.instructor_id, name: 'Unknown' },
            imageUrl: courseData.image_url,
            studentCount: courseData.student_count || 0,
            rating: courseData.rating || 0,
            createdAt: courseData.created_at,
            type: courseData.type,
            price: courseData.price || 0,
            category: courseData.category,
            hasCertificate: courseData.has_certificate || false,
            certificateUrl: courseData.certificate_url || '',
            programOutcome: courseData.program_outcome || '',
            courseStructure: courseData.course_structure || '',
            faqs: courseData.faqs || '',
            duration: courseData.duration || '',
            level: courseData.level || 'Beginner',
            tags: courseData.tags || [],
            lessonCount: courseData.lesson_count || 0,
            finalAssessmentId: courseData.final_assessment_id
          };
          
          console.log('Course loaded:', course);
          setCourse(course);
          setError(null);
        } else {
          setError('Course not found.');
        }
      } catch (err) {
        setError('Failed to fetch course data.');
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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
        title="Edit Course"
        description="Update the details of your course below."
      />
      <div className="max-w-4xl mx-auto space-y-8 bg-muted/40 dark:bg-slate-dark p-4 sm:p-6 md:p-8 rounded-lg">
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
        {!loading && !error && course && (
           <>
             <CourseForm initialData={course} />
             <Separator />
             <CourseContentManager courseId={course.id} />
           </>
        )}
      </div>
    </div>
  );
}
