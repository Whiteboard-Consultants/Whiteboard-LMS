import {
  createTransporter,
  getAdminNotificationAddress,
  getOutboundFromAddress,
  isEmailServiceConfigured,
} from '@/lib/email-service';
import { siteConfig } from '@/lib/seo';

export interface ApplicationFormData {
  fullName: string;
  email: string;
  whatsapp: string;
  currentEducation: string;
  pursueLevel: string;
  pursueProgram: string;
  preferredLocation: string;
  locationDetail: string;
  confusionArea: string;
  currentStruggle: string;
  planningTimeline: string;
  callbackDate: string;
  callbackTime: string;
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

function buildFieldsHtml(data: ApplicationFormData): string {
  const rows = [
    ['Full Name', data.fullName],
    ['Email', data.email],
    ['WhatsApp Number', data.whatsapp],
    ['Current Education', data.currentEducation],
    ['Pursue Level', data.pursueLevel],
    ['Program', data.pursueProgram],
    ['Preferred Location', data.preferredLocation],
    ['City / Country', data.locationDetail],
    ['Maximum Confusion Area', data.confusionArea],
    ['Current Struggle', data.currentStruggle],
    ['Planning Timeline', data.planningTimeline],
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

function buildFieldsText(data: ApplicationFormData): string {
  return `
Full Name: ${data.fullName}
Email: ${data.email}
WhatsApp Number: ${data.whatsapp}
Current Education: ${data.currentEducation}
Pursue Level: ${data.pursueLevel}
Program: ${data.pursueProgram}
Preferred Location: ${data.preferredLocation}
City / Country: ${data.locationDetail}
Maximum Confusion Area: ${data.confusionArea}
Current Struggle: ${data.currentStruggle}
Planning Timeline: ${data.planningTimeline}
Preferred Callback Date: ${formatCallbackDate(data.callbackDate)}
Preferred Callback Time: ${data.callbackTime}
Submitted At: ${new Date(data.submittedAt).toLocaleString('en-IN')}
  `.trim();
}

export async function sendApplicationAdminNotification(
  data: ApplicationFormData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping application admin notification.');
      return false;
    }

    const adminEmail = getAdminNotificationAddress();
    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();
    const formattedDate = formatCallbackDate(data.callbackDate);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005294; margin-bottom: 8px;">New Application Form Submission</h2>
        <p style="color: #64748b; margin-top: 0;">A student has submitted the multi-step application form on whiteboardconsultant.com.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${buildFieldsHtml(data)}
        </table>
        <div style="background-color:#ecfdf5;padding:15px;border-radius:6px;border-left:4px solid #10b981;">
          <p style="margin:0;">Please connect with the student on <strong>${formattedDate}</strong> at <strong>${data.callbackTime}</strong> (Mon–Sat, 10:30 AM – 6:00 PM).</p>
          <p style="margin:10px 0 0 0;">
            <a href="mailto:${data.email}?subject=Re: Your Application - Whiteboard Consultants" style="color:#2563eb;">Reply to ${data.email}</a>
            &nbsp;|&nbsp;
            <a href="https://wa.me/91${data.whatsapp}" style="color:#2563eb;">WhatsApp +91 ${data.whatsapp}</a>
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: `New Application – ${data.fullName}`,
      text: `New Application Form Submission\n\n${buildFieldsText(data)}`,
      html: htmlContent,
    });

    console.log('Application admin notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send application admin notification:', error);
    return false;
  }
}

export async function sendApplicationConfirmation(
  data: ApplicationFormData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping application confirmation.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();
    const firstName = data.fullName.trim().split(/\s+/)[0] || 'there';
    const formattedDate = formatCallbackDate(data.callbackDate);
    const logoUrl = `${siteConfig.url}/logo.png`;

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="${logoUrl}" alt="Whiteboard Consultants" style="max-width: 200px; height: auto;">
        </div>
        <h2 style="color: #005294;">Thank you for your application!</h2>
        <p>Dear ${firstName},</p>
        <p>We have received your application and truly appreciate you sharing your academic goals and concerns with us. Our counselors have your details and will be ready to guide you.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005294;">
          <h3 style="margin: 0 0 8px 0; color: #005294;">Your scheduled callback</h3>
          <p style="margin: 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0 0 0;"><strong>Time:</strong> ${data.callbackTime}</p>
          <p style="margin: 12px 0 0 0; color: #64748b; font-size: 14px;">Our official working hours: Mon–Sat, 10:30 AM to 6:00 PM</p>
        </div>
        <p>We look forward to helping you navigate your education journey with clarity and confidence.</p>
        <p>Need help sooner? Call us at <a href="tel:+${CONTACT_PHONE_TEL}" style="color:#2563eb;">${CONTACT_PHONE}</a> or email <a href="mailto:${CONTACT_EMAIL}" style="color:#2563eb;">${CONTACT_EMAIL}</a>.</p>
        <p>Warm regards,<br><strong>The Whiteboard Consultants Team</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.</p>
      </div>
    `;

    const textContent = `
Thank you for your application!

Dear ${firstName},

We have received your application and appreciate you sharing your academic goals with us.

Your scheduled callback:
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
      subject: 'We received your application – Whiteboard Consultants',
      text: textContent,
      html: htmlContent,
    });

    console.log('Application confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send application confirmation:', error);
    return false;
  }
}
