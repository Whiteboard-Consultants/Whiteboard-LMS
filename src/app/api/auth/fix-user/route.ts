import { supabaseAdmin } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const targetEmail = email || 'nigel@whiteboardconsultant.com';
    const password = newPassword || 'Nigel123!';

    // First, check if user exists in auth
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    const existingAuthUser = users.users.find(u => u.email === targetEmail);

    if (existingAuthUser) {
      // User exists in auth, update password
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUser.id,
        { 
          password: password,
          email_confirm: true
        }
      );

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Password updated successfully',
        credentials: {
          email: targetEmail,
          password: password
        },
        user_id: existingAuthUser.id
      });

    } else {
      // User doesn't exist in auth, create new auth user
      // First get the user record from the database
      const { data: dbUser, error: dbError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', targetEmail)
        .single();

      if (dbError || !dbUser) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }

      // Create auth user with the same ID
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: targetEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: dbUser.name,
          role: dbUser.role
        }
      });

      if (authError) {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }

      // Update the database user record with the new auth ID if different
      if (authData.user.id !== dbUser.id) {
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ id: authData.user.id })
          .eq('email', targetEmail);

        if (updateError) {
          console.error('Error updating user ID:', updateError);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Auth user created successfully',
        credentials: {
          email: targetEmail,
          password: password
        },
        user_id: authData.user.id,
        old_db_id: dbUser.id
      });
    }

  } catch (error) {
    console.error('Fix user error:', error);
    return NextResponse.json({ error: 'Failed to fix user authentication' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 500 });
    }

    const targetEmail = 'nigel@whiteboardconsultant.com';

    // Check auth users
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 400 });
    }

    const authUser = users.users.find(u => u.email === targetEmail);

    // Check database user
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', targetEmail)
      .single();

    return NextResponse.json({
      email: targetEmail,
      auth_user_exists: !!authUser,
      auth_user_id: authUser?.id || null,
      auth_user_confirmed: authUser?.email_confirmed_at || null,
      db_user_exists: !!dbUser && !dbError,
      db_user_id: dbUser?.id || null,
      db_user_data: dbUser || null,
      users_match: authUser?.id === dbUser?.id
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({ error: 'Failed to check user status' }, { status: 500 });
  }
}