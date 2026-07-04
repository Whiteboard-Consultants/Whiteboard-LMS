import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getCourses, getCourseCategories } from '@/lib/supabase-data';
import { getPrograms } from '@/app/admin/programs-actions';
import {
  getTestSeries,
  searchMockTests,
  getMockTestFilterOptions,
} from '@/app/instructor/test-series-actions';
import type { Course, CourseCategory } from '@/types';
import { mapCategoryForDatabase, type CategoryKey } from '@/lib/course-categories';

const REVALIDATE_SECONDS = 1800;

/** Published courses for public listing pages (ISR-friendly). */
export const getCachedPublishedCourses = unstable_cache(
  async () => getCourses({ publishedOnly: true }),
  ['public-published-courses'],
  { revalidate: REVALIDATE_SECONDS, tags: ['courses'] }
);

export const getCachedCourseCategories = unstable_cache(
  async () => getCourseCategories(),
  ['public-course-categories'],
  { revalidate: 3600, tags: ['courses'] }
);

export const getCachedPrograms = unstable_cache(
  async () => {
    const result = await getPrograms();
    return result.success ? result.data ?? [] : [];
  },
  ['public-programs'],
  { revalidate: REVALIDATE_SECONDS, tags: ['programs'] }
);

const fetchPublishedTestSeries = unstable_cache(
  async () => getTestSeries({ isPublished: true }),
  ['public-published-test-series'],
  { revalidate: REVALIDATE_SECONDS, tags: ['test-series'] }
);

/** Request-level dedupe (metadata + page share one fetch). */
export const getPublishedTestSeries = cache(async () => fetchPublishedTestSeries());

const fetchPublishedMockTests = unstable_cache(
  async () => searchMockTests({ isPublished: true }),
  ['public-published-mock-tests'],
  { revalidate: REVALIDATE_SECONDS, tags: ['mock-tests'] }
);

export const getPublishedMockTests = cache(async () => fetchPublishedMockTests());

const fetchMockTestsForSeries = unstable_cache(
  async (seriesId: string) => searchMockTests({ seriesId, isPublished: true }),
  ['public-mock-tests-by-series'],
  { revalidate: REVALIDATE_SECONDS, tags: ['mock-tests'] }
);

export const getMockTestsForSeries = cache(async (seriesId: string) =>
  fetchMockTestsForSeries(seriesId)
);

const fetchMockTestFilterOptions = unstable_cache(
  async () => getMockTestFilterOptions(),
  ['public-mock-test-filter-options'],
  { revalidate: REVALIDATE_SECONDS, tags: ['mock-tests'] }
);

export const getCachedMockTestFilterOptions = cache(async () =>
  fetchMockTestFilterOptions()
);

/** In-memory filter over the cached course list (avoids per-filter DB hits). */
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
  if (!category || category === 'All Programs') {
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
