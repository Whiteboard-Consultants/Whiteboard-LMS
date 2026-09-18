import {
  createTransporter,
  getAdminNotificationAddress,
  getOutboundFromAddress,
  isEmailServiceConfigured,
} from '@/lib/email-service';
import {
  getBridgePlanLabel,
  getYearOfStudyLabel,
  isHigherEducationPlan,
  type FutureOfJobsFormData,
} from '@/lib/schemas/future-of-jobs-form';
import { siteConfig } from '@/lib/seo';

export interface FutureOfJobsSubmissionData extends FutureOfJobsFormData {
  submittedAt: string;
}

const CONTACT_EMAIL = siteConfig.contact.email;
const CONTACT_PHONE = siteConfig.contact.phone;
const CONTACT_PHONE_TEL = CONTACT_PHONE.replace(/\D/g, '');
const WEBINAR_INVITE_URL =
  'https://webinar.gg/webinar-page/cmu6t30tz00hgs60yc5fcc3dx';

function buildFieldsHtml(data: FutureOfJobsSubmissionData): string {
  const rows = [
    ['Name', data.fullName],
    ['Email', data.email],
    ['Phone', data.mobileNumber],
    ['College Name', data.collegeName],
    ['Year of Study', getYearOfStudyLabel(data.yearOfStudy)],
    ['Plan to cross the bridge', getBridgePlanLabel(data.bridgePlan)],
    [
      'Choice of program',
      isHigherEducationPlan(data.bridgePlan)
        ? data.programChoice?.trim() || 'Not provided'
        : 'Not applicable',
    ],
    ['Submitted At', new Date(data.submittedAt).toLocaleString('en-IN')],
  ];

  return rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-weight:600;color:#1e40af;vertical-align:top;width:40%;">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;white-space:pre-line;">${value}</td></tr>`
    )
    .join('');
}

function buildFieldsText(data: FutureOfJobsSubmissionData): string {
  return `
Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.mobileNumber}
College Name: ${data.collegeName}
Year of Study: ${getYearOfStudyLabel(data.yearOfStudy)}
Plan to cross the bridge: ${getBridgePlanLabel(data.bridgePlan)}
Choice of program: ${
    isHigherEducationPlan(data.bridgePlan)
      ? data.programChoice?.trim() || 'Not provided'
      : 'Not applicable'
  }
Submitted At: ${new Date(data.submittedAt).toLocaleString('en-IN')}
  `.trim();
}

export async function sendFutureOfJobsAdminNotification(
  data: FutureOfJobsSubmissionData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn(
        'No email service configured. Skipping Future of Jobs admin notification.'
      );
      return false;
    }

    const adminEmail = getAdminNotificationAddress();
    const transporter = await createTransporter();
    const fromEmail = getOutboundFromAddress();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #005294; margin-bottom: 8px;">Future of Jobs — Seat Reserved</h2>
        <p style="color: #64748b; margin-top: 0;">A student has registered for the 21 September 2026 session at Bhawanipur Global Campus.</p>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          ${buildFieldsHtml(data)}
        </table>
        <div style="background-color:#ecfdf5;padding:15px;border-radius:6px;border-left:4px solid #10b981;">
          <p style="margin:0;">
            <a href="mailto:${data.email}?subject=Re: Future of Jobs session — Whiteboard Consultants" style="color:#2563eb;">Reply to ${data.email}</a>
            &nbsp;|&nbsp;<a href="tel:${data.mobileNumber}" style="color:#2563eb;">Call ${data.mobileNumber}</a>
          </p>
          <p style="margin:10px 0 0 0;">Webinar invite sent: <a href="${WEBINAR_INVITE_URL}" style="color:#2563eb;">${WEBINAR_INVITE_URL}</a></p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: `Future of Jobs registration — ${data.fullName}`,
      text: `Future of Jobs — Seat Reserved\n\n${buildFieldsText(data)}\n\nWebinar invite sent: ${WEBINAR_INVITE_URL}`,
      html: htmlContent,
    });

    console.log('Future of Jobs admin notification sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send Future of Jobs admin notification:', error);
    return false;
  }
}

export async function sendFutureOfJobsConfirmation(
  data: FutureOfJobsSubmissionData
): Promise<boolean> {
  try {
    if (!isEmailServiceConfigured()) {
      console.warn(
        'No email service configured. Skipping Future of Jobs confirmation.'
      );
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
        <h2 style="color: #005294;">You're in. Seat confirmed.</h2>
        <p>Dear ${data.fullName},</p>
        <p>Seat confirmed for <strong>Future of Jobs — How to Cross the Bridge</strong> on <strong>21 September 2026</strong> at Bhawanipur Global Campus.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #005294;">
          <p style="margin: 0 0 12px 0;">Join the session with this webinar invite:</p>
          <p style="margin: 0;">
            <a href="${WEBINAR_INVITE_URL}" style="display:inline-block;background-color:#005294;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600;">
              Open webinar invite
            </a>
          </p>
          <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b; word-break: break-all;">
            ${WEBINAR_INVITE_URL}
          </p>
        </div>
        <p>We'll WhatsApp/email your reminder and the pre-session prep sheet 24 hours before. See you there.</p>
        <p>Need help sooner? Call us at <a href="tel:+${CONTACT_PHONE_TEL}" style="color:#2563eb;">${CONTACT_PHONE}</a> or email <a href="mailto:${CONTACT_EMAIL}" style="color:#2563eb;">${CONTACT_EMAIL}</a>.</p>
        <p>Warm regards,<br><strong>The Whiteboard Consultants Team</strong></p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">© ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.</p>
      </div>
    `;

    const textContent = `
You're in. Seat confirmed.

Dear ${data.fullName},

Seat confirmed for Future of Jobs — How to Cross the Bridge on 21 September 2026 at Bhawanipur Global Campus.

Join the session with this webinar invite:
${WEBINAR_INVITE_URL}

We'll WhatsApp/email your reminder and the pre-session prep sheet 24 hours before. See you there.

Need help sooner?
Call: ${CONTACT_PHONE}
Email: ${CONTACT_EMAIL}

Warm regards,
The Whiteboard Consultants Team
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: data.email,
      subject: 'Seat confirmed — Future of Jobs, 21 September | Whiteboard Consultants',
      text: textContent,
      html: htmlContent,
    });

    console.log('Future of Jobs confirmation sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send Future of Jobs confirmation:', error);
    return false;
  }
}
