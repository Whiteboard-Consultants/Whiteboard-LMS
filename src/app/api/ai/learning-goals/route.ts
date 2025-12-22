import { getLearningGoalsProgress } from '@/lib/ai-learning-paths';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai/learning-goals
 * Get all learning goals and their progress for a student
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

    // Get learning goals and progress
    const goalsData = await getLearningGoalsProgress(userId);

    return NextResponse.json(
      {
        success: true,
        data: {
          goals: goalsData.goals,
          progress: goalsData.progress,
          totalGoals: goalsData.goals.length,
          completedGoals: goalsData.progress.filter((p: any) => p.status === 'completed').length,
          activeGoals: goalsData.progress.filter((p: any) => ['on-track', 'in-progress'].includes(p.status)).length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning goals' },
      { status: 500 }
    );
  }
}
