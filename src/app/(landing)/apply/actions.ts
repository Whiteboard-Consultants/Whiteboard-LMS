'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies, headers } from 'next/headers';
import { supabase } from '@/lib/supabase';
import {
  sendApplicationAdminNotification,
  sendApplicationConfirmation,
  type ApplicationFormData,
} from '@/lib/application-email-service';
import { sendMetaLeadEvent } from '@/lib/meta-conversions-api';
import { siteConfig } from '@/lib/seo';

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

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '-' };
  }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

function buildMessageBody(data: ApplicationFormData): string {
  return [
    `Application Form Submission`,
    ``,
    `Full Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `WhatsApp: +91 ${data.whatsapp}`,
    `Current Education: ${data.currentEducation}`,
    `Pursue Level: ${data.pursueLevel}`,
    `Program: ${data.pursueProgram}`,
    `Preferred Location: ${data.preferredLocation}`,
    `City/Country: ${data.locationDetail}`,
    `Confusion Area: ${data.confusionArea}`,
    `Current Struggle: ${data.currentStruggle}`,
    `Planning Timeline: ${data.planningTimeline}`,
    `Callback Date: ${data.callbackDate}`,
    `Callback Time: ${data.callbackTime}`,
  ].join('\n');
}

export async function submitApplication(
  data: ApplicationFormData,
  eventId?: string
): Promise<{ success: boolean; error?: string }> {
  if (
    !data.fullName?.trim() ||
    !data.email?.trim() ||
    !data.whatsapp?.trim() ||
    !data.currentEducation?.trim() ||
    !data.pursueLevel ||
    !data.pursueProgram?.trim() ||
    !data.preferredLocation ||
    !data.locationDetail?.trim() ||
    !data.confusionArea?.trim() ||
    !data.currentStruggle ||
    !data.planningTimeline ||
    !data.callbackDate ||
    !data.callbackTime
  ) {
    return { success: false, error: 'Please complete all required fields.' };
  }

  if (!/^\d{10}$/.test(data.whatsapp)) {
    return { success: false, error: 'WhatsApp number must be exactly 10 digits.' };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const submittedAt = new Date().toISOString();
  const payload: ApplicationFormData = {
    ...data,
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    whatsapp: data.whatsapp.trim(),
    submittedAt,
  };

  try {
    const client = supabaseAdmin || supabase;
    const requestHeaders = await headers();
    const requestCookies = await cookies();
    const ipAddress =
      requestHeaders.get('x-forwarded-for') ||
      requestHeaders.get('x-real-ip') ||
      'unknown';
    const userAgent = requestHeaders.get('user-agent') || 'unknown';
    const sourceUrl =
      requestHeaders.get('referer') || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/apply`;

    if (client) {
      const { firstName, lastName } = splitName(payload.fullName);

      const { error } = await client.from('contact_submissions').insert({
        first_name: firstName,
        last_name: lastName,
        email: payload.email,
        phone: payload.whatsapp,
        inquiry_type: 'Application Form',
        message: buildMessageBody(payload),
        submitted_at: submittedAt,
      });

      if (error) {
        console.error('Application submission DB error:', error);
      }
    }

    const { firstName, lastName } = splitName(payload.fullName);
    const [adminSent, confirmationSent, metaLeadSent] = await Promise.all([
      sendApplicationAdminNotification(payload),
      sendApplicationConfirmation(payload),
      sendMetaLeadEvent({
        eventId: eventId || crypto.randomUUID(),
        eventSourceUrl: sourceUrl,
        userData: {
          email: payload.email,
          phone: payload.whatsapp,
          firstName,
          lastName,
          fbp: requestCookies.get('_fbp')?.value,
          fbc: requestCookies.get('_fbc')?.value,
          clientIpAddress: ipAddress,
          clientUserAgent: userAgent,
        },
      }),
    ]);

    console.log(
      `Application emails – admin: ${adminSent ? 'sent' : 'failed'}, confirmation: ${confirmationSent ? 'sent' : 'failed'}`
    );
    console.log(`Application Meta lead – ${metaLeadSent ? 'sent' : 'failed'}`);

    if (!adminSent && !confirmationSent) {
      return {
        success: false,
        error:
          `Your application was saved but we could not send emails. Please contact us at ${siteConfig.contact.email}.`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Application submission error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}
