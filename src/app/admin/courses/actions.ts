
'use server';

import { revalidatePath } from 'next/cache';

// TODO: Migrate to Supabase course functionality
export async function deleteCourse(courseId: string, imageUrl: string) {
  try {
    console.log('🗑️ Starting course deletion process for:', courseId);
    
    // Dynamically import Supabase client
    const { createServerSupabaseClient } = await import('@/lib/supabase-server');
    const supabase = await createServerSupabaseClient();
    
    // First, delete all enrollments associated with the course
    console.log('🎓 Deleting enrollments...');
    const { error: enrollmentsError } = await supabase
      .from('enrollments')
      .delete()
      .eq('course_id', courseId);

    if (enrollmentsError) {
      console.error('Failed to delete course enrollments:', enrollmentsError);
      return { success: false, message: `Failed to delete course enrollments: ${enrollmentsError.message}` };
    }
    
    // Second, delete all lessons associated with the course
    console.log('📚 Deleting lessons...');
    const { error: lessonsError } = await supabase
      .from('lessons')
      .delete()
      .eq('course_id', courseId);

    if (lessonsError) {
      console.error('Failed to delete course lessons:', lessonsError);
      return { success: false, message: `Failed to delete course lessons: ${lessonsError.message}` };
    }
    
    // Finally, delete the course from database
    console.log('🎯 Deleting course...');
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error('Failed to delete course:', error);
      return { success: false, message: error.message };
    }

    console.log('✅ Course deleted successfully');
    
    // Optionally, delete associated image from storage if imageUrl is provided
    // TODO: Implement image deletion from Supabase Storage if needed

    revalidatePath('/admin/courses');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting course:', error);
    return { success: false, message: error.message || 'Failed to delete course.' };
  }
}

export async function updateCourseStatus(courseId: string, status: 'draft' | 'published') {
  console.log('updateCourseStatus - TODO: Implement with Supabase');
  revalidatePath('/admin/courses');
  return { success: false, message: 'Course functionality not yet migrated to Supabase' };
}
