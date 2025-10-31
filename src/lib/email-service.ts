import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Token cache to avoid unnecessary API calls
class TokenCache {
  private token: string | null = null;
  private expiresAt: number = 0;

  set(token: string, expiresIn: number) {
    this.token = token;
    this.expiresAt = Date.now() + (expiresIn * 1000) - 5 * 60 * 1000; // 5 min buffer
  }

  isValid(): boolean {
    return this.token !== null && Date.now() < this.expiresAt;
  }

  get(): string | null {
    return this.isValid() ? this.token : null;
  }

  clear() {
    this.token = null;
    this.expiresAt = 0;
  }
}

const tokenCache = new TokenCache();

// Get Gmail OAuth2 access token
async function getGmailAccessToken(): Promise<string | null> {
  try {
    if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET || !process.env.GMAIL_REFRESH_TOKEN) {
      return null;
    }

    // Check cache first
    const cachedToken = tokenCache.get();
    if (cachedToken) {
      return cachedToken;
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'http://localhost:3000/api/auth/callback'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();
    const accessToken = credentials.access_token;

    if (!accessToken) {
      return null;
    }

    // Cache the token
    tokenCache.set(accessToken, credentials.expiry_date ? 
      Math.floor((credentials.expiry_date - Date.now()) / 1000) : 3600);

    return accessToken;
  } catch (error) {
    console.error('Failed to get Gmail access token:', error);
    return null;
  }
}

// Email configuration - Smart routing based on account type
// Primary: SMTP2GO (proven reliable for Google Workspace accounts)
// Fallback: Gmail OAuth2 (if configured for personal Gmail)
const createTransporter = async () => {
  // Try SMTP2GO first (primary service for workspace accounts)
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    try {
      const port = parseInt(process.env.SMTP_PORT || '2525');
      const secure = process.env.SMTP_SECURE === 'true'; // Only true if explicitly set
      
      console.log('Creating SMTP2GO transporter with:', {
        host: process.env.SMTP_HOST,
        port,
        secure,
        user: process.env.SMTP_USER,
      });

      return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.smtp2go.com',
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } catch (error) {
      console.warn('SMTP2GO transporter creation failed:', error);
      // Continue to fallback
    }
  }

  // Fallback to Gmail OAuth2 if configured
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN) {
    try {
      const accessToken = await getGmailAccessToken();
      if (accessToken) {
        console.log('Using Gmail OAuth2 as fallback email service');
        return nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            type: 'OAuth2',
            user: process.env.GMAIL_USER,
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });
      }
    } catch (error) {
      console.error('Gmail OAuth2 also unavailable:', error);
    }
  }

  throw new Error('No email service configured (neither SMTP2GO nor Gmail OAuth2)');
};

export interface ContactSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  inquiryType: string;
  message?: string;
  submittedAt: string;
}

