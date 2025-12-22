/**
 * Dynamic route for user segment statistics
 * GET /api/users/[userId]/segments/stats
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const getClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

/**
 * GET /api/users/[userId]/segments/stats
 * Get user segment statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;
    const client = getClient();

    // Get all progress records for user
    const { data: progressRecords, error: progressError } = await client
      .from('user_segment_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    if (!progressRecords || progressRecords.length === 0) {
      return NextResponse.json({
        stats: {
          userId,
          totalSegmentsCompleted: 0,
          totalSegmentsStarted: 0,
          averageQuizScore: 0,
          totalTimeSpent: 0,
          averageTimePerSegment: 0,
          lastActivityDate: null,
          completionRate: 0,
        },
      });
    }

    const completedSegments = progressRecords.filter((p) => p.status === 'completed');
    const inProgressSegments = progressRecords.filter((p) => p.status === 'in_progress');

    const totalTimeSpent = progressRecords.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);
    const quizScores = completedSegments
      .map((p) => p.quiz_score)
      .filter((score) => score !== null && score !== undefined) as number[];

    const averageQuizScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length)
        : 0;

    const totalSegmentsStarted = completedSegments.length + inProgressSegments.length;
    const averageTimePerSegment =
      totalSegmentsStarted > 0 ? Math.round(totalTimeSpent / totalSegmentsStarted) : 0;

    // Get last activity
    const sortedByDate = [...progressRecords].sort(
      (a, b) => new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime()
    );
    const lastActivityDate = sortedByDate[0]?.updated_at || null;

    const completionRate =
      totalSegmentsStarted > 0
        ? Math.round((completedSegments.length / totalSegmentsStarted) * 100)
        : 0;

    return NextResponse.json({
      stats: {
        userId,
        totalSegmentsCompleted: completedSegments.length,
        totalSegmentsStarted,
        totalSegmentsInProgress: inProgressSegments.length,
        averageQuizScore,
        totalTimeSpent,
        averageTimePerSegment,
        lastActivityDate,
        completionRate,
      },
    });
  } catch (error) {
    console.error('Error fetching segment stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
