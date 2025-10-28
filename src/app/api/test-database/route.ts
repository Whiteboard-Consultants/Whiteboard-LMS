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
    console.log('Testing database constraints and schema');
    
    // Check current status values in users table
    const { data: statusData, error: statusError } = await supabaseServiceRole
      .from('users')
      .select('status')
      .not('status', 'is', null);
      
    if (statusError) {
      console.log('Status query error:', statusError);
    } else {
      const uniqueStatuses = Array.from(new Set(statusData.map(u => u.status)));
      console.log('Current status values in database:', uniqueStatuses);
    }
    
    // Try to create a test auth user to see the exact error
    console.log('Testing auth user creation with minimal data');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabaseServiceRole.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'student'
      }
    });
    
    if (authError) {
      console.log('Auth creation error details:', authError);
      return NextResponse.json({
        error: 'Auth creation failed',
        details: authError,
        message: authError.message,
        status: authError.status,
        code: authError.code
      });
    }
    
    console.log('Auth user created successfully:', authData.user?.id);
    
    // Clean up test user
    await supabaseServiceRole.auth.admin.deleteUser(authData.user!.id);
    
    return NextResponse.json({
      success: true,
      message: 'Database test completed successfully',
      authUserId: authData.user?.id
    });
    
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: error.message || 'Database test failed',
      details: error
    }, { status: 500 });
  }
}