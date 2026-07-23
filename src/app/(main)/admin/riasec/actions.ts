'use server';

import { createClient } from '@supabase/supabase-js';
import { assertCan } from '@/lib/permissions';
import type { User } from '@/types';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  : null;

type Actor = Pick<User, 'role' | 'permissions'> | null | undefined;

export async function getRiasecAssessments(actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'riasec');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    const { data, error } = await supabaseAdmin
      .from('riasec_assessments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RIASEC assessments:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getRiasecAssessments:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch RIASEC assessments',
    };
  }
}

export async function deleteRiasecAssessment(id: string, actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'riasec');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    if (!id) {
      return { success: false, error: 'Assessment ID is required' };
    }

    const { error } = await supabaseAdmin.from('riasec_assessments').delete().eq('id', id);

    if (error) {
      console.error('Error deleting RIASEC assessment:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteRiasecAssessment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete RIASEC assessment',
    };
  }
}

export async function getRiasecAssessmentStats(actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'riasec');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    const { count: totalLeads, error: countError } = await supabaseAdmin
      .from('riasec_assessments')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting RIASEC leads count:', countError);
      return { success: false, error: countError.message };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentLeads, error: recentError } = await supabaseAdmin
      .from('riasec_assessments')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      console.error('Error getting recent RIASEC leads count:', recentError);
    }

    const { count: completedAssessments, error: completedError } = await supabaseAdmin
      .from('riasec_assessments')
      .select('*', { count: 'exact', head: true })
      .not('completed_at', 'is', null);

    if (completedError) {
      console.error('Error getting completed RIASEC count:', completedError);
    }

    return {
      success: true,
      data: {
        totalLeads: totalLeads || 0,
        recentLeads: recentLeads || 0,
        completedAssessments: completedAssessments || 0,
      },
    };
  } catch (error) {
    console.error('Error in getRiasecAssessmentStats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch RIASEC assessment statistics',
    };
  }
}
