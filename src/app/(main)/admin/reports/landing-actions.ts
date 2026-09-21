'use server';

import { createClient } from '@supabase/supabase-js';
import {
  getBudgetLabel,
  getCareerStageLabel,
  getMbaReasonLabel,
  getProgramTimelineLabel,
} from '@/lib/schemas/mba-landing-form';
import {
  getBridgePlanLabel,
  getYearOfStudyLabel,
} from '@/lib/schemas/future-of-jobs-form';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type LandingLeadSource = 'online-mba' | 'resume-mastery' | 'future-of-jobs';

export interface LandingLead {
  id: string;
  source: LandingLeadSource;
  sourceLabel: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  summary: string;
}

const SOURCE_LABELS: Record<LandingLeadSource, string> = {
  'online-mba': 'Online MBA',
  'resume-mastery': 'Resume Mastery',
  'future-of-jobs': 'Future of Jobs',
};

export async function fetchLandingRegistrations(): Promise<{
  data: LandingLead[];
  error: string | null;
}> {
  try {
    const [mbaResult, resumeResult, jobsResult] = await Promise.all([
      supabaseAdmin
        .from('mba_landing_form_responses')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('landing_form_responses')
        .select('*')
        .order('created_at', { ascending: false }),
      supabaseAdmin
        .from('future_of_jobs_form_responses')
        .select('*')
        .order('created_at', { ascending: false }),
    ]);

    const leads: LandingLead[] = [];

    if (!mbaResult.error && mbaResult.data) {
      for (const row of mbaResult.data) {
        leads.push({
          id: `mba-${row.id}`,
          source: 'online-mba',
          sourceLabel: SOURCE_LABELS['online-mba'],
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—',
          email: row.email || '',
          phone: row.phone_number || '',
          submittedAt: row.created_at,
          summary: [
            getCareerStageLabel(row.career_stage || ''),
            getMbaReasonLabel(row.mba_reason || ''),
            getBudgetLabel(row.budget || ''),
            getProgramTimelineLabel(row.program_timeline || ''),
            row.callback_date
              ? `Callback: ${row.callback_date} ${row.callback_time || ''}`.trim()
              : '',
          ]
            .filter(Boolean)
            .join(' · '),
        });
      }
    } else if (mbaResult.error) {
      console.error('Error fetching MBA landing responses:', mbaResult.error);
    }

    if (!resumeResult.error && resumeResult.data) {
      for (const row of resumeResult.data) {
        leads.push({
          id: `resume-${row.id}`,
          source: 'resume-mastery',
          sourceLabel: SOURCE_LABELS['resume-mastery'],
          name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—',
          email: row.email || '',
          phone: row.phone_number || '',
          submittedAt: row.created_at,
          summary: [row.career_stage, row.job_target, row.timeline]
            .filter(Boolean)
            .join(' · '),
        });
      }
    } else if (resumeResult.error) {
      console.error('Error fetching resume landing responses:', resumeResult.error);
    }

    if (!jobsResult.error && jobsResult.data) {
      for (const row of jobsResult.data) {
        leads.push({
          id: `jobs-${row.id}`,
          source: 'future-of-jobs',
          sourceLabel: SOURCE_LABELS['future-of-jobs'],
          name: row.full_name || '—',
          email: row.email || '',
          phone: row.mobile_number || '',
          submittedAt: row.created_at,
          summary: [
            row.college_name,
            getYearOfStudyLabel(row.year_of_study || ''),
            getBridgePlanLabel(row.bridge_plan || ''),
            row.program_choice,
          ]
            .filter(Boolean)
            .join(' · '),
        });
      }
    } else if (jobsResult.error) {
      console.error('Error fetching Future of Jobs responses:', jobsResult.error);
    }

    leads.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return { data: leads, error: null };
  } catch (error) {
    console.error('Error in fetchLandingRegistrations:', error);
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
