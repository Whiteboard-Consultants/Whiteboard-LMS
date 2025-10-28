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

export async function GET(request: NextRequest) {
  try {
    console.log('Checking database setup...');
    
    // Test 1: Check if we can query users table
    const { data: users, error: usersError } = await supabaseServiceRole
      .from('users')
      .select('id, email, name, role, status')
      .limit(5);
    
    console.log('Users query result:', { users, error: usersError });
    
    // Test 2: Try a simple auth user creation with a unique email
    const testEmail = `test-${Date.now()}@example.com`;
    console.log('Testing auth user creation with email:', testEmail);
    
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'student'
      }
    });
    
    let result: any = {
      step1_users_query: {
        success: !usersError,
        error: usersError?.message,
        count: users?.length || 0
      },
      step2_auth_creation: {
        success: !authError,
        error: authError?.message,
        user_id: authData?.user?.id
      }
    };
    
    if (authData?.user) {
      // Test 3: Check if profile was auto-created by trigger
      console.log('Checking if profile was auto-created for:', authData.user.id);
      
      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profileData, error: profileError } = await supabaseServiceRole
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      result = {
        ...result,
        step3_profile_check: {
          success: !profileError,
          error: profileError?.message,
          profile_created: !!profileData,
          profile: profileData
        }
      };
      
      // Clean up test user
      await supabaseServiceRole.auth.admin.deleteUser(authData.user.id);
      if (profileData) {
        await supabaseServiceRole
          .from('users')
          .delete()
          .eq('id', authData.user.id);
      }
      
      result = {
        ...result,
        step4_cleanup: {
          success: true,
          message: 'Test user and profile cleaned up'
        }
      };
    }
    
    return NextResponse.json({
      success: result.step2_auth_creation.success,
      message: 'Database setup check completed',
      details: result,
      recommendation: result.step2_auth_creation.success ? 
        (result.step3_profile_check?.profile_created ? 
          'Everything is working correctly!' : 
          'Auth works but trigger may not be creating profiles') :
        'Auth user creation is failing - check the function and trigger setup'
    });
    
  } catch (error: any) {
    console.error('Database setup check error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Database setup check failed',
      details: error
    }, { status: 500 });
  }
}