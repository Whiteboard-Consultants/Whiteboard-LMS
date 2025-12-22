import { generateLearningPath } from '@/lib/ai-learning-paths';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/learning-path/generate
 * Generate an AI-optimized learning path based on a student goal
 * Body: { goalId: string }
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

    const body = await request.json();
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json(
        { error: 'Missing required field: goalId' },
        { status: 400 }
      );
    }

    // Generate optimized learning path
    const path = await generateLearningPath(userId, goalId);

    if (!path) {
      return NextResponse.json(
        { error: 'Failed to generate learning path. Ensure goal and lessons exist.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: path,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path' },
      { status: 500 }
    );
  }
}
