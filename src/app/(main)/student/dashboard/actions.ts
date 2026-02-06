'use server';

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function getStudentEnrollments(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID required', data: [] };
  }

  try {
    console.log('[SERVER ACTION] getStudentEnrollments called for user:', userId);
    
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['pending', 'approved', 'active', 'completed']);

    if (error) {
      console.error('[SERVER ACTION] Error fetching enrollments:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', enrollments?.length || 0, 'enrollments');
    return { success: true, error: null, data: enrollments || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getStudentEnrollments:', error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function getEnrolledCourses(courseIds: string[]) {
  if (!courseIds || courseIds.length === 0) {
    return { success: true, error: null, data: [] };
  }

  try {
    console.log('[SERVER ACTION] getEnrolledCourses called for', courseIds.length, 'courses');
    
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .in('id', courseIds);

    if (error) {
      console.error('[SERVER ACTION] Error fetching courses:', error);
      return { success: false, error: error.message, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', courses?.length || 0, 'courses');
    return { success: true, error: null, data: courses || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getEnrolledCourses:', error);
    return { success: false, error: String(error), data: [] };
  }
}

export async function getCourseById(courseId: string) {
  if (!courseId) {
    return { success: false, error: 'Course ID required', data: null };
  }

  try {
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error('[SERVER ACTION] Error fetching course:', error);
      return { success: false, error: error.message, data: null };
    }

    console.log('[SERVER ACTION] Successfully fetched course:', courseId);
    return { success: true, error: null, data: course };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getCourseById:', error);
    return { success: false, error: String(error), data: null };
  }
}

export async function getStudentEnrollmentForCourse(userId: string, courseId: string) {
  if (!userId || !courseId) {
    return { success: false, error: 'User ID and Course ID required', data: null };
  }

  try {
    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .in('status', ['pending', 'approved', 'active', 'completed'])
      .single();

    if (error) {
      console.log('[SERVER ACTION] Enrollment not found:', error.message);
      return { success: false, error: 'You are not enrolled in this course.', data: null };
    }

    console.log('[SERVER ACTION] Successfully fetched enrollment for course:', courseId);
    return { success: true, error: null, data: enrollment };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getStudentEnrollmentForCourse:', error);
    return { success: false, error: String(error), data: null };
  }
}

export async function getInstructorData(instructorIds: string[]) {
  if (!instructorIds || instructorIds.length === 0) {
    return {};
  }

  try {
    const { data: instructors, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .in('id', instructorIds);

    if (error) {
      console.error('Error fetching instructor data:', error);
      return {};
    }

    // Convert array to map for easy lookup
    const instructorMap: Record<string, any> = {};
    if (instructors) {
      instructors.forEach(instructor => {
        instructorMap[instructor.id] = instructor;
      });
    }

    return instructorMap;
  } catch (error) {
    console.error('Error in getInstructorData:', error);
    return {};
  }
}

export async function getStudentEnrolledTests(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID required', data: [] };
  }

  try {
    console.log('[SERVER ACTION] getStudentEnrolledTests called for user:', userId);
    
    // Fetch test-related enrollments (individual and series purchases)
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('test_id, series_id, status')
      .eq('user_id', userId)
      .or('purchase_type.eq.individual,purchase_type.eq.series_package')
      .in('status', ['pending', 'approved', 'active', 'completed']);

    if (enrollmentsError) {
      console.error('[SERVER ACTION] Error fetching test enrollments:', enrollmentsError);
      return { success: false, error: enrollmentsError.message, data: [] };
    }

    // Extract test IDs and series IDs
    const testIds = new Set<string>();
    const seriesIds = new Set<string>();
    
    (enrollments || []).forEach(enrollment => {
      if (enrollment.test_id) testIds.add(enrollment.test_id);
      if (enrollment.series_id) seriesIds.add(enrollment.series_id);
    });

    if (testIds.size === 0 && seriesIds.size === 0) {
      console.log('[SERVER ACTION] No test enrollments found');
      return { success: true, error: null, data: [] };
    }

    // Build query - fetch tests that are either directly enrolled or part of an enrolled series
    let query = supabaseAdmin
      .from('tests')
      .select('*');

    // Create OR condition for test IDs and series IDs
    const testIdArray = Array.from(testIds);
    const seriesIdArray = Array.from(seriesIds);
    
    if (testIdArray.length > 0 && seriesIdArray.length > 0) {
      query = query.or(`id.in.(${testIdArray.join(',')}),series_id.in.(${seriesIdArray.join(',')})`);
    } else if (testIdArray.length > 0) {
      query = query.in('id', testIdArray);
    } else if (seriesIdArray.length > 0) {
      query = query.in('series_id', seriesIdArray);
    }

    const { data: tests, error: testsError } = await query.order('created_at', { ascending: false });

    if (testsError) {
      console.error('[SERVER ACTION] Error fetching tests:', testsError);
      return { success: false, error: testsError.message, data: [] };
    }

    console.log('[SERVER ACTION] Successfully fetched', tests?.length || 0, 'tests');
    return { success: true, error: null, data: tests || [] };
  } catch (error) {
    console.error('[SERVER ACTION] Exception in getStudentEnrolledTests:', error);
    return { success: false, error: String(error), data: [] };
  }
}
