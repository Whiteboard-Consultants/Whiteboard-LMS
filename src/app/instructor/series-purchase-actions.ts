'use server';

import { createClient } from '@supabase/supabase-js';
import type { SeriesPurchase, TestPurchase, PurchaseType } from '@/types';

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

/**
 * Check if user has access to a test
 * Returns true if:
 * 1. User has individual test access (purchased)
 * 2. User has series package access (purchased)
 * 3. Test is linked to a course AND user is enrolled in that course
 */
export async function userHasTestAccess(
  userId: string,
  testId: string
): Promise<{ success: boolean; hasAccess: boolean; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, hasAccess: false, error: 'Admin client not initialized' };
    }

    // Check direct test access (purchased)
    const { data: directAccess } = await supabaseAdmin
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('test_id', testId)
      .eq('purchase_type', 'individual')
      .single();

    if (directAccess) {
      console.log(`✅ User has direct test access for test ${testId}`);
      return { success: true, hasAccess: true };
    }

    // Get test details including series_id and course_id
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('series_id, course_id')
      .eq('id', testId)
      .single();

    if (testError) {
      console.error('Error fetching test details:', testError);
      return { success: true, hasAccess: false };
    }

    if (!test) {
      return { success: true, hasAccess: false };
    }

    // Check if test is linked to a course and user is enrolled in that course
    if (test.course_id) {
      console.log(`🔍 Test ${testId} is linked to course ${test.course_id}`);
      const { data: courseEnrollment } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('course_id', test.course_id)
        .in('status', ['approved', 'active', 'completed'])
        .single();

      if (courseEnrollment) {
        console.log(`✅ User is enrolled in course ${test.course_id}, granting test access`);
        return { success: true, hasAccess: true };
      }
    }

    // Check series package access
    if (test.series_id) {
      console.log(`🔍 Test ${testId} is part of series ${test.series_id}`);
      const { data: seriesAccess } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', userId)
        .eq('series_id', test.series_id)
        .eq('purchase_type', 'series_package')
        .single();

      if (seriesAccess) {
        console.log(`✅ User has series package access for series ${test.series_id}`);
        return { success: true, hasAccess: true };
      }
    }

    return { success: true, hasAccess: false };
  } catch (error: any) {
    console.error('Error checking test access:', error);
    return { success: false, hasAccess: false, error: error.message };
  }
}

/**
 * Get user's series package purchases
 */
