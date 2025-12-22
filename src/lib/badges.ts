/**
 * Badges & Gamification Service Layer
 * Core business logic for badge management and points tracking
 */

import { createClient } from '@supabase/supabase-js';
import type {
  Badge,
  UserBadge,
  UserPoints,
  PointTransaction,
  BadgeWithStatus,
  AchievementProgress,
  UserAchievementStats,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '@/types/badges';

// Get Supabase client (server-safe)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

// ============================================================================
// BADGE QUERIES
// ============================================================================

/**
 * Get all available badges
 */
export async function getBadges(activeOnly: boolean = true): Promise<Badge[]> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('badges')
      .select('*')
      .order('rarity')
      .order('name');

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
}

/**
 * Get badge by ID
 */
export async function getBadgeById(badgeId: string): Promise<Badge | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('id', badgeId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching badge:', error);
    return null;
  }
}

/**
 * Get badges by type
 */
export async function getBadgesByType(badgeType: string): Promise<Badge[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('badge_type', badgeType)
      .eq('is_active', true)
      .order('rarity')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges by type:', error);
    return [];
  }
}

/**
 * Get badges by criteria type
 */
export async function getBadgesByCriteria(criteriaType: string): Promise<Badge[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('criteria_type', criteriaType)
      .eq('is_active', true);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching badges by criteria:', error);
    return [];
  }
}

// ============================================================================
// USER BADGE OPERATIONS
// ============================================================================

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_badges')
      .select(
        `
        *,
        badges:badge_id (
          id,
          name,
          description,
          icon_url,
          badge_type,
          rarity,
          points_reward
        )
      `
      )
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }
}

/**
 * Check if user has earned a specific badge
 */
export async function userHasBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
    return !!data;
  } catch (error) {
    console.error('Error checking user badge:', error);
    return false;
  }
}

/**
 * Get user's badges with availability status
 */
export async function getUserBadgesWithStatus(userId: string): Promise<BadgeWithStatus[]> {
  try {
    const allBadges = await getBadges(true);
    const earnedBadges = await getUserBadges(userId);

    const earnedIds = new Set(earnedBadges.map((b) => b.badge_id));

    return allBadges.map((badge) => ({
      ...badge,
      earned: earnedIds.has(badge.id),
      earned_at: earnedBadges.find((b) => b.badge_id === badge.id)?.earned_at,
      progress: earnedIds.has(badge.id) ? 100 : 0, // TODO: Calculate actual progress
    }));
  } catch (error) {
    console.error('Error fetching user badges with status:', error);
    return [];
  }
}

/**
 * Count earned badges by rarity
 */
