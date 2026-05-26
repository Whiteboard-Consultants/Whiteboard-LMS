import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  return NextResponse.json({
    hasSecretKey: !!secretKey,
    secretKeyLength: secretKey?.length || 0,
    secretKeyPreview: secretKey ? secretKey.substring(0, 10) + '...' : 'NOT SET',
    hasSiteKey: !!siteKey,
    siteKey: siteKey || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  });
}
