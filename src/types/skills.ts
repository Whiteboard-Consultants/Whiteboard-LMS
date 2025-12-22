/**
 * Skills System Types
 * Comprehensive type definitions for the learning experience skills module
 */

import type { TimestampType } from './index';

// ============================================================================
// SKILL DEFINITIONS
// ============================================================================

export type SkillCategory =
  | 'Technical'
  | 'Business'
  | 'Language'
  | 'Soft Skills'
  | 'Test Prep'
  | 'Data Science'
  | 'Design'
  | 'Other';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type ProficiencyLevel = 'Basic' | 'Intermediate' | 'Advanced';

/**
 * Skill master record
 * Represents a single skill that can be taught or acquired
 */
export interface Skill {
  id: string;
  name: string;
  description?: string;
  category: SkillCategory;
  difficulty_level: DifficultyLevel;
  parent_skill_id?: string; // For hierarchical skills (e.g., JavaScript -> React)
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

/**
 * Course to Skill mapping
 * Defines which skills a course teaches and at what level
 */
export interface CourseSkill {
  id: string;
  course_id: string;
  skill_id: string;
  proficiency_level: ProficiencyLevel; // What level of this skill will student reach
  weight: number; // 1-10: importance/weight of this skill in the course
  created_at?: TimestampType;
}

/**
 * User Skill tracking
 * Records a user's proficiency level in a specific skill
 */
export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  proficiency_level: DifficultyLevel;
  mastery_percentage: number; // 0-100
  practice_count: number; // How many times practiced
  last_practiced_at?: TimestampType;
  acquired_at?: TimestampType; // When user first demonstrated this skill
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

/**
 * Learning Goal
 * Career or learning objectives that define what skills to acquire
 */
export interface UserLearningGoal {
  id: string;
  user_id: string;
  goal_title: string;
  goal_description?: string;
  role_title?: string; // e.g., "Senior Data Engineer"
  target_skills: string[]; // Array of skill IDs needed for this goal
  priority: number; // 1 (low) to 5 (high)
  target_completion_date?: TimestampType;
  status: 'active' | 'completed' | 'paused';
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

// ============================================================================
// SKILL GAPS & ANALYSIS
// ============================================================================

export interface SkillGap {
  skill_id: string;
  skill_name: string;
  category: SkillCategory;
  user_proficiency?: DifficultyLevel;
  required_level: DifficultyLevel;
  proficiency_gap: number; // 0-100 (how far from requirement)
  priority: 'critical' | 'high' | 'medium' | 'low';
  courses_that_teach: CourseSkillMapping[];
}

export interface SkillGapAnalysis {
  id: string;
  user_id: string;
  goal_id?: string;
  total_skills_needed: number;
  skills_mastered: number;
  completion_percentage: number;
  priority_gaps: SkillGap[]; // Top 3-5 critical gaps
  recommended_courses: RecommendedCourse[];
  analysis_generated_at?: TimestampType;
  created_at?: TimestampType;
  updated_at?: TimestampType;
}

// ============================================================================
// SKILL PROGRESS TRACKING
// ============================================================================

export interface SkillProgress {
  skill_id: string;
  skill_name: string;
  current_level: DifficultyLevel;
  mastery_percentage: number;
  practice_count: number;
  last_practiced_at?: TimestampType;
  courses_that_teach: CourseSkillMapping[];
  next_milestone?: {
    level: DifficultyLevel;
    required_mastery: number;
    estimated_days_to_reach: number;
  };
}

// ============================================================================
// COURSE RECOMMENDATIONS
// ============================================================================

export interface CourseSkillMapping {
  course_id: string;
  course_title: string;
  skill_proficiency_level: ProficiencyLevel;
  weight: number;
}

export interface RecommendedCourse {
  course_id: string;
  course_title: string;
  course_description?: string;
  skills_taught: string[]; // Array of skill IDs
  priority_score: number; // 0-100 (how well this closes gaps)
  skills_gap_coverage: number; // Percentage of user's gaps this course covers
  estimated_duration_hours?: number;
  difficulty_match?: number; // 0-1 (how well user's level matches course difficulty)
}

// ============================================================================
// SKILL STATISTICS & ANALYTICS
// ============================================================================

export interface UserSkillStats {
  total_skills: number;
  beginner_count: number;
  intermediate_count: number;
  advanced_count: number;
  expert_count: number;
  average_mastery: number;
  skills_by_category: SkillCategoryStat[];
  highest_proficiency_skill?: Skill;
  lowest_proficiency_skill?: Skill;
}

export interface SkillCategoryStat {
  category: SkillCategory;
  skill_count: number;
  average_mastery: number;
  mastered_count: number; // Advanced or Expert level
  in_progress_count: number; // Basic or Intermediate
  not_started_count: number;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateUserSkillRequest {
  skill_id: string;
  proficiency_level: DifficultyLevel;
  mastery_percentage?: number;
}

export interface UpdateUserSkillRequest {
  proficiency_level?: DifficultyLevel;
  mastery_percentage?: number;
  practice_count?: number;
  last_practiced_at?: TimestampType;
}

export interface CreateLearningGoalRequest {
  goal_title: string;
  goal_description?: string;
  role_title?: string;
  target_skills: string[]; // Array of skill IDs
  priority?: number;
  target_completion_date?: TimestampType;
}

export interface UpdateLearningGoalRequest {
  goal_title?: string;
  goal_description?: string;
  role_title?: string;
  target_skills?: string[];
  priority?: number;
  target_completion_date?: TimestampType;
  status?: 'active' | 'completed' | 'paused';
}

export interface SkillGapAnalysisRequest {
  user_id: string;
  goal_id?: string;
}

// ============================================================================
// SKILL FILTERING & SEARCH
// ============================================================================

export interface SkillFilter {
  categories?: SkillCategory[];
  difficulty_levels?: DifficultyLevel[];
  search_query?: string;
  exclude_ids?: string[];
}

export interface SkillSearchResult {
  skills: Skill[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
}

// ============================================================================
// SKILL ACQUISITION EVENTS
// ============================================================================

export type SkillEventType =
  | 'skill_learned'
  | 'proficiency_increased'
  | 'skill_mastered'
  | 'skill_gap_identified'
  | 'recommended_course_for_skill';

export interface SkillEvent {
  event_type: SkillEventType;
  user_id: string;
  skill_id: string;
  previous_level?: DifficultyLevel;
  new_level?: DifficultyLevel;
  triggered_by?: 'lesson_completion' | 'quiz_pass' | 'course_completion' | 'manual';
  reference_id?: string; // lesson_id, course_id, etc.
  created_at: TimestampType;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface SkillApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedSkillResponse {
  data: Skill[];
  pagination: {
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
