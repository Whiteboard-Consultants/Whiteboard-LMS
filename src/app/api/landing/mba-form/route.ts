import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  sendMbaLandingAdminNotification,
  sendMbaLandingConfirmation,
  type MbaLandingSubmissionData,
} from '@/lib/mba-landing-email-service';
import { mbaLandingFormSchema } from '@/lib/schemas/mba-landing-form';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = mbaLandingFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const submittedAt = new Date().toISOString();

    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sourceUrl = request.headers.get('referer') || 'direct';

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: inserted, error } = await supabase
      .from('mba_landing_form_responses')
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone_number: data.phone || null,
        career_stage: data.careerStage,
        mba_reason: data.mbaReason,
        budget: data.budget,
        program_timeline: data.programTimeline,
        biggest_challenge: data.biggestChallenge,
        callback_date: data.callbackDate,
        callback_time: data.callbackTime,
        response_data: {
          formVersion: '1.0',
          completedAt: submittedAt,
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        source_url: sourceUrl,
      })
      .select();

    if (error) {
      console.error('MBA landing form database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }

    const emailPayload: MbaLandingSubmissionData = {
      ...data,
      submittedAt,
    };

    try {
      const [adminSent, confirmationSent] = await Promise.all([
        sendMbaLandingAdminNotification(emailPayload),
        sendMbaLandingConfirmation(emailPayload),
      ]);

      console.log(`MBA landing form notifications:`, {
        adminNotification: adminSent ? 'sent' : 'failed',
        userConfirmation: confirmationSent ? 'sent' : 'failed',
      });
    } catch (emailError) {
      console.error('Error sending MBA landing email notifications:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully!',
      data: inserted,
    });
  } catch (error) {
    console.error('MBA landing form submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the form.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
