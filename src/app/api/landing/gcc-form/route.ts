import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  sendGccAdminNotification,
  sendGccConfirmation,
  type GccSubmissionData,
} from '@/lib/gcc-email-service';
import { sendMetaLeadEvent } from '@/lib/meta-conversions-api';
import {
  gccFormSchema,
  normalizeIndianMobile,
  splitFullName,
} from '@/lib/schemas/gcc-form';

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
    const parsed = gccFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      );
    }

    const data = {
      ...parsed.data,
      mobileNumber: normalizeIndianMobile(parsed.data.mobileNumber),
    };
    const submittedAt = new Date().toISOString();
    const eventId =
      typeof body?.eventId === 'string' && body.eventId.trim()
        ? body.eventId.trim()
        : crypto.randomUUID();
    const { firstName, lastName } = splitFullName(data.fullName);

    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sourceUrl =
      request.headers.get('referer') ||
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/gcc`;
    const fbp = request.cookies.get('_fbp')?.value;
    const fbc = request.cookies.get('_fbc')?.value;

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: inserted, error } = await supabase
      .from('gcc_form_responses')
      .insert({
        full_name: data.fullName,
        email: data.email,
        mobile_number: data.mobileNumber,
        department_stream: data.departmentStream,
        current_semester_year: data.currentSemesterYear,
        preferred_destinations: data.preferredDestinations,
        preferred_study_areas: data.preferredStudyAreas,
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
      console.error('Global Career Camp form database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }

    const emailPayload: GccSubmissionData = {
      ...data,
      submittedAt,
    };

    try {
      const [adminSent, confirmationSent, metaLeadSent] = await Promise.all([
        sendGccAdminNotification(emailPayload),
        sendGccConfirmation(emailPayload),
        sendMetaLeadEvent({
          eventId,
          eventSourceUrl: sourceUrl,
          userData: {
            email: data.email,
            phone: data.mobileNumber,
            firstName,
            lastName,
            fbp,
            fbc,
            clientIpAddress: ipAddress,
            clientUserAgent: userAgent,
          },
        }),
      ]);

      console.log('Global Career Camp form notifications:', {
        adminNotification: adminSent ? 'sent' : 'failed',
        userConfirmation: confirmationSent ? 'sent' : 'failed',
        metaLeadEvent: metaLeadSent ? 'sent' : 'failed',
      });
    } catch (emailError) {
      console.error('Error sending Global Career Camp notifications:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully!',
      data: inserted,
    });
  } catch (error) {
    console.error('Global Career Camp form submission error:', error);
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
