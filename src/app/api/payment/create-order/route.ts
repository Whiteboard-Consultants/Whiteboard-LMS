import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, description, testId, seriesId, userId, isTestPurchase, couponCode } = await request.json();

    console.log('💳 [CREATE ORDER] Received:', { amount, currency, testId, seriesId, userId, isTestPurchase, couponCode });

    if (!amount || !currency || !userId) {
      console.error('❌ [CREATE ORDER] Missing fields:', { amount, currency, userId });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('❌ [CREATE ORDER] Missing Razorpay credentials:', { 
        hasKeyId: !!key_id, 
        hasKeySecret: !!key_secret,
        keyIdValue: key_id ? key_id.substring(0, 20) : 'undefined',
        keySecretLength: key_secret?.length || 0
      });
      return NextResponse.json(
        { error: 'Payment gateway not configured', details: 'Missing Razorpay credentials' },
        { status: 500 }
      );
    }

    console.log('📝 [CREATE ORDER] Razorpay credentials found:', {
      keyIdLength: key_id.length,
      keySecretLength: key_secret.length,
      keyIdStart: key_id.substring(0, 10),
      keyIdEnd: key_id.substring(key_id.length - 5)
    });

    let razorpay;
    try {
      razorpay = new Razorpay({
        key_id,
        key_secret
      });
      console.log('✅ [CREATE ORDER] Razorpay SDK initialized successfully');
    } catch (initError) {
      console.error('❌ [CREATE ORDER] Failed to initialize Razorpay:', initError);
      console.error('❌ [CREATE ORDER] Init error type:', typeof initError);
      console.error('❌ [CREATE ORDER] Init error:', JSON.stringify(initError));
      throw new Error(`Razorpay initialization failed: ${initError instanceof Error ? initError.message : String(initError)}`);
    }

    console.log('📝 [CREATE ORDER] Creating Razorpay order with amount:', amount);

    let order;
    try {
      // Receipt must be <= 40 characters
      const timestamp = Date.now().toString();
      const receipt = `ord_${timestamp.slice(-30)}`; // "ord_" + last 30 chars of timestamp = 34 chars max
      
      order = await razorpay.orders.create({
        amount: Math.round(amount), // Amount in paise
        currency,
        receipt,
        notes: {
          userId,
          testId: testId || null,
          seriesId: seriesId || null,
          isTestPurchase,
          couponCode: couponCode || null,
          description
        }
      });
      console.log('✅ [CREATE ORDER] Order created:', order.id);
    } catch (orderError) {
      console.error('❌ [CREATE ORDER] Failed to create order:', orderError);
      console.error('❌ [CREATE ORDER] Order error type:', typeof orderError);
      console.error('❌ [CREATE ORDER] Order error:', JSON.stringify(orderError));
      throw orderError;
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    console.error('❌ [CREATE ORDER] Caught error:', error);
    console.error('❌ [CREATE ORDER] Error type:', typeof error);
    console.error('❌ [CREATE ORDER] Error constructor:', error instanceof Error ? 'Error' : Object.prototype.toString.call(error));
    
    let errorMessage = 'Unknown error';
    let errorDetails = '';
    let errorType = 'unknown';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      errorType = error.name;
    } else if (typeof error === 'object' && error !== null) {
      // Check if it's a Razorpay error object
      if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
        statusCode = (error as any).statusCode;
        console.error('❌ [CREATE ORDER] Razorpay statusCode:', statusCode);
      }
      
      if ('error' in error && typeof (error as any).error === 'object') {
        const razorpayError = (error as any).error;
        console.error('❌ [CREATE ORDER] Razorpay error object:', razorpayError);
        
        if ('description' in razorpayError) {
          errorMessage = razorpayError.description;
        }
        if ('code' in razorpayError) {
          errorType = razorpayError.code;
        }
        
        errorDetails = JSON.stringify(razorpayError);
      } else {
        errorMessage = JSON.stringify(error);
        errorType = 'object';
        if ('message' in error) {
          errorMessage = String((error as any).message);
        }
      }
    } else {
      errorMessage = String(error);
      errorType = typeof error;
    }

    console.error('❌ [CREATE ORDER] Final error message:', errorMessage);
    console.error('❌ [CREATE ORDER] Final error type:', errorType);
    console.error('❌ [CREATE ORDER] Response statusCode:', statusCode);

    return NextResponse.json(
      { 
        error: 'Failed to create payment order', 
        details: errorMessage,
        errorType,
        stack: process.env.NODE_ENV === 'development' ? errorDetails : undefined
      },
      { status: statusCode }
    );
  }
}
