import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  sendUowApplicationAdminNotification,
  sendUowApplicationConfirmation,
  type UowApplicationData,
} from '@/lib/uow-application-email-service';
import { uowApplyFormSchema } from '@/lib/schemas/uow-apply-form';
import { siteConfig } from '@/lib/seo';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = uowApplyFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid form data. Please check your entries and try again.' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const submittedAt = new Date().toISOString();

    const messageParts = [
      `Program: ${data.degreeOfInterest}`,
      `State: ${data.state}`,
      data.enquiryMessage ? `Message: ${data.enquiryMessage}` : null,
    ].filter(Boolean);

    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });

      const { error } = await supabase.from('contact_submissions').insert({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        inquiry_type: `UOW Admission: ${data.degreeOfInterest}`,
        message: messageParts.join('\n'),
        submitted_at: submittedAt,
      });

      if (error) {
        console.error('UOW application database error:', error);
      }
    } else {
      console.warn('UOW application: Supabase service role not configured, skipping DB save.');
    }

    const emailPayload: UowApplicationData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      degreeOfInterest: data.degreeOfInterest,
      state: data.state,
      enquiryMessage: data.enquiryMessage?.trim(),
      submittedAt,
    };

    const [adminSent, confirmationSent] = await Promise.all([
      sendUowApplicationAdminNotification(emailPayload),
      sendUowApplicationConfirmation(emailPayload),
    ]);

    console.log('UOW application email status:', {
      adminNotification: adminSent ? 'sent' : 'failed',
      userConfirmation: confirmationSent ? 'sent' : 'failed',
    });

    if (!adminSent && !confirmationSent) {
      return NextResponse.json(
        {
          error: `Your application was received but we could not send emails. Please contact us at ${siteConfig.contact.email}.`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully.',
      emailSent: { admin: adminSent, confirmation: confirmationSent },
    });
  } catch (error) {
    console.error('UOW application submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting your application.' },
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
