
'use server';

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { sendAdminNotification, sendAutoReply, type ContactSubmissionData } from '@/lib/email-service';
import type { z } from "zod";

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

const formSchema = {
  firstName: { type: "string" },
  lastName: { type: "string" },
  email: { type: "string" },
  phone: { type: "string" },
  inquiryType: { type: "string" },
  message: { type: "string", optional: true },
};

type ContactFormData = z.infer<z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodString;
    inquiryType: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
}>>;


export async function saveContactSubmission(formData: ContactFormData) {
  // Validate required fields
  if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.inquiryType) {
    return { success: false, error: 'All required fields must be filled out.' };
  }

  try {
    // Use admin client if available, otherwise fall back to regular client
    const client = supabaseAdmin || supabase;
    
    if (!client) {
      console.error('No Supabase client available');
      return { success: false, error: 'Database configuration error. Please try again later.' };
    }

    const submissionData = {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      inquiry_type: formData.inquiryType,
      message: formData.message?.trim() || null,
      submitted_at: new Date().toISOString(),
    };
    
    const { data, error } = await client
      .from('contact_submissions')
      .insert(submissionData)
      .select('id')
      .single();
    
    if (error) {
      console.error('Supabase contact submission error:', error);
      
      // Provide more specific error messages based on the error type
      if (error.code === '42P01') {
        return { success: false, error: 'Database table not found. Please contact support.' };
      } else if (error.code === '23505') {
        return { success: false, error: 'A submission with this email already exists.' };
      } else {
        return { success: false, error: 'Failed to save your submission. Please try again.' };
      }
    }
    
    if (!data) {
      console.error('No data returned from contact submission insert');
      return { success: false, error: 'Submission may not have been saved properly. Please try again.' };
    }
    
    console.log('Contact submission saved successfully:', data.id);
    
    // Send email notifications (don't block the response if emails fail)
    const emailData: ContactSubmissionData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      inquiryType: formData.inquiryType,
      message: formData.message?.trim(),
      submittedAt: submissionData.submitted_at,
    };

    // Send notifications asynchronously (don't await to avoid blocking the response)
    Promise.all([
      sendAdminNotification(emailData),
      sendAutoReply(emailData)
    ]).then(([adminSent, autoReplySent]) => {
      console.log(`✅ Contact submission ${data.id} saved successfully`);
      console.log('📧 Email notifications:', { 
        adminNotification: adminSent ? '✅ sent' : '❌ failed (check SMTP config)',
        autoReply: autoReplySent ? '✅ sent' : '❌ failed (check SMTP config)'
      });
      
      if (!adminSent || !autoReplySent) {
        console.log('💡 To enable email notifications, add SMTP configuration to .env.local:');
        console.log('   SMTP_USER, SMTP_PASSWORD, ADMIN_EMAIL');
        console.log('   See .env.email.example for full configuration');
      }
    }).catch((error) => {
      console.error('❌ Error sending email notifications:', error);
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error saving contact submission:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
