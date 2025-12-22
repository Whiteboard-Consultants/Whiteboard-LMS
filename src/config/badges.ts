/**
 * Badges Configuration
 * Constants, defaults, and badge definitions
 */

import type { Badge, BadgeRarity, BadgeCriteriaType } from '@/types/badges';

/**
 * Badge rarity levels
 */
export const BADGE_RARITIES: BadgeRarity[] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

/**
 * Badge rarity colors
 */
export const RARITY_COLORS: Record<BadgeRarity, string> = {
  Common: '#6B7280',
  Uncommon: '#10B981',
  Rare: '#3B82F6',
  Epic: '#8B5CF6',
  Legendary: '#F59E0B',
};

/**
 * Badge type descriptions
 */
export const BADGE_TYPE_DESCRIPTIONS: Record<string, string> = {
  achievement: 'One-time achievements and milestones',
  milestone: 'Progress-based achievements',
  skill_master: 'Skill mastery and proficiency badges',
  social: 'Social and community contribution badges',
};

/**
 * Badge criteria type descriptions
 */
export const CRITERIA_TYPE_DESCRIPTIONS: Record<BadgeCriteriaType, string> = {
  lesson_completion: 'Complete a certain number of lessons',
  quiz_score: 'Achieve a specific quiz score',
  skill_level: 'Reach a skill proficiency level',
  streak: 'Maintain a learning streak',
  course_completion: 'Complete courses',
  community_votes: 'Receive helpful votes from community',
  community_help: 'Help other students',
  speed: 'Complete course quickly',
  category_diversity: 'Complete courses across categories',
};

/**
 * Points per action
 */
export const POINTS_PER_ACTION = {
  LESSON_COMPLETION: 10,
  QUIZ_PASS: 5,
  QUIZ_PERFECT: 20,
  COURSE_COMPLETION: 50,
  BADGE_EARN_COMMON: 10,
  BADGE_EARN_UNCOMMON: 25,
  BADGE_EARN_RARE: 50,
  BADGE_EARN_EPIC: 100,
  BADGE_EARN_LEGENDARY: 250,
  COMMUNITY_POST_HELPFUL: 5,
  COMMUNITY_HELP_STUDENT: 15,
} as const;

/**
 * Streak thresholds for badges
 */
export const STREAK_THRESHOLDS = {
  STREAK_3_DAYS: 3,
  STREAK_7_DAYS: 7,
  STREAK_30_DAYS: 30,
  STREAK_100_DAYS: 100,
} as const;

/**
 * Lesson completion thresholds for milestones
 */
export const LESSON_THRESHOLDS = {
  FIRST_LESSON: 1,
  FIVE_LESSONS: 5,
  TEN_LESSONS: 10,
  TWENTY_FIVE_LESSONS: 25,
  HUNDRED_LESSONS: 100,
} as const;

/**
 * Quiz score thresholds
 */
export const QUIZ_SCORE_THRESHOLDS = {
  PASSING: 60,
  GOOD: 80,
  EXCELLENT: 90,
  PERFECT: 100,
} as const;

/**
 * Course speed thresholds (in days)
 */
export const COURSE_SPEED_THRESHOLDS = {
  QUICK_LEARNER: 5,
  SPEED_DEMON: 10,
} as const;

/**
 * Leaderboard settings
 */
export const LEADERBOARD_CONFIG = {
  TOP_N: 10,
  UPDATE_INTERVAL_MINUTES: 60,
  SHOW_WEEKLY_LEADERBOARD: true,
  SHOW_MONTHLY_LEADERBOARD: true,
  SHOW_ALLTIME_LEADERBOARD: true,
} as const;

/**
 * Badge showcase settings
 */
export const BADGE_SHOWCASE_CONFIG = {
  FEATURED_BADGES_COUNT: 5,
  SHOW_RECENT_COUNT: 10,
  SHOW_IN_PROFILE: true,
  SHOW_ON_POSTS: true,
  SHOW_ON_PROFILE_CARD: true,
} as const;

/**
 * Achievement unlock notifications
 */
export const ACHIEVEMENT_NOTIFICATIONS = {
  SHOW_TOAST: true,
  SHOW_BADGE_POPUP: true,
  SEND_EMAIL: true,
  SHARE_TO_FEED: true,
  RECORD_ANALYTICS: true,
} as const;

