
'use server';

import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { sendAdminNotification, sendAutoReply, type ContactSubmissionData } from '@/lib/email-service';
import { sendMetaLeadEvent } from '@/lib/meta-conversions-api';
import { verifyReCaptcha } from '@/lib/recaptcha-verify';
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


export async function saveContactSubmission(
  formData: ContactFormData,
  recaptchaToken?: string,
  eventId?: string
) {
  // Verify reCAPTCHA token first
  if (recaptchaToken) {
    const recaptchaResult = await verifyReCaptcha(recaptchaToken, 'contact_form');
    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed:', recaptchaResult.error);
      return { success: false, error: 'Security verification failed. Please try again.' };
    }
    console.log('✅ reCAPTCHA verified, score:', recaptchaResult.score);
  } else if (process.env.NODE_ENV === 'production') {
    // In production, require reCAPTCHA token
    return { success: false, error: 'Security verification required.' };
  }

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
    const requestHeaders = await headers();
    const requestCookies = await cookies();
    const ipAddress =
      requestHeaders.get('x-forwarded-for') ||
      requestHeaders.get('x-real-ip') ||
      'unknown';
    const userAgent = requestHeaders.get('user-agent') || 'unknown';
    const sourceUrl =
      requestHeaders.get('referer') || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/contact`;
    
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
    
    console.log('✅ Contact submission saved successfully:', data.id);
    
    // Send email notifications
    const emailData: ContactSubmissionData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      inquiryType: formData.inquiryType,
      message: formData.message?.trim(),
      submittedAt: submissionData.submitted_at,
    };

    // Send notifications and wait for them to complete
    try {
      const [adminSent, autoReplySent, metaLeadSent] = await Promise.all([
        sendAdminNotification(emailData),
        sendAutoReply(emailData),
        sendMetaLeadEvent({
          eventId: eventId || crypto.randomUUID(),
          eventSourceUrl: sourceUrl,
          userData: {
            email: emailData.email,
            phone: emailData.phone,
            firstName: emailData.firstName,
            lastName: emailData.lastName,
            fbp: requestCookies.get('_fbp')?.value,
            fbc: requestCookies.get('_fbc')?.value,
            clientIpAddress: ipAddress,
            clientUserAgent: userAgent,
          },
        }),
      ]);

      console.log(`📧 Contact submission ${data.id} - Email status:`);
      console.log(`   Admin notification: ${adminSent ? '✅ sent' : '❌ failed'}`);
      console.log(`   Auto-reply: ${autoReplySent ? '✅ sent' : '❌ failed'}`);
      console.log(`   Meta lead event: ${metaLeadSent ? '✅ sent' : '❌ failed'}`);
      
      if (!adminSent || !autoReplySent) {
        console.log('⚠️  Email service issue detected. Checking configuration:');
        console.log(`   EMAIL_SERVICE=${process.env.EMAIL_SERVICE}`);
        console.log(`   Gmail OAuth2 configured: ${process.env.GMAIL_CLIENT_ID ? '✅' : '❌'}`);
        console.log(`   SMTP2GO configured: ${process.env.SMTP_USER ? '✅' : '❌'}`);
        console.log(`   Gmail App Password configured: ${process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? '✅' : '❌'}`);
        console.log(`   Admin email: ${process.env.ADMIN_EMAIL}`);
      }
    } catch (emailError) {
      console.error('❌ Error sending email notifications:', emailError);
      console.error('Email service error details:', {
        message: emailError instanceof Error ? emailError.message : String(emailError),
        service: process.env.EMAIL_SERVICE,
        hasGmailOAuth2: !!process.env.GMAIL_CLIENT_ID,
        hasGmailAppPassword: !!(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD),
        hasSMTP2GO: !!process.env.SMTP_USER,
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving contact submission:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
