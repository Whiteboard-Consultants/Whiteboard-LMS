import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

function getUserIdFromHeaders(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeaders(request);
    
    console.log('🎓 Skills API called for user:', userId?.substring(0, 8));
    
    if (!userId) {
      console.log('❌ No user ID extracted from headers');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Get user skills using service role (bypasses RLS)
    console.log('📚 Fetching skills from database...');
    const { data, error } = await supabaseAdmin
      .from('user_skills')
      .select(`
        id,
        user_id,
        skill_id,
        proficiency_level,
        mastery_percentage,
        practice_count,
        acquired_at,
        last_practiced_at,
        skills (
          id,
          name,
          category,
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .order('mastery_percentage', { ascending: false });

    console.log('📊 Skills query result:', {
      error: error?.message,
      dataLength: data?.length,
      sample: data?.[0]
    });

    if (error) {
      console.error('❌ Database error:', error.message);
      throw error;
    }

    const mappedSkills = data?.map(item => ({
      ...item.skills,
      proficiency_level: item.proficiency_level,
      mastery_percentage: item.mastery_percentage,
      practice_count: item.practice_count,
      acquired_at: item.acquired_at,
      last_practiced_at: item.last_practiced_at,
    })) || [];

    console.log('✅ Mapped', mappedSkills.length, 'skills');

    return NextResponse.json({
      success: true,
      data: {
        skills: mappedSkills,
        gaps: [],
        totalSkills: mappedSkills.length,
        masteredSkills: mappedSkills.filter(
          (s: any) => s.proficiency_level === 'expert'
        ).length,
        averageMastery: mappedSkills.length > 0 
          ? Math.round(
              mappedSkills.reduce((acc: number, s: any) => acc + s.mastery_percentage, 0) /
              mappedSkills.length
            )
          : 0,
      },
    });
  } catch (error) {
    console.error('❌ Error in skills dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
