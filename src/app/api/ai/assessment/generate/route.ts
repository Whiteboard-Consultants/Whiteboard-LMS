import { generateAssessment } from '@/lib/ai-learning-paths';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/assessment/generate
 * Generate a customized assessment for a lesson based on student level
 * Body: { lessonId: string, difficulty: 'beginner'|'intermediate'|'advanced'|'expert' }
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
    const { lessonId, difficulty } = body;

    if (!lessonId || !difficulty) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, difficulty' },
        { status: 400 }
      );
    }

    const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    if (!validDifficulties.includes(difficulty)) {
      return NextResponse.json(
        { error: 'Invalid difficulty level' },
        { status: 400 }
      );
    }

    // Generate customized assessment
    const assessment = await generateAssessment(lessonId, userId, difficulty);

    if (!assessment) {
      return NextResponse.json(
        { error: 'Failed to generate assessment' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: assessment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { error: 'Failed to generate assessment' },
      { status: 500 }
    );
  }
}
