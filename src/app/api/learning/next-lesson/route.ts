import { getNextRecommendedLesson } from '@/lib/adaptive-learning';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/learning/next-lesson
 * Get the next recommended lesson for a student based on their learning profile
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
    
    // Decode JWT to get user ID (basic decoding, relies on edge runtime to validate)
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

    // Get course ID from query params (optional)
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    // Get next recommended lesson
    const recommendation = await getNextRecommendedLesson(
      userId,
      courseId || undefined
    );

    if (!recommendation) {
      return NextResponse.json(
        {
          success: false,
          message: 'No lesson recommendations available at this time',
          data: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: recommendation,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching next lesson:', error);
    return NextResponse.json(
      { error: 'Failed to fetch next lesson recommendation' },
      { status: 500 }
    );
  }
}
