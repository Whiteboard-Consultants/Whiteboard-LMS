/**
 * Badge Earning Service
 * Handles badge detection, evaluation, and awarding logic
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface BadgeAward {
  badgeId: string;
  userId: string;
  awardedAt: string;
  reason: string;
}

/**
 * Main function to check and award badges for a user
 * Called after significant events (quiz completion, lesson completion, etc.)
 */
export async function checkAndAwardBadges(userId: string): Promise<BadgeAward[]> {
  try {
    const awardedBadges: BadgeAward[] = [];

    // Check all badge conditions
    const quizBadges = await checkQuizMasteryBadges(userId);
    const skillBadges = await checkSkillMasteryBadges(userId);
    const progressBadges = await checkProgressBadges(userId);
    const streakBadges = await checkStreakBadges(userId);

    // Combine all potential badges
    const allPotentialBadges = [
      ...quizBadges,
      ...skillBadges,
      ...progressBadges,
      ...streakBadges,
    ];

    // Award each badge that hasn't been earned yet
    for (const badge of allPotentialBadges) {
      const isAlreadyEarned = await checkBadgeEarned(userId, badge.badgeId);
      if (!isAlreadyEarned) {
        const awarded = await awardBadge(userId, badge.badgeId, badge.reason);
        if (awarded) {
          awardedBadges.push(awarded);
        }
      }
    }

    return awardedBadges;
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return [];
  }
}

/**
 * Award a specific badge to a user
 */
export async function awardBadge(
  userId: string,
  badgeId: string,
  reason: string
): Promise<BadgeAward | null> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
        earned_at: new Date().toISOString(),
        reason: reason,
      })
      .select()
      .single();

    if (error) {
      console.error('Error awarding badge:', error);
      return null;
    }

    return {
      badgeId: data.badge_id,
      userId: data.user_id,
      awardedAt: data.earned_at,
      reason: data.reason,
    };
  } catch (error) {
    console.error('Error in awardBadge:', error);
    return null;
  }
}

/**
 * Check if user has already earned a badge
 */
export async function checkBadgeEarned(userId: string, badgeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    return !error && !!data;
  } catch (error) {
    return false;
  }
}

/**
 * Check quiz/assessment mastery badges
 * - Quiz Master: 3+ quizzes passed
 * - Ace Scorer: 5+ quizzes with 90%+ score
 * - Perfect Score: 1+ quiz with 100% score
 */
async function checkQuizMasteryBadges(userId: string): Promise<Array<{ badgeId: string; reason: string }>> {
  try {
    const badges: Array<{ badgeId: string; reason: string }> = [];

    // Get quiz completion stats
    const { data: quizzes, error } = await supabase
      .from('quiz_attempts')
      .select('score, total_score, passed')
      .eq('user_id', userId)
      .eq('passed', true);

    if (error || !quizzes) {
      return badges;
    }

    const passedQuizzes = quizzes.length;
    const perfectScores = quizzes.filter(q => q.score === q.total_score).length;
    const highScores = quizzes.filter(q => (q.score / q.total_score) * 100 >= 90).length;

    // Quiz Master: 3+ quizzes passed
    if (passedQuizzes >= 3) {
      badges.push({
        badgeId: 'quiz-master',
        reason: `Completed ${passedQuizzes} quizzes successfully`,
      });
    }

    // Ace Scorer: 5+ quizzes with 90%+ score
    if (highScores >= 5) {
      badges.push({
        badgeId: 'ace-scorer',
        reason: `Scored 90% or higher on ${highScores} quizzes`,
      });
    }

    // Perfect Score: 1+ quiz with 100% score
    if (perfectScores >= 1) {
      badges.push({
        badgeId: 'perfect-score',
        reason: `Achieved perfect score on a quiz`,
      });
    }

    return badges;
  } catch (error) {
    console.error('Error checking quiz mastery badges:', error);
    return [];
  }
}

/**
 * Check skill mastery badges
 * - Skill Expert: 1+ skill at expert level
 * - Polymath: 3+ skills at advanced level
 * - Master of All: 5+ skills at advanced+ level
 * - Communication Pro: Speaking & listening at expert
 * - Grammar Guru: Grammar at expert level
 */
