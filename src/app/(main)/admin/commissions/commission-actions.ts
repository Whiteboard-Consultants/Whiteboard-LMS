'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface CommissionRate {
  id: string;
  level: 'platform' | 'instructor' | 'course';
  instructor_id?: string;
  course_id?: string;
  commission_percentage: number;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Get commission rate for a specific instructor and/or course
export async function getCommissionRate(instructorId: string, courseId?: string) {
  try {
    // Priority: course-level > instructor-level > platform-level
    
    // 1. Check for course-specific rate
    if (courseId) {
      const { data, error } = await supabaseAdmin
        .from('commission_rates')
        .select('*')
        .eq('level', 'course')
        .eq('course_id', courseId)
        .single();

      if (data && !error) {
        return {
          success: true,
          data: data as CommissionRate,
          error: null
        };
      }
    }

    // 2. Check for instructor-specific rate
    const { data: instructorRate, error: instructorError } = await supabaseAdmin
      .from('commission_rates')
      .select('*')
      .eq('level', 'instructor')
      .eq('instructor_id', instructorId)
      .single();

    if (instructorRate && !instructorError) {
      return {
        success: true,
        data: instructorRate as CommissionRate,
        error: null
      };
    }

    // 3. Fall back to platform-level rate
    const { data: platformRate, error: platformError } = await supabaseAdmin
      .from('commission_rates')
      .select('*')
      .eq('level', 'platform')
      .single();

    if (platformRate && !platformError) {
      return {
        success: true,
        data: platformRate as CommissionRate,
        error: null
      };
    }

    // 4. If no rate found, return error (shouldn't happen with default)
    return {
      success: false,
      data: null,
      error: 'No commission rate found'
    };
  } catch (error) {
    console.error('Error fetching commission rate:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get all commission rates (for admin management)
export async function getAllCommissionRates() {
  try {
    const { data, error } = await supabaseAdmin
      .from('commission_rates')
      .select('*')
      .order('level', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching commission rates:', error);
      return {
        success: false,
        data: null,
        error: `Failed to fetch commission rates: ${error.message}`
      };
    }

    return {
      success: true,
      data: (data || []) as CommissionRate[],
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching commission rates:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Create or update a commission rate (admin only)
export async function saveCommissionRate(
  level: 'platform' | 'instructor' | 'course',
  commissionPercentage: number,
  instructorId?: string,
  courseId?: string,
  description?: string
) {
  try {
    // Validate input
    if (commissionPercentage < 0 || commissionPercentage > 100) {
      return {
        success: false,
        data: null,
        error: 'Commission percentage must be between 0 and 100'
      };
    }

    // Check if rate already exists
    let query = supabaseAdmin
      .from('commission_rates')
      .select('id')
      .eq('level', level);

    if (level === 'instructor' && instructorId) {
      query = query.eq('instructor_id', instructorId);
    } else if (level === 'course' && courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: existingRate, error: checkError } = await query.single();

    if (existingRate && !checkError) {
      // Update existing rate
      const { data, error } = await supabaseAdmin
        .from('commission_rates')
        .update({
          commission_percentage: commissionPercentage,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRate.id)
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: `Failed to update commission rate: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as CommissionRate,
        error: null
      };
    } else {
      // Create new rate
      const { data, error } = await supabaseAdmin
        .from('commission_rates')
        .insert({
          level,
          commission_percentage: commissionPercentage,
          instructor_id: level === 'instructor' ? instructorId : null,
          course_id: level === 'course' ? courseId : null,
          description
        })
        .select()
        .single();

      if (error) {
        return {
          success: false,
          data: null,
          error: `Failed to create commission rate: ${error.message}`
        };
      }

      return {
        success: true,
        data: data as CommissionRate,
        error: null
      };
    }
  } catch (error) {
    console.error('Unexpected error saving commission rate:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Delete a commission rate (admin only)
export async function deleteCommissionRate(rateId: string) {
  try {
    // Prevent deleting the platform default rate
    const { data: rate, error: fetchError } = await supabaseAdmin
      .from('commission_rates')
      .select('level')
      .eq('id', rateId)
      .single();

    if (rate?.level === 'platform') {
      return {
        success: false,
        data: null,
        error: 'Cannot delete the platform default commission rate'
      };
    }

    const { error } = await supabaseAdmin
      .from('commission_rates')
      .delete()
      .eq('id', rateId);

    if (error) {
      return {
        success: false,
        data: null,
        error: `Failed to delete commission rate: ${error.message}`
      };
    }

    return {
      success: true,
      data: null,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error deleting commission rate:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get all instructors (for admin dropdown selection)
export async function getAllInstructors() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('role', 'instructor')
      .order('name');

    if (error) {
      console.error('Error fetching instructors:', error);
      return {
        success: false,
        data: null,
        error: `Failed to fetch instructors: ${error.message}`
      };
    }

    return {
      success: true,
      data: (data || []) as Array<{ id: string; name: string; email: string }>,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching instructors:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get all courses (for admin dropdown selection)
export async function getAllCourses() {
  try {
    const { data, error } = await supabaseAdmin
      .from('courses')
      .select('id, title, instructor_id')
      .order('title');

    if (error) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        data: null,
        error: `Failed to fetch courses: ${error.message}`
      };
    }

    return {
      success: true,
      data: (data || []) as Array<{ id: string; title: string; instructor_id: string | null }>,
      error: null
    };
  } catch (error) {
    console.error('Unexpected error fetching courses:', error);
    return {
      success: false,
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
