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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserIdFromHeaders(request);
    const goalId = params.id;

    console.log('📋 Learning Goals API DELETE called for goal:', goalId, 'user:', userId?.substring(0, 8));

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    // First verify the goal belongs to the user
    const { data: goalData, error: getError } = await supabaseAdmin
      .from('user_learning_goals')
      .select('user_id')
      .eq('id', goalId)
      .single();

    if (getError || !goalData) {
      console.error('❌ Goal not found:', getError);
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    if (goalData.user_id !== userId) {
      console.error('❌ Unauthorized: Goal belongs to different user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete the goal
    const { error } = await supabaseAdmin
      .from('user_learning_goals')
      .delete()
      .eq('id', goalId);

    if (error) {
      console.error('❌ Error deleting goal:', error.message);
      throw error;
    }

    console.log('✅ Learning goal deleted:', goalId);

    return NextResponse.json({
      success: true,
      message: 'Goal deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error in DELETE:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
