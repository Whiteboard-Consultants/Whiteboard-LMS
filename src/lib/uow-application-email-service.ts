import {
  createTransporter,
  getAdminNotificationAddress,
  getOutboundFromAddress,
  isEmailServiceConfigured,
} from '@/lib/email-service';
import { siteConfig } from '@/lib/seo';

export interface UowApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredIntake: string;
  degreeOfInterest: string;
  state: string;
  enquiryMessage?: string;
  submittedAt: string;
}

const CONTACT_EMAIL = siteConfig.contact.email;
const CONTACT_PHONE = siteConfig.contact.phone;
const CONTACT_PHONE_TEL = CONTACT_PHONE.replace(/\D/g, '');

function buildFieldsHtml(data: UowApplicationData): string {
  const rows = [
    ['First Name', data.firstName],
    ['Last Name', data.lastName],
    ['Email', data.email],
    ['Phone', data.phone],
    ['Preferred Intake', data.preferredIntake],
    ['Program of Interest', data.degreeOfInterest],
    ['State', data.state],
    ['Enquiry Message', data.enquiryMessage || 'Not provided'],
    ['Submitted At', new Date(data.submittedAt).toLocaleString('en-IN')],
  ];

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e40af;vertical-align:top;width:40%;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;white-space:pre-line;">${value}</td></tr>`
    )
    .join('');
}

function buildFieldsText(data: UowApplicationData): string {
  return `
First Name: ${data.firstName}
Last Name: ${data.lastName}
Email: ${data.email}
Phone: ${data.phone}
Preferred Intake: ${data.preferredIntake}
Program of Interest: ${data.degreeOfInterest}
State: ${data.state}
Enquiry Message: ${data.enquiryMessage || 'Not provided'}
Submitted At: ${new Date(data.submittedAt).toLocaleString('en-IN')}
  `.trim();
}

export async function sendUowApplicationAdminNotification(
  data: UowApplicationData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping UOW admin notification.');
      return false;
    }

    const adminEmail = getAdminNotificationAddress();
    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005294; margin-bottom: 8px;">UOW India Application</h2>
        <p style="color: #64748b; margin-top: 0;">A new application has been submitted for University of Wollongong, India.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${buildFieldsHtml(data)}
        </table>
        <div style="background-color:#ecfdf5;padding:15px;border-radius:6px;border-left:4px solid #10b981;">
          <p style="margin:10px 0 0 0;">
            <a href="mailto:${data.email}?subject=Re: Your UOW India Application - Whiteboard Consultants" style="color:#2563eb;">Reply to ${data.email}</a>
            &nbsp;|&nbsp;
            <a href="tel:${data.phone}" style="color:#2563eb;">Call ${data.phone}</a>
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: 'New Application for UOW-India',
      text: `New Application for UOW-India\n\n${buildFieldsText(data)}`,
      html: htmlContent,
    });

    console.log('UOW admin notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send UOW admin notification:', error);
    return false;
  }
}

export async function sendUowApplicationConfirmation(
  data: UowApplicationData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn('No email service configured. Skipping UOW confirmation.');
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
        <h2 style="color: #005294;">Thank you for your application!</h2>
        <p>Dear ${data.firstName},</p>
        <p>We have received your application for the <strong>University of Wollongong, India</strong> program (<strong>${data.degreeOfInterest}</strong>). Our counsellors will review your details and connect with you shortly.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005294;">
          <h3 style="margin: 0 0 8px 0; color: #005294;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our UOW India specialists will review your application</li>
            <li>We will reach out within 24 hours to guide you through the next steps</li>
            <li>You will receive personalised support for your preferred ${data.preferredIntake} intake</li>
          </ul>
        </div>
        <p>Need help sooner? Call us at <a href="tel:+${CONTACT_PHONE_TEL}" style="color:#2563eb;">${CONTACT_PHONE}</a> or email <a href="mailto:${CONTACT_EMAIL}" style="color:#2563eb;">${CONTACT_EMAIL}</a>.</p>
        <p>Warm regards,<br><strong>The Whiteboard Consultants Team</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.</p>
      </div>
    `;

    const textContent = `
Thank you for your application!

Dear ${data.firstName},

We have received your application for the University of Wollongong, India program (${data.degreeOfInterest}). Our counsellors will review your details and connect with you shortly.

What happens next?
- Our UOW India specialists will review your application
- We will reach out within 24 hours to guide you through the next steps
- You will receive personalised support for your preferred ${data.preferredIntake} intake

Need help sooner?
Call: ${CONTACT_PHONE}
Email: ${CONTACT_EMAIL}

Warm regards,
The Whiteboard Consultants Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: data.email,
      subject: 'We received your UOW India application – Whiteboard Consultants',
      text: textContent,
      html: htmlContent,
    });

    console.log('UOW confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send UOW confirmation:', error);
    return false;
  }
}
