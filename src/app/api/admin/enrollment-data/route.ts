import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const { userIds, courseIds } = await request.json();

    let usersMap: Record<string, any> = {};
    let coursesMap: Record<string, any> = {};

    // Fetch users with service_role (bypasses RLS)
    if (userIds && userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, name, email, phone')
        .in('id', userIds);

      if (usersError) {
        console.error('Error fetching users:', usersError);
        return NextResponse.json(
          { error: `Failed to fetch users: ${usersError.message}` },
          { status: 500 }
        );
      }

      usersMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
    }

    // Fetch courses with service_role (bypasses RLS)
    if (courseIds && courseIds.length > 0) {
      const { data: coursesData, error: coursesError } = await supabaseAdmin
        .from('courses')
        .select('id, title')
        .in('id', courseIds);

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        return NextResponse.json(
          { error: `Failed to fetch courses: ${coursesError.message}` },
          { status: 500 }
        );
      }

      coursesMap = Object.fromEntries((coursesData || []).map(c => [c.id, c]));
    }

    return NextResponse.json({
      users: usersMap,
      courses: coursesMap,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
