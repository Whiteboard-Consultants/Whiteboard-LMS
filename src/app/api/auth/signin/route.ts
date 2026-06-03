import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

function getAuthErrorMessage(authData: Record<string, unknown>): string {
  const errorCode = authData.error_code as string | undefined;

  if (errorCode === 'email_not_confirmed') {
    return 'Email not confirmed';
  }
  if (
    errorCode === 'invalid_credentials' ||
    authData.error === 'invalid_grant'
  ) {
    return 'Invalid email or password';
  }

  return (
    (authData.msg as string) ||
    (authData.error_description as string) ||
    (authData.error as string) ||
    'Authentication failed'
  );
}

async function confirmEmailForDevLogin(email: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'production' || !supabaseAdmin) {
    return false;
  }

  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (!profile?.id) {
    return false;
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
    email_confirm: true,
  });

  if (error) {
    console.error('Dev auto-confirm failed:', error);
    return false;
  }

  console.log('Dev auto-confirmed email for:', email);
  return true;
}

async function authenticateWithPassword(
  supabaseUrl: string,
  supabaseAnonKey: string,
  email: string,
  password: string
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  const authResponse = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseAnonKey,
      },
      body: JSON.stringify({ email, password }),
      signal: controller.signal,
    }
  );

  clearTimeout(timeoutId);

  const responseText = await authResponse.text();
  let authData: Record<string, unknown> = {};

  try {
    authData = JSON.parse(responseText) as Record<string, unknown>;
  } catch {
    return {
      ok: false as const,
      status: 500,
      authData: { error: 'Authentication service error' },
      responseText,
    };
  }

  return { ok: authResponse.ok, status: authResponse.status, authData, responseText };
}

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

    const startTime = Date.now();
    let authResult = await authenticateWithPassword(
      supabaseUrl,
      supabaseAnonKey,
      email,
      password
    );

    if (
      !authResult.ok &&
      authResult.authData.error_code === 'email_not_confirmed' &&
      (await confirmEmailForDevLogin(email))
    ) {
      authResult = await authenticateWithPassword(
        supabaseUrl,
        supabaseAnonKey,
        email,
        password
      );
    }

    const duration = Date.now() - startTime;
    console.log(
      'Auth response status:',
      authResult.ok ? 200 : authResult.status,
      '(took',
      duration + 'ms)'
    );
    console.log('Auth response body (raw):', authResult.responseText);

    const authData = authResult.authData;

    if (!authResult.ok) {
      console.error('Supabase auth error:', authData);

      const message = getAuthErrorMessage(authData);
      return NextResponse.json(
        {
          error: message,
          code: authData.error_code || null,
        },
        { status: 401 }
      );
    }

    const { access_token, refresh_token, user } = authData as {
      access_token: string;
      refresh_token: string;
      user: { email?: string };
    };

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


