'use server';

import { siteConfig } from '@/lib/seo';
import {
  sendUowApplicationAdminNotification,
  sendUowApplicationConfirmation,
  type UowApplicationData,
} from '@/lib/uow-application-email-service';
import { uowApplyFormSchema, type UowApplyFormData } from '@/lib/schemas/uow-apply-form';
import { createClient } from '@supabase/supabase-js';

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

export async function saveUowApplication(formData: UowApplyFormData) {
  const parsed = uowApplyFormSchema.safeParse(formData);

  if (!parsed.success) {
    return { success: false, error: 'All required fields must be filled out.' };
  }

  const data = parsed.data;
  const submittedAt = new Date().toISOString();

  try {
    const messageParts = [
      `Program: ${data.degreeOfInterest}`,
      `State: ${data.state}`,
      data.enquiryMessage ? `Message: ${data.enquiryMessage}` : null,
    ].filter(Boolean);

    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('contact_submissions').insert({
        first_name: data.firstName.trim(),
        last_name: data.lastName.trim(),
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        inquiry_type: `UOW Admission: ${data.degreeOfInterest}`,
        message: messageParts.join('\n'),
        submitted_at: submittedAt,
      });

      if (error) {
        console.error('UOW application submission error:', error);
      }
    }

    const emailData: UowApplicationData = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      degreeOfInterest: data.degreeOfInterest,
      state: data.state,
      enquiryMessage: data.enquiryMessage?.trim(),
      submittedAt,
    };

    const [adminSent, confirmationSent] = await Promise.all([
      sendUowApplicationAdminNotification(emailData),
      sendUowApplicationConfirmation(emailData),
    ]);

    console.log('UOW application email status:', {
      adminNotification: adminSent ? 'sent' : 'failed',
      userConfirmation: confirmationSent ? 'sent' : 'failed',
    });

    if (!adminSent && !confirmationSent) {
      return {
        success: false,
        error: `Your application was received but we could not send emails. Please contact us at ${siteConfig.contact.email}.`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error saving UOW application:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
