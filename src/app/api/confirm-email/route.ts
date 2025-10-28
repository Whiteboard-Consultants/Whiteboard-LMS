import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

const confirmEmailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Email confirmation request for:', body.email);
    
    const validatedData = confirmEmailSchema.parse(body);
    
    // Find the auth user by email
    const { data: existingUsers } = await supabaseServiceRole.auth.admin.listUsers();
    const existingAuthUser = existingUsers?.users?.find(u => u.email === validatedData.email);
    
    if (!existingAuthUser) {
      return NextResponse.json({
        error: 'No user found with that email address'
      }, { status: 404 });
    }
    
    if (existingAuthUser.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'Email is already confirmed',
        user: {
          id: existingAuthUser.id,
          email: existingAuthUser.email,
          email_confirmed_at: existingAuthUser.email_confirmed_at
        }
      });
    }
    
    // Manually confirm the email
    console.log('Confirming email for user:', existingAuthUser.id);
    const { data: updatedUser, error: updateError } = await supabaseServiceRole.auth.admin.updateUserById(
      existingAuthUser.id,
      {
        email_confirm: true
      }
    );
    
    if (updateError) {
      console.error('Failed to confirm email:', updateError);
      return NextResponse.json({
        error: 'Failed to confirm email'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully! You can now log in.',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        email_confirmed_at: updatedUser.user.email_confirmed_at
      }
    });
    
  } catch (error: any) {
    console.error('Email confirmation error:', error);
    
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