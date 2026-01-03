'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function getCommissionReports() {
  try {
    // Fetch all instructors
    const { data: instructorsData, error: instructorsError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
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

    // Fetch all courses
    const { data: coursesData, error: coursesError } = await supabaseAdmin
      .from('courses')
      .select('id, instructor_id, price');

    if (coursesError) {
      console.error('Error fetching courses:', coursesError);
      return {
        success: false,
        error: `Failed to fetch courses: ${coursesError.message}`,
        data: null
      };
    }

    // Fetch all enrollments
    const { data: enrollmentsData, error: enrollmentsError } = await supabaseAdmin
      .from('enrollments')
      .select('id, course_id, instructor_id, enrolled_original_price, payment_status, enrolled_at');

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
      return {
        success: false,
        error: `Failed to fetch enrollments: ${enrollmentsError.message}`,
        data: null
      };
    }

    // Fetch commission rates
    const { data: commissionRatesData, error: commissionRatesError } = await supabaseAdmin
      .from('commission_rates')
      .select('instructor_id, level, commission_percentage');

    if (commissionRatesError) {
      console.error('Error fetching commission rates:', commissionRatesError);
      return {
        success: false,
        error: `Failed to fetch commission rates: ${commissionRatesError.message}`,
        data: null
      };
    }

    // Create maps for quick lookup
    const commissionRateMap = new Map<string | null, number>();
    let platformCommissionRate = 20; // default

    (commissionRatesData || []).forEach(rate => {
      if (rate.level === 'platform') {
        platformCommissionRate = rate.commission_percentage;
      } else if (rate.instructor_id && rate.level === 'instructor') {
        commissionRateMap.set(rate.instructor_id, rate.commission_percentage);
      }
    });

    // Calculate commission for each instructor
    const commissionMap = new Map<string, {
      name: string;
      email: string;
      avatar_url: string | null;
      totalEnrollments: number;
      paidEnrollments: number;
      totalCommission: number;
      commissionPercentage: number;
      courses: number;
    }>();

    (enrollmentsData || []).forEach(enrollment => {
      if (enrollment.instructor_id && enrollment.payment_status === 'paid') {
        const instructorId = enrollment.instructor_id;
        const instructor = instructorsData.find(i => i.id === instructorId);
        
        if (instructor) {
          const commissionPercentage = commissionRateMap.get(instructorId) || platformCommissionRate;
          const enrollmentPrice = enrollment.enrolled_original_price || 0;
          const commission = (enrollmentPrice * commissionPercentage) / 100;

          if (!commissionMap.has(instructorId)) {
            const courseCount = (coursesData || []).filter(c => c.instructor_id === instructorId).length;
            commissionMap.set(instructorId, {
              name: instructor.name || 'Unknown',
              email: instructor.email,
              avatar_url: null,
              totalEnrollments: 0,
              paidEnrollments: 0,
              totalCommission: 0,
              commissionPercentage,
              courses: courseCount
            });
          }

          const existing = commissionMap.get(instructorId)!;
          existing.totalEnrollments += 1;
          existing.paidEnrollments += 1;
          existing.totalCommission += commission;
        }
      }
    });

    // Convert to array and sort by commission
    const reports = Array.from(commissionMap.entries())
      .map(([id, data]) => ({
        id,
        ...data
      }))
      .sort((a, b) => b.totalCommission - a.totalCommission);

    const totalCommissionToPay = reports.reduce((sum, report) => sum + report.totalCommission, 0);

    return {
      success: true,
      error: null,
      data: reports,
      totalCommissionToPay
    };
  } catch (error) {
    console.error('Error in getCommissionReports:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}
