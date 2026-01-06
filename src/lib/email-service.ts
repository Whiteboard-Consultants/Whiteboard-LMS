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
        console.log('Using Gmail OAuth2 as email service');
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
      console.warn('Gmail OAuth2 unavailable:', error.message);
      // Continue to next fallback
    }
  }

  // Fallback to Gmail App Password if configured
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    try {
      console.log('Using Gmail App Password as email service');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''), // Remove spaces from password
        },
      });
    } catch (error) {
      console.error('Gmail App Password also unavailable:', error);
    }
  }

  throw new Error('No email service configured (SMTP2GO, Gmail OAuth2, or Gmail App Password required)');
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

    // Check for either Gmail OAuth2, Gmail App Password, or SMTP2GO
    const hasGmailOAuth2 = process.env.GMAIL_CLIENT_ID && process.env.GMAIL_REFRESH_TOKEN;
    const hasGmailAppPassword = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    const hasSMTP2GO = process.env.SMTP_USER && process.env.SMTP_PASSWORD;

    if (!hasGmailOAuth2 && !hasGmailAppPassword && !hasSMTP2GO) {
      console.warn('No email service configured. Skipping admin notification.');
      return false;
    }

    const transporter = await createTransporter();

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;

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
    const hasGmailAppPassword = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;

    if (!hasGmailOAuth2 && !hasSMTP2GO && !hasGmailAppPassword) {
      console.warn('No email service configured. Skipping auto-reply.');
      return false;
    }

    const transporter = await createTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;

    const subject = `Thank you for contacting Whiteboard Consultants - ${submission.inquiryType}`;
    
    // Always use production URL for logo in emails (localhost won't work for email images)
    const logoUrl = `https://whiteboard-lms.vercel.app/logo.png`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="${logoUrl}" alt="Whiteboard Consultants" style="max-width: 200px; height: auto; display: block; margin: 0 auto;">
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

        <div style="text-align: center; margin: 25px 0;">
          <p style="margin: 0 0 15px 0; color: #475569; font-size: 14px;">Connect with us on social media:</p>
          <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
            <a href="https://www.facebook.com/whiteboardconsultants" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1877f2; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a href="https://www.twitter.com/whiteboardcons" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #000000; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.953 4.57a10 10 0 002.856-9.58 11.08 11.08 0 01-3.127.856 4.933 4.933 0 00-8.551 4.496 14.048 14.048 0 01-10.18-5.223 4.822 4.822 0 001.528 6.573 4.902 4.902 0 01-2.228-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.935 4.935 0 01-2.224.084 4.928 4.928 0 004.6 3.419A9.9 9.9 0 010 19.54a13.94 13.94 0 007.548 2.212c9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/whiteboardconsultants" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #0077b5; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.475-2.236-1.986-2.236-1.081 0-1.722.722-2.004 1.418-.103.249-.129.597-.129.946v5.441h-3.554s.047-8.842 0-9.769h3.554v1.383c.43-.664 1.202-1.61 2.923-1.61 2.135 0 3.735 1.39 3.735 4.38v5.616zM5.337 8.855c-1.144 0-1.915-.759-1.915-1.71 0-.955.77-1.71 1.957-1.71 1.187 0 1.915.755 1.916 1.71 0 .951-.729 1.71-1.916 1.71zm1.946 11.597H3.392V9.009h3.891v11.443zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
              </svg>
            </a>
            <a href="https://www.instagram.com/whiteboardconsultants" target="_blank" style="display: inline-block; width: 40px; height: 40px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="white" stroke-width="2"/>
                <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" fill="white"/>
                <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
              </svg>
            </a>
            <a href="https://www.youtube.com/whiteboardconsultants" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #ff0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

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