/**
 * Start a BGES RIASEC assessment after the pre-quiz form.
 * Creates/reuses an auth user and assessment row with contact + preference data.
 * POST /api/riasec/bges-start
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { bgesPreQuizSchema } from '@/lib/schemas/bges-pre-quiz';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data: existingAssessment } = await supabase
    .from('riasec_assessments')
    .select('user_id')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingAssessment?.user_id) {
    return existingAssessment.user_id;
  }

  // Fallback: scan auth users in pages (rare path for emails without prior assessments)
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data?.users?.length) break;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === email
    );
    if (match) return match.id;
    if (data.users.length < 200) break;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = bgesPreQuizSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Invalid form data' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const email = data.email.trim().toLowerCase();
    const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;
    const password = crypto.randomUUID();

    let userId = await findUserIdByEmail(email);

    if (userId) {
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: fullName,
          whatsapp_number: data.whatsappNumber,
          source: 'bges',
          bges_pre_quiz: data,
        },
      });
    } else {
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            whatsapp_number: data.whatsappNumber,
            source: 'bges',
            bges_pre_quiz: data,
          },
        });

      if (authError || !authData.user) {
        // Race: user may have been created between lookup and create
        const retryId = await findUserIdByEmail(email);
        if (!retryId) {
          return NextResponse.json(
            { error: authError?.message || 'Failed to create user session' },
            { status: 400 }
          );
        }
        userId = retryId;
      } else {
        userId = authData.user.id;
      }
    }

    const { data: assessment, error: assessmentError } = await supabase
      .from('riasec_assessments')
      .insert({
        user_id: userId,
        email,
        full_name: fullName,
        responses: {
          _preQuiz: data,
          _campaign: 'bges',
        },
      })
      .select()
      .single();

    if (assessmentError || !assessment) {
      console.error('Error creating BGES assessment:', assessmentError);
      return NextResponse.json(
        { error: 'Failed to create assessment record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
      },
      assessment: {
        id: assessment.id,
        fullName,
      },
    });
  } catch (error) {
    console.error('BGES start error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
