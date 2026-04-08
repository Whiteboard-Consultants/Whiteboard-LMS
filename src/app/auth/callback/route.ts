import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  console.log('🔐 Auth callback received');
  console.log('📋 Full URL:', requestUrl.toString());
  console.log('📋 Query string:', requestUrl.search);
  console.log('📋 Hash:', requestUrl.hash);
  
  // Check for errors first
  const error = requestUrl.searchParams.get('error') || new URLSearchParams(requestUrl.hash.substring(1)).get('error');
  const errorDescription = requestUrl.searchParams.get('error_description') || new URLSearchParams(requestUrl.hash.substring(1)).get('error_description');
  
  if (error) {
    console.error('❌ Auth error from Supabase:', { error, errorDescription });
    return NextResponse.redirect(
      `${requestUrl.origin}/reset-password?error=${encodeURIComponent(error)}`
    );
  }

  // Check if this is an OAuth callback (from Google, GitHub, etc.)
  // OAuth tokens come in hash fragment with the format: #access_token=...&token_type=bearer&expires_in=...
  const hashParams = new URLSearchParams(requestUrl.hash.substring(1));
  const accessToken = hashParams.get('access_token');
  const tokenType = hashParams.get('token_type');
  
  if (accessToken && tokenType === 'bearer') {
    console.log('🔐 OAuth callback detected - processing provider authentication');
    
    try {
      // Initialize Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Get the current session (Supabase has already set it from the hash)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.user) {
        console.error('❌ Failed to get session:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }

      console.log('✅ OAuth session established for user:', session.user.email);

      // Check if user already has an assessment record
      const { data: existingAssessment, error: fetchError } = await supabase
        .from('riasec_assessments')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!fetchError && existingAssessment) {
        console.log('ℹ️ Assessment already exists for user, proceeding to quiz');
      } else if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = not found (expected on first login)
        console.error('❌ Error checking assessment:', fetchError);
      } else {
        // Create new assessment for first-time OAuth user
        console.log('✅ Creating new assessment for OAuth user');
        const { data: newAssessment, error: createError } = await supabase
          .from('riasec_assessments')
          .insert({
            user_id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating assessment:', createError);
          // Don't fail - user can still take quiz without saved record initially
        } else {
          console.log('✅ Assessment created:', newAssessment?.id);
        }
      }

      // Redirect to home with OAuth flag - the RIASEC modal will open automatically
      // Remove the hash to prevent re-processing
      const redirectUrl = `${requestUrl.origin}/?oauth=true&from=riasec`;
      console.log('📍 Redirecting to:', redirectUrl);
      return NextResponse.redirect(redirectUrl);
    } catch (err) {
      console.error('❌ OAuth processing error:', err);
      return NextResponse.redirect(`${requestUrl.origin}/`);
    }
  }

  // For implicit flow (password recovery), tokens come in hash fragment
  // Just redirect with the hash intact so the SDK can process it
  if (requestUrl.hash && requestUrl.hash.includes('access_token')) {
    console.log('🔐 Implicit flow tokens detected in hash');
    const redirectUrl = `${requestUrl.origin}/reset-password${requestUrl.hash}`;
    console.log('📍 Redirecting to:', redirectUrl.substring(0, 100) + '...');
    return NextResponse.redirect(redirectUrl);
  }

  // For PKCE flow, code comes in query params (fallback)
  const code = requestUrl.searchParams.get('code');
  if (code) {
    console.log('🔐 PKCE code detected in query params');
    const redirectUrl = `${requestUrl.origin}/reset-password?code=${encodeURIComponent(code)}`;
    console.log('📍 Redirecting to:', redirectUrl);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('ℹ️ No auth parameters found, redirecting to home');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}
