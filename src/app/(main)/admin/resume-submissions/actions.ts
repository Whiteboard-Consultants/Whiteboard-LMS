'use server';

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client for server-side operations
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null;

export async function getResumeSubmissions() {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    const { data, error } = await supabaseAdmin
      .from('resume_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching resume submissions:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getResumeSubmissions:', error);
    return { success: false, error: 'Failed to fetch resume submissions' };
  }
}

export async function updateResumeStatus(id: string, status: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    if (!id || !status) {
      return { success: false, error: 'ID and status are required' };
    }

    const { error } = await supabaseAdmin
      .from('resume_submissions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating resume status:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateResumeStatus:', error);
    return { success: false, error: 'Failed to update resume status' };
  }
}

export async function getResumeSubmissionStats() {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Database configuration error' };
    }

    // Get total submissions
    const { count: totalSubmissions, error: countError } = await supabaseAdmin
      .from('resume_submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting total submissions count:', countError);
      return { success: false, error: countError.message };
    }

    // Get submissions from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentSubmissions, error: recentError } = await supabaseAdmin
      .from('resume_submissions')
      .select('*', { count: 'exact', head: true })
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    if (recentError) {
      console.error('Error getting recent submissions count:', recentError);
    }

    // Get submissions by status
    const { data: statusStats, error: statusError } = await supabaseAdmin
      .from('resume_submissions')
      .select('status')
      .gte('submitted_at', thirtyDaysAgo.toISOString());

    if (statusError) {
      console.error('Error getting status stats:', statusError);
    }

    // Count by status
    const statusCounts = statusStats?.reduce((acc: Record<string, number>, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return { 
      success: true, 
      data: {
        totalSubmissions: totalSubmissions || 0,
        recentSubmissions: recentSubmissions || 0,
        statusCounts
      }
    };
  } catch (error) {
    console.error('Error in getResumeSubmissionStats:', error);
    return { success: false, error: 'Failed to fetch resume submission statistics' };
  }
}