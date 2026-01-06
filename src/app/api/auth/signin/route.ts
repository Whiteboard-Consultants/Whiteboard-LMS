import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Use Supabase REST API directly with server-side request
    // This avoids CORS issues since it's a server-to-server call
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    console.log('Attempting authentication for:', email);
    console.log('Supabase URL:', supabaseUrl);

    // Add timeout for Supabase API call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout
    
    const startTime = Date.now();
    const authResponse = await fetch(
      `${supabaseUrl}/auth/v1/token?grant_type=password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          password,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    console.log('Auth response status:', authResponse.status, '(took', duration + 'ms)');
    
    const responseText = await authResponse.text();
    console.log('Auth response body (raw):', responseText);

    let authData;
    try {
      authData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse auth response:', parseError);
      console.error('Raw response:', responseText);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }

    if (!authResponse.ok) {
      console.error('Supabase auth error:', authData);
      
      if (authData.error === 'invalid_grant') {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { error: authData.error_description || authData.error || 'Authentication failed' },
        { status: 401 }
      );
    }

    const { access_token, refresh_token, user } = authData;

    // Set secure httpOnly cookies for tokens
    const response = NextResponse.json({
      session: {
        access_token,
        refresh_token,
        user,
        expires_at: Date.now() + (60 * 60 * 1000), // 1 hour
      },
      user,
    });

    // Set secure cookies (httpOnly, secure in production)
    response.cookies.set('sb-access-token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    response.cookies.set('sb-refresh-token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    console.log('Authentication successful for:', user.email);
    return response;

  } catch (error) {
    console.error('Sign in API error:', error);
    
    // Check if it's an abort/timeout error
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Supabase auth request timeout');
      return NextResponse.json(
        { error: 'Authentication service timed out. Please try again.' },
        { status: 504 }
      );
    }
    
    console.error('Error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}


