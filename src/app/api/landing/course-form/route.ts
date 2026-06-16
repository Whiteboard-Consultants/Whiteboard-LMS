import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import {
  sendResumeMasteryAdminNotification,
  sendResumeMasteryConfirmation,
} from '@/lib/resume-mastery-email-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      courseId,
      firstName,
      lastName,
      email,
      phone,
      careerStage,
      currentStruggle,
      experienceLevel,
      jobTarget,
      atsAwareness,
      linkedinAlignment,
      timeline,
      decisionMaker,
      outcomeExpectation,
    } = body;

    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const sourceUrl = request.headers.get('referer') || 'direct';

    // Insert into database
    const { data, error } = await supabase
      .from('landing_form_responses')
      .insert({
        course_id: courseId,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone || null,
        career_stage: careerStage,
        current_struggle: currentStruggle,
        experience_level: experienceLevel,
        job_target: jobTarget,
        ats_awareness: atsAwareness,
        linkedin_alignment: linkedinAlignment,
        timeline,
        decision_maker: decisionMaker,
        outcome_expectation: outcomeExpectation,
        response_data: {
          formVersion: '1.0',
          completedAt: new Date().toISOString(),
        },
        ip_address: ipAddress,
        user_agent: userAgent,
        source_url: sourceUrl,
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }

    const submittedAt = new Date().toISOString();
    const emailPayload = {
      courseId,
      firstName,
      lastName,
      email,
      phone,
      careerStage,
      currentStruggle,
      experienceLevel,
      jobTarget,
      atsAwareness,
      linkedinAlignment,
      timeline,
      decisionMaker,
      outcomeExpectation,
      courseName: body.courseName,
      submittedAt,
    };

    try {
      await Promise.all([
        sendResumeMasteryAdminNotification(emailPayload),
        sendResumeMasteryConfirmation(emailPayload),
      ]);
    } catch (emailError) {
      console.error('Resume Mastery email error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully!',
      data,
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting the form.' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
