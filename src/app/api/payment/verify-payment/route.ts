import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});

export async function POST(request: NextRequest) {
  try {
    const {
      isFreeOrder,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      testId,
      testIds,
      seriesId,
      seriesIds,
      isTestPurchase,
      couponCode,
      orderId,
      amount
    } = await request.json();

    console.log('🔍 [VERIFY PAYMENT]', { isFreeOrder, razorpay_order_id, userId, testId, seriesId });

    // Handle free orders (100% discount)
    if (isFreeOrder) {
      console.log('✅ [VERIFY PAYMENT] Processing free order');
      return NextResponse.json({
        success: true,
        orderId: orderId || `free_${Date.now()}`,
        paymentId: `free_${Date.now()}`,
        isFreeOrder: true,
        message: 'Free purchase processed successfully'
      });
    }

    // Handle paid orders with Razorpay verification
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing Razorpay payment details');
      return NextResponse.json(
        { error: 'Missing payment details' },
        { status: 400 }
      );
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Signature verification failed');
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Verify payment with Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      console.error('❌ Payment not captured:', payment.status);
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Payment verified successfully
    console.log(`✅ Payment verified - Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);

    return NextResponse.json({
      success: true,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
