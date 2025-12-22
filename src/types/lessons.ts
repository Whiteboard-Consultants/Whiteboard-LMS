/**
 * Lesson Segments & Microlearning Types
 * Type definitions for breaking lessons into manageable 3-5 minute chunks
 */

import type { TimestampType } from './index';

// ============================================================================
// LESSON SEGMENT DEFINITIONS
// ============================================================================

export type ContentType = 'video' | 'text' | 'quiz' | 'interactive' | 'assignment' | 'discussion';

export type SegmentStatus = 'not_started' | 'in_progress' | 'completed' | 'paused';

export type EstimatedEffort = 'Easy' | 'Medium' | 'Hard';

/**
 * Lesson segment model
 * A sub-lesson that typically takes 3-5 minutes to complete
 */
export interface LessonSegment {
  id: string;
  lesson_id: string;
  segment_number: number; // Order within lesson (1, 2, 3...)
  title: string;
  description?: string;
  content_type: ContentType;
  content_url?: string; // URL to video, article, etc.
  duration_seconds: number; // Expected duration in seconds
  learning_objectives?: string[]; // What learner should know
  key_concepts?: string[]; // Main concepts covered
  estimated_effort: EstimatedEffort;
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

/**
 * User's progress through a segment
 */
export interface UserSegmentProgress {
  id: string;
  user_id: string;
  segment_id: string;
  enrollment_id: string;
  status: SegmentStatus;
  progress_percentage: number; // 0-100
  time_spent_seconds: number; // Actual time spent
  attempts: number; // Number of times attempted
  quiz_score?: number; // 0-100 (for quiz segments)
  quiz_passed?: boolean;
  started_at?: TimestampType;
  completed_at?: TimestampType;
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

/**
 * Segment with progress data joined
 */
export interface SegmentWithProgress extends LessonSegment {
  user_progress?: UserSegmentProgress;
  is_locked?: boolean; // True if prerequisites not met
  can_skip?: boolean; // True if user can skip to next
}

/**
 * Lesson with segments
 */
export interface LessonWithSegments {
  id: string;
  title: string;
  description?: string;
  segments: LessonSegment[];
  total_duration_minutes: number;
  total_segments: number;
  user_progress?: {
    completed_segments: number;
    total_segments: number;
    completion_percentage: number;
    total_time_spent_seconds: number;
  };
}

// ============================================================================
// SEGMENT PROGRESS TRACKING
// ============================================================================

export interface SegmentProgressStats {
  segment_id: string;
  segment_title: string;
  total_users: number;
  completed_users: number;
  completion_percentage: number;
  average_time_spent_seconds: number;
  average_attempts: number;
  quiz_segments?: {
    average_score: number;
    pass_rate: number; // Percentage who passed
  };
}

export interface UserSegmentStats {
  total_segments_completed: number;
  total_time_spent_seconds: number;
  average_time_per_segment_seconds: number;
  segments_in_progress: number;
  segments_locked: number;
  completion_rate_percentage: number;
  average_quiz_score?: number;
  quiz_pass_rate?: number;
}

/**
 * Detailed progress for lesson
 */
export interface LessonProgressDetail {
  lesson_id: string;
  lesson_title: string;
  enrollment_id: string;
  total_segments: number;
  completed_segments: number;
  in_progress_segments: number;
  locked_segments: number;
  completion_percentage: number;
  total_duration_minutes: number;
  time_spent_minutes: number;
  estimated_remaining_minutes: number;
  segments: {
    segment_id: string;
    segment_number: number;
    title: string;
    status: SegmentStatus;
    progress_percentage: number;
  }[];
  last_accessed_segment?: {
    id: string;
    number: number;
    title: string;
  };
  next_segment?: {
    id: string;
    number: number;
    title: string;
  };
}

// ============================================================================
// MICROLEARNING FEATURES
// ============================================================================

export interface SegmentQuiz {
  id: string;
  segment_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer' | 'matching';
  questions: {
    id: string;
    question_text: string;
    options?: string[]; // For multiple choice
    correct_answer: string | number;
    explanation?: string;
  }[];
  passing_score: number; // Required score to pass (0-100)
  max_attempts?: number; // Max attempts allowed
  time_limit_seconds?: number; // Time limit for quiz
}

export interface SegmentResource {
  id: string;
  segment_id: string;
  type: 'pdf' | 'image' | 'code' | 'transcript' | 'link' | 'attachment';
  title: string;
  url: string;
  description?: string;
  is_downloadable: boolean;
  size_bytes?: number;
}

export interface SegmentDependency {
  segment_id: string;
  depends_on_segment_id: string; // Must complete this first
  hard_dependency: boolean; // True = cannot skip
}

// ============================================================================
// SEGMENT RECOMMENDATIONS & ADAPTIVE
// ============================================================================

export interface AdaptiveSegmentRecommendation {
  segment_id: string;
  reason: 'prerequisite_not_met' | 'skill_gap' | 'performance_based' | 'personalized';
  priority: 'critical' | 'recommended' | 'optional';
  description: string;
}

export interface SegmentDifficulty {
  segment_id: string;
  base_difficulty: EstimatedEffort;
  adjusted_difficulty?: EstimatedEffort; // Based on user performance
  time_estimate_seconds: number;
  adjusted_time_estimate?: number;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateSegmentRequest {
  lesson_id: string;
  segment_number: number;
  title: string;
  description?: string;
  content_type: ContentType;
  content_url?: string;
  duration_seconds: number;
  learning_objectives?: string[];
  key_concepts?: string[];
  estimated_effort: EstimatedEffort;
}

export interface UpdateSegmentProgressRequest {
  status?: SegmentStatus;
  progress_percentage?: number;
  time_spent_seconds?: number;
  attempts?: number;
  quiz_score?: number;
  quiz_passed?: boolean;
}

export interface StartSegmentRequest {
  user_id: string;
  segment_id: string;
  enrollment_id: string;
}

export interface CompleteSegmentRequest {
  user_id: string;
  segment_id: string;
  enrollment_id: string;
  time_spent_seconds: number;
  quiz_score?: number;
}

export interface SegmentBatchProgressRequest {
  user_id: string;
  enrollment_id: string;
  segments: {
    segment_id: string;
    status: SegmentStatus;
    progress_percentage: number;
    time_spent_seconds?: number;
    quiz_score?: number;
  }[];
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SegmentApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LessonSegmentsListResponse {
  lesson_id: string;
  lesson_title: string;
  total_segments: number;
  total_duration_minutes: number;
  segments: SegmentWithProgress[];
  completion_percentage?: number;
}

export interface UserSegmentProgressResponse {
  segment_id: string;
  segment_title: string;
  current_status: SegmentStatus;
  progress_percentage: number;
  time_spent_seconds: number;
  quiz_score?: number;
  quiz_passed?: boolean;
}

// ============================================================================
// SEGMENT SCHEDULING & SPACED LEARNING
// ============================================================================

export interface SegmentSchedule {
  segment_id: string;
  user_id: string;
  enrollment_id: string;
  scheduled_date?: TimestampType; // When to suggest this segment
  priority_order: number; // 1 = most urgent
  suggested_time_of_day?: string; // 'morning', 'afternoon', 'evening'
}

export interface SpacedLearningReview {
  segment_id: string;
  user_id: string;
  initial_completion_date: TimestampType;
  review_date: TimestampType;
  next_review_date?: TimestampType;
  retention_level: 'fresh' | 'fading' | 'forgotten'; // Based on spaced repetition
}

// ============================================================================
// ANALYTICS & INSIGHTS
// ============================================================================

export interface SegmentEngagementMetrics {
  segment_id: string;
  total_users_exposed: number;
  total_completions: number;
  engagement_rate: number; // Completion rate 0-1
  average_time_spent_seconds: number;
  time_vs_estimate_ratio: number; // Actual / Expected
  dropout_rate: number; // Users who started but didn't complete
  satisfaction_score?: number; // 1-5 user rating
}

export interface LessonProgressInsights {
  lesson_id: string;
  bottleneck_segments: LessonSegment[]; // Segments where users struggle
  easy_segments: LessonSegment[]; // Segments most users pass quickly
  typical_time_per_segment: Record<string, number>; // Actual vs estimated
  recommended_next_steps: string[];
}

// ============================================================================
// SEGMENT VARIATIONS & A/B TESTING
// ============================================================================

export interface SegmentVariation {
  id: string;
  segment_id: string;
  variation_name: string;
  content_url_variant: string;
  description: string;
  is_control: boolean; // True = original version
  created_at: TimestampType;
}

export interface SegmentABTest {
  id: string;
  segment_id: string;
  control_variation_id: string;
  test_variation_id: string;
  metric_to_test: 'completion_rate' | 'engagement_time' | 'quiz_score' | 'satisfaction';
  start_date: TimestampType;
  end_date?: TimestampType;
  results?: {
    control_performance: number;
    test_performance: number;
    winner: 'control' | 'test' | 'no_significant_difference';
    confidence_level: number;
  };
}
