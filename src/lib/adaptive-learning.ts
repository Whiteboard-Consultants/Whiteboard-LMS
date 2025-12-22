/**
 * Adaptive Learning Service
 * Personalizes learning paths based on student performance and learning patterns
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface AdaptiveRecommendation {
  nextLessonId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reason: string;
  estimatedTime: number;
  relatedSkills: string[];
}

export interface LearningAnalytics {
  averageQuizScore: number;
  completionRate: number;
  learningPace: 'slow' | 'normal' | 'fast';
  strongSkills: string[];
  weakSkills: string[];
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Analyze student's learning pattern and performance
 */
export async function analyzeLearnerProfile(userId: string): Promise<LearningAnalytics> {
  try {
    // Get quiz performance
    const { data: quizAttempts, error: quizError } = await supabase
      .from('quiz_attempts')
      .select('score, total_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Get skill proficiency
    const { data: skills, error: skillsError } = await supabase
      .from('user_skills')
      .select('proficiency_level, mastery_percentage, skills(name, category)')
      .eq('user_id', userId);

    // Get lesson completion stats
    const { data: completedLessons, error: lessonsError } = await supabase
      .from('lesson_segments')
      .select('id, time_spent')
      .eq('user_id', userId)
      .eq('is_completed', true);

    // Get total lessons
    const { data: totalLessons, error: totalError } = await supabase
      .from('lesson_segments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    // Calculate metrics
    const averageQuizScore = calculateAverageScore(quizAttempts || []);
    const completionRate = calculateCompletionRate(completedLessons || [], totalLessons || []);
    const learningPace = calculateLearningPace(completedLessons || []);
    const { strongSkills, weakSkills } = analyzeSkillProficiency(skills || []);
    const recommendedDifficulty = determineOptimalDifficulty(averageQuizScore, completionRate);

    return {
      averageQuizScore,
      completionRate,
      learningPace,
      strongSkills,
      weakSkills,
      recommendedDifficulty,
    };
  } catch (error) {
    console.error('Error analyzing learner profile:', error);
    return {
      averageQuizScore: 0,
      completionRate: 0,
      learningPace: 'normal',
      strongSkills: [],
      weakSkills: [],
      recommendedDifficulty: 'beginner',
    };
  }
}

/**
 * Get the next recommended lesson for a student
 */
export async function getNextRecommendedLesson(
  userId: string,
  courseId?: string
): Promise<AdaptiveRecommendation | null> {
  try {
    // Analyze learner profile
    const learnerProfile = await analyzeLearnerProfile(userId);

    // Get next incomplete lesson in course/curriculum
    const query = supabase
      .from('lessons')
      .select('id, title, difficulty, duration_minutes, skills(*)')
      .eq('is_published', true);

    if (courseId) {
      query.eq('course_id', courseId);
    }

    // Filter by difficulty preference
    const difficultyFilter = getDifficultyRange(learnerProfile.recommendedDifficulty);
    query.in('difficulty', difficultyFilter);

    const { data: availableLessons, error } = await query;

    if (error || !availableLessons || availableLessons.length === 0) {
      return null;
    }

    // Get lessons the user hasn't completed
    const { data: completedLessons } = await supabase
      .from('lesson_segments')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true);

    const completedIds = new Set(completedLessons?.map((l: any) => l.lesson_id) || []);
    const uncompletedLessons = availableLessons.filter((l: any) => !completedIds.has(l.id));

    if (uncompletedLessons.length === 0) {
      return null;
    }

    // Score lessons based on relevance to weak skills and user's profile
    const scoredLessons = scoreAndRankLessons(
      uncompletedLessons,
      learnerProfile.weakSkills,
      learnerProfile.recommendedDifficulty
    );

    const recommendedLesson = scoredLessons[0];

    if (!recommendedLesson) {
      return null;
    }

    return {
      nextLessonId: recommendedLesson.lesson.id,
      difficulty: recommendedLesson.lesson.difficulty,
      reason: recommendedLesson.reason,
      estimatedTime: recommendedLesson.lesson.duration_minutes,
      relatedSkills: recommendedLesson.lesson.skills?.map((s: any) => s.name) || [],
    };
  } catch (error) {
    console.error('Error getting next recommended lesson:', error);
    return null;
  }
}

/**
 * Recommend lesson difficulty based on performance
 */
export async function recommendLessonDifficulty(userId: string): Promise<'beginner' | 'intermediate' | 'advanced' | 'expert'> {
  try {
    const profile = await analyzeLearnerProfile(userId);
    return profile.recommendedDifficulty;
  } catch (error) {
    console.error('Error recommending difficulty:', error);
    return 'intermediate';
  }
}

/**
 * Adjust learning path based on quiz performance
 */
export async function adjustLearningPath(
  userId: string,
  quizId: string,
  score: number,
  totalScore: number
): Promise<{
  adjustmentMade: boolean;
  recommendation: string;
  newDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}> {
  try {
    const percentage = (score / totalScore) * 100;

    let recommendation = '';
    let adjustmentMade = false;
    let newDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'intermediate';

    if (percentage >= 90) {
      recommendation = 'Excellent! You\'re ready for more challenging content.';
      newDifficulty = 'advanced';
      adjustmentMade = true;
    } else if (percentage >= 75) {
      recommendation = 'Great! Continue with similar difficulty level.';
      newDifficulty = 'intermediate';
    } else if (percentage >= 60) {
      recommendation = 'Good effort! Consider reviewing this topic before moving on.';
      newDifficulty = 'beginner';
    } else {
      recommendation = 'This is challenging - let\'s work on the fundamentals first.';
      newDifficulty = 'beginner';
      adjustmentMade = true;
    }

    // Get associated skill and update if needed
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('lesson_id')
      .eq('id', quizId)
      .single();

    if (quiz) {
      // Log adjustment for future analysis
      await logLearningPathAdjustment(userId, quiz.lesson_id, percentage, newDifficulty);
    }

    return {
      adjustmentMade,
      recommendation,
      newDifficulty,
    };
  } catch (error) {
    console.error('Error adjusting learning path:', error);
    return {
      adjustmentMade: false,
      recommendation: 'Continue with your current pace.',
      newDifficulty: 'intermediate',
    };
  }
}

/**
 * Get personalized learning recommendations
 */
export async function getPersonalizedRecommendations(userId: string) {
  try {
    const profile = await analyzeLearnerProfile(userId);
    const nextLesson = await getNextRecommendedLesson(userId);

    // Identify skills to focus on
    const skillRecommendations = profile.weakSkills.map(skill => ({
      skill,
      priority: 'high' as const,
      reason: 'This skill needs improvement for better performance',
    }));

    // Check if student should take a break or accelerate
    const paceRecommendation = getPaceRecommendation(profile.learningPace, profile.completionRate);

    return {
      nextLessonRecommendation: nextLesson,
      skillFocus: skillRecommendations,
      paceRecommendation,
      learnerProfile: profile,
      daysSinceActivity: await getDaysSinceLastActivity(userId),
    };
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return null;
  }
}

/**
 * Get learning progress insights
 */
export async function getLearningProgressInsights(userId: string) {
  try {
    const profile = await analyzeLearnerProfile(userId);
    
    // Calculate improvement over time
    const { data: recentQuizzes } = await supabase
      .from('quiz_attempts')
      .select('score, total_score, created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: true });

    const improvementTrend = calculateImprovementTrend(recentQuizzes || []);

    return {
      currentProfile: profile,
      improvementTrend,
      insights: generateInsights(profile, improvementTrend),
    };
  } catch (error) {
    console.error('Error getting learning insights:', error);
    return null;
  }
}

// ============= Helper Functions =============

function calculateAverageScore(quizAttempts: any[]): number {
  if (!quizAttempts || quizAttempts.length === 0) return 0;
  const total = quizAttempts.reduce((sum, attempt) => {
    return sum + (attempt.score / attempt.total_score) * 100;
  }, 0);
  return Math.round(total / quizAttempts.length);
}

function calculateCompletionRate(
  completedLessons: any[] | null,
  totalLessons: any[] | null
): number {
  if (!totalLessons || totalLessons.length === 0) return 0;
  const completed = completedLessons?.length || 0;
  return Math.round((completed / totalLessons.length) * 100);
}

function calculateLearningPace(completedLessons: any[] | null): 'slow' | 'normal' | 'fast' {
  if (!completedLessons || completedLessons.length === 0) return 'normal';
  
  // Count lessons completed in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentLessons = completedLessons.filter((l: any) => 
    new Date(l.completed_at) > sevenDaysAgo
  ).length;

  if (recentLessons >= 10) return 'fast';
  if (recentLessons >= 5) return 'normal';
  return 'slow';
}

function analyzeSkillProficiency(skills: any[]): { strongSkills: string[]; weakSkills: string[] } {
  const strong: string[] = [];
  const weak: string[] = [];

  if (!skills) return { strongSkills: strong, weakSkills: weak };

  skills.forEach(skill => {
    if (skill.mastery_percentage >= 80) {
      strong.push((skill.skills as any)?.name || 'Unknown');
    } else if (skill.mastery_percentage < 50) {
      weak.push((skill.skills as any)?.name || 'Unknown');
    }
  });

  return { strongSkills: strong, weakSkills: weak };
}

function determineOptimalDifficulty(
  avgScore: number,
  completionRate: number
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  if (avgScore >= 90 && completionRate >= 80) return 'advanced';
  if (avgScore >= 80 && completionRate >= 60) return 'intermediate';
  if (avgScore >= 60) return 'beginner';
  return 'beginner';
}

function getDifficultyRange(difficulty: string): string[] {
  switch (difficulty) {
    case 'expert':
      return ['expert', 'advanced'];
    case 'advanced':
      return ['advanced', 'intermediate'];
    case 'intermediate':
      return ['intermediate', 'beginner', 'advanced'];
    case 'beginner':
    default:
      return ['beginner', 'intermediate'];
  }
}

function scoreAndRankLessons(
  lessons: any[],
  weakSkills: string[],
  recommendedDifficulty: string
): Array<{ lesson: any; score: number; reason: string }> {
  return lessons
    .map(lesson => {
      let score = 0;
      let reason = '';

      // Score based on difficulty match
      const difficultyBonus = lesson.difficulty === recommendedDifficulty ? 20 : 0;

      // Score based on relevance to weak skills
      const relatedToWeakSkills = lesson.skills?.some((s: any) =>
        weakSkills.includes(s.name)
      ) ? 30 : 0;

      if (relatedToWeakSkills > 0) {
        reason = 'Addresses skills you need to improve';
      } else {
        reason = 'Recommended based on your learning level';
      }

      score = difficultyBonus + relatedToWeakSkills + Math.random() * 10;

      return { lesson, score, reason };
    })
    .sort((a, b) => b.score - a.score);
}

async function logLearningPathAdjustment(
  userId: string,
  lessonId: string,
  performanceScore: number,
  recommendedDifficulty: string
): Promise<void> {
  try {
    // Store adjustment in a hypothetical learning_adjustments table for future analysis
    // This can be implemented later as a comprehensive audit trail
    console.log(`Learning path adjusted for user ${userId}: difficulty -> ${recommendedDifficulty}`);
  } catch (error) {
    console.error('Error logging adjustment:', error);
  }
}

function getPaceRecommendation(
  pace: 'slow' | 'normal' | 'fast',
  completionRate: number
): string {
  if (pace === 'fast' && completionRate >= 80) {
    return 'You\'re progressing very well! Consider taking on more challenging topics.';
  }
  if (pace === 'slow' && completionRate < 30) {
    return 'Try to dedicate more time to learning. Even 15 minutes daily helps build momentum!';
  }
  return 'You\'re on a good pace. Keep up the consistent effort!';
}

async function getDaysSinceLastActivity(userId: string): Promise<number> {
  try {
    const { data } = await supabase
      .from('lesson_segments')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) return 0;

    const lastActivity = new Date(data.completed_at);
    const today = new Date();
    const diffTime = today.getTime() - lastActivity.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
}

function calculateImprovementTrend(quizzes: any[]): {
  trend: 'improving' | 'declining' | 'stable';
  percentageChange: number;
} {
  if (!quizzes || quizzes.length < 2) {
    return { trend: 'stable', percentageChange: 0 };
  }

  const midpoint = Math.floor(quizzes.length / 2);
  const firstHalf = quizzes.slice(0, midpoint);
  const secondHalf = quizzes.slice(midpoint);

  const firstHalfAvg = calculateAverageScore(firstHalf);
  const secondHalfAvg = calculateAverageScore(secondHalf);

  const percentageChange = secondHalfAvg - firstHalfAvg;
  let trend: 'improving' | 'declining' | 'stable' = 'stable';

  if (percentageChange > 5) trend = 'improving';
  if (percentageChange < -5) trend = 'declining';

  return { trend, percentageChange: Math.round(percentageChange) };
}

function generateInsights(
  profile: LearningAnalytics,
  trend: { trend: string; percentageChange: number }
): string[] {
  const insights: string[] = [];

  if (trend.trend === 'improving') {
    insights.push('📈 Great progress! Your scores are improving.');
  } else if (trend.trend === 'declining') {
    insights.push('📉 Your scores are decreasing. Consider reviewing recent topics.');
  }

  if (profile.strongSkills.length >= 2) {
    insights.push(`💪 You excel at: ${profile.strongSkills.join(', ')}`);
  }

  if (profile.weakSkills.length >= 1) {
    insights.push(`🎯 Focus areas: ${profile.weakSkills.join(', ')}`);
  }

  if (profile.learningPace === 'fast') {
    insights.push('⚡ You\'re progressing quickly! Challenge yourself with advanced topics.');
  }

  if (profile.completionRate >= 75) {
    insights.push('🏆 Excellent completion rate. You\'re on track!');
  }

  return insights;
}
