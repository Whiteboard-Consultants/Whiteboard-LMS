import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    console.log('🔍 [RAZORPAY DEBUG] Checking credentials...');

    if (!key_id || !key_secret) {
      return NextResponse.json({
        status: 'error',
        message: 'Missing credentials',
        hasKeyId: !!key_id,
        hasKeySecret: !!key_secret,
        keyIdLength: key_id?.length || 0,
        keySecretLength: key_secret?.length || 0,
      });
    }

    console.log('🔍 [RAZORPAY DEBUG] Key ID length:', key_id.length);
    console.log('🔍 [RAZORPAY DEBUG] Key Secret length:', key_secret.length);
    console.log('🔍 [RAZORPAY DEBUG] Key ID format:', key_id.substring(0, 10) + '...');

    // Try to initialize Razorpay
    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id,
        key_secret
      });
      console.log('✅ [RAZORPAY DEBUG] SDK initialized successfully');
    } catch (initError) {
      console.error('❌ [RAZORPAY DEBUG] Initialization failed:', initError);
      return NextResponse.json({
        status: 'error',
        message: 'SDK initialization failed',
        initError: initError instanceof Error ? initError.message : String(initError),
        keyIdLength: key_id.length,
        keySecretLength: key_secret.length,
      });
    }

    // Try to create a test order with minimal amount
    try {
      console.log('🔍 [RAZORPAY DEBUG] Attempting to create test order...');
      const testOrder = await razorpay.orders.create({
        amount: 100, // 1 INR in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`,
        notes: {
          test: 'true',
          timestamp: new Date().toISOString()
        }
      });
      
      console.log('✅ [RAZORPAY DEBUG] Test order created:', (testOrder as any).id);
      
      return NextResponse.json({
        status: 'success',
        message: 'Credentials are valid and working',
        testOrderId: (testOrder as any).id,
        keyIdLength: key_id.length,
        keySecretLength: key_secret.length,
        keyIdPreview: key_id.substring(0, 20) + '***',
      });
    } catch (orderError) {
      console.error('❌ [RAZORPAY DEBUG] Order creation failed:', orderError);
      
      let errorMessage = 'Unknown error';
      let errorCode = 'unknown';
      
      if (typeof orderError === 'object' && orderError !== null) {
        if ('error' in orderError && typeof (orderError as any).error === 'object') {
          const razorpayErr = (orderError as any).error;
          if ('description' in razorpayErr) {
            errorMessage = razorpayErr.description;
          }
          if ('code' in razorpayErr) {
            errorCode = razorpayErr.code;
          }
        }
      } else if (orderError instanceof Error) {
        errorMessage = orderError.message;
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Credentials appear invalid - test order creation failed',
        errorMessage,
        errorCode,
        keyIdLength: key_id.length,
        keySecretLength: key_secret.length,
        keyIdPreview: key_id.substring(0, 20) + '***',
        recommendation: 'Please verify your Razorpay API credentials in the dashboard',
      });
    }
  } catch (error) {
    console.error('❌ [RAZORPAY DEBUG] Unexpected error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
