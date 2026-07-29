/**
 * Fetch a completed RIASEC assessment for certificate display.
 * GET /api/riasec/certificate/[assessmentId]
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await context.params;

    if (!assessmentId) {
      return NextResponse.json(
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    const { data: assessment, error } = await supabase
      .from('riasec_assessments')
      .select('id, full_name, email, completed_at, primary_profile, responses')
      .eq('id', assessmentId)
      .single();

    if (error || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    if (!assessment.completed_at) {
      return NextResponse.json(
        { error: 'Assessment is not completed yet' },
        { status: 400 }
      );
    }

    const campaign =
      assessment.responses &&
      typeof assessment.responses === 'object' &&
      !Array.isArray(assessment.responses)
        ? (assessment.responses as Record<string, unknown>)._campaign
        : null;

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.id,
        fullName: assessment.full_name,
        email: assessment.email,
        completedAt: assessment.completed_at,
        primaryProfile: assessment.primary_profile,
        campaign: typeof campaign === 'string' ? campaign : null,
      },
    });
  } catch (error) {
    console.error('Certificate fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
