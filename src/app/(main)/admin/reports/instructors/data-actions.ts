'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface InstructorReportData {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageRating: number;
  completionRate: number;
  totalRevenue: number;
  activeStudents: number;
  joinedAt: string;
  commissionPercentage: number;
}

export interface InstructorReportsResponse {
  success: boolean;
  data: InstructorReportData[] | null;
  error: string | null;
  totalPlatformRevenue?: number;
}

// Helper function to get commission rate for an instructor
async function getInstructorCommissionRate(instructorId: string): Promise<number> {
  const { data, error } = await supabaseAdmin
    .from('commission_rates')
    .select('commission_percentage')
    .eq('level', 'instructor')
    .eq('instructor_id', instructorId)
    .single();

  if (data && !error) {
    return data.commission_percentage;
  }

  // Fall back to platform default
  const { data: platformRate, error: platformError } = await supabaseAdmin
    .from('commission_rates')
    .select('commission_percentage')
    .eq('level', 'platform')
    .single();

  if (platformRate && !platformError) {
    return platformRate.commission_percentage;
  }

  // Final fallback
  return 20;
}

export async function getInstructorReports() {
  try {
    // 1. Fetch all instructors using service role
    const { data: instructorsData, error: instructorsError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', 'instructor')
      .order('name');

    if (instructorsError) {
      console.error('Error fetching instructors:', instructorsError);
      return {
        success: false,
        error: `Failed to fetch instructors: ${instructorsError.message}`,
        data: null
      };
    }

    if (!instructorsData || instructorsData.length === 0) {
      return {
        success: true,
        error: null,
        data: []
      };
    }

    // 2. Fetch all courses
    const { data: coursesData, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('*');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return {
        success: false,
        error: `Failed to fetch courses: ${coursesError.message}`,
        data: null
      };
    }

    // 3. Fetch all enrollments with pricing information
    const { data: enrollmentsData, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('*');

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        success: false,
        error: `Failed to fetch enrollments: ${enrollmentsError.message}`,
        data: null
      };
    }

    // 4. Process data for each instructor
    const reportData: InstructorReportData[] = await Promise.all(
      instructorsData.map(async (instructor) => {
        // Find courses by this instructor
        const instructorCourses = (coursesData || []).filter(
          course => course.instructor_id === instructor.id
        );

        // Find enrollments for instructor's courses
        const courseIds = instructorCourses.map(course => course.id);
        const instructorEnrollments = (enrollmentsData || []).filter(
          enrollment => courseIds.includes(enrollment.course_id)
        );

        // Get instructor commission rate
        const commissionPercentage = await getInstructorCommissionRate(instructor.id);

        // Calculate metrics
        const totalCourses = instructorCourses.length;
        const totalEnrollments = instructorEnrollments.length;
        const completedEnrollments = instructorEnrollments.filter(
          enrollment => enrollment.completed === true || enrollment.progress === 100
        ).length;
        const completionRate = totalEnrollments > 0 
          ? Math.round((completedEnrollments / totalEnrollments) * 100) 
          : 0;

        // Calculate average rating
        const coursesWithRatings = instructorCourses.filter(course => course.rating && course.rating > 0);
        const averageRating = coursesWithRatings.length > 0
          ? Math.round((coursesWithRatings.reduce((sum, course) => sum + (course.rating || 0), 0) / coursesWithRatings.length) * 10) / 10
          : 0;

        // Calculate total students (unique enrollments)
        const uniqueStudents = new Set(instructorEnrollments.map(e => e.user_id));
        const totalStudents = uniqueStudents.size;

        // Calculate active students (recent activity)
        const activeStudents = instructorEnrollments.filter(
          enrollment => {
            if (!enrollment.last_accessed_at) return false;
            const lastAccess = new Date(enrollment.last_accessed_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return lastAccess > thirtyDaysAgo;
          }
        ).length;

        // Calculate total revenue: Sum of (enrollment original price * commission percentage / 100)
        const totalRevenue = instructorEnrollments.reduce((sum, enrollment) => {
          // Use enrolled_original_price if available (with fallback to enrolled_price, then course original_price)
          const enrollmentPrice = enrollment.enrolled_original_price || 
                                 enrollment.enrolled_price ||
                                 (instructorCourses.find(c => c.id === enrollment.course_id)?.original_price || 0);
          
          // Apply commission percentage
          const instructorShare = (enrollmentPrice * commissionPercentage) / 100;
          return sum + instructorShare;
        }, 0);

        return {
          id: instructor.id,
          name: instructor.name || instructor.email,
          email: instructor.email,
          avatar_url: instructor.avatar_url,
          totalCourses,
          totalStudents,
          totalEnrollments,
          completedEnrollments,
          averageRating,
          completionRate,
          totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals
          activeStudents,
          joinedAt: instructor.createdAt || instructor.created_at,
          commissionPercentage
        };
      })
    );

    // Calculate total platform revenue (sum of all original prices)
    const totalPlatformRevenue = enrollmentsData.reduce((sum, enrollment) => {
      const originalPrice = enrollment.enrolled_original_price || 0;
      return sum + originalPrice;
    }, 0);

    return {
      success: true,
      error: null,
      data: reportData,
      totalPlatformRevenue: Math.round(totalPlatformRevenue * 100) / 100
    };
  } catch (error) {
    console.error('Unexpected error fetching instructor reports:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}
