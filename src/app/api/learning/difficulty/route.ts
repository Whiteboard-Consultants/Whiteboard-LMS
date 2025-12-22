import { recommendLessonDifficulty } from '@/lib/adaptive-learning';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/learning/difficulty
 * Get the recommended lesson difficulty for a student based on their performance
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

    // Get recommended difficulty
    const difficulty = await recommendLessonDifficulty(userId);

    // Get difficulty description
    const descriptions: Record<string, string> = {
      beginner: 'Just starting your learning journey. Perfect for building fundamentals.',
      intermediate: 'You have solid basics. Ready to expand your knowledge.',
      advanced: 'You\'re progressing well. Time to tackle complex topics.',
      expert: 'Master level content. For those seeking deep expertise.',
    };

    return NextResponse.json(
      {
        success: true,
        data: {
          recommendedDifficulty: difficulty,
          description: descriptions[difficulty],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching difficulty recommendation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch difficulty recommendation' },
      { status: 500 }
    );
  }
}
