import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Try to reset password for existing user
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) {
      // If user doesn't exist, create a new one
      if (error.message.includes('User not found')) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: 'TempPassword123!',
          email_confirm: true,
          user_metadata: {
            name: 'Admin User',
            role: 'admin'
          }
        });

        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        // Create user profile
        await supabaseAdmin
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            name: 'Admin User',
            role: 'admin',
            status: 'approved',
            email_verified: true
          });

        return NextResponse.json({ 
          success: true, 
          message: 'New user created successfully',
          credentials: {
            email: email,
            password: 'TempPassword123!'
          }
        });
      }
      
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset link generated',
      resetLink: data.properties?.action_link
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}