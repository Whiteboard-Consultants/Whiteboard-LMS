
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { enrollInPaidCourses } from '@/app/student/enrollment-actions';

export async function POST(request: Request) {
  try {
    const { 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature,
        courseId,
        userId,
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courseId || !userId) {
        return NextResponse.json({ success: false, error: 'Missing payment details.' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Signature matches. Securely enroll the user in the course.
      const enrollmentResult = await enrollInPaidCourses(
        [courseId], 
        userId, 
        razorpay_payment_id, 
        razorpay_order_id
      );

      if (enrollmentResult.success) {
        return NextResponse.json({ success: true, message: 'Payment verified and enrollment processed.' }, { status: 200 });
      } else {
        // Enrollment failed even after successful payment. This needs investigation.
        console.error("ENROLLMENT FAILED AFTER PAYMENT VERIFICATION:", enrollmentResult.error);
        return NextResponse.json({ success: false, error: 'Payment was successful, but enrollment failed. Please contact support.' }, { status: 500 });
      }
    } else {
      // Signature does not match.
      return NextResponse.json({ success: false, error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

  } catch (error: unknown) {
    console.error('VERIFY PAYMENT FAILED:', error);
    return NextResponse.json({ success: false, error: 'An internal server error occurred.' }, { status: 500 });
  }
}
