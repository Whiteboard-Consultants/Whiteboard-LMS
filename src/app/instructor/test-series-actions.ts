'use server';

import { createClient } from '@supabase/supabase-js';
import type { TestSeries, Test, DifficultyLevel } from '@/types';

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

// ============================================================================
// Test Series Operations
// ============================================================================

/**
 * Create a new test series
 */
export async function createTestSeries(
  seriesData: Omit<TestSeries, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; data?: TestSeries; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('test_series')
      .insert({
        title: seriesData.title,
        description: seriesData.description,
        topic_area: seriesData.topicArea,
        instructor_id: seriesData.instructorId,
        cover_image_url: seriesData.coverImageUrl,
        is_published: seriesData.isPublished ?? false,
        price: seriesData.price || null,
        is_purchasable: seriesData.isPurchasable ?? true,
        discount_percentage: seriesData.discountPercentage ?? 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating test series:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        topicArea: data.topic_area,
        instructorId: data.instructor_id,
        coverImageUrl: data.cover_image_url,
        isPublished: data.is_published,
        price: data.price,
        isPurchasable: data.is_purchasable,
        discountPercentage: data.discount_percentage,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    };
  } catch (error: any) {
    console.error('Error in createTestSeries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing test series
 */
export async function updateTestSeries(
  seriesId: string,
  seriesData: Partial<TestSeries>
): Promise<{ success: boolean; data?: TestSeries; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const updatePayload: any = {};
    if (seriesData.title !== undefined) updatePayload.title = seriesData.title;
    if (seriesData.description !== undefined) updatePayload.description = seriesData.description;
    if (seriesData.topicArea !== undefined) updatePayload.topic_area = seriesData.topicArea;
    if (seriesData.coverImageUrl !== undefined) updatePayload.cover_image_url = seriesData.coverImageUrl;
    if (seriesData.isPublished !== undefined) updatePayload.is_published = seriesData.isPublished;
    if (seriesData.price !== undefined) updatePayload.price = seriesData.price;
    if (seriesData.isPurchasable !== undefined) updatePayload.is_purchasable = seriesData.isPurchasable;
    if (seriesData.discountPercentage !== undefined) updatePayload.discount_percentage = seriesData.discountPercentage;

    const { data, error } = await supabaseAdmin
      .from('test_series')
      .update(updatePayload)
      .eq('id', seriesId)
      .select()
      .single();

    if (error) {
      console.error('Error updating test series:', error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        topicArea: data.topic_area,
        instructorId: data.instructor_id,
        coverImageUrl: data.cover_image_url,
        isPublished: data.is_published,
        price: data.price,
        isPurchasable: data.is_purchasable,
        discountPercentage: data.discount_percentage,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }
    };
  } catch (error: any) {
    console.error('Error in updateTestSeries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all test series (with optional filters)
 * When called server-side with admin access, returns all series (instructor's + published)
 */
export async function getTestSeries(filters?: {
  instructorId?: string;
  topicArea?: string;
  isPublished?: boolean;
}): Promise<{ success: boolean; data?: TestSeries[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    let query = supabaseAdmin
      .from('test_series')
      .select(`
        *,
        tests(id)
      `);

    // Note: When called with admin access, we ignore publication status filters
    // and return all series that match other criteria (instructor, topic, etc.)
    // This allows admins and editors to see all series regardless of publish status

    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId);
    }

    if (filters?.topicArea) {
      query = query.eq('topic_area', filters.topicArea);
    }

    // Only apply isPublished filter if explicitly requested
    // Otherwise, admin can see all series
    if (filters?.isPublished === true) {
      query = query.eq('is_published', true);
    } else if (filters?.isPublished === false) {
      query = query.eq('is_published', false);
    }
    // If isPublished is undefined, don't filter - show all

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test series:', error);
      return { success: false, error: error.message };
    }

    const formattedData = (data || []).map((series: any) => ({
      id: series.id,
      title: series.title,
      description: series.description,
      topicArea: series.topic_area,
      instructorId: series.instructor_id,
      coverImageUrl: series.cover_image_url,
      isPublished: series.is_published,
      price: series.price,
      isPurchasable: series.is_purchasable,
      discountPercentage: series.discount_percentage,
      createdAt: series.created_at,
      updatedAt: series.updated_at,
      testCount: series.tests?.length || 0
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error in getTestSeries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a single test series by ID
 */
export async function getTestSeriesById(
  seriesId: string
): Promise<{ success: boolean; data?: TestSeries; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('test_series')
      .select(`
        *,
        tests(id, topic, difficulty_level)
      `)
      .eq('id', seriesId)
      .single();

    if (error) {
      console.error('Error fetching test series:', error);
      return { success: false, error: error.message };
    }

    // Extract unique topics from tests
    const topics = [...new Set((data.tests || []).map((t: any) => t.topic))].filter(Boolean);

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        topicArea: data.topic_area,
        instructorId: data.instructor_id,
        coverImageUrl: data.cover_image_url,
        isPublished: data.is_published,
        price: data.price,
        isPurchasable: data.is_purchasable,
        discountPercentage: data.discount_percentage,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        testCount: data.tests?.length || 0,
        topicsInSeries: topics
      }
    };
  } catch (error: any) {
    console.error('Error in getTestSeriesById:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Test Operations (Series-Specific)
// ============================================================================

/**
 * Get a single test by ID with associated series pricing data
 */
export async function getTestById(
  testId: string
): Promise<{ success: boolean; data?: Test; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    console.log('🔍 [getTestById] Fetching test:', testId);

    // First get the test
    const { data: testData, error: testError } = await supabaseAdmin
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single();

    if (testError || !testData) {
      console.error('❌ [getTestById] Error fetching test:', testError);
      return { success: false, error: testError?.message || 'Test not found' };
    }

    console.log('✅ [getTestById] Test fetched:', {
      id: testData.id,
      series_id: testData.series_id,
      price: testData.price
    });

    // If test has a series_id, get the series pricing data
    let seriesData: any = null;
    if (testData.series_id) {
      console.log('🔍 [getTestById] Fetching series:', testData.series_id);
      const { data: series, error: seriesError } = await supabaseAdmin
        .from('test_series')
        .select('id, title, price, discount_percentage, is_purchasable')
        .eq('id', testData.series_id)
        .single();

      console.log('🔍 [getTestById] Series query result - error:', seriesError, 'data:', series);

      if (seriesError) {
        console.error('❌ [getTestById] Error fetching series:', seriesError);
      } else if (series) {
        console.log('✅ [getTestById] Series fetched:', {
          id: series.id,
          title: series.title,
          price: series.price,
          discount_percentage: series.discount_percentage,
          is_purchasable: series.is_purchasable
        });
        seriesData = series;
      } else {
        console.log('⚠️ [getTestById] Series query returned null');
      }
    }

    // Map and return
    const instructorsList = await getInstructors();
    const instructorMap = new Map(instructorsList.map(i => [i.id, i.name]));

    const mappedTest: Test = {
      id: testData.id,
      title: testData.title,
      description: testData.description,
      duration: testData.duration,
      instructorId: testData.instructor_id,
      instructorName: instructorMap.get(testData.instructor_id) || 'Unknown',
      questionCount: testData.question_count || 0,
      createdAt: testData.created_at,
      courseId: testData.course_id,
      courseTitle: testData.course_title,
      type: testData.type || 'mock',
      isTimeLimited: testData.is_time_limited ?? true,
      passingScore: testData.passing_score,
      maxAttempts: testData.max_attempts,
      showResults: testData.show_results ?? true,
      allowReview: testData.allow_review ?? true,
      seriesId: testData.series_id,
      seriesTitle: seriesData?.title,
      seriesPrice: seriesData?.price,
      discountPercentage: seriesData?.discount_percentage,
      topic: testData.topic,
      difficultyLevel: testData.difficulty_level,
      price: testData.price || 0,
      isFree: testData.is_free ?? true
    };

    console.log('✅ [getTestById] Mapped test:', {
      id: mappedTest.id,
      seriesId: mappedTest.seriesId,
      seriesPrice: mappedTest.seriesPrice,
      discountPercentage: mappedTest.discountPercentage
    });

    return { success: true, data: mappedTest };
  } catch (error: any) {
    console.error('❌ [getTestById] Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get all tests in a series (with optional filters)
 */
export async function getTestsInSeries(
  seriesId: string,
  filters?: {
    topic?: string;
    difficultyLevel?: DifficultyLevel;
    minPrice?: number;
    maxPrice?: number;
  }
): Promise<{ success: boolean; data?: Test[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    let query = supabaseAdmin
      .from('tests')
      .select(`
        *,
        test_series:series_id(title)
      `)
      .eq('series_id', seriesId);

    if (filters?.topic) {
      query = query.eq('topic', filters.topic);
    }

    if (filters?.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    // Default: only show published tests for public pages
    query = query.eq('published', true);

    const { data, error } = await query.order('order_within_topic', { ascending: true });

    if (error) {
      console.error('Error fetching tests in series:', error);
      return { success: false, error: error.message };
    }

    const formattedData = (data || []).map((test: any) => ({
      id: test.id,
      title: test.title,
      description: test.description,
      duration: test.time_limit || 0,
      instructorId: test.instructor_id,
      questionCount: test.question_count || 0,
      createdAt: test.created_at,
      type: test.type || 'assessment',
      isTimeLimited: test.time_limit ? true : false,
      showResults: true,
      allowReview: true,
      seriesId: test.series_id,
      seriesTitle: test.test_series?.title,
      topic: test.topic,
      difficultyLevel: test.difficulty_level,
      price: test.price || 0,
      isFree: test.is_free ?? true,
      orderWithinTopic: test.order_within_topic
    }));

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error in getTestsInSeries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all topics in a series
 */
export async function getTopicsInSeries(
  seriesId: string
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('tests')
      .select('topic')
      .eq('series_id', seriesId)
      .not('topic', 'is', null);

    if (error) {
      console.error('Error fetching topics:', error);
      return { success: false, error: error.message };
    }

    const uniqueTopics = [...new Set((data || []).map((t: any) => t.topic))].filter(Boolean);
    return { success: true, data: uniqueTopics };
  } catch (error: any) {
    console.error('Error in getTopicsInSeries:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Search and filter all available mock tests
 */
export async function searchMockTests(filters?: {
  seriesId?: string;
  seriesName?: string;
  topic?: string;
  difficultyLevel?: DifficultyLevel;
  minPrice?: number;
  maxPrice?: number;
  instructorId?: string;
  isPublished?: boolean;
}): Promise<{ success: boolean; data?: Test[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    let query = supabaseAdmin
      .from('tests')
      .select(`
        *,
        test_series:series_id(id, title, price, discount_percentage)
      `);

    if (filters?.seriesId) {
      query = query.eq('series_id', filters.seriesId);
    }

    if (filters?.topic) {
      query = query.eq('topic', filters.topic);
    }

    if (filters?.difficultyLevel) {
      query = query.eq('difficulty_level', filters.difficultyLevel);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.instructorId) {
      query = query.eq('instructor_id', filters.instructorId);
    }

    // Filter by published status (for public pages, only show published tests)
    if (filters?.isPublished !== undefined) {
      query = query.eq('published', filters.isPublished);
    } else {
      // Default: for public pages, only show published tests
      query = query.eq('published', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching mock tests:', error);
      return { success: false, error: error.message };
    }

    // Fetch all instructors separately to enrich data
    const instructorsList = await getInstructors();
    const instructorMap = new Map(instructorsList.map(i => [i.id, i.name]));

    const formattedData = (data || []).map((test: any) => {
      // Handle nested test_series response (may be array or object)
      const seriesData = Array.isArray(test.test_series) 
        ? test.test_series[0] 
        : test.test_series;

      return {
        id: test.id,
        title: test.title,
        description: test.description,
        duration: test.duration || 0,
        instructorId: test.instructor_id,
        instructorName: instructorMap.get(test.instructor_id) || 'Unknown Instructor',
        questionCount: test.question_count || 0,
        createdAt: test.created_at,
        type: test.type || 'mock',
        isTimeLimited: test.is_time_limited ?? true,
        passingScore: test.passing_score || 80,
        maxAttempts: test.max_attempts,
        showResults: test.show_results ?? true,
        allowReview: test.allow_review ?? true,
        seriesId: test.series_id,
        seriesTitle: seriesData?.title,
        seriesPrice: seriesData?.price,
        discountPercentage: seriesData?.discount_percentage || 0,
        topic: test.topic,
        difficultyLevel: test.difficulty_level,
        price: test.price || 0,
        isFree: test.is_free ?? true
      };
    });

    return { success: true, data: formattedData };
  } catch (error: any) {
    console.error('Error in searchMockTests:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get unique values for filters
 */
export async function getMockTestFilterOptions(): Promise<{
  success: boolean;
  data?: {
    series: { id: string; title: string }[];
    topics: string[];
    difficulties: DifficultyLevel[];
    priceRange: { min: number; max: number };
    instructors: { id: string; name: string }[];
  };
  error?: string;
}> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Supabase admin client not initialized' };
    }

    // Get all series
    const { data: seriesData, error: seriesError } = await supabaseAdmin
      .from('test_series')
      .select('id, title')
      .eq('is_published', true);

    // Get all topics
    const { data: topicsData, error: topicsError } = await supabaseAdmin
      .from('tests')
      .select('topic')
      .not('series_id', 'is', null);

    // Get price range
    const { data: priceData, error: priceError } = await supabaseAdmin
      .from('tests')
      .select('price')
      .not('series_id', 'is', null);

    // Get instructors
    const { data: instructorsData, error: instructorsError } = await supabaseAdmin
      .from('tests')
      .select('instructor_id, users(id, name)')
      .not('series_id', 'is', null);

    if (seriesError || topicsError || priceError || instructorsError) {
      return { success: false, error: 'Failed to fetch filter options' };
    }

    const uniqueTopics = [...new Set((topicsData || []).map((t: any) => t.topic))].filter(Boolean);
    const prices = (priceData || []).map((p: any) => p.price || 0).filter((p) => p > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

    const uniqueInstructors = Array.from(
      new Map(
        (instructorsData || []).map((t: any) => [t.instructor_id, { id: t.instructor_id, name: t.users?.name || 'Unknown' }])
      ).values()
    );

    return {
      success: true,
      data: {
        series: seriesData || [],
        topics: uniqueTopics,
        difficulties: ['Easy', 'Medium', 'Medium-Hard', 'Hard'],
        priceRange: { min: minPrice, max: maxPrice },
        instructors: uniqueInstructors
      }
    };
  } catch (error: any) {
    console.error('Error in getMockTestFilterOptions:', error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// Instructor Operations
// ============================================================================

/**
 * Get all instructors from the database (server-side to bypass RLS)
 */
export async function getInstructors(): Promise<Array<{ id: string; name: string; email?: string }>> {
  try {
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized');
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('role', 'instructor');

    if (error) {
      console.error('Error fetching instructors:', error);
      return [];
    }

    console.log('✅ Instructors fetched server-side:', data?.length || 0);
    return data || [];
  } catch (error: any) {
    console.error('Error in getInstructors:', error);
    return [];
  }
}
