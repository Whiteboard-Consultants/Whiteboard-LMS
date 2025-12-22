/**
 * Lessons & Microlearning Configuration
 * Constants, thresholds, and settings for segment-based learning
 */

import type { ContentType, SegmentStatus, EstimatedEffort } from '@/types/lessons';

/**
 * Content Type Configurations
 */
export const CONTENT_TYPES: Record<ContentType, { label: string; icon: string; color: string }> =
  {
    video: {
      label: 'Video',
      icon: '▶️',
      color: 'bg-red-100 text-red-700',
    },
    text: {
      label: 'Reading',
      icon: '📖',
      color: 'bg-blue-100 text-blue-700',
    },
    quiz: {
      label: 'Quiz',
      icon: '❓',
      color: 'bg-green-100 text-green-700',
    },
    interactive: {
      label: 'Interactive',
      icon: '🔧',
      color: 'bg-purple-100 text-purple-700',
    },
    assignment: {
      label: 'Assignment',
      icon: '📝',
      color: 'bg-orange-100 text-orange-700',
    },
    discussion: {
      label: 'Discussion',
      icon: '💬',
      color: 'bg-pink-100 text-pink-700',
    },
  };

/**
 * Segment Status Configurations
 */
export const SEGMENT_STATUSES: Record<SegmentStatus, { label: string; description: string }> = {
  not_started: {
    label: 'Not Started',
    description: 'This segment is available to start',
  },
  in_progress: {
    label: 'In Progress',
    description: 'You are currently working on this segment',
  },
  completed: {
    label: 'Completed',
    description: 'You have successfully completed this segment',
  },
  paused: {
    label: 'Paused',
    description: 'You have paused this segment',
  },
};

/**
 * Estimated Effort Configurations
 */
export const EFFORT_LEVELS: Record<EstimatedEffort, { label: string; emoji: string }> = {
  Easy: {
    label: 'Easy',
    emoji: '🟢',
  },
  Medium: {
    label: 'Medium',
    emoji: '🟡',
  },
  Hard: {
    label: 'Hard',
    emoji: '🔴',
  },
};

/**
 * Time Estimates (in seconds) by effort level
 */
export const TIME_ESTIMATES_BY_EFFORT: Record<EstimatedEffort, number> = {
  Easy: 5 * 60, // 5 minutes
  Medium: 10 * 60, // 10 minutes
  Hard: 20 * 60, // 20 minutes
};

/**
 * Time Estimates (in seconds) by content type
 * Overrides effort-based estimates if more specific
 */
export const TIME_ESTIMATES_BY_CONTENT: Record<ContentType, Record<EstimatedEffort, number>> = {
  video: {
    Easy: 3 * 60, // 3 minutes
    Medium: 8 * 60, // 8 minutes
    Hard: 15 * 60, // 15 minutes
  },
  text: {
    Easy: 5 * 60, // 5 minutes
    Medium: 12 * 60, // 12 minutes
    Hard: 25 * 60, // 25 minutes
  },
  quiz: {
    Easy: 5 * 60, // 5 minutes
    Medium: 10 * 60, // 10 minutes
    Hard: 20 * 60, // 20 minutes
  },
  interactive: {
    Easy: 10 * 60, // 10 minutes
    Medium: 20 * 60, // 20 minutes
    Hard: 30 * 60, // 30 minutes
  },
  assignment: {
    Easy: 15 * 60, // 15 minutes
    Medium: 30 * 60, // 30 minutes
    Hard: 60 * 60, // 60 minutes
  },
  discussion: {
    Easy: 10 * 60, // 10 minutes
    Medium: 20 * 60, // 20 minutes
    Hard: 30 * 60, // 30 minutes
  },
};

/**
 * Quiz Configuration
 */
export const QUIZ_CONFIG = {
  PASSING_SCORE: 60, // Minimum percentage score to pass
  MAX_ATTEMPTS: 3, // Maximum number of attempts
  TIME_LIMIT_MINUTES: 15, // Default time limit per attempt
  SHOW_ANSWERS_AFTER_SUBMISSION: true,
  ALLOW_REVIEW_AFTER_COMPLETION: true,
};

/**
 * Spaced Repetition Intervals (in seconds)
 * For quizzes that failed
 */
export const SPACED_REPETITION = {
  FIRST_RETRY: 1 * 60 * 60, // 1 hour
  SECOND_RETRY: 24 * 60 * 60, // 1 day
  FINAL_RETRY: 7 * 24 * 60 * 60, // 7 days
};

/**
 * Segment Lock Configuration
 * Controls whether segments can be taken out of order
 */
export const SEGMENT_LOCK_CONFIG = {
  ENFORCE_SEQUENTIAL_ORDER: false, // If true, segments must be completed in order
  ALLOW_SKIPPING: true, // If true, users can skip segments
  ALLOW_REVIEW_COMPLETED: true, // If true, users can review completed segments
};

/**
 * Completion Rewards
 */