export async function getUserBadgesByRarity(
  userId: string
): Promise<Record<string, number>> {
  try {
    const badges = await getUserBadges(userId);
    const counts: Record<string, number> = {
      Common: 0,
      Uncommon: 0,
      Rare: 0,
      Epic: 0,
      Legendary: 0,
    };

    badges.forEach((badge) => {
      if (badge.badges) {
        const rarity = badge.badges.rarity;
        counts[rarity] = (counts[rarity] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    console.error('Error counting badges by rarity:', error);
    return {};
  }
}

// ============================================================================
// POINTS SYSTEM
// ============================================================================

/**
 * Get user's points
 */
export async function getUserPoints(userId: string): Promise<UserPoints | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return null;
  }
}

/**
 * Get point transactions for user
 */
export async function getUserPointTransactions(
  userId: string,
  limit: number = 50
): Promise<PointTransaction[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching point transactions:', error);
    return [];
  }
}

/**
 * Get point transactions by type
 */
export async function getPointTransactionsByType(
  userId: string,
  transactionType: string
): Promise<PointTransaction[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('point_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', transactionType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching point transactions by type:', error);
    return [];
  }
}

// ============================================================================
// ACHIEVEMENT TRACKING
// ============================================================================

/**
 * Get achievement statistics for user
 */
export async function getUserAchievementStats(userId: string): Promise<UserAchievementStats> {
  try {
    const earnedBadges = await getUserBadges(userId);
    const allBadges = await getBadges(true);
    const userPoints = await getUserPoints(userId);
    const rarityCount = await getUserBadgesByRarity(userId);

    return {
      total_badges: allBadges.length,
      earned_badges: earnedBadges.length,
      completion_percentage:
        allBadges.length > 0 ? Math.round((earnedBadges.length / allBadges.length) * 100) : 0,
      total_points: userPoints?.total_points || 0,
      badges_by_rarity: {
        common: rarityCount['Common'] || 0,
        uncommon: rarityCount['Uncommon'] || 0,
        rare: rarityCount['Rare'] || 0,
        epic: rarityCount['Epic'] || 0,
        legendary: rarityCount['Legendary'] || 0,
      },
      recent_badges: earnedBadges.slice(0, 5),
      achievements_in_progress: [], // TODO: Calculate based on current progress
    };
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    return {
      total_badges: 0,
      earned_badges: 0,
      completion_percentage: 0,
      total_points: 0,
      badges_by_rarity: {
        common: 0,
        uncommon: 0,
        rare: 0,
        epic: 0,
        legendary: 0,
      },
      recent_badges: [],
      achievements_in_progress: [],
    };
  }
}

// ============================================================================
// LEADERBOARD
// ============================================================================

/**
 * Get top leaderboard entries
 */
export async function getLeaderboard(
  period: LeaderboardPeriod = 'alltime',
  limit: number = 10
): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabaseClient();

    // Determine date filter based on period
    const now = new Date();
    let dateFilter: string | null = null;

    if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = monthAgo.toISOString();
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = weekAgo.toISOString();
    }

    // Build query
    let query = supabase
      .from('user_points')
      .select(
        `
        user_id,
        total_points,
        users:user_id (
          id,
          name,
          avatarUrl
        )
      `
      )
      .order('total_points', { ascending: false })
      .limit(limit);

    if (dateFilter && period !== 'alltime') {
      query = query.gte('updated_at', dateFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Transform to leaderboard format
    const entries: LeaderboardEntry[] = [];
    (data || []).forEach((item: any, index: number) => {
      entries.push({
        rank: index + 1,
        user_id: item.user_id,
        user_name: item.users?.name || 'Unknown',
        user_avatar: item.users?.avatarUrl,
        total_points: item.total_points,
        badge_count: 0, // TODO: Fetch badge count
      });
    });

    return entries;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's leaderboard rank
 */
export async function getUserLeaderboardRank(
  userId: string,
  period: LeaderboardPeriod = 'alltime'
): Promise<{ rank: number; total_points: number } | null> {
  try {
    const supabase = getSupabaseClient();

    const userPoints = await getUserPoints(userId);
    if (!userPoints) return null;

    // Count how many users have more points
    let query = supabase
      .from('user_points')
      .select('user_id', { count: 'exact' })
      .gt('total_points', userPoints.total_points);

    if (period === 'month') {
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      query = query.gte('updated_at', monthAgo.toISOString());
    } else if (period === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('updated_at', weekAgo.toISOString());
    }

    const { count, error } = await query;

    if (error) throw error;

    return {
      rank: (count || 0) + 1,
      total_points: userPoints.total_points,
    };
  } catch (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }
}

// ============================================================================
// BADGE GROUPING & ORGANIZATION
// ============================================================================

/**
 * Get badges grouped by type
 */
export async function getBadgesGroupedByType(): Promise<Record<string, Badge[]>> {
  try {
    const badges = await getBadges(true);
    const grouped: Record<string, Badge[]> = {};

    badges.forEach((badge) => {
      if (!grouped[badge.badge_type]) {
        grouped[badge.badge_type] = [];
      }
      grouped[badge.badge_type].push(badge);
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping badges by type:', error);
    return {};
  }
}

/**
 * Get badges grouped by rarity
 */
export async function getBadgesGroupedByRarity(): Promise<Record<string, Badge[]>> {
  try {
    const badges = await getBadges(true);
    const grouped: Record<string, Badge[]> = {};

    badges.forEach((badge) => {
      if (!grouped[badge.rarity]) {
        grouped[badge.rarity] = [];
      }
      grouped[badge.rarity].push(badge);
    });

    return grouped;
  } catch (error) {
    console.error('Error grouping badges by rarity:', error);
    return {};
  }
}

// ============================================================================
// STATISTICS & ANALYTICS
// ============================================================================

/**
 * Get badge earning statistics
 */
export async function getBadgeStats(): Promise<{
  total_badges: number;
  total_earned: number;
  most_common_badge: Badge | null;
  rarest_badge: Badge | null;
  earning_by_type: Record<string, number>;
}> {
  try {
    const supabase = getSupabaseClient();
    const badges = await getBadges(true);

    // Count total earned
    const { count: totalEarned } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact' });

    // Get earning by badge type
    const { data: earningByType } = await supabase
      .from('user_badges')
      .select('badges:badge_id (badge_type)', { count: 'exact' });

    const earningCounts: Record<string, number> = {};
    (earningByType || []).forEach((item: any) => {
      const type = item.badges?.badge_type || 'unknown';
      earningCounts[type] = (earningCounts[type] || 0) + 1;
    });

    // Find most/least common
    let mostCommon: Badge | null = null;
    let rarest: Badge | null = null;

    if (badges.length > 0) {
      mostCommon = badges[0];
      rarest = badges[badges.length - 1];
    }

    return {
      total_badges: badges.length,
      total_earned: totalEarned || 0,
      most_common_badge: mostCommon,
      rarest_badge: rarest,
      earning_by_type: earningCounts,
    };
  } catch (error) {
    console.error('Error fetching badge stats:', error);
    return {
      total_badges: 0,
      total_earned: 0,
      most_common_badge: null,
      rarest_badge: null,
      earning_by_type: {},
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get rarity color for UI
 */
export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    Common: '#6B7280',
    Uncommon: '#10B981',
    Rare: '#3B82F6',
    Epic: '#8B5CF6',
    Legendary: '#F59E0B',
  };
  return colors[rarity] || '#6B7280';
}

/**
 * Format points with separator
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Calculate badge progress percentage
 */
export function calculateBadgeProgress(
  current: number,
  required: number
): { percentage: number; isEarned: boolean } {
  const percentage = Math.min(Math.round((current / required) * 100), 100);
  return {
    percentage,
    isEarned: percentage >= 100,
  };
}
