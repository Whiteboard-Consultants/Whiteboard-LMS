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
    console.log('Testing Supabase service role configuration...');
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
    console.log('Service Role Key:', serviceRoleKey ? 'Set (length: ' + serviceRoleKey.length + ')' : 'Missing');
    
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          serviceRoleKey: !!serviceRoleKey
        }
      }, { status: 500 });
    }
    
    // Test basic database connection
    console.log('Testing database connection...');
    const { data: users, error: dbError } = await supabaseServiceRole
      .from('users')
      .select('id, email, name')
      .limit(1);
      
    if (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError
      }, { status: 500 });
    }
    
    console.log('Database connection successful. Sample user:', users?.[0]);
    
    // Test auth admin functions - try to list users
    console.log('Testing auth admin functions...');
    try {
      const { data: authUsers, error: authError } = await supabaseServiceRole.auth.admin.listUsers({
        page: 1,
        perPage: 1
      });
      
      if (authError) {
        console.error('Auth admin error:', authError);
        return NextResponse.json({ 
          error: 'Auth admin functions failed',
          details: authError
        }, { status: 500 });
      }
      
      console.log('Auth admin functions working. Auth users count:', authUsers.users.length);
      
      return NextResponse.json({ 
        success: true,
        message: 'Supabase service role configuration is working correctly',
        details: {
          databaseConnection: true,
          authAdminFunctions: true,
          sampleUser: users?.[0],
          authUsersCount: authUsers.users.length
        }
      });
      
    } catch (authTestError) {
      console.error('Auth test error:', authTestError);
      return NextResponse.json({ 
        error: 'Auth admin test failed',
        details: authTestError
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Service role test error:', error);
    return NextResponse.json({ 
      error: 'Service role test failed',
      details: error.message
    }, { status: 500 });
  }
}