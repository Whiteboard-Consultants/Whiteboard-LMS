import { NextRequest, NextResponse } from 'next/server';
import { verifyReCaptchaToken } from '@/lib/recaptcha-verify';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, action } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'No token provided' },
        { status: 400 }
      );
    }

    const result = await verifyReCaptchaToken(token, action);

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
