import {
  createTransporter,
  getAdminNotificationAddress,
  getOutboundFromAddress,
  isEmailServiceConfigured,
} from '@/lib/email-service';
import { type GccFormData } from '@/lib/schemas/gcc-form';
import { siteConfig } from '@/lib/seo';

export interface GccSubmissionData extends GccFormData {
  submittedAt: string;
}

const CONTACT_EMAIL = siteConfig.contact.email;
const CONTACT_PHONE = siteConfig.contact.phone;
const CONTACT_PHONE_TEL = CONTACT_PHONE.replace(/\D/g, '');

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildFieldsHtml(data: GccSubmissionData): string {
  const rows = [
    ['Name', data.fullName],
    ['Email', data.email],
    ['Phone', data.mobileNumber],
    ['Department / Stream', data.departmentStream],
    ['Current Year', data.currentSemesterYear],
    ['Preferred destinations', data.preferredDestinations.join(', ')],
    ['Preferred study areas', data.preferredStudyAreas.join(', ')],
    ['Submitted at', new Date(data.submittedAt).toLocaleString('en-IN')],
  ];

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e40af;vertical-align:top;width:40%;">${escapeHtml(label)}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${escapeHtml(value)}</td></tr>`
    )
    .join('');
}

function buildFieldsText(data: GccSubmissionData): string {
  return `
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.mobileNumber}
Department / Stream: ${data.departmentStream}
Current Year: ${data.currentSemesterYear}
Preferred destinations: ${data.preferredDestinations.join(', ')}
Preferred study areas: ${data.preferredStudyAreas.join(', ')}
Submitted at: ${new Date(data.submittedAt).toLocaleString('en-IN')}
  `.trim();
}

export async function sendGccAdminNotification(data: GccSubmissionData): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping Global Career Camp admin notification.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005294; margin-bottom: 8px;">Global Career Camp 2026 — Free pass reserved</h2>
        <p style="color: #64748b; margin-top: 0;">A student has reserved a free pass for 30 September and 1 October 2026 at Bhawanipur Global Campus.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${buildFieldsHtml(data)}
        </table>
        <div style="background-color:#ecfdf5;padding:15px;border-radius:6px;border-left:4px solid #10b981;">
          <p style="margin:0;">
            <a href="mailto:${escapeHtml(data.email)}?subject=Re: Global Career Camp 2026 — Whiteboard Consultants" style="color:#2563eb;">Reply to ${escapeHtml(data.email)}</a>
            &nbsp;|&nbsp;<a href="tel:${escapeHtml(data.mobileNumber)}" style="color:#2563eb;">Call ${escapeHtml(data.mobileNumber)}</a>
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: getAdminNotificationAddress(),
      subject: `Global Career Camp registration — ${data.fullName}`,
      text: `Global Career Camp 2026 — Free pass reserved\n\n${buildFieldsText(data)}`,
      html: htmlContent,
    });

    console.log('Global Career Camp admin notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send Global Career Camp admin notification:', error);
    return false;
  }
}

export async function sendGccConfirmation(data: GccSubmissionData): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping Global Career Camp confirmation.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();
    const logoUrl = `${siteConfig.url}/logo.png`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="Whiteboard Consultants" style="max-width: 200px; height: auto;">
        </div>
        <h2 style="color: #005294;">Your free pass is reserved.</h2>
        <p>Dear ${escapeHtml(data.fullName)},</p>
        <p>Your free pass for <strong>Global Career Camp 2026</strong> at Bhawanipur Global Campus, Kolkata is confirmed.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005294;">
          <p style="margin: 0 0 8px 0;"><strong>Day 1:</strong> 30 September 2026, 10:00 AM – 5:00 PM</p>
          <p style="margin: 0;"><strong>Day 2:</strong> 1 October 2026, 10:30 AM – 1:30 PM. FinTech Rewired Masterclass</p>
        </div>
        <p>Questions before the camp? Call us at <a href="tel:+${CONTACT_PHONE_TEL}" style="color:#2563eb;">${CONTACT_PHONE}</a> or email <a href="mailto:${CONTACT_EMAIL}" style="color:#2563eb;">${CONTACT_EMAIL}</a>.</p>
        <p>Warm regards,<br><strong>The Whiteboard Consultants Team</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.</p>
      </div>
    `;

    const textContent = `
Your free pass is reserved.

Dear ${data.fullName},

Your free pass for Global Career Camp 2026 at Bhawanipur Global Campus, Kolkata is confirmed.

Day 1: 30 September 2026, 10:00 AM – 5:00 PM
Day 2: 1 October 2026, 10:30 AM – 1:30 PM. FinTech Rewired Masterclass

Questions before the camp?
Call: ${CONTACT_PHONE}
Email: ${CONTACT_EMAIL}

Warm regards,
The Whiteboard Consultants Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: data.email,
      subject: 'Your free pass is reserved — Global Career Camp 2026 | Whiteboard Consultants',
      text: textContent,
      html: htmlContent,
    });

    console.log('Global Career Camp confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send Global Career Camp confirmation:', error);
    return false;
  }
}
