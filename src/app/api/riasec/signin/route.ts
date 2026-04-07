/**
 * Sign In endpoint for RIASEC assessment
 * POST /api/riasec/signin
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Use anon client for auth operations
const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Use service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth (use anon client)
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Sign in failed' },
        { status: 500 }
      );
    }

    // Check if user already has an assessment record
    const { data: existingAssessment } = await supabaseAdmin
      .from('riasec_assessments')
      .select('id, completed_at')
      .eq('user_id', authData.user.id)
      .single();

    // If no assessment record exists, create one
    let assessmentId = existingAssessment?.id;
    
    if (!existingAssessment) {
      const { data: newAssessment, error: assessmentError } = await supabaseAdmin
        .from('riasec_assessments')
        .insert({
          user_id: authData.user.id,
          email: authData.user.email,
        })
        .select()
        .single();

      if (assessmentError) {
        console.error('Error creating assessment record:', assessmentError);
        return NextResponse.json(
          { error: 'Failed to create assessment record' },
          { status: 500 }
        );
      }

      assessmentId = newAssessment.id;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      assessment: {
        id: assessmentId,
      },
      alreadyCompleted: !!existingAssessment?.completed_at,
      session: authData.session || null,
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
