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
    console.log('Starting bulk email confirmation for unconfirmed users...');
    
    // Get all auth users
    const { data: allUsers } = await supabaseServiceRole.auth.admin.listUsers();
    
    if (!allUsers?.users) {
      return NextResponse.json({
        error: 'Failed to fetch users'
      }, { status: 500 });
    }
    
    // Filter unconfirmed users
    const unconfirmedUsers = allUsers.users.filter(user => !user.email_confirmed_at);
    
    console.log(`Found ${unconfirmedUsers.length} unconfirmed users`);
    
    if (unconfirmedUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All users already have confirmed emails',
        stats: {
          total_users: allUsers.users.length,
          unconfirmed_users: 0,
          confirmed_users: 0,
          errors: []
        }
      });
    }
    
    const results = {
      confirmed_users: 0,
      errors: [] as string[]
    };
    
    // Confirm each unconfirmed user
    for (const user of unconfirmedUsers) {
      try {
        console.log(`Confirming email for user: ${user.email} (${user.id})`);
        
        const { error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(
          user.id,
          {
            email_confirm: true
          }
        );
        
        if (updateError) {
          console.error(`Failed to confirm ${user.email}:`, updateError);
          results.errors.push(`${user.email}: ${updateError.message}`);
        } else {
          console.log(`Successfully confirmed: ${user.email}`);
          results.confirmed_users++;
        }
      } catch (error) {
        console.error(`Error processing ${user.email}:`, error);
        results.errors.push(`${user.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Bulk email confirmation completed. Confirmed ${results.confirmed_users} out of ${unconfirmedUsers.length} users.`,
      stats: {
        total_users: allUsers.users.length,
        unconfirmed_users: unconfirmedUsers.length,
        confirmed_users: results.confirmed_users,
        errors: results.errors
      }
    });
    
  } catch (error: any) {
    console.error('Bulk email confirmation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}