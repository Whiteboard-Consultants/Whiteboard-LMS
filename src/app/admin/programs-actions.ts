'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

export interface Program {
  id: string;
  name: string;
  description?: string;
  start_date?: string;
  last_enrollment_date?: string;
  batch_time?: string;
  created_at: string;
  updated_at: string;
  course_count?: number;
}

/**
 * Get all programs with course counts
 */
export async function getPrograms() {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    // Try to fetch from the view first
    let { data: programs, error } = await supabaseAdmin
      .from('programs_with_courses')
      .select('*')
      .order('created_at', { ascending: false });

    // If view doesn't exist, fall back to fetching from programs table with manual count
    if (error && error.message.includes('relation') || error?.code === 'PGRST116') {
      console.warn('View programs_with_courses not found, falling back to programs table');
      
      const { data: programsData, error: programsError } = await supabaseAdmin
        .from('programs')
        .select('*')
        .order('created_at', { ascending: false });

      if (programsError) {
        console.error('Error fetching programs:', programsError);
        return { success: false, error: programsError.message, data: [] };
      }

      // Get course counts for each program
      const programsWithCounts = await Promise.all(
        (programsData || []).map(async (program) => {
          const { count } = await supabaseAdmin
            .from('courses')
            .select('*', { count: 'exact', head: true })
            .eq('program_id', program.id);
          
          return {
            ...program,
            course_count: count || 0
          };
        })
      );

      return { success: true, data: programsWithCounts, error: null };
    }

    if (error) {
      console.error('Error fetching programs:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: programs || [], error: null };
  } catch (error) {
    console.error('Exception in getPrograms:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch programs', 
      data: [] 
    };
  }
}

/**
 * Get a single program by ID
 */
export async function getProgramById(programId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: null };
    }

    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .select('*')
      .eq('id', programId)
      .single();

    if (error) {
      console.error('Error fetching program:', error);
      return { success: false, error: error.message, data: null };
    }

    return { success: true, data: program, error: null };
  } catch (error) {
    console.error('Exception in getProgramById:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch program', 
      data: null 
    };
  }
}

/**
 * Create a new program
 */
export async function createProgram(programData: {
  name: string;
  description?: string;
  start_date?: string;
  last_enrollment_date?: string;
  batch_time?: string;
}) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: null };
    }

    // Validate required fields
    if (!programData.name?.trim()) {
      return { success: false, error: 'Program name is required', data: null };
    }

    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .insert([
        {
          name: programData.name.trim(),
          description: programData.description?.trim() || null,
          start_date: programData.start_date || null,
          last_enrollment_date: programData.last_enrollment_date || null,
          batch_time: programData.batch_time?.trim() || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating program:', error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data: program,
      message: 'Program created successfully',
      error: null 
    };
  } catch (error) {
    console.error('Exception in createProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create program', 
      data: null 
    };
  }
}

/**
 * Update a program
 */
export async function updateProgram(programId: string, programData: {
  name?: string;
  description?: string;
  start_date?: string;
  last_enrollment_date?: string;
  batch_time?: string;
}) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: null };
    }

    if (!programId) {
      return { success: false, error: 'Program ID is required', data: null };
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (programData.name !== undefined) {
      if (!programData.name.trim()) {
        return { success: false, error: 'Program name cannot be empty', data: null };
      }
      updateData.name = programData.name.trim();
    }

    if (programData.description !== undefined) {
      updateData.description = programData.description?.trim() || null;
    }

    if (programData.start_date !== undefined) {
      updateData.start_date = programData.start_date || null;
    }

    if (programData.last_enrollment_date !== undefined) {
      updateData.last_enrollment_date = programData.last_enrollment_date || null;
    }

    if (programData.batch_time !== undefined) {
      updateData.batch_time = programData.batch_time?.trim() || null;
    }

    const { data: program, error } = await supabaseAdmin
      .from('programs')
      .update(updateData)
      .eq('id', programId)
      .select()
      .single();

    if (error) {
      console.error('Error updating program:', error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data: program,
      message: 'Program updated successfully',
      error: null 
    };
  } catch (error) {
    console.error('Exception in updateProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update program', 
      data: null 
    };
  }
}

/**
 * Delete a program
 */
export async function deleteProgram(programId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!programId) {
      return { success: false, error: 'Program ID is required' };
    }

    const { error } = await supabaseAdmin
      .from('programs')
      .delete()
      .eq('id', programId);

    if (error) {
      console.error('Error deleting program:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true,
      message: 'Program deleted successfully',
      error: null 
    };
  } catch (error) {
    console.error('Exception in deleteProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete program' 
    };
  }
}

/**
 * Link a course to a program
 */
export async function linkCourseToProgram(courseId: string, programId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: null };
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({ program_id: programId })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error linking course to program:', error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data: course,
      message: 'Course linked to program',
      error: null 
    };
  } catch (error) {
    console.error('Exception in linkCourseToProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to link course', 
      data: null 
    };
  }
}

/**
 * Unlink a course from a program
 */
export async function unlinkCourseFromProgram(courseId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: null };
    }

    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .update({ program_id: null })
      .eq('id', courseId)
      .select()
      .single();

    if (error) {
      console.error('Error unlinking course from program:', error);
      return { success: false, error: error.message, data: null };
    }

    return { 
      success: true, 
      data: course,
      message: 'Course unlinked from program',
      error: null 
    };
  } catch (error) {
    console.error('Exception in unlinkCourseFromProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to unlink course', 
      data: null 
    };
  }
}

/**
 * Get courses for a program
 */
export async function getCoursesByProgram(programId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('program_id', programId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses by program:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: courses || [], error: null };
  } catch (error) {
    console.error('Exception in getCoursesByProgram:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch courses', 
      data: [] 
    };
  }
}
/**
 * Get all courses from the database
 */
export async function getAllCourses() {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('id, title')
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching all courses:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: courses || [], error: null };
  } catch (error) {
    console.error('Exception in getAllCourses:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch courses', 
      data: [] 
    };
  }
}