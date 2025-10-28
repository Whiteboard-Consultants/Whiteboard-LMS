'use server';

import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import type { Enrollment } from '@/types';

export async function requestCertificate(enrollmentId: string) {
  if (!enrollmentId) {
    return { success: false, error: 'Enrollment ID is required.' };
  }

  try {
    // Get the enrollment to check eligibility
    const { data: enrollment, error: fetchError } = await supabase
      .from('enrollments')
      .select('*')
      .eq('id', enrollmentId)
      .single();

    if (fetchError) {
      console.error('Error fetching enrollment:', fetchError);
      return { success: false, error: 'Enrollment not found.' };
    }

    // Check if the student has completed the course
    if (!enrollment.completed) {
      return { success: false, error: 'You must complete the course before requesting a certificate.' };
    }

    // Check if already requested or approved
    if (enrollment.certificate_status === 'requested') {
      return { success: false, error: 'Certificate request is already pending approval.' };
    }

    if (enrollment.certificate_status === 'approved') {
      return { success: false, error: 'Certificate has already been approved.' };
    }

    // Update certificate status to requested
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ 
        certificate_status: 'requested',
        certificate_requested_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('Error updating certificate status:', updateError);
      return { success: false, error: 'Failed to submit certificate request.' };
    }

    // Revalidate relevant paths
    revalidatePath('/student/dashboard');
    revalidatePath('/student/certificates');
    revalidatePath('/admin/certificates');

    return { success: true };
  } catch (error) {
    console.error('Error in requestCertificate:', error);
    return { success: false, error: 'An unexpected error occurred while requesting your certificate.' };
  }
}

export async function getCertificateRequests() {
  try {
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        ),
        courses:course_id (
          id,
          title,
          image_url
        )
      `)
      .eq('certificate_status', 'requested')
      .order('certificate_requested_at', { ascending: false });

    if (error) {
      // Log the full error and the query result for debugging
      console.error('Error fetching certificate requests:', error);
      console.error('Supabase error details:', JSON.stringify(error, null, 2));
      console.error('Enrollments data returned:', JSON.stringify(enrollments, null, 2));
      return { success: false, error: 'Failed to fetch certificate requests. ' + (error.message || error.details || JSON.stringify(error)) };
    }

    // Log the enrollments data for debugging
    console.log('Fetched enrollments:', JSON.stringify(enrollments, null, 2));
    return { success: true, data: enrollments || [] };
  } catch (error) {
    console.error('Error in getCertificateRequests:', error);
    let errMsg = 'An unexpected error occurred.';
    if (error instanceof Error) {
      errMsg += ' ' + error.message;
    } else {
      errMsg += ' ' + JSON.stringify(error);
    }
    return { success: false, error: errMsg };
  }
}

export async function getApprovedCertificates(userId?: string) {
  try {
    let query = supabase
      .from('enrollments')
      .select(`
        *,
        users:user_id (
          id,
          name,
          email
        ),
        courses:course_id (
          id,
          title,
          image_url
        )
      `)
      .eq('certificate_status', 'approved')
      .order('certificate_approved_at', { ascending: false });

    // If userId is provided, filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data: enrollments, error } = await query;

    if (error) {
      console.error('Error fetching approved certificates:', error);
      return { success: false, error: 'Failed to fetch certificates.' };
    }

    return { success: true, data: enrollments || [] };
  } catch (error) {
    console.error('Error in getApprovedCertificates:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function rejectCertificate(enrollmentId: string, reason?: string) {
  if (!enrollmentId) {
    return { success: false, error: 'Enrollment ID is required.' };
  }

  try {
    const { error } = await supabase
      .from('enrollments')
      .update({ 
        certificate_status: 'not_eligible',
        certificate_rejection_reason: reason,
        certificate_rejected_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (error) {
      console.error('Error rejecting certificate:', error);
      return { success: false, error: 'Failed to reject certificate.' };
    }

    revalidatePath('/admin/certificates');
    revalidatePath('/student/certificates');
    
    return { success: true };
  } catch (error) {
    console.error('Error in rejectCertificate:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}