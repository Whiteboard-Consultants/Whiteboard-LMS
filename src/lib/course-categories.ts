import { CourseCategory } from "@/types";

// Define all available course categories with their display information
export const COURSE_CATEGORIES = {
  'All Programs': {
    id: 'all',
    name: 'All Programs',
    description: 'Browse all available courses and programs',
    color: '#6B7280'
  },
  'Test Prep': {
    id: 'test-prep',
    name: 'Test Prep',
    description: 'IELTS, TOEFL, GRE, GMAT and other standardized test preparation',
    color: '#3B82F6'
  },
  'Career Development': {
    id: 'career-development',
    name: 'Career Development',
    description: 'Professional skills, interview preparation, and career guidance',
    color: '#10B981'
  },
  'Language Skills': {
    id: 'language-skills',
    name: 'Language Skills',
    description: 'English communication, writing, and language proficiency',
    color: '#F59E0B'
  },
  'Free Courses': {
    id: 'free',
    name: 'Free Courses',
    description: 'Explore our free educational content and resources',
    color: '#EF4444'
  }
} as const;

// Type for category keys
export type CategoryKey = keyof typeof COURSE_CATEGORIES;

// Helper function to get category info
export function getCategoryInfo(category: CategoryKey) {
  return COURSE_CATEGORIES[category];
}

// Helper function to get all category options for filters/dropdowns
export function getAllCategories(): CategoryKey[] {
  return Object.keys(COURSE_CATEGORIES) as CategoryKey[];
}

// Helper function to get actual course categories (excluding special filters)
export function getCourseCategories(): CourseCategory[] {
  return ['Test Prep', 'Career Development', 'Language Skills'];
}

// Helper function to map display category to database category
export function mapCategoryForDatabase(displayCategory: CategoryKey): string | undefined {
  switch (displayCategory) {
    case 'All Programs':
      return undefined; // No filter
    case 'Free Courses':
      // Handle different possible values for free courses
      return 'FREE'; // Based on your course data
    case 'Test Prep':
    case 'Career Development':
    case 'Language Skills':
      return displayCategory;
    default:
      return undefined;
  }
}