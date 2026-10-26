import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getCourses, getCourseCategories } from '@/lib/supabase-data';
import { getPrograms } from '@/app/admin/programs-actions';
import {
  getTestSeries,
  searchMockTests,
  getMockTestFilterOptions,
} from '@/app/instructor/test-series-actions';
import type { Course } from '@/types';
import { metaDescription } from '@/lib/seo';
import {
  filterPublishedCourses,
} from '@/lib/filter-published-courses';

export { filterPublishedCourses };

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

/** Listing fields only. Full course HTML stays off the public catalogue payload. */
export function toPublicCourseListing(course: Course): Course {
  return {
    id: course.id,
    title: course.title,
    description: metaDescription(course.description, 160),
    imageUrl: course.imageUrl,
    instructor: {
      id: course.instructor?.id || '',
      name: course.instructor?.name || 'Unknown Instructor',
    },
    studentCount: course.studentCount || 0,
    rating: course.rating || 0,
    ratingCount: course.ratingCount || 0,
    type: course.type,
    price: course.price,
    originalPrice: course.originalPrice,
    category: course.category,
    hasCertificate: Boolean(course.hasCertificate),
    duration: course.duration,
    level: course.level,
    freeLessonsCount: course.freeLessonsCount,
  };
}
