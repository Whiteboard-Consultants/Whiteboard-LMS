/**
 * Skills Configuration
 * Constants, defaults, and configuration for the skills system
 */

import type { SkillCategory, DifficultyLevel } from '@/types/skills';

/**
 * All available skill categories
 */
export const SKILL_CATEGORIES: SkillCategory[] = [
  'Technical',
  'Business',
  'Language',
  'Soft Skills',
  'Test Prep',
  'Data Science',
  'Design',
  'Other',
];

/**
 * Difficulty levels in progression order
 */
export const DIFFICULTY_LEVELS: DifficultyLevel[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Expert',
];

/**
 * Proficiency level descriptions
 */
export const PROFICIENCY_DESCRIPTIONS: Record<DifficultyLevel, string> = {
  Beginner: 'Just starting, understanding fundamentals',
  Intermediate: 'Comfortable applying the skill, need guidance on complex tasks',
  Advanced: 'Can work independently, solving complex problems',
  Expert: 'Deep mastery, can teach and mentor others',
};

/**
 * Difficulty colors for UI
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  Beginner: '#10B981', // Green
  Intermediate: '#3B82F6', // Blue
  Advanced: '#F59E0B', // Amber
  Expert: '#EF4444', // Red
};

/**
 * Category icons and descriptions
 */
export const CATEGORY_CONFIG: Record<SkillCategory, { icon: string; description: string; color: string }> = {
  Technical: {
    icon: '💻',
    description: 'Programming, software, and engineering skills',
    color: '#6366F1',
  },
  Business: {
    icon: '📊',
    description: 'Business, management, and professional skills',
    color: '#8B5CF6',
  },
  Language: {
    icon: '🌍',
    description: 'Language and communication skills',
    color: '#EC4899',
  },
  'Soft Skills': {
    icon: '👥',
    description: 'Interpersonal and soft skills',
    color: '#14B8A6',
  },
  'Test Prep': {
    icon: '📝',
    description: 'Standardized test preparation',
    color: '#F97316',
  },
  'Data Science': {
    icon: '📈',
    description: 'Data analysis and science skills',
    color: '#06B6D4',
  },
  Design: {
    icon: '🎨',
    description: 'Design and creative skills',
    color: '#EC4899',
  },
  Other: {
    icon: '📚',
    description: 'Other skills and areas',
    color: '#6B7280',
  },
};

/**
 * Mastery percentage thresholds
 */
export const MASTERY_THRESHOLDS = {
  BEGINNER_THRESHOLD: 0,
  INTERMEDIATE_THRESHOLD: 25,
  ADVANCED_THRESHOLD: 75,
  EXPERT_THRESHOLD: 90,
} as const;

/**
 * Skill practice and learning constants
 */
export const SKILL_LEARNING_CONSTANTS = {
  // Points per practice session
  POINTS_PER_PRACTICE: 10,
  
  // Mastery percentage increase per activity
  MASTERY_INCREASE_LESSON_COMPLETE: 5,
  MASTERY_INCREASE_QUIZ_PASS: 3,
  MASTERY_INCREASE_QUIZ_PERFECT: 5,
  MASTERY_INCREASE_COURSE_COMPLETE: 20,
  
  // How many days of inactivity before "last practiced" becomes stale
  PRACTICE_STALE_DAYS: 30,
  
  // Default practice count before considering a skill learned
  PRACTICE_COUNT_TO_LEARN: 10,
  
  // Estimated days to reach next level
  DAYS_TO_INTERMEDIATE: 30,
  DAYS_TO_ADVANCED: 60,
  DAYS_TO_EXPERT: 90,
} as const;

/**
 * Skill gap analysis thresholds
 */
export const GAP_ANALYSIS_THRESHOLDS = {
  CRITICAL_GAP: 60, // 60-100% gap = critical
  HIGH_GAP: 40, // 40-60% gap = high
  MEDIUM_GAP: 20, // 20-40% gap = medium
  LOW_GAP: 0, // 0-20% gap = low
} as const;

/**
 * Skill acquisition triggers
 * Events that can trigger skill awards or level-ups
 */
export const SKILL_TRIGGERS = {
  LESSON_COMPLETION: 'lesson_completion',
  QUIZ_PASS: 'quiz_pass',
  QUIZ_PERFECT: 'quiz_perfect_score',
  COURSE_COMPLETION: 'course_completion',
  ASSIGNMENT_SUBMISSION: 'assignment_submission',
  PROJECT_COMPLETION: 'project_completion',
  MILESTONE_ACHIEVEMENT: 'milestone_achievement',
} as const;

/**
 * Default skills to recommend for new users (by category)
 */
export const RECOMMENDED_STARTER_SKILLS_BY_CATEGORY: Record<SkillCategory, string[]> = {
  Technical: ['Communication', 'Problem Solving', 'Time Management'],
  Business: ['Project Management', 'Leadership', 'Communication'],
  Language: ['English', 'Critical Thinking'],
  'Soft Skills': ['Communication', 'Teamwork', 'Adaptability'],
  'Test Prep': ['Quantitative Reasoning', 'Verbal Reasoning'],
  'Data Science': ['Statistics', 'Excel'],
  Design: ['Design Thinking', 'Communication'],
  Other: ['Learning', 'Curiosity'],
};

/**
 * Skill prerequisites (skills that should be learned before others)
 */
export const SKILL_PREREQUISITES: Record<string, string[]> = {
  'TypeScript': ['JavaScript'],
  'React': ['JavaScript'],
  'Node.js': ['JavaScript'],
  'Advanced SQL': ['SQL'],
  'Machine Learning': ['Statistics', 'Python'],
  'Kubernetes': ['Docker', 'System Design'],
  'Advanced System Design': ['System Design', 'Database Design'],
};

/**
 * Maximum skills a user can track
 */
export const MAX_TRACKED_SKILLS = 50;

/**
 * Maximum learning goals a user can have
 */
export const MAX_LEARNING_GOALS = 5;

/**
 * Pagination defaults
 */
export const PAGINATION_DEFAULTS = {
  SKILLS_PER_PAGE: 20,
  USER_SKILLS_PER_PAGE: 15,
  GOALS_PER_PAGE: 10,
} as const;

/**
 * Cache durations (in seconds)
 */
export const CACHE_DURATIONS = {
  SKILLS_LIST: 3600, // 1 hour
  USER_SKILLS: 1800, // 30 minutes
  SKILL_STATS: 3600, // 1 hour
  GAP_ANALYSIS: 86400, // 24 hours
} as const;
