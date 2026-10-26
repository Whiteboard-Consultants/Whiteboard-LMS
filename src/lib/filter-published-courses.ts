import type { Course, CourseCategory } from '@/types';
import { mapCategoryForDatabase, type CategoryKey } from '@/lib/course-categories';

/** In-memory filter over a published course list. Safe to import from client components. */
export function filterPublishedCourses(
  courses: Course[],
  options?: {
    searchTerm?: string;
    category?: CourseCategory | 'All Programs' | 'Free Courses' | string;
  }
): Course[] {
  let result = courses;

  if (options?.searchTerm) {
    const q = options.searchTerm.toLowerCase();
    result = result.filter((course) => course.title.toLowerCase().includes(q));
  }

  const category = options?.category;
  if (!category || category === 'All Programs' || category === 'Batch Schedule' || category === 'Mock Tests') {
    return result;
  }

  if (category === 'Free Courses') {
    return result.filter(
      (course) =>
        course.type === 'free' ||
        course.price === 0 ||
        course.price == null
    );
  }

  const databaseCategory = mapCategoryForDatabase(category as CategoryKey);
  if (!databaseCategory) return result;

  return result.filter(
    (course) =>
      course.category === databaseCategory || course.category === category
  );
}