/**
 * Badge earning rules
 * These are used to validate badge earning logic
 */
export const BADGE_EARNING_RULES: Record<
  BadgeCriteriaType,
  { check_interval?: string; allow_multiple?: boolean; retroactive?: boolean }
> = {
  lesson_completion: { check_interval: 'per_lesson', allow_multiple: true, retroactive: true },
  quiz_score: { check_interval: 'per_quiz', allow_multiple: false, retroactive: false },
  skill_level: { check_interval: 'on_level_up', allow_multiple: true, retroactive: false },
  streak: { check_interval: 'daily', allow_multiple: true, retroactive: false },
  course_completion: { check_interval: 'per_course', allow_multiple: true, retroactive: true },
  community_votes: { check_interval: 'real_time', allow_multiple: false, retroactive: false },
  community_help: { check_interval: 'per_help', allow_multiple: true, retroactive: false },
  speed: { check_interval: 'on_course_complete', allow_multiple: true, retroactive: false },
  category_diversity: { check_interval: 'per_course', allow_multiple: true, retroactive: false },
};

/**
 * Badge unlocking milestones
 */
export const BADGE_MILESTONES = {
  FIRST_BADGE: 'Your first badge!',
  FIVE_BADGES: '5 badges earned',
  TEN_BADGES: '10 badges earned',
  BADGE_COLLECTOR: '20 badges earned',
  LEGENDARY_COLLECTOR: '50 badges earned',
} as const;

/**
 * Point transaction types
 */
export const POINT_TRANSACTION_TYPES = {
  LESSON_COMPLETION: 'lesson_complete',
  QUIZ_PASS: 'quiz_pass',
  QUIZ_PERFECT: 'quiz_perfect_score',
  COURSE_COMPLETION: 'course_complete',
  BADGE_EARN: 'badge_earn',
  COMMUNITY_POST: 'community_post',
  COMMUNITY_HELPFUL: 'community_helpful_vote',
  COMMUNITY_HELP: 'community_help_student',
  REFERRAL: 'referral_bonus',
  ACHIEVEMENT: 'achievement_unlock',
  BONUS: 'bonus_points',
  DEDUCTION: 'point_deduction',
} as const;

/**
 * Gamification settings
 */
export const GAMIFICATION_SETTINGS = {
  ENABLE_LEADERBOARDS: true,
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_POINTS: true,
  ENABLE_STREAKS: true,
  SHOW_BADGES_ON_PROFILE: true,
  COMPETITIVE_MODE: true, // Enable leaderboards and competition
  SHOW_POINTS_EVERYWHERE: true,
  CELEBRATE_ACHIEVEMENTS: true,
} as const;

/**
 * Streak configuration
 */
export const STREAK_CONFIG = {
  REQUIRED_ACTIVITY_PER_DAY: 1, // At least 1 lesson or activity
  RESET_ON_MISSED_DAY: true,
  NOTIFY_ON_STREAK_MILESTONE: true,
  SHOW_STREAK_TIMER: true,
  GRACE_PERIOD_HOURS: 0, // No grace period (reset at midnight)
} as const;

/**
 * Maximum badges and points
 */
export const LIMITS = {
  MAX_BADGES_PER_USER: 100,
  MAX_LEADERBOARD_ENTRIES: 1000,
  MAX_POINTS_PER_DAY: 500, // Cap daily points to prevent abuse
  POINTS_EXPIRATION_DAYS: 365, // Points expire after 1 year (null = no expiration)
} as const;

/**
 * Pagination for badge lists
 */
export const PAGINATION_DEFAULTS = {
  BADGES_PER_PAGE: 12,
  LEADERBOARD_PER_PAGE: 10,
  TRANSACTION_HISTORY_PER_PAGE: 20,
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  BADGES_LIST: 3600, // 1 hour
  USER_BADGES: 1800, // 30 minutes
  USER_POINTS: 600, // 10 minutes
  LEADERBOARD: 3600, // 1 hour
  BADGE_STATS: 86400, // 24 hours
} as const;

/**
 * Bulk badge earning operations
 */
export const BULK_OPERATIONS = {
  MAX_BADGES_PER_REQUEST: 50,
  MAX_USERS_PER_REQUEST: 100,
} as const;
