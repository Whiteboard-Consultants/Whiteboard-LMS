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

export async function getContactSubmissions(actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'contact_forms');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    const { data, error } = await supabaseAdmin
      .from('contact_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching contact submissions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getContactSubmissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contact submissions',
    };
  }
}

export async function deleteContactSubmission(id: string, actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'contact_forms');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    if (!id) {
      return { success: false, error: 'Submission ID is required' };
    }

    const { error } = await supabaseAdmin.from('contact_submissions').delete().eq('id', id);

    if (error) {
      console.error('Error deleting contact submission:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteContactSubmission:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete contact submission',
    };
  }
}

export async function getContactSubmissionStats(actor?: Actor) {
  try {
    if (actor !== undefined) {
      assertCan(actor, 'contact_forms');
    }
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    const { count: totalSubmissions, error: countError } = await supabaseAdmin
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting total submissions count:', countError);
      return { success: false, error: countError.message };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentSubmissions, error: recentError } = await supabaseAdmin
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      console.error('Error getting recent submissions count:', recentError);
    }

    const { data: inquiryStats, error: inquiryError } = await supabaseAdmin
      .from('contact_submissions')
      .select('inquiry_type')
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    if (inquiryError) {
      console.error('Error getting inquiry stats:', inquiryError);
    }

    const inquiryTypeCounts =
      inquiryStats?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.inquiry_type] = (acc[curr.inquiry_type] || 0) + 1;
        return acc;
      }, {}) || {};

    return {
      success: true,
      data: {
        totalSubmissions: totalSubmissions || 0,
        recentSubmissions: recentSubmissions || 0,
        inquiryTypeCounts,
      },
    };
  } catch (error) {
    console.error('Error in getContactSubmissionStats:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to fetch contact submission statistics',
    };
  }
}