export async function sendAdminNotification(submission: ContactSubmissionData): Promise<boolean> {
  try {
    // Check if email configuration is available
    if (!process.env.ADMIN_EMAIL) {
      console.warn('Admin email not configured. Skipping admin notification.');
      return false;
    }

    // Check for either Gmail OAuth2 or SMTP2GO
    const hasGmailOAuth2 = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN;
    const hasSMTP2GO = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    if (!hasGmailOAuth2 && !hasSMTP2GO) {
      console.warn('No email service configured. Skipping admin notification.');
      return false;
    }

    const transporter = await createTransporter();

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    // Create email content
    const subject = `New Contact Form Submission - ${submission.inquiryType}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">New Contact Form Submission</h2>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Contact Details</h3>
          <p><strong>Name:</strong> ${submission.firstName} ${submission.lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${submission.email}">${submission.email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${submission.phone}">${submission.phone}</a></p>
          <p><strong>Inquiry Type:</strong> ${submission.inquiryType}</p>
          <p><strong>Submitted At:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        </div>

        ${submission.message ? `
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Message</h3>
          <p style="white-space: pre-line; margin: 0;">${submission.message}</p>
        </div>
        ` : ''}

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">Next Steps</h3>
          <p style="margin: 0;">Please respond to this inquiry within 24 hours to maintain good customer service.</p>
          <p style="margin: 10px 0 0 0;">
            <strong>Reply directly to:</strong> 
            <a href="mailto:${submission.email}?subject=Re: ${submission.inquiryType} Inquiry" style="color: #2563eb;">
              ${submission.email}
            </a>
          </p>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          This notification was sent from your Whiteboard Consultants contact form.
          <br>
          Visit your <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/contact-submissions" style="color: #2563eb;">admin dashboard</a> to view all submissions.
        </p>
      </div>
    `;

    const textContent = `
New Contact Form Submission - ${submission.inquiryType}

Contact Details:
Name: ${submission.firstName} ${submission.lastName}
Email: ${submission.email}
Phone: ${submission.phone}
Inquiry Type: ${submission.inquiryType}
Submitted At: ${new Date(submission.submittedAt).toLocaleString()}

${submission.message ? `Message:\n${submission.message}\n` : ''}

Please respond to this inquiry within 24 hours.
Reply directly to: ${submission.email}
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('Admin notification sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send admin notification:', error);
    return false;
  }
}

export async function sendAutoReply(submission: ContactSubmissionData): Promise<boolean> {
  try {
    // Check if email configuration is available
    const hasGmailOAuth2 = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN;
    const hasSMTP2GO = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    if (!hasGmailOAuth2 && !hasSMTP2GO) {
      console.warn('No email service configured. Skipping auto-reply.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const subject = `Thank you for contacting Whiteboard Consultants - ${submission.inquiryType}`;
    
    // Use production URL for logo in emails (since localhost won't work when sent)
    const logoUrl = process.env.NODE_ENV === 'production' 
      ? `https://whiteboard-lms.vercel.app/logo.png`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoUrl}" alt="Whiteboard Consultants" style="max-width: 200px; height: auto; margin-bottom: 15px; display: block;">
          <h1 style="color: #2563eb; margin: 0;">Whiteboard Consultants</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Your Future | Our Focus</p>
        </div>
        
        <h2 style="color: #1e40af;">Thank you for reaching out!</h2>
        
        <p>Dear ${submission.firstName},</p>
        
        <p>We have received your inquiry about <strong>${submission.inquiryType}</strong> and appreciate you taking the time to contact us.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our expert counselors will review your inquiry</li>
            <li>We'll respond within 24 hours (usually much sooner!)</li>
            <li>You'll receive personalized guidance based on your needs</li>
          </ul>
        </div>

        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Explore our <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="color: #2563eb;">online courses</a></li>
          <li>Read our <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" style="color: #2563eb;">latest blog posts</a></li>
          <li>Follow us on social media for tips and updates</li>
        </ul>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">Need Immediate Help?</h3>
          <p style="margin: 0;">Call us at <a href="tel:+918583035656" style="color: #2563eb;">+91 85830 35656</a></p>
          <p style="margin: 5px 0 0 0;">Or email us at <a href="mailto:info@whiteboardconsultant.com" style="color: #2563eb;">info@whiteboardconsultant.com</a></p>
        </div>

        <p>Best regards,<br>
        <strong>The Whiteboard Consultants Team</strong></p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
          This is an automated response. Please do not reply directly to this email.
          <br>
          © 2025 Whiteboard Consultants. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
Thank you for contacting Whiteboard Consultants!

Dear ${submission.firstName},

We have received your inquiry about ${submission.inquiryType} and appreciate you taking the time to contact us.

What happens next?
- Our expert counselors will review your inquiry
- We'll respond within 24 hours (usually much sooner!)
- You'll receive personalized guidance based on your needs

Need immediate help?
Call us at +91 85830 35656
Email: info@whiteboardconsultant.com

Best regards,
The Whiteboard Consultants Team

This is an automated response. Please do not reply directly to this email.
    `.trim();

    // Send auto-reply
    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: submission.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('Auto-reply sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send auto-reply:', error);
    return false;
  }
}