export async function getUserSeriesPurchases(
  userId: string
): Promise<{ success: boolean; data?: SeriesPurchase[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        user_id,
        series_id,
        price,
        created_at,
        test_series(title)
      `)
      .eq('user_id', userId)
      .eq('purchase_type', 'series_package')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching series purchases:', error);
      return { success: false, error: error.message };
    }

    const formatted = (data || []).map((enrollment: any) => {
      const seriesData = Array.isArray(enrollment.test_series) 
        ? enrollment.test_series[0] 
        : enrollment.test_series;
      return {
        id: enrollment.id,
        userId: enrollment.user_id,
        seriesId: enrollment.series_id,
        seriesTitle: seriesData?.title || 'Unknown Series',
        price: enrollment.price || 0,
        discount: 0, // Calculate from series discount_percentage if needed
        purchaseDate: enrollment.created_at,
        status: 'active' as const
      };
    });

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getUserSeriesPurchases:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's individual test purchases
 */
export async function getUserTestPurchases(
  userId: string
): Promise<{ success: boolean; data?: TestPurchase[]; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select(`
        id,
        user_id,
        test_id,
        tests:test_id(title),
        price,
        created_at
      `)
      .eq('user_id', userId)
      .eq('purchase_type', 'individual')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching test purchases:', error);
      return { success: false, error: error.message };
    }

    const formatted = (data || []).map((enrollment: any) => ({
      id: enrollment.id,
      userId: enrollment.user_id,
      testId: enrollment.test_id,
      testTitle: enrollment.tests?.title || 'Unknown Test',
      price: enrollment.price || 0,
      purchaseDate: enrollment.created_at,
      status: 'active' as const
    }));

    return { success: true, data: formatted };
  } catch (error: any) {
    console.error('Error in getUserTestPurchases:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Record a series package purchase
 * Grants user access to all tests in the series
 */
export async function purchaseSeriesPackage(
  userId: string,
  seriesId: string,
  price: number,
  couponCode?: string
): Promise<{ success: boolean; data?: SeriesPurchase; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    console.log('💳 [purchaseSeriesPackage] Starting series purchase:', { userId, seriesId, price, couponCode });

    // Step 1: Try to fetch as a series first
    let { data: series, error: seriesError } = await supabaseAdmin
      .from('test_series')
      .select('instructor_id')
      .eq('id', seriesId)
      .single();

    // Step 2: If not found as series, try to find as test
    let test: any = null;
    let testError: any = null;
    let actualSeriesId = seriesId; // The series ID we'll use for enrollments
    let isPureTestPurchase = false; // True only if test has NO series

    if (seriesError || !series) {
      console.warn('⚠️ [purchaseSeriesPackage] Series not found, checking if it\'s a test instead...');
      
      const testLookup = await supabaseAdmin
        .from('tests')
        .select('instructor_id, series_id')
        .eq('id', seriesId)
        .single();
      
      test = testLookup.data;
      testError = testLookup.error;
      
      if (!testError && test) {
        console.log('✅ [purchaseSeriesPackage] Found test:', { testId: seriesId, hasSeries: !!test.series_id });
        
        // If test has a series_id, we're purchasing the whole series
        if (test.series_id) {
          console.log('✅ Test is part of a series, fetching series details:', test.series_id);
          actualSeriesId = test.series_id;
          
          // Fetch the series details
          const { data: seriesData, error: seriesErr } = await supabaseAdmin
            .from('test_series')
            .select('instructor_id')
            .eq('id', test.series_id)
            .single();
          
          if (seriesErr || !seriesData) {
            console.error('❌ Could not fetch series details:', seriesErr?.message);
            return { success: false, error: 'Could not fetch series details' };
          }
          series = seriesData;
        } else {
          // Pure test purchase - no series
          console.log('✅ Test is standalone (not part of a series)');
          isPureTestPurchase = true;
          series = { instructor_id: test.instructor_id };
        }
      } else {
        // Neither series nor test found
        const { data: allSeries } = await supabaseAdmin
          .from('test_series')
          .select('id, title')
          .limit(5);
        
        const { data: sampleTests } = await supabaseAdmin
          .from('tests')
          .select('id, title')
          .limit(5);
        
        console.error('❌ [purchaseSeriesPackage] Series/test lookup failed');
        console.error('❌ Looking for ID:', seriesId);
        console.error('❌ Series error:', seriesError?.message);
        console.error('❌ Test error:', testError?.message);
        console.error('❌ Sample series:', allSeries?.length ? allSeries.map(s => s.title) : 'none');
        console.error('❌ Sample tests:', sampleTests?.length ? sampleTests.map(t => t.title) : 'none');
        return { success: false, error: `Series/test not found: ${seriesError?.message || testError?.message || 'Unknown error'}` };
      }
    }

    // Step 3: Create enrollment record
    let enrollmentData: any = {
      user_id: userId,
      instructor_id: series.instructor_id,
      purchase_type: 'series_package',
      amount: price,
      status: 'approved',
      coupon_code: couponCode || null,
      enrolled_at: new Date().toISOString()
    };

    // For pure test purchases, set test_id; for series purchases, set series_id
    if (isPureTestPurchase) {
      enrollmentData.test_id = seriesId;
    } else {
      enrollmentData.series_id = actualSeriesId;
    }

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert(enrollmentData)
      .select(`
        id,
        user_id,
        series_id,
        test_id,
        test_series:series_id(title),
        amount,
        enrolled_at
      `)
      .single();

    if (enrollmentError) {
      console.error('Error creating enrollment:', enrollmentError);
      return { success: false, error: enrollmentError.message };
    }

    console.log(`✅ Created enrollment for ${isPureTestPurchase ? 'test' : 'series'}:`, { enrollmentId: enrollment.id, actualSeriesId, isPureTestPurchase });

    // 2. Get all tests in this series (skip if this is a pure test purchase without a series)
    if (!isPureTestPurchase) {
      const { data: tests, error: testsError } = await supabaseAdmin
        .from('tests')
        .select('id, price')
        .eq('series_id', actualSeriesId);

      if (testsError) {
        console.error('Error fetching tests in series:', testsError);
        // Continue anyway - at least series purchase is recorded
      } else if (tests && tests.length > 0) {
        // Create individual test enrollments (for analytics/tracking)
        const testEnrollments = tests.map(test => ({
          user_id: userId,
          test_id: test.id,
          instructor_id: series.instructor_id,
          purchase_type: 'series_package' as PurchaseType,
          amount: test.price || 0,
          status: 'active',
          enrolled_at: new Date().toISOString()
        }));

        const { error: testEnrollmentError } = await supabaseAdmin
          .from('enrollments')
          .insert(testEnrollments);

        if (testEnrollmentError) {
          console.error('❌ Failed to create test enrollments for series purchase:', testEnrollmentError);
          // Don't fail the entire purchase for this
        } else {
          console.log(`✅ Successfully created ${testEnrollments.length} test enrollments for series`);
        }
      }
    }

    // Build response - handle both series and test purchases
    let seriesTitle = 'Unknown Series/Test';
    
    if (isPureTestPurchase) {
      // For pure test purchases, try to get the test title
      const { data: testDetails } = await supabaseAdmin
        .from('tests')
        .select('title')
        .eq('id', seriesId)
        .single();
      seriesTitle = testDetails?.title || 'Unknown Test';
    } else {
      // For series purchases, use the relationship data
      const seriesData = Array.isArray(enrollment.test_series) 
        ? enrollment.test_series[0] 
        : enrollment.test_series;
      seriesTitle = seriesData?.title || 'Unknown Series';
    }

    const result: SeriesPurchase = {
      id: enrollment.id,
      userId: enrollment.user_id,
      seriesId: enrollment.series_id || enrollment.test_id || actualSeriesId,
      seriesTitle: seriesTitle,
      price: enrollment.amount || 0,
      discount: 0,
      purchaseDate: enrollment.enrolled_at,
      status: 'active'
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in purchaseSeriesPackage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Record an individual test purchase
 */
export async function purchaseTest(
  userId: string,
  testId: string,
  price: number
): Promise<{ success: boolean; data?: TestPurchase; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        test_id: testId,
        purchase_type: 'individual',
        price: price,
        status: 'active'
      })
      .select(`
        id,
        user_id,
        test_id,
        tests:test_id(title),
        price,
        created_at
      `)
      .single();

    if (enrollmentError) {
      console.error('Error creating test purchase enrollment:', enrollmentError);
      return { success: false, error: enrollmentError.message };
    }

    const testsData = Array.isArray(enrollment.tests) 
      ? enrollment.tests[0] 
      : enrollment.tests;

    const result: TestPurchase = {
      id: enrollment.id,
      userId: enrollment.user_id,
      testId: enrollment.test_id,
      testTitle: testsData?.title || 'Unknown Test',
      price: enrollment.price || 0,
      purchaseDate: enrollment.created_at,
      status: 'active'
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error('Error in purchaseTest:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get series package details with pricing info
 */
export async function getSeriesPackageDetails(
  seriesId: string
): Promise<{
  success: boolean;
  data?: {
    seriesId: string;
    seriesTitle: string;
    seriesPrice: number;
    discountPercentage: number;
    testCount: number;
    individualTestPrice: number;
    totalIndividualPrice: number;
    savings: number;
  };
  error?: string;
}> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    // Get series info
    const { data: series, error: seriesError } = await supabaseAdmin
      .from('test_series')
      .select('title, price, discount_percentage')
      .eq('id', seriesId)
      .single();

    if (seriesError) {
      return { success: false, error: seriesError.message };
    }

    // Get tests in series
    const { data: tests, error: testsError } = await supabaseAdmin
      .from('tests')
      .select('price')
      .eq('series_id', seriesId);

    if (testsError) {
      return { success: false, error: testsError.message };
    }

    const totalIndividualPrice = tests.reduce((sum, t) => sum + (t.price || 0), 0);
    const savings = totalIndividualPrice - (series.price || totalIndividualPrice);

    return {
      success: true,
      data: {
        seriesId,
        seriesTitle: series.title,
        seriesPrice: series.price || 0,
        discountPercentage: series.discount_percentage || 0,
        testCount: tests.length,
        individualTestPrice: totalIndividualPrice / tests.length || 0,
        totalIndividualPrice,
        savings: Math.max(0, savings)
      }
    };
  } catch (error: any) {
    console.error('Error in getSeriesPackageDetails:', error);
    return { success: false, error: error.message };
  }
}

export async function purchaseIndividualTest(
  userId: string,
  testId: string,
  price: number,
  couponCode?: string
): Promise<{ success: boolean; data?: SeriesPurchase; error?: string }> {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Admin client not initialized' };
    }

    console.log('💳 [purchaseIndividualTest] Processing purchase:', { userId, testId, price, couponCode });

    // First, fetch the test to get instructor_id
    const { data: test, error: testError } = await supabaseAdmin
      .from('tests')
      .select('instructor_id')
      .eq('id', testId)
      .single();

    if (testError || !test) {
      console.error('❌ [purchaseIndividualTest] Error fetching test:', testError);
      return { success: false, error: 'Test not found' };
    }

    // Create enrollment record for individual test purchase
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
      .from('enrollments')
      .insert({
        user_id: userId,
        test_id: testId,
        instructor_id: test.instructor_id,
        purchase_type: 'individual',
        amount: price,
        status: 'approved',
        coupon_code: couponCode || null
      })
      .select(`
        id,
        user_id,
        test_id,
        amount,
        enrolled_at
      `)
      .single();

    if (enrollmentError) {
      console.error('❌ [purchaseIndividualTest] Error creating enrollment:', enrollmentError);
      return { success: false, error: enrollmentError.message };
    }

    console.log('✅ [purchaseIndividualTest] Purchase recorded:', enrollment.id);

    const result: SeriesPurchase = {
      id: enrollment.id,
      userId: enrollment.user_id,
      seriesId: testId,
      seriesTitle: 'Test Purchase',
      price: enrollment.amount || 0,
      discount: 0,
      purchaseDate: enrollment.enrolled_at,
      status: 'active'
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error('❌ [purchaseIndividualTest] Error:', error);
    return { success: false, error: error.message };
  }
}