async function checkSkillMasteryBadges(userId: string): Promise<Array<{ badgeId: string; reason: string }>> {
  try {
    const badges: Array<{ badgeId: string; reason: string }> = [];

    // Get user skills with proficiency levels
    const { data: userSkills, error } = await supabase
      .from('user_skills')
      .select('skill_id, proficiency_level, skills(name, category)')
      .eq('user_id', userId);

    if (error || !userSkills) {
      return badges;
    }

    const expertSkills = userSkills.filter(s => s.proficiency_level === 'expert');
    const advancedSkills = userSkills.filter(s => ['advanced', 'expert'].includes(s.proficiency_level));

    // Skill Expert: 1+ skill at expert level
    if (expertSkills.length >= 1) {
      const skillName = (expertSkills[0].skills as any)?.name || 'a skill';
      badges.push({
        badgeId: 'skill-expert',
        reason: `Achieved expert level in ${skillName}`,
      });
    }

    // Polymath: 3+ skills at advanced level
    if (advancedSkills.length >= 3) {
      badges.push({
        badgeId: 'polymath',
        reason: `Advanced proficiency in ${advancedSkills.length} different skills`,
      });
    }

    // Master of All: 5+ skills at advanced+ level
    if (advancedSkills.length >= 5) {
      badges.push({
        badgeId: 'master-of-all',
        reason: `Advanced or expert level in ${advancedSkills.length} skills`,
      });
    }

    // Category-specific badges
    const communicationSkills = userSkills.filter(
      s => (s.skills as any)?.category === 'Communication' && 
           ['advanced', 'expert'].includes(s.proficiency_level)
    );
    if (communicationSkills.length >= 2) {
      badges.push({
        badgeId: 'communication-pro',
        reason: 'Expert communication skills across multiple areas',
      });
    }

    const grammarSkills = userSkills.filter(
      s => (s.skills as any)?.name?.toLowerCase().includes('grammar') && 
           s.proficiency_level === 'expert'
    );
    if (grammarSkills.length >= 1) {
      badges.push({
        badgeId: 'grammar-guru',
        reason: 'Achieved expert level in grammar',
      });
    }

    return badges;
  } catch (error) {
    console.error('Error checking skill mastery badges:', error);
    return [];
  }
}

/**
 * Check progress/milestone badges
 * - Quick Learner: 5+ lessons in 7 days
 * - Course Graduate: Complete all lessons in a course
 * - Century Club: 100+ lessons completed
 * - Week Warrior: 10+ lessons in one week
 */
async function checkProgressBadges(userId: string): Promise<Array<{ badgeId: string; reason: string }>> {
  try {
    const badges: Array<{ badgeId: string; reason: string }> = [];

    // Get total lessons completed
    const { data: lessonsCompleted, error: lessonsError } = await supabase
      .from('lesson_segments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (!lessonsError && lessonsCompleted) {
      const completedCount = lessonsCompleted.length;

      // Century Club: 100+ lessons completed
      if (completedCount >= 100) {
        badges.push({
          badgeId: 'century-club',
          reason: `Completed ${completedCount} lessons`,
        });
      }
    }

    // Quick Learner: 5+ lessons in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentLessons, error: recentError } = await supabase
      .from('lesson_segments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completed_at', sevenDaysAgo.toISOString());

    if (!recentError && recentLessons && recentLessons.length >= 5) {
      badges.push({
        badgeId: 'quick-learner',
        reason: `Completed ${recentLessons.length} lessons in the last 7 days`,
      });
    }

    // Course Graduate: Complete all lessons in a course
    const { data: enrolledCourses, error: coursesError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId);

    if (!coursesError && enrolledCourses) {
      for (const enrollment of enrolledCourses) {
        const { data: courseContent } = await supabase
          .from('lessons')
          .select('id', { count: 'exact' })
          .eq('course_id', enrollment.course_id);

        const { data: completedContent } = await supabase
          .from('lesson_segments')
          .select('lessons(id)', { count: 'exact' })
          .eq('user_id', userId)
          .eq('is_completed', true)
          .eq('lessons.course_id', enrollment.course_id);

        if (
          courseContent &&
          completedContent &&
          courseContent.length > 0 &&
          completedContent.length === courseContent.length
        ) {
          badges.push({
            badgeId: 'course-graduate',
            reason: 'Completed all lessons in a course',
          });
          break; // Only award once
        }
      }
    }

    return badges;
  } catch (error) {
    console.error('Error checking progress badges:', error);
    return [];
  }
}

/**
 * Check streak/consistency badges
 * - Consistent Learner: 7-day learning streak
 * - Week Warrior: 10+ lessons in one week
 * - Month Master: 20+ lessons in one month
 */
async function checkStreakBadges(userId: string): Promise<Array<{ badgeId: string; reason: string }>> {
  try {
    const badges: Array<{ badgeId: string; reason: string }> = [];

    // Calculate learning streak (consecutive days with activity)
    const streak = await calculateLearningStreak(userId);

    // Consistent Learner: 7-day streak
    if (streak >= 7) {
      badges.push({
        badgeId: 'consistent-learner',
        reason: `Maintained a ${streak}-day learning streak`,
      });
    }

    // Week Warrior: 10+ lessons in one week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: weekLessons, error: weekError } = await supabase
      .from('lesson_segments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completed_at', oneWeekAgo.toISOString());

    if (!weekError && weekLessons && weekLessons.length >= 10) {
      badges.push({
        badgeId: 'week-warrior',
        reason: `Completed ${weekLessons.length} lessons in one week`,
      });
    }

    // Month Master: 20+ lessons in one month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: monthLessons, error: monthError } = await supabase
      .from('lesson_segments')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .gte('completed_at', oneMonthAgo.toISOString());

    if (!monthError && monthLessons && monthLessons.length >= 20) {
      badges.push({
        badgeId: 'month-master',
        reason: `Completed ${monthLessons.length} lessons in one month`,
      });
    }

    return badges;
  } catch (error) {
    console.error('Error checking streak badges:', error);
    return [];
  }
}

