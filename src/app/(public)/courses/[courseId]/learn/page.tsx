import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseOverviewClient } from '@/components/course-overview-client';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { pageMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createServerSupabaseClient();
  
  try {
    const { data: course } = await supabase
      .from('courses')
      .select('title, description')
      .eq('id', courseId)
      .single();

    return pageMetadata({
      title: course?.title ? `Learn ${course.title}` : 'Course Learning',
      description: course?.description || 'Learn with this comprehensive course.',
      path: `/courses/${courseId}/learn`,
      robots: { index: false, follow: false },
    });
  } catch {
    return pageMetadata({
      title: 'Course Learning',
      description: 'Learn with this comprehensive course.',
      path: `/courses/${courseId}/learn`,
      robots: { index: false, follow: false },
    });
  }
}

export default async function CourseLearnPage({ params }: PageProps) {
  const { courseId } = await params;
  const supabase = await createServerSupabaseClient();
  
  // Verify the course exists
  const { data: course, error } = await supabase
    .from('courses')
    .select('id')
    .eq('id', courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  // TODO: Get user session and check enrollment
  // For now, we'll pass undefined for userId
  const userId = undefined;

  return (
    <CourseOverviewClient
      courseId={courseId}
      userId={userId}
    />
  );
}