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

export async function requestCertificate(enrollmentId: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!enrollmentId) {
      return { success: false, error: 'Enrollment ID is required' };
    }

    // Update the enrollment's certificate_status to 'requested'
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        certificate_status: 'requested',
        certificate_requested_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .select();

    if (error) {
      console.error('Error requesting certificate:', error);
      return { success: false, error: 'Failed to request certificate' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Enrollment not found' };
    }

    return { success: true, message: 'Certificate request submitted successfully', data };
  } catch (error) {
    console.error('Error in requestCertificate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function getApprovedCertificates(userId?: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    // Build query based on whether userId is provided
    let query = supabaseAdmin
      .from('enrollments')
      .select('id, user_id, course_id, progress, completed, certificate_status, certificate_approved_at, enrolled_at, users(id, name, email), courses(id, title, image_url)')
      .eq('certificate_status', 'approved');

    // If userId provided, filter by user (student page)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    query = query.order('certificate_approved_at', { ascending: false });

    // Fetch approved certificates
    const { data: certificates, error } = await query;

    if (error) {
      console.error('Error fetching approved certificates:', error);
      return { success: false, error: 'Failed to fetch certificates', data: [] };
    }

    // Return empty array if no certificates found (this is not an error)
    return { success: true, data: certificates || [] };
  } catch (error) {
    console.error('Error in getApprovedCertificates:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function getCertificateRequests() {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error', data: [] };
    }

    // Fetch pending certificate requests with user and course details
    const { data: certificates, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, user_id, course_id, progress, completed, certificate_status, certificate_requested_at, users(id, name, email), courses(id, title, image_url)')
      .eq('certificate_status', 'requested')
      .order('certificate_requested_at', { ascending: true });

    if (error) {
      console.error('Error fetching certificate requests:', error);
      return { success: false, error: 'Failed to fetch certificate requests', data: [] };
    }

    if (!certificates || certificates.length === 0) {
      return { success: true, data: [] };
    }

    return { success: true, data: certificates };
  } catch (error) {
    console.error('Error in getCertificateRequests:', error);
    return { success: false, error: 'An unexpected error occurred', data: [] };
  }
}

export async function rejectCertificate(enrollmentId: string, reason?: string) {
  try {
    if (!supabaseAdmin) {
      return { success: false, error: 'Server configuration error' };
    }

    if (!enrollmentId) {
      return { success: false, error: 'Enrollment ID is required' };
    }

    // Update the enrollment's certificate_status to 'not_eligible'
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        certificate_status: 'not_eligible',
        certificate_rejected_reason: reason || 'Certificate request rejected',
        certificate_rejected_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .select();

    if (error) {
      console.error('Error rejecting certificate:', error);
      return { success: false, error: 'Failed to reject certificate' };
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Enrollment not found' };
    }

    return { success: true, message: 'Certificate request rejected', data };
  } catch (error) {
    console.error('Error in rejectCertificate:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
