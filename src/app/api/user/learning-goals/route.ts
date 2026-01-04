import { NextRequest, NextResponse } from 'next/server';
import { getUserLearningGoals } from '@/lib/skills-service';

function getUserIdFromHeaders(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice(7);
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload.sub;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromHeaders(request);
    
    console.log('📚 Learning Goals API called for user:', userId?.substring(0, 8));
    
    if (!userId) {
      console.log('❌ No user ID in request');
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const result = await getUserLearningGoals(userId);

    console.log('📊 Learning goals result:', {
      success: result.success,
      error: result.error,
      count: result.data?.length
    });

    if (!result.success) {
      console.log('⚠️ Learning goals fetch failed, returning empty array');
      // Return empty array instead of error - goals are optional
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Error fetching learning goals:', error);
    // Return empty array instead of 500 error - goals are optional
    return NextResponse.json({
      success: true,
      data: [],
    });
    );
  }
}
