
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/types';

// Type guard to check for Razorpay error structure
function isRazorpayError(error: unknown): error is { error: { description: string } } {
    return (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        typeof (error as any).error === 'object' &&
        (error as any).error !== null &&
        'description' in (error as any).error
    );
}


export async function POST(request: Request) {
  // Hardcoding keys as a temporary solution for this environment.
  // In a production environment, these should come from process.env.
  const keyId = "rzp_test_z6HEooldB7tRcd";
  const keySecret = "l1FrFqoJGnZy9sjkBsetEriY";

  if (!keyId || !keySecret) {
    console.error('Server configuration error: Razorpay keys not found.');
    return NextResponse.json({ error: 'Server configuration error: Razorpay keys not found.' }, { status: 500 });
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  try {
    const { courseIds, finalAmount } = await request.json();

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return NextResponse.json({ error: 'Course IDs are required and must be an array.' }, { status: 400 });
    }
    
    // Use the finalAmount if provided (for discounts), otherwise calculate from DB
    let totalAmount = 0;
    if (typeof finalAmount === 'number' && finalAmount > 0) {
        totalAmount = finalAmount;
    } else {
        // Securely fetch course prices from the server-side
        for (const courseId of courseIds) {
          if (typeof courseId !== 'string') {
            return NextResponse.json({ error: `Invalid course ID format for ${courseId}` }, { status: 400 });
          }
          
          try {
            const { data: course, error } = await supabase
              .from('courses')
              .select('type, price')
              .eq('id', courseId)
              .single();
            
            if (error || !course) {
              console.warn(`Course with ID ${courseId} not found during order creation.`);
              continue;
            }
            
            if (course.type === 'paid' && typeof course.price === 'number') {
              totalAmount += course.price;
            }
          } catch (err) {
            console.warn(`Error fetching course ${courseId}:`, err);
          }
        }
    }
    
    if (totalAmount <= 0) {
        return NextResponse.json({ error: 'No payable items found or total is zero.' }, { status: 400 });
    }

    const options = {
      amount: Math.round(totalAmount * 100), // Amount in paisa, rounded to avoid floating point issues
      currency: 'INR',
      receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ order, keyId }, { status: 200 });

  } catch (error: unknown) {
    console.error('SERVER ERROR CREATING RAZORPAY ORDER:', error);
    
    if (isRazorpayError(error)) {
      return NextResponse.json({ error: `Razorpay API Error: ${error.error.description}` }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Failed to create Razorpay order due to an unexpected server error.' }, { status: 500 });
  }
}
