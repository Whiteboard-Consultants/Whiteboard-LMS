import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;
    
    console.log('Attempting to create auth user without triggers affecting users table');
    
    // Step 1: First, let's disable the trigger temporarily if possible
    // We'll try to create the auth user and handle the database conflict manually
    
    // Check if this email already has an auth account
    const { data: existingAuthUser } = await supabaseServiceRole.auth.admin.listUsers();
    const emailExists = existingAuthUser?.users?.some(u => u.email === email);
    
    if (emailExists) {
      return NextResponse.json({
        error: 'User already has an auth account'
      }, { status: 400 });
    }
    
    // Try creating auth user first
    const { data: authUser, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        skip_profile_creation: true // Custom flag to potentially skip trigger
      }
    });
    
    if (authError) {
      console.error('Auth user creation failed:', authError);
      return NextResponse.json({
        error: 'Failed to create auth account',
        details: authError.message,
        code: authError.code
      }, { status: 500 });
    }
    
    console.log('Auth user created successfully:', authUser.user?.id);
    
    // Step 2: Now manually create the user profile 
    // First check if the trigger already created one
    const { data: existingProfile, error: checkError } = await supabaseServiceRole
      .from('users')
      .select('*')
      .eq('id', authUser.user!.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      // Clean up auth user if profile check fails
      await supabaseServiceRole.auth.admin.deleteUser(authUser.user!.id);
      return NextResponse.json({
        error: 'Failed to verify profile creation'
      }, { status: 500 });
    }
    
    if (existingProfile) {
      console.log('Profile auto-created by trigger:', existingProfile.id);
      return NextResponse.json({
        success: true,
        message: 'User created successfully with auto-generated profile',
        authUser: authUser.user,
        profile: existingProfile
      });
    }
    
    // No profile was created, create it manually
    console.log('No profile auto-created, creating manually');
    const { data: newProfile, error: profileError } = await supabaseServiceRole
      .from('users')
      .insert([{
        id: authUser.user!.id,
        email,
        name,
        role,
        status: 'approved',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (profileError) {
      console.error('Manual profile creation failed:', profileError);
      // Clean up auth user if profile creation fails
      await supabaseServiceRole.auth.admin.deleteUser(authUser.user!.id);
      return NextResponse.json({
        error: 'Failed to create user profile',
        details: profileError.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'User created successfully with manual profile',
      authUser: authUser.user,
      profile: newProfile
    });
    
  } catch (error: any) {
    console.error('User creation test error:', error);
    return NextResponse.json({
      error: error.message || 'User creation test failed'
    }, { status: 500 });
  }
}