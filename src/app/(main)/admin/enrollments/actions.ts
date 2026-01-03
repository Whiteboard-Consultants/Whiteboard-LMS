'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function fetchEnrollmentsByStatus(status: 'pending' | 'approved') {
  try {
    console.log(`[SERVER ACTION] Fetching ${status} enrollments`);
    
    // Fetch enrollments with the specified status
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .eq('status', status);

    if (error) {
      console.error(`[SERVER ACTION] Error fetching ${status} enrollments:`, error);
      return { success: false, error: error.message, data: [] };
    }

    if (!enrollments || enrollments.length === 0) {
      console.log(`[SERVER ACTION] No ${status} enrollments found`);
      return { success: true, error: null, data: [] };
    }

    console.log(`[SERVER ACTION] Fetched ${enrollments.length} ${status} enrollments`);

    // Get unique user IDs and course IDs for batch fetching
    const userIds = Array.from(new Set(enrollments.map(e => e.user_id).filter(Boolean)));
    const courseIds = Array.from(new Set(enrollments.map(e => e.course_id).filter(Boolean)));
    const instructorIds = Array.from(new Set(enrollments.map(e => e.instructor_id).filter(Boolean)));

    // Fetch users data (combine student and instructor IDs)
    const allUserIds = Array.from(new Set([...userIds, ...instructorIds]));
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .in('id', allUserIds);

    // Fetch courses data
    const { data: courses } = await supabaseAdmin
      .from('courses')
      .select('id, title, price')
      .in('id', courseIds);

    // Create lookup maps
    const usersMap = new Map(users?.map(u => [u.id, u]) || []);
    const coursesMap = new Map(courses?.map(c => [c.id, c]) || []);

    // Map database fields to expected interface fields
    const mappedEnrollments = enrollments.map((enrollment: any) => ({
      id: enrollment.id,
      userId: enrollment.user_id,
      courseId: enrollment.course_id,
      instructorId: enrollment.instructor_id,
      progress: enrollment.progress || 0,
      completed: enrollment.completed || false,
      enrolledAt: enrollment.enrolled_at || enrollment.created_at,
      status: enrollment.status,
      paymentId: enrollment.payment_id,
      orderId: enrollment.order_id,
      amount: enrollment.amount,
      purchaseDate: enrollment.purchase_date,
      completedLessons: enrollment.completed_lessons || [],
      certificateStatus: enrollment.certificate_status,
      averageScore: enrollment.average_score,
      couponCode: enrollment.coupon_code,
      // Derived fields from lookups
      studentName: usersMap.get(enrollment.user_id)?.name || 'Unknown Student',
      courseTitle: coursesMap.get(enrollment.course_id)?.title || 'Unknown Course',
      coursePrice: coursesMap.get(enrollment.course_id)?.price || 0,
      instructorName: usersMap.get(enrollment.instructor_id)?.name || 'Unknown Instructor'
    }));

    return { success: true, error: null, data: mappedEnrollments };
  } catch (error) {
    console.error(`[SERVER ACTION] Exception fetching ${status} enrollments:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error', 
      data: [] 
    };
  }
}
