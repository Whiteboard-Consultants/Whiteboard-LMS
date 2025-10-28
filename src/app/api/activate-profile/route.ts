import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Create regular Supabase client for auth operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create Supabase client with service role key for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const activateProfileSchema = z.object({
  email: z.string().email(),
  registrationCode: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Activate profile request:', JSON.stringify(body, null, 2));
    
    const validatedData = activateProfileSchema.parse(body);
    
    // Step 1: Find and validate the registration code
    const { data: profile, error: profileError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('email', validatedData.email)
      .ilike('bio', `%${validatedData.registrationCode}%`)
      .single();
      
    if (profileError) {
      console.error('Error looking up profile:', profileError);
      return NextResponse.json({
        error: 'Invalid registration code or email'
      }, { status: 400 });
    }
    
    console.log('Found profile for activation:', profile.id);
    
    // Step 2: Activate the profile (clear registration code, set status to approved)
    const { data: activatedProfile, error: updateError } = await supabaseServiceRole
      .from('users')
      .update({
        status: 'approved',
        bio: null, // Clear registration code
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
      .select()
      .single();
      
    if (updateError) {
      console.error('Profile activation error:', updateError);
      return NextResponse.json({
        error: 'Failed to activate profile'
      }, { status: 500 });
    }
    
    console.log('Profile activated successfully:', activatedProfile.id);
    
    // Step 3: Generate a one-time setup token for the user
    const setupToken = `SETUP-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Store the setup token in the profile temporarily
    await supabaseServiceRole
      .from('users')
      .update({
        bio: `Setup Token: ${setupToken}`, // Store setup token temporarily
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id);
    
    return NextResponse.json({
      success: true,
      message: 'Profile activated successfully! You can now create your account.',
      setupToken,
      profile: activatedProfile,
      nextStep: 'Use this setup token to create your login credentials.'
    });
    
  } catch (error: any) {
    console.error('Profile activation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}