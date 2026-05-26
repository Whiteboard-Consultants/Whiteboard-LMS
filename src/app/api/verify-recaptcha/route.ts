import { NextRequest, NextResponse } from 'next/server';
import { verifyReCaptchaV3Token } from '@/lib/recaptcha-verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    console.log('verify-recaptcha route called with:', { 
      tokenLength: token?.length, 
      action,
      hasToken: !!token 
    });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const result = await verifyReCaptchaV3Token(token, action);
    
    console.log('reCAPTCHA verification result:', result);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      score: result.score,
    });
  } catch (error) {
    console.error('reCAPTCHA verification API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
