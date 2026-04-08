/**
 * Google OAuth endpoint for RIASEC
 * POST /api/riasec/google-auth
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { redirectUrl } = await request.json();

    if (!redirectUrl) {
      return NextResponse.json(
        { error: 'Redirect URL is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const clientId = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'Supabase client ID not configured' },
        { status: 500 }
      );
    }

    // Build Google OAuth URL with Supabase
    const params = new URLSearchParams({
      client_id: clientId,
      provider: 'google',
      redirect_to: redirectUrl,
      response_type: 'code',
      scopes: 'profile email',
    });

    const url = `${supabaseUrl}/auth/v1/oauth2/authorize?${params.toString()}`;

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}
