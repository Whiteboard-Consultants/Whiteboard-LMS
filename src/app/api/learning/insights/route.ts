import { getLearningProgressInsights } from '@/lib/adaptive-learning';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/learning/insights
 * Get learning progress insights and personalized recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Decode JWT to get user ID
    const parts = token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    const userId = payload.sub;

    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token payload' },
        { status: 401 }
      );
    }

    // Get learning insights
    const insights = await getLearningProgressInsights(userId);

    if (!insights) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unable to generate insights at this time',
          data: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          profile: insights.currentProfile,
          improvementTrend: insights.improvementTrend,
          insights: insights.insights,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching learning insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning insights' },
      { status: 500 }
    );
  }
}