/**
 * Calculate learning streak (consecutive days with lesson activity)
 */
export async function calculateLearningStreak(userId: string): Promise<number> {
  try {
    const { data: activities, error } = await supabase
      .from('lesson_segments')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    if (error || !activities || activities.length === 0) {
      return 0;
    }

    // Get unique days
    const uniqueDays = new Set<string>();
    activities.forEach(activity => {
      if (activity.completed_at) {
        const date = new Date(activity.completed_at).toDateString();
        uniqueDays.add(date);
      }
    });

    // Calculate streak
    let streak = 0;
    const sortedDays = Array.from(uniqueDays)
      .map(day => new Date(day))
      .sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's activity today or yesterday
    const hasRecentActivity =
      sortedDays.length > 0 &&
      (sortedDays[0].toDateString() === today.toDateString() ||
       sortedDays[0].toDateString() === yesterday.toDateString());

    if (!hasRecentActivity) {
      return 0;
    }

    // Count consecutive days
    for (let i = 0; i < sortedDays.length - 1; i++) {
      const current = sortedDays[i];
      const next = sortedDays[i + 1];
      const diffTime = current.getTime() - next.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak + 1; // +1 for the first day
  } catch (error) {
    console.error('Error calculating learning streak:', error);
    return 0;
  }
}

/**
 * Get user's current learning streak
 */
export async function getUserStreak(userId: string): Promise<number> {
  return calculateLearningStreak(userId);
}

/**
 * Get all badges earned by a user
 */
export async function getUserEarnedBadges(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badges(*)')
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching earned badges:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserEarnedBadges:', error);
    return [];
  }
}

/**
 * Get badge progress for a user (toward badges not yet earned)
 */
export async function getBadgeProgress(userId: string) {
  try {
    const earnedBadges = await getUserEarnedBadges(userId);
    const earnedBadgeIds = earnedBadges.map(b => b.badge_id);

    // Get all available badges
    const { data: allBadges, error } = await supabase
      .from('badges')
      .select('*')
      .not('id', 'in', `(${earnedBadgeIds.join(',')})`);

    if (error || !allBadges) {
      return [];
    }

    // Calculate progress for each badge
    const progress = [];
    for (const badge of allBadges) {
      const badgeProgress = await calculateBadgeProgress(userId, badge.id);
      if (badgeProgress) {
        progress.push({
          badge,
          ...badgeProgress,
        });
      }
    }

    return progress.sort((a, b) => b.progress - a.progress);
  } catch (error) {
    console.error('Error getting badge progress:', error);
    return [];
  }
}

/**
 * Calculate progress toward a specific badge
 */
async function calculateBadgeProgress(userId: string, badgeId: string) {
  try {
    // This is a simplified implementation
    // In a real system, each badge would have specific progress metrics
    const badgeProgressMap: { [key: string]: { progress: number; description: string } } = {
      'quiz-master': await getQuizMasteryProgress(userId),
      'skill-expert': await getSkillExpertProgress(userId),
      'consistent-learner': await getStreakProgress(userId),
      'quick-learner': await getWeeklyProgressCount(userId),
    };

    return badgeProgressMap[badgeId] || { progress: 0, description: '' };
  } catch (error) {
    console.error('Error calculating badge progress:', error);
    return null;
  }
}

async function getQuizMasteryProgress(userId: string) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('passed', true);

  const count = data?.length || 0;
  return {
    progress: Math.min(100, (count / 3) * 100),
    description: `${count}/3 quizzes passed`,
  };
}

async function getSkillExpertProgress(userId: string) {
  const { data, error } = await supabase
    .from('user_skills')
    .select('id')
    .eq('user_id', userId)
    .eq('proficiency_level', 'expert');

  const count = data?.length || 0;
  return {
    progress: Math.min(100, (count / 1) * 100),
    description: `${count}/1 expert skills`,
  };
}

async function getStreakProgress(userId: string) {
  const streak = await calculateLearningStreak(userId);
  return {
    progress: Math.min(100, (streak / 7) * 100),
    description: `${streak}/7 day streak`,
  };
}

async function getWeeklyProgressCount(userId: string) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data } = await supabase
    .from('lesson_segments')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_completed', true)
    .gte('completed_at', oneWeekAgo.toISOString());

  const count = data?.length || 0;
  return {
    progress: Math.min(100, (count / 5) * 100),
    description: `${count}/5 lessons this week`,
  };
}
