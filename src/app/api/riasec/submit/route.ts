/**
 * Assessment submission endpoint for RIASEC
 * POST /api/riasec/submit
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { calculateRIASECScores, getTopProfiles, getProfileDetails } from '@/lib/riasec-data';
import { sendRIASECResultsEmail, getRiasecAdminSubject } from '@/lib/riasec-email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, responses, campaign } = await request.json();

    if (!assessmentId || !responses) {
      return NextResponse.json(
        { error: 'Assessment ID and responses are required' },
        { status: 400 }
      );
    }

    // Get the assessment record to extract user and email info
    const { data: assessment, error: fetchError } = await supabase
      .from('riasec_assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (fetchError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Calculate RIASEC scores
    const scores = calculateRIASECScores(responses);
    const topProfiles = getTopProfiles(scores);

    // Get profile details for top 3
    const profileDetails = topProfiles.map(profileId => getProfileDetails(profileId));

    // Update assessment with results
    const { data: updatedAssessment, error: updateError } = await supabase
      .from('riasec_assessments')
      .update({
        realistic_score: scores.realistic,
        investigative_score: scores.investigative,
        artistic_score: scores.artistic,
        social_score: scores.social,
        enterprising_score: scores.enterprising,
        conventional_score: scores.conventional,
        primary_profile: topProfiles[0],
        secondary_profile: topProfiles[1],
        tertiary_profile: topProfiles[2],
        responses: responses,
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating assessment:', updateError);
      return NextResponse.json(
        { error: 'Failed to save assessment results' },
        { status: 500 }
      );
    }

    // Send emails asynchronously (don't block response)
    try {
      await sendRIASECResultsEmail({
        assessment: updatedAssessment,
        scores,
        profileDetails,
        adminSubject: getRiasecAdminSubject(campaign),
      });

      // Update email_sent flags
      await supabase
        .from('riasec_assessments')
        .update({
          email_sent_to_student: true,
          email_sent_to_admin: true,
          student_email_sent_at: new Date().toISOString(),
          admin_email_sent_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);
    } catch (emailError) {
      console.error('Error sending emails:', emailError);
      // Don't fail the response - assessment is still saved
    }

    return NextResponse.json({
      success: true,
      assessment: updatedAssessment,
      results: {
        scores,
        topProfiles,
        profileDetails,
      },
    });
  } catch (error) {
    console.error('Assessment submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
