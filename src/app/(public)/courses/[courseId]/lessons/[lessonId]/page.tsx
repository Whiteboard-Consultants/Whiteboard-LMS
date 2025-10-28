import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseLessonPageClient } from '@/components/course-lesson-page-client';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('title')
      .eq('id', lessonId)
      .single();

    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    return {
      title: lesson?.title ? `${lesson.title} - ${course?.title || 'Course'}` : 'Lesson',
      description: `Learn with this lesson from ${course?.title || 'our course'}.`,
    };
  } catch {
    return {
      title: 'Lesson',
      description: 'Learn with this lesson.',
    };
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Verify the lesson exists and belongs to the course
  const { data: lesson, error } = await supabase
    .from('lessons')
    .select('id, course_id')
    .eq('id', lessonId)
    .eq('course_id', courseId)
    .single();

  if (error || !lesson) {
    notFound();
  }

  // TODO: Get user session and check enrollment
  // For now, we'll pass undefined for userId
  const userId = undefined;

  return (
    <CourseLessonPageClient
      courseId={courseId}
      lessonId={lessonId}
      userId={userId}
    />
  );
}