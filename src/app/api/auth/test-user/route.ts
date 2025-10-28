import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    // Create a test admin user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@whiteboardconsultant.com',
      password: 'Admin123!',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create user profile in the users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'Admin User',
        role: 'admin',
        status: 'approved',
        email_verified: true
      })
      .select()
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      // Don't return error here as the auth user was created successfully
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test admin user created successfully',
      user: {
        email: authData.user.email,
        id: authData.user.id
      }
    });

  } catch (error) {
    console.error('Test user creation error:', error);
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    // List existing users
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.error('Error listing users:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const userList = users.users.map(user => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    }));

    return NextResponse.json({ 
      users: userList,
      total: users.users.length 
    });

  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 });
  }
}