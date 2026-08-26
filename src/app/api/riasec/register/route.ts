/**
 * Registration endpoint for RIASEC assessment
 * POST /api/riasec/register
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendMetaLeadEvent } from '@/lib/meta-conversions-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Register the user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const nameParts = fullName.trim().split(/\s+/);
    const eventId =
      typeof body?.eventId === 'string' && body.eventId.trim()
        ? body.eventId.trim()
        : crypto.randomUUID();
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sourceUrl =
      request.headers.get('referer') || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/`;
    const fbp = request.cookies.get('_fbp')?.value;
    const fbc = request.cookies.get('_fbc')?.value;

    // Create RIASEC assessment record
    const { data: assessment, error: assessmentError } = await supabase
      .from('riasec_assessments')
      .insert({
        user_id: authData.user.id,
        email,
        full_name: fullName,
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

    const metaLeadSent = await sendMetaLeadEvent({
      eventId,
      eventSourceUrl: sourceUrl,
      userData: {
        email,
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ') || undefined,
        fbp,
        fbc,
        clientIpAddress: ipAddress,
        clientUserAgent: userAgent,
      },
    });

    console.log('RIASEC registration Meta lead:', metaLeadSent ? 'sent' : 'failed');

    // Create auth session token for immediate login
    // Session is returned from signUp automatically

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      assessment: {
        id: assessment.id,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