export const SEGMENT_REWARDS = {
  POINTS_PER_SEGMENT: 10, // Base points for segment completion
  POINTS_PER_QUIZ_COMPLETION: 15, // Additional points for completing quiz
  POINTS_QUIZ_SCORE_BONUS: 5, // Points bonus per 10% above 60% passing score
  BADGE_UNLOCK_ON_LESSON_COMPLETE: true, // Award badge when full lesson completed
};

/**
 * Analytics Thresholds
 */
export const ANALYTICS_CONFIG = {
  AVERAGE_TIME_WINDOW_DAYS: 30, // Calculate average time over last 30 days
  LOW_COMPLETION_RATE_THRESHOLD: 0.3, // Alert if completion rate below 30%
  HIGH_ABANDONMENT_THRESHOLD: 0.5, // Alert if abandonment rate above 50%
  PERFECT_SCORE_PERCENTAGE: 0.9, // 90% or higher is "perfect"
};

/**
 * A/B Testing Configuration
 */
export const AB_TEST_CONFIG = {
  ENABLE_SEGMENT_VARIANTS: true, // Enable Easy/Intermediate/Advanced variants
  CONTROL_GROUP_PERCENTAGE: 0.2, // 20% of users get control (original) variant
  TREATMENT_GROUP_PERCENTAGE: 0.4, // 40% each for two treatment groups
  TEST_DURATION_DAYS: 30, // Duration to collect metrics
  MINIMUM_SAMPLE_SIZE: 30, // Minimum users to declare winner
};

/**
 * Microlearning Guidelines
 * Recommended ranges for effective microlearning
 */
export const MICROLEARNING_GUIDELINES = {
  RECOMMENDED_SEGMENT_DURATION_SECONDS: 5 * 60, // 5 minutes ideal
  MAX_SEGMENT_DURATION_SECONDS: 20 * 60, // 20 minutes maximum
  MIN_SEGMENT_DURATION_SECONDS: 1 * 60, // 1 minute minimum
  RECOMMENDED_DAILY_SEGMENTS: 3, // Users should complete ~3 segments daily
  RECOMMENDED_SEGMENTS_PER_LESSON: 6, // Lessons should have ~6 segments
  RECOMMENDED_TOTAL_LESSON_TIME_MINUTES: 30, // Total lesson time ~30 minutes
};

/**
 * Streak Configuration
 * For tracking consecutive segment completions
 */
export const STREAK_CONFIG = {
  DAILY_STREAK_ACTIVE_WINDOW_HOURS: 24, // 24-hour window for daily streaks
  WEEKLY_STREAK_DAYS: 7, // Completed 7 days in a row
  MONTHLY_STREAK_DAYS: 30, // Completed 30 days in a row
  STREAK_RESET_INACTIVE_DAYS: 2, // Reset streak if inactive for 2+ days
};

/**
 * Notification Settings
 */
export const NOTIFICATION_CONFIG = {
  NOTIFY_SEGMENT_AVAILABLE: true,
  NOTIFY_SEGMENT_DUE_SOON: true, // When segment becoming overdue
  NOTIFY_LESSON_COMPLETED: true,
  NOTIFY_QUIZ_PASSED: true,
  NOTIFY_QUIZ_FAILED: true,
  NOTIFY_MILESTONE_REACHED: true, // e.g., 10 segments completed
  DUE_SOON_HOURS: 24, // Alert 24 hours before due
};

/**
 * Default Learning Path Configuration
 */
export const DEFAULT_LEARNING_PATH = {
  SEGMENTS_PER_WEEK: 15, // Recommended: 15 segments per week
  SESSIONS_PER_DAY: 1, // Recommended: 1 learning session per day
  OPTIMAL_SESSION_TIME_MINUTES: 20, // Optimal session length
};

/**
 * Retry & Recovery Configuration
 */
export const RETRY_CONFIG = {
  ALLOW_SEGMENT_RETAKE: true,
  RETAKE_WAITING_PERIOD_HOURS: 24, // Must wait 24 hours between retakes
  AUTO_SAVE_PROGRESS_INTERVAL_SECONDS: 30, // Save progress every 30 seconds
  PRESERVE_QUIZ_RESPONSES_ON_FAILURE: true, // Show previous answers on retry
};

/**
 * Accessibility & Accommodations
 */
export const ACCESSIBILITY_CONFIG = {
  SUPPORT_CAPTIONS_FOR_VIDEO: true,
  SUPPORT_TRANSCRIPT_DOWNLOADS: true,
  SUPPORT_TEXT_TO_SPEECH: true,
  SUPPORT_PLAYBACK_SPEED_ADJUSTMENT: true,
  SUPPORTED_SPEEDS: [0.75, 1, 1.25, 1.5, 2], // Video playback speeds
  SUPPORT_DYSLEXIC_FONT_OPTION: true,
  DEFAULT_FONT_SIZE_REM: 1, // Base font size in rem
};
