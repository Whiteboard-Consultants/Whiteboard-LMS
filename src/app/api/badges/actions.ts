'use server';

/**
 * Badges & Gamification Server Actions
 * Server-side operations for badge and points management
 */

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import type { UserBadge, AwardBadgeRequest, AwardPointsRequest } from '@/types/badges';

// Get admin client (service_role - bypasses RLS)
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Award badge to user
 */
export async function awardBadge(request: AwardBadgeRequest): Promise<{
  success: boolean;
  data?: UserBadge;
  error?: string;
}> {
  try {
    const admin = getAdminClient();

    // Check if user already has this badge
    const { data: existing } = await admin
      .from('user_badges')
      .select('id')
      .eq('user_id', request.user_id)
      .eq('badge_id', request.badge_id)
      .maybeSingle();

    if (existing) {
      return {
        success: false,
        error: 'User already has this badge',
      };
    }

    // Get badge to get points reward
    const { data: badge } = await admin
      .from('badges')
      .select('id, points_reward')
      .eq('id', request.badge_id)
      .single();

    if (!badge) {
      return {
        success: false,
        error: 'Badge not found',
      };
    }

    // Award badge
    const { data: userBadge, error: badgeError } = await admin
      .from('user_badges')
      .insert({
        user_id: request.user_id,
        badge_id: request.badge_id,
        earned_at: new Date().toISOString(),
        earned_from_id: request.earned_from_id,
        earned_from_type: request.earned_from_type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (badgeError) throw badgeError;

    // Award points
    await awardPoints({
      user_id: request.user_id,
      points: badge.points_reward,
      transaction_type: 'badge_earn',
      reference_id: request.badge_id,
      description: `Earned badge reward`,
    });

    return { success: true, data: userBadge };
  } catch (error) {
    console.error('Error awarding badge:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Award points to user
 */
export async function awardPoints(request: AwardPointsRequest): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const admin = getAdminClient();

    // Create transaction record
    const { error: txError } = await admin.from('point_transactions').insert({
      user_id: request.user_id,
      points: request.points,
      transaction_type: request.transaction_type,
      reference_id: request.reference_id,
      description: request.description,
      created_at: new Date().toISOString(),
    });

    if (txError) throw txError;

    // Update user points
    const { data: currentPoints } = await admin
      .from('user_points')
      .select('*')
      .eq('user_id', request.user_id)
      .single();

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));

    let updateData: any = {
      total_points: (currentPoints?.total_points || 0) + request.points,
      last_points_update: new Date().toISOString(),
    };

    // Update monthly/weekly if recent
    if (currentPoints) {
      const lastUpdate = new Date(currentPoints.last_points_update || 0);
      
      if (lastUpdate >= thisMonth) {
        updateData.points_this_month = (currentPoints.points_this_month || 0) + request.points;
      } else {
        updateData.points_this_month = request.points;
      }

      if (lastUpdate >= thisWeek) {
        updateData.points_this_week = (currentPoints.points_this_week || 0) + request.points;
      } else {
        updateData.points_this_week = request.points;
      }

      // Update category-specific points
      if (request.transaction_type === 'lesson_complete') {
        updateData.lesson_completion_points =
          (currentPoints.lesson_completion_points || 0) + request.points;
      } else if (request.transaction_type.includes('quiz')) {
        updateData.quiz_points = (currentPoints.quiz_points || 0) + request.points;
      } else if (request.transaction_type === 'badge_earn') {
        updateData.badge_points = (currentPoints.badge_points || 0) + request.points;
      } else if (request.transaction_type.includes('community')) {
        updateData.community_points = (currentPoints.community_points || 0) + request.points;
      }

      const { error: updateError } = await admin
        .from('user_points')
        .update(updateData)
        .eq('user_id', request.user_id);

      if (updateError) throw updateError;
    } else {
      // Create new points record
      const { error: insertError } = await admin.from('user_points').insert({
        user_id: request.user_id,
        total_points: request.points,
        points_this_month: request.points,
        points_this_week: request.points,
        lesson_completion_points:
          request.transaction_type === 'lesson_complete' ? request.points : 0,
        quiz_points: request.transaction_type.includes('quiz') ? request.points : 0,
        badge_points: request.transaction_type === 'badge_earn' ? request.points : 0,
        community_points: request.transaction_type.includes('community') ? request.points : 0,
        last_points_update: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error awarding points:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Award multiple badges to user
 */
export async function awardBadges(
  userId: string,
  badgeIds: string[],
  earnedFromId?: string,
  earnedFromType?: string
): Promise<{ success: boolean; awarded_count?: number; error?: string }> {
  try {
    let awardedCount = 0;

    for (const badgeId of badgeIds) {
      const result = await awardBadge({
        user_id: userId,
        badge_id: badgeId,
        earned_from_id: earnedFromId,
        earned_from_type: earnedFromType,
      });

      if (result.success) {
        awardedCount++;
      }
    }

    return { success: true, awarded_count: awardedCount };
  } catch (error) {
    console.error('Error awarding badges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check and award badges based on trigger
 * This is the main entry point for badge evaluation
 */
export async function checkAndAwardBadges(
  userId: string,
  triggerType: string,
  triggerData: Record<string, any>
): Promise<{ success: boolean; awarded_badges?: string[]; error?: string }> {
  try {
    const admin = getAdminClient();
    const awardedBadges: string[] = [];

    // Fetch all badges and check each one
    const { data: badges } = await admin
      .from('badges')
      .select('*')
      .eq('is_active', true);

    if (!badges) {
      return { success: true, awarded_badges: [] };
    }

    for (const badge of badges) {
      const shouldAward = checkBadgeCriteria(
        badge.criteria_type,
        badge.criteria_value,
        triggerType,
        triggerData
      );

      if (shouldAward) {
        const result = await awardBadge({
          user_id: userId,
          badge_id: badge.id,
          earned_from_id: triggerData.reference_id,
          earned_from_type: triggerType,
        });

        if (result.success) {
          awardedBadges.push(badge.id);
        }
      }
    }

    return { success: true, awarded_badges: awardedBadges };
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Deduct points (for negative actions, rare)
 */
export async function deductPoints(
  userId: string,
  points: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    return await awardPoints({
      user_id: userId,
      points: -points,
      transaction_type: 'point_deduction',
      description: reason,
    });
  } catch (error) {
    console.error('Error deducting points:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reset user's badges (admin only)
 */
export async function resetUserBadges(userId: string): Promise<{
  success: boolean;
  removed_count?: number;
  error?: string;
}> {
  try {
    const { userId: authUserId } = await auth();
    
    // In production, verify user is admin
    // For now, just check they're authenticated
    if (!authUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    // Get all badges for user
    const { data: badges, error: fetchError } = await admin
      .from('user_badges')
      .select('id')
      .eq('user_id', userId);

    if (fetchError) throw fetchError;

    // Delete all badges
    const { error: deleteError } = await admin
      .from('user_badges')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // Reset points
    const { error: resetError } = await admin
      .from('user_points')
      .update({
        total_points: 0,
        points_this_month: 0,
        points_this_week: 0,
        lesson_completion_points: 0,
        quiz_points: 0,
        badge_points: 0,
        community_points: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (resetError) throw resetError;

    return { success: true, removed_count: badges?.length || 0 };
  } catch (error) {
    console.error('Error resetting user badges:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if badge criteria is met
 */
function checkBadgeCriteria(
  criteriaType: string,
  criteriaValue: number,
  triggerType: string,
  triggerData: Record<string, any>
): boolean {
  switch (criteriaType) {
    case 'lesson_completion':
      return (
        triggerType === 'lesson_complete' &&
        (triggerData.lesson_count || 0) >= criteriaValue
      );

    case 'quiz_score':
      return triggerType === 'quiz_pass' && (triggerData.score || 0) >= criteriaValue;

    case 'skill_level':
      return (
        triggerType === 'skill_level_up' &&
        (triggerData.skill_level_number || 0) >= criteriaValue
      );

    case 'streak':
      return (
        triggerType === 'streak_update' &&
        (triggerData.current_streak || 0) >= criteriaValue
      );

    case 'course_completion':
      return (
        triggerType === 'course_complete' &&
        (triggerData.course_count || 0) >= criteriaValue
      );

    case 'community_votes':
      return (
        triggerType === 'community_vote' &&
        (triggerData.total_votes || 0) >= criteriaValue
      );

    case 'community_help':
      return (
        triggerType === 'community_help' &&
        (triggerData.help_count || 0) >= criteriaValue
      );

    case 'speed':
      return (
        triggerType === 'course_complete' &&
        (triggerData.completion_days || 0) <= criteriaValue
      );

    case 'category_diversity':
      return (
        triggerType === 'course_complete' &&
        (triggerData.categories_completed || 0) >= criteriaValue
      );

    default:
      return false;
  }
}
