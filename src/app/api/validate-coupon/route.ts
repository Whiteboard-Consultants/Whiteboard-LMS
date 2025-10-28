
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { Coupon } from '@/types';

export async function POST(request: Request) {
  try {
    const { couponCode } = await request.json();

    if (!couponCode) {
      return NextResponse.json({ error: 'Coupon code is required.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .single();

    if (error || !data) {
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
