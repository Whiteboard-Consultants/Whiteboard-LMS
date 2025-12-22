/**
 * Badge Check & Award Endpoint
 * POST /api/badges/check-and-award
 * 
 * Triggered after significant events (quiz completion, lesson completion)
 * Returns newly awarded badges to the client
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAndAwardBadges } from '@/lib/badges-earning';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Extract user ID from JWT token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid authorization token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Verify token and get user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check and award badges
    const awardedBadges = await checkAndAwardBadges(user.id);

    return NextResponse.json({
      success: true,
      data: {
        awardedBadges,
        count: awardedBadges.length,
      },
    });
  } catch (error: any) {
    console.error('Error in badge check and award:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check and award badges',
      },
      { status: 500 }
    );
  }
}
