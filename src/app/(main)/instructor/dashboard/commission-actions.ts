'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface InstructorCommissionInfo {
  commissionPercentage: number;
  totalEnrollments: number;
  totalOriginalPrice: number;
  totalEarned: number;
  description: string;
}

export async function getInstructorCommissionInfo(instructorId: string) {
  try {
    // 1. Get instructor's commission rate
    // Check instructor-specific rate first
    const { data: instructorRate } = await supabaseAdmin
      .from('commission_rates')
      .select('commission_percentage')
      .eq('level', 'instructor')
      .eq('instructor_id', instructorId)
      .single();

    let commissionPercentage = instructorRate?.commission_percentage;

    // Fall back to platform default if no instructor-specific rate
    if (!commissionPercentage) {
      const { data: platformRate } = await supabaseAdmin
        .from('commission_rates')
        .select('commission_percentage')
        .eq('level', 'platform')
        .single();

      commissionPercentage = platformRate?.commission_percentage || 20;
    }

    // 2. Get instructor's courses
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, price, original_price')
      .eq('instructor_id', instructorId);

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return {
        success: false,
        error: `Failed to fetch courses: ${coursesError.message}`,
        data: null
      };
    }

    // 3. Get enrollments for those courses
    const courseIds = (courses || []).map(c => c.id);
    if (courseIds.length === 0) {
      return {
        success: true,
        data: {
          commissionPercentage,
          totalEnrollments: 0,
          totalOriginalPrice: 0,
          totalEarned: 0,
          description: `You earn ${commissionPercentage}% commission on course enrollments`
        },
        error: null
      };
    }

    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('*')
      .in('course_id', courseIds);

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        success: false,
        error: `Failed to fetch enrollments: ${enrollmentsError.message}`,
        data: null
      };
    }

    // 4. Calculate total earned
    const totalEnrollments = (enrollments || []).length;
    let totalOriginalPrice = 0;
    let totalEarned = 0;

    if (enrollments && enrollments.length > 0) {
      enrollments.forEach(enrollment => {
        // Use enrolled_original_price if available
        const originalPrice = enrollment.enrolled_original_price || 0;
        totalOriginalPrice += originalPrice;
        const instructorShare = (originalPrice * commissionPercentage) / 100;
        totalEarned += instructorShare;
      });
    }

    return {
      success: true,
      data: {
        commissionPercentage,
        totalEnrollments,
        totalOriginalPrice,
        totalEarned: Math.round(totalEarned * 100) / 100,
        description: `You earn ${commissionPercentage}% commission on course enrollments`
      },
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching instructor commission info:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}

/**
 * Get commission earned within a date range
 */
export async function getCommissionByDateRange(instructorId: string, startDate: Date, endDate: Date) {
  try {
    // 1. Get instructor's commission rate
    const { data: instructorRate } = await supabaseAdmin
      .from('commission_rates')
      .select('commission_percentage')
      .eq('level', 'instructor')
      .eq('instructor_id', instructorId)
      .single();

    let commissionPercentage = instructorRate?.commission_percentage;

    if (!commissionPercentage) {
      const { data: platformRate } = await supabaseAdmin
        .from('commission_rates')
        .select('commission_percentage')
        .eq('level', 'platform')
        .single();

      commissionPercentage = platformRate?.commission_percentage || 20;
    }

    // 2. Get instructor's courses
    const { data: courses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id')
      .eq('instructor_id', instructorId);

    if (coursesError || !courses || courses.length === 0) {
      return {
        success: true,
        data: 0,
        error: null
      };
    }

    // 3. Get enrollments within date range
    const courseIds = courses.map(c => c.id);
    const { data: enrollments, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('enrolled_original_price')
      .in('course_id', courseIds)
      .gte('enrolled_at', startDate.toISOString())
      .lte('enrolled_at', endDate.toISOString());

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        success: false,
        data: 0,
        error: enrollmentsError.message
      };
    }

    // 4. Calculate commission earned
    let totalCommission = 0;
    if (enrollments && enrollments.length > 0) {
      enrollments.forEach(enrollment => {
        const originalPrice = enrollment.enrolled_original_price || 0;
        const commission = (originalPrice * commissionPercentage) / 100;
        totalCommission += commission;
      });
    }

    return {
      success: true,
      data: totalCommission,
      error: null
    };
  } catch (error) {
    console.error('Error fetching commission by date range:', error);
    return {
      success: false,
      data: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
