import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSkills, calculateSkillGaps } from '@/lib/skills-service';

const supabase = createClient(
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
    // Decode JWT to get user ID (without verification, just for reading)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub; // sub is the user ID
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeaders(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Get user skills
    const skillsResult = await getUserSkills(userId);

    if (!skillsResult.success) {
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      );
    }

    // Calculate gaps
    const gapsResult = await calculateSkillGaps(userId);

    return NextResponse.json({
      success: true,
      data: {
        skills: skillsResult.data,
        gaps: gapsResult.data,
        totalSkills: skillsResult.data.length,
        masteredSkills: skillsResult.data.filter(
          (s: any) => s.proficiency_level === 'expert'
        ).length,
        averageMastery: skillsResult.data.length > 0 
          ? Math.round(
              skillsResult.data.reduce((acc: number, s: any) => acc + s.mastery_percentage, 0) /
              skillsResult.data.length
            )
          : 0,
      },
    });
  } catch (error) {
    console.error('Error in skills dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
