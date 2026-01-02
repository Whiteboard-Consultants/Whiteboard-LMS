'use server';

import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getDashboardStats() {
  try {
    // Fetch all users using service role (bypasses RLS)
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, status');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return {
        success: false,
        error: usersError.message,
        data: null
      };
    }

    const users = usersData || [];
    
    return {
      success: true,
      data: {
        totalUsers: users.length,
        totalInstructors: users.filter(u => u.role === 'instructor').length,
        totalStudents: users.filter(u => u.role === 'student').length,
        pendingApprovals: users.filter(u => u.status === 'pending').length,
        users: users
      }
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
}
