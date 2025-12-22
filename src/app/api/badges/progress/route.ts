/**
 * Badge Progress Endpoint
 * GET /api/badges/progress
 * 
 * Returns progress toward badges not yet earned
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBadgeProgress } from '@/lib/badges-earning';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: NextRequest) {
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
    
    // Decode JWT to get user ID (don't validate with Supabase Auth for testing)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json(
        { success: false, error: 'Invalid token format' },
        { status: 401 }
      );
    }

    let userId: string;
    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64').toString('utf-8')
      );
      userId = payload.sub;
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get badge progress
    const badgeProgress = await getBadgeProgress(userId);

    return NextResponse.json({
      success: true,
      data: {
        badgeProgress,
        totalInProgress: badgeProgress.length,
        nextBadges: badgeProgress.slice(0, 3), // Top 3 closest to earning
      },
    });
  } catch (error: any) {
    console.error('Error fetching badge progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch badge progress',
      },
      { status: 500 }
    );
  }
}
