import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to decode JWT token without external library
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    // Decode the payload (second part)
    const payload = parts[1];
    // Add padding if needed
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const decoded = JSON.parse(Buffer.from(padded, 'base64').toString());
    
    return decoded;
  } catch (err) {
    console.error('Failed to decode JWT:', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    console.log('🔐 GET /api/user/profile - Token length:', token.length);

    // Decode the token to get the user ID
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.sub) {
      console.error('❌ Failed to decode token or extract user ID');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decoded.sub;
    console.log('👤 Decoded user ID from token:', userId);

    // Use service role key to bypass RLS and fetch user data directly
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('📥 Fetching user profile for ID:', userId);

    // Fetch user data using service role (bypasses RLS)
    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    console.log('📋 User record result:', { 
      hasData: !!userRecord, 
      error: userError?.message,
      userId,
      role: userRecord?.role,
      name: userRecord?.name
    });

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 404 }
      );
    }

    if (!userRecord) {
      console.error('❌ User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is a student, also fetch their profile
    let profileData = null;
    if (userRecord.role === 'student') {
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profileError && profile) {
        profileData = profile;
        console.log('📚 Student profile found');
      } else if (profileError?.code !== 'PGRST116') {
        console.log('⚠️ Error fetching student profile:', profileError?.message);
      }
    }

    // Merge data
    const userData = {
      ...userRecord,
      ...(profileData && {
        education: profileData.education,
        passingYear: profileData.passing_year,
        improvementAreas: profileData.improvement_areas,
        careerPlan: profileData.career_plan,
        isProfileComplete: profileData.is_profile_complete,
        needsInterviewSupport: profileData.needs_interview_support,
      })
    };

    console.log('✅ User profile fetched successfully:', { id: userData.id, role: userData.role });

    return NextResponse.json({ userData });

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}
