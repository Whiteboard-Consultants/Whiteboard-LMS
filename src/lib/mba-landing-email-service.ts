import {
  createTransporter,
  getAdminNotificationAddress,
  getOutboundFromAddress,
  isEmailServiceConfigured,
} from '@/lib/email-service';
import {
  getBudgetLabel,
  getCareerStageLabel,
  getMbaReasonLabel,
  getProgramTimelineLabel,
  type MbaLandingFormData,
} from '@/lib/schemas/mba-landing-form';
import { siteConfig } from '@/lib/seo';

export interface MbaLandingSubmissionData extends MbaLandingFormData {
  submittedAt: string;
}

const CONTACT_EMAIL = siteConfig.contact.email;
const CONTACT_PHONE = siteConfig.contact.phone;
const CONTACT_PHONE_TEL = CONTACT_PHONE.replace(/\D/g, '');

function formatCallbackDate(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function buildFieldsHtml(data: MbaLandingSubmissionData): string {
  const rows = [
    ['First Name', data.firstName],
    ['Last Name', data.lastName],
    ['Email', data.email],
    ['Phone', data.phone || 'Not provided'],
    ['Career Stage', getCareerStageLabel(data.careerStage)],
    ['Why MBA?', getMbaReasonLabel(data.mbaReason)],
    ['Budget', getBudgetLabel(data.budget)],
    ['Program Start Timeline', getProgramTimelineLabel(data.programTimeline)],
    ['Biggest Challenge', data.biggestChallenge],
    ['Preferred Callback Date', formatCallbackDate(data.callbackDate)],
    ['Preferred Callback Time', data.callbackTime],
    ['Submitted At', new Date(data.submittedAt).toLocaleString('en-IN')],
  ];

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e40af;vertical-align:top;width:40%;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;white-space:pre-line;">${value}</td></tr>`
    )
    .join('');
}

function buildFieldsText(data: MbaLandingSubmissionData): string {
  return `
First Name: ${data.firstName}
Last Name: ${data.lastName}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Career Stage: ${getCareerStageLabel(data.careerStage)}
Why MBA?: ${getMbaReasonLabel(data.mbaReason)}
Budget: ${getBudgetLabel(data.budget)}
Program Start Timeline: ${getProgramTimelineLabel(data.programTimeline)}
Biggest Challenge: ${data.biggestChallenge}
Preferred Callback Date: ${formatCallbackDate(data.callbackDate)}
Preferred Callback Time: ${data.callbackTime}
Submitted At: ${new Date(data.submittedAt).toLocaleString('en-IN')}
  `.trim();
}

export async function sendMbaLandingAdminNotification(
  data: MbaLandingSubmissionData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping MBA landing admin notification.');
      return false;
    }

    const adminEmail = getAdminNotificationAddress();
    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();
    const formattedDate = formatCallbackDate(data.callbackDate);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005294; margin-bottom: 8px;">Online MBA Enquiry</h2>
        <p style="color: #64748b; margin-top: 0;">A new Online MBA enquiry has been submitted on whiteboardconsultant.com.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${buildFieldsHtml(data)}
        </table>
        <div style="background-color:#ecfdf5;padding:15px;border-radius:6px;border-left:4px solid #10b981;">
          <p style="margin:0;">Please connect with the student on <strong>${formattedDate}</strong> at <strong>${data.callbackTime}</strong> (Mon–Sat, 10:30 AM – 6:00 PM).</p>
          <p style="margin:10px 0 0 0;">
            <a href="mailto:${data.email}?subject=Re: Your Online MBA Enquiry - Whiteboard Consultants" style="color:#2563eb;">Reply to ${data.email}</a>
            ${data.phone ? `&nbsp;|&nbsp;<a href="tel:${data.phone}" style="color:#2563eb;">Call ${data.phone}</a>` : ''}
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: 'Online MBA Enquiry',
      text: `Online MBA Enquiry\n\n${buildFieldsText(data)}`,
      html: htmlContent,
    });

    console.log('MBA landing admin notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send MBA landing admin notification:', error);
    return false;
  }
}

export async function sendMbaLandingConfirmation(
  data: MbaLandingSubmissionData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping MBA landing confirmation.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();
    const formattedDate = formatCallbackDate(data.callbackDate);
    const logoUrl = `${siteConfig.url}/logo.png`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="Whiteboard Consultants" style="max-width: 200px; height: auto;">
        </div>
        <h2 style="color: #005294;">Thank you for your Online MBA enquiry!</h2>
        <p>Dear ${data.firstName},</p>
        <p>We have received your enquiry and appreciate you sharing your career goals with us. Our counsellors will review your details and match you with Online MBA programs suited to your profile.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005294;">
          <h3 style="margin: 0 0 8px 0; color: #005294;">Your scheduled consultation</h3>
          <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0 0 0;"><strong>Time:</strong> ${data.callbackTime}</p>
          <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Our official working hours: Mon–Sat, 10:30 AM to 6:00 PM</p>
        </div>
        <p>We look forward to helping you find the right Online MBA program for your career growth.</p>
        <p>Need help sooner? Call us at <a href="tel:+${CONTACT_PHONE_TEL}" style="color:#2563eb;">${CONTACT_PHONE}</a> or email <a href="mailto:${CONTACT_EMAIL}" style="color:#2563eb;">${CONTACT_EMAIL}</a>.</p>
        <p>Warm regards,<br><strong>The Whiteboard Consultants Team</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.</p>
      </div>
    `;

    const textContent = `
Thank you for your Online MBA enquiry!

Dear ${data.firstName},

We have received your enquiry and appreciate you sharing your career goals with us.

Your scheduled consultation:
Date: ${formattedDate}
Time: ${data.callbackTime}

Our team will connect with you at the chosen date and time (Mon–Sat, 10:30 AM – 6:00 PM).

Need help sooner?
Call: ${CONTACT_PHONE}
Email: ${CONTACT_EMAIL}

Warm regards,
The Whiteboard Consultants Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: data.email,
      subject: 'Thank You for Your Online MBA Enquiry – Whiteboard Consultants',
      text: textContent,
      html: htmlContent,
    });

    console.log('MBA landing confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send MBA landing confirmation:', error);
    return false;
  }
}
