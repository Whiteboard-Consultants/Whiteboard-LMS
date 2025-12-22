/**
 * Badges & Gamification Types
 * Complete type definitions for the gamification and badges system
 */

import type { TimestampType } from './index';

// ============================================================================
// BADGE DEFINITIONS
// ============================================================================

export type BadgeType = 'achievement' | 'milestone' | 'skill_master' | 'social';

export type BadgeCriteriaType =
  | 'lesson_completion'
  | 'quiz_score'
  | 'skill_level'
  | 'streak'
  | 'course_completion'
  | 'community_votes'
  | 'community_help'
  | 'speed'
  | 'category_diversity';

export type BadgeRarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

/**
 * Badge master record
 * Defines the badge itself and earning criteria
 */
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  badge_type: BadgeType;
  criteria_type: BadgeCriteriaType;
  criteria_value: number; // Threshold value (e.g., score >= 90)
  criteria_metadata?: Record<string, any>; // Additional criteria details
  rarity: BadgeRarity;
  points_reward: number; // Points awarded for earning badge
  is_active: boolean;
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

/**
 * User earned badge
 * Record of when and how a user earned a badge
 */
export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: TimestampType;
  earned_from_id?: string; // lesson_id, quiz_id, course_id, etc.
  earned_from_type?: string; // 'lesson', 'quiz', 'course', 'skill'
  created_at?: TimestampType;
  // Join data
  badge?: Badge;
}

/**
 * Badge with user's earning status
 */
export interface BadgeWithStatus extends Badge {
  earned?: boolean;
  earned_at?: TimestampType;
  progress?: number; // 0-100 (how close to earning this badge)
}

// ============================================================================
// POINTS SYSTEM
// ============================================================================

export interface UserPoints {
  id: string;
  user_id: string;
  total_points: number;
  points_this_month: number;
  points_this_week: number;
  lesson_completion_points: number;
  quiz_points: number;
  badge_points: number;
  community_points: number;
  last_points_update?: TimestampType;
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points: number; // Can be negative for deductions
  transaction_type: string; // 'lesson_complete', 'quiz_pass', 'badge_earn', etc.
  reference_id?: string; // lesson_id, badge_id, etc.
  description?: string;
  created_at?: TimestampType;
}

// ============================================================================
// BADGE CATEGORIES & GROUPS
// ============================================================================

export type BadgeCategory =
  | 'Achievements'
  | 'Milestones'
  | 'Skills'
  | 'Social'
  | 'Speed'
  | 'Perfect';

export interface BadgeGroup {
  category: BadgeCategory;
  name: string;
  description: string;
  icon: string;
  badges: Badge[];
  earned_count?: number;
}

// ============================================================================
// LEADERBOARD & RANKINGS
// ============================================================================

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  total_points: number;
  badge_count: number;
  badges_earned?: UserBadge[];
  last_activity?: TimestampType;
}

export type LeaderboardPeriod = 'alltime' | 'month' | 'week';

export interface LeaderboardStats {
  period: LeaderboardPeriod;
  top_10: LeaderboardEntry[];
  user_rank?: {
    rank: number;
    points: number;
    badge_count: number;
  };
}

// ============================================================================
// ACHIEVEMENT TRACKING
// ============================================================================

export interface AchievementProgress {
  badge_id: string;
  badge_name: string;
  badge_rarity: BadgeRarity;
  criteria_type: BadgeCriteriaType;
  criteria_value: number;
  current_progress: number;
  progress_percentage: number;
  earned: boolean;
  earned_at?: TimestampType;
  estimated_days_to_earn?: number;
}

export interface UserAchievementStats {
  total_badges: number;
  earned_badges: number;
  completion_percentage: number;
  total_points: number;
  badges_by_rarity: {
    common: number;
    uncommon: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  recent_badges: UserBadge[];
  next_milestone?: AchievementProgress;
  achievements_in_progress: AchievementProgress[];
}

// ============================================================================
// STREAK TRACKING
// ============================================================================

export interface StreakData {
  current_streak: number; // Days in current streak
  longest_streak: number; // All-time longest streak
  last_activity_date?: TimestampType;
  streak_broken_at?: TimestampType; // When current streak was broken
  total_days_active: number;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface AwardBadgeRequest {
  user_id: string;
  badge_id: string;
  earned_from_id?: string;
  earned_from_type?: string;
}

export interface AwardPointsRequest {
  user_id: string;
  points: number;
  transaction_type: string;
  reference_id?: string;
  description?: string;
}

export interface BatchAwardBadgesRequest {
  user_id: string;
  badge_ids: string[];
  earned_from_id?: string;
  earned_from_type?: string;
}

export interface BadgeCheckRequest {
  user_id: string;
  trigger_type: string; // 'lesson_complete', 'quiz_pass', etc.
  trigger_data: Record<string, any>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface BadgeApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface BadgesListResponse {
  data: Badge[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface UserBadgesResponse {
  total_earned: number;
  total_available: number;
  completion_percentage: number;
  earned_badges: UserBadge[];
  available_badges: BadgeWithStatus[];
}

// ============================================================================
// BADGE EARNING CONDITIONS
// ============================================================================

export interface BadgeEarningCondition {
  badge_id: string;
  trigger_type: string;
  check: (data: Record<string, any>) => boolean; // Function to check if badge earned
  calculate_progress?: (data: Record<string, any>) => number; // 0-100
}

export interface LessonCompletionData {
  user_id: string;
  lesson_id: string;
  time_spent_seconds: number;
  quiz_score?: number;
  is_first_lesson?: boolean;
}

export interface QuizPassData {
  user_id: string;
  quiz_id: string;
  lesson_id: string;
  score: number;
  total_attempts: number;
}

export interface CourseCompletionData {
  user_id: string;
  course_id: string;
  completion_time_days: number;
  total_lessons: number;
  lessons_completed: number;
  average_quiz_score: number;
}

// ============================================================================
// SOCIAL & COMMUNITY
// ============================================================================

export interface SocialAchievement {
  badge_id: string;
  badge_name: string;
  description: string;
  earned_by_count: number; // How many users have earned this badge
  earned_by_percentage: number; // Percentage of total users
  is_rare: boolean; // Less than 5% of users have it
}

// ============================================================================
// PROFILE & SHOWCASE
// ============================================================================

export interface BadgeShowcase {
  featured_badges: UserBadge[]; // Top 5 most recent badges
  all_badges: UserBadge[];
  stats: {
    total_earned: number;
    total_points: number;
    current_streak: number;
  };
}

/**
 * Badge display settings for user profile
 */
export interface BadgeDisplaySettings {
  show_badges: boolean;
  featured_badge_ids: string[]; // Up to 5 featured badges
  show_points: boolean;
  show_streak: boolean;
}
