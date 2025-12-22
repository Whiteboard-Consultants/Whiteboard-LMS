import { optimizeLearningPath } from '@/lib/ai-learning-paths';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/learning-path/optimize
 * Optimize an existing learning path based on new performance data
 * Body: { currentPath: string[] }
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
    const { currentPath } = body;

    if (!Array.isArray(currentPath) || currentPath.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or empty currentPath array' },
        { status: 400 }
      );
    }

    // Optimize the learning path
    const optimization = await optimizeLearningPath(userId, currentPath);

    if (!optimization) {
      return NextResponse.json(
        { error: 'Failed to optimize learning path' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: optimization,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error optimizing learning path:', error);
    return NextResponse.json(
      { error: 'Failed to optimize learning path' },
      { status: 500 }
    );
  }
}
