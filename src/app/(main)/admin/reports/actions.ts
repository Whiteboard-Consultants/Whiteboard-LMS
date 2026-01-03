'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function getCouponEnrollments() {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .select('coupon_code, course_id, user_id, course_price');

    if (error) {
      console.error('Error fetching enrollments with coupons:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || [], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCouponEnrollments:', message);
    return { success: false, data: null, error: message };
  }
}

export async function getCouponDetails(couponCodes: string[]) {
  try {
    if (!couponCodes || couponCodes.length === 0) {
      return { success: true, data: [], error: null };
    }

    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('code, type, value')
      .in('code', couponCodes);

    if (error) {
      console.error('Error fetching coupon details:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data: data || [], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error in getCouponDetails:', message);
    return { success: false, data: null, error: message };
  }
}
