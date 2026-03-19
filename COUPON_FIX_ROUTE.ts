// ============================================================================
// CORRECTED: /src/app/api/validate-coupon/route.ts
// ============================================================================
// This version uses supabaseAdmin (service_role) on server-side to bypass RLS
// while still validating coupon status in application layer
// ============================================================================

import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Coupon } from '@/types';

export async function POST(request: Request) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    // ✅ FIX 1: Use supabaseAdmin (service_role key) on server-side
    // This bypasses RLS policies while remaining secure (running on server)
    // The FAMILY100 coupon will be found regardless of is_active status
    // We validate the status in application logic below
    const client = supabaseAdmin || supabase;
    
    const { data, error } = await client
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (error || !data) {
      console.error('Coupon query error:', error);
      return NextResponse.json({ error: 'Invalid coupon code.' }, { status: 404 });
    }

    // Map database fields to frontend format
    const coupon: Coupon = {
      ...data,
      usageLimit: data.usage_limit,
      usageCount: data.usage_count,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      createdAt: data.created_at
    };

    // ✅ FIX 2: Validate coupon status in application layer
    // (No longer relies on RLS policy to block inactive coupons)
    if (!coupon.isActive) {
        return NextResponse.json({ error: 'This coupon is not active.' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt as string) < new Date()) {
        return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
    }

    // Here you could add logic to check if the coupon applies to specific courses in the cart
    // For now, we assume it applies to the whole cart.

    return NextResponse.json({ 
        success: true, 
        discount: {
            type: coupon.type,
            value: coupon.value
        }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('COUPON VALIDATION ERROR:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}
