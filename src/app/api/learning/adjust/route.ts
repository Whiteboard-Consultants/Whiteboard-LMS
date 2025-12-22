import { adjustLearningPath } from '@/lib/adaptive-learning';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/learning/adjust
 * Adjust the learning path based on quiz performance
 * Body: { quizId: string, score: number, totalScore: number }
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { quizId, score, totalScore } = body;

    if (!quizId || typeof score !== 'number' || typeof totalScore !== 'number') {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: quizId, score, totalScore' },
        { status: 400 }
      );
    }

    if (totalScore <= 0) {
      return NextResponse.json(
        { error: 'totalScore must be greater than 0' },
        { status: 400 }
      );
    }

    // Adjust learning path
    const result = await adjustLearningPath(userId, quizId, score, totalScore);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adjusting learning path:', error);
    return NextResponse.json(
      { error: 'Failed to adjust learning path' },
      { status: 500 }
    );
  }
}
