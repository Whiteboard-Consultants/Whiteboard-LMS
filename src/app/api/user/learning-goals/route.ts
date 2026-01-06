import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
    
    console.log('📋 Learning Goals API GET called for user:', userId?.substring(0, 8));
    
    if (!userId) {
      console.log('❌ No user ID in request');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_learning_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching learning goals:', error.message);
      throw error;
    }

    console.log('✅ Found', data?.length || 0, 'learning goals');

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error('❌ Error in learning goals GET:', error);
    // Return empty array instead of 500 error - goals are optional
    return NextResponse.json({
      success: true,
      data: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromHeaders(request);
    
    console.log('📋 Learning Goals API POST called for user:', userId?.substring(0, 8));
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { goal_title, goal_description, role_title, target_skills, priority, target_completion_date } = body;

    if (!goal_title) {
      return NextResponse.json(
        { error: 'goal_title is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('user_learning_goals')
      .insert([
        {
          user_id: userId,
          goal_title,
          goal_description,
          role_title,
          target_skills: target_skills || [],
          priority: priority || 1,
          target_completion_date,
          status: 'active',
        }
      ])
      .select();

    if (error) {
      console.error('❌ Error creating learning goal:', error.message);
      throw error;
    }

    console.log('✅ Learning goal created:', data?.[0]?.id);

    return NextResponse.json({
      success: true,
      data: data?.[0],
    });
  } catch (error) {
    console.error('❌ Error in learning goals POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
