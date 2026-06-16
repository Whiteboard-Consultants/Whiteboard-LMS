'use server';

import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  sendUowApplicationAdminNotification,
  sendUowApplicationConfirmation,
  type UowApplicationData,
} from '@/lib/uow-application-email-service';

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

export async function saveUowApplication(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredIntake: string;
  degreeOfInterest: string;
  state: string;
  enquiryMessage?: string;
}) {
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.phone ||
    !formData.preferredIntake ||
    !formData.degreeOfInterest ||
    !formData.state
  ) {
    return { success: false, error: 'All required fields must be filled out.' };
  }

  try {
    const client = supabaseAdmin || supabase;

    if (!client) {
      return { success: false, error: 'Database configuration error. Please try again later.' };
    }

    const submittedAt = new Date().toISOString();
    const messageParts = [
      `Preferred Intake: ${formData.preferredIntake}`,
      `Program: ${formData.degreeOfInterest}`,
      `State: ${formData.state}`,
      formData.enquiryMessage ? `Message: ${formData.enquiryMessage}` : null,
    ].filter(Boolean);

    const submissionData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      inquiry_type: `UOW Admission: ${formData.degreeOfInterest}`,
      message: messageParts.join('\n'),
      submitted_at: submittedAt,
    };

    const { data, error } = await client
      .from('contact_submissions')
      .insert(submissionData)
      .select('id')
      .single();

    if (error) {
      console.error('UOW application submission error:', error);
      return { success: false, error: 'Failed to save your application. Please try again.' };
    }

    const emailData: UowApplicationData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      preferredIntake: formData.preferredIntake,
      degreeOfInterest: formData.degreeOfInterest,
      state: formData.state,
      enquiryMessage: formData.enquiryMessage?.trim(),
      submittedAt,
    };

    try {
      await Promise.all([
        sendUowApplicationAdminNotification(emailData),
        sendUowApplicationConfirmation(emailData),
      ]);
    } catch (emailError) {
      console.error('UOW application email error:', emailError);
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error saving UOW application:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
