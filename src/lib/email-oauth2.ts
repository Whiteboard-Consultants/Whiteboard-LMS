/**
 * Email Service with Gmail OAuth2 SMTP Authentication
 * 
 * This module handles email sending using Gmail's OAuth2 XOAuth2 authentication
 * instead of passwords. This is production-grade and works with 2-Step Verification.
 * 
 * The refresh token automatically handles token expiration and renewal.
 */

import nodemailer from 'nodemailer';
import { google } from 'googleapis';

/**
 * Create a Nodemailer transporter with Gmail OAuth2 or Gmail App Password
 */
export async function createEmailTransport() {
  try {
    const emailService = process.env.EMAIL_SERVICE || 'gmail-app-password';
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📧 EMAIL SERVICE INITIALIZATION`);
    console.log(`${'='.repeat(70)}`);
    console.log(`🔍 Current EMAIL_SERVICE setting: "${emailService}"`);
    
    // Use Gmail App Password (Simplest, Most Reliable)
    if (!process.env.GMAIL_REFRESH_TOKEN || emailService === 'gmail-app-password') {
      console.log(`✅ Using: GMAIL APP PASSWORD (Simple & Reliable)`);
      console.log(`📮 From Address: ${process.env.GMAIL_USER}`);
      console.log(`🔐 Authentication Method: Gmail App Password`);
      
      if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error('GMAIL_USER and GMAIL_APP_PASSWORD are required for Gmail App Password authentication');
      }

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      console.log(`✨ Gmail App Password transporter created successfully`);
      console.log(`${'='.repeat(70)}\n`);
      
      return transporter;
    }
    
    // Use Gmail OAuth2 (if refresh token is configured)
    if (emailService === 'gmail-oauth2' && process.env.GMAIL_REFRESH_TOKEN) {
      console.log(`✅ Using: GMAIL OAUTH2 (Secure OAuth2 Authentication)`);
      console.log(`📮 From Address: ${process.env.GMAIL_USER}`);
      console.log(`🔐 Authentication Method: OAuth2 with Refresh Token`);
      
      if (!process.env.GMAIL_REFRESH_TOKEN) {
        throw new Error('GMAIL_REFRESH_TOKEN is not configured in environment variables');
      }

      const oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        'http://localhost:3000/api/auth/callback'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.GMAIL_USER,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        },
      });

      console.log(`✨ OAuth2 transporter created successfully`);
      console.log(`${'='.repeat(70)}\n`);
      
      return transporter;
    } else {
      // Fallback to SMTP2GO if configured
      console.log(`⚠️  Using: SMTP2GO (Legacy SMTP - Not recommended)`);
      console.log(`📮 From Address: ${process.env.SMTP_FROM_EMAIL}`);
      console.log(`🔐 Authentication Method: Basic SMTP Username/Password`);
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '2525'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      console.log(`⚠️  SMTP2GO transporter created (fallback mode)`);
      console.log(`${'='.repeat(70)}\n`);
      
      return transporter;
    }
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    throw new Error(`Email transporter error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send an email using OAuth2 SMTP
 * 
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param html - Email body (HTML format)
 * @param text - Email body (Plain text, optional)
 * @returns Promise with email send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  try {
    console.log(`📧 Sending email to ${to} with subject: "${subject}"`);

    const transporter = await createEmailTransport();

    // Use GMAIL_USER for Gmail-based services, fallback to SMTP_FROM_EMAIL or SMTP_USER
    const fromEmail = process.env.GMAIL_USER || process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const mailOptions = {
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Fallback: strip HTML tags
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ Email sent successfully');
    console.log(`   Message ID: ${info.messageId}`);
    
    return {
      success: true,
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Send a registration confirmation email
 */
export async function sendRegistrationEmail(
  email: string,
  name: string,
  confirmationLink?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to WhitedgeLMS! 🎓</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for registering with WhitedgeLMS. We're excited to have you on board!</p>
            ${confirmationLink ? `
              <p>Please confirm your email address by clicking the link below:</p>
              <p><a href="${confirmationLink}" class="button">Confirm Email</a></p>
            ` : ''}
            <p>If you have any questions, feel free to reach out to us.</p>
            <p>Best regards,<br>The WhitedgeLMS Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WhitedgeLMS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, 'Welcome to WhitedgeLMS!', html);
}

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetLink: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #FF9800; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { background-color: #FF9800; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
          .warning { color: #FF9800; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We received a request to reset your password. Click the link below to set a new password:</p>
            <p><a href="${resetLink}" class="button">Reset Password</a></p>
            <p class="warning">⚠️ This link will expire in 1 hour for security reasons.</p>
            <p>If you didn't request this reset, please ignore this email or contact support.</p>
            <p>Best regards,<br>The WhitedgeLMS Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WhitedgeLMS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, 'Password Reset Request', html);
}

/**
 * Send a course enrollment confirmation email
 */
export async function sendEnrollmentEmail(
  email: string,
  name: string,
  courseName: string,
  courseLink?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2196F3; color: white; padding: 20px; border-radius: 5px; }
          .content { padding: 20px; background-color: #f9f9f9; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
          .button { background-color: #2196F3; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Enrollment Confirmed! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>You have successfully enrolled in <strong>${courseName}</strong>!</p>
            ${courseLink ? `
              <p>Get started now:</p>
              <p><a href="${courseLink}" class="button">View Course</a></p>
            ` : ''}
            <p>We're excited to have you in this course. Happy learning!</p>
            <p>Best regards,<br>The WhitedgeLMS Team</p>
          </div>
          <div class="footer">
            <p>© 2024 WhitedgeLMS. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail(email, `Enrollment Confirmed: ${courseName}`, html);
}

/**
 * Send enrollment welcome email with course details
 * Includes course objectives, learning outcomes, and other key information
 */
export async function sendEnrollmentWelcomeEmail(
  email: string,
  name: string,
  courseName: string,
  courseObjective: string,
  learningOutcomes: string,
  courseDuration: string,
  instructorName: string,
  courseCategory: string,
  courseId: string,
  coursePrice?: number,
  isPaid?: boolean
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📧 SENDING ENROLLMENT WELCOME EMAIL`);
    console.log(`${'='.repeat(70)}`);
    console.log(`👤 Student: ${name} (${email})`);
    console.log(`📚 Course: ${courseName}`);
    console.log(`${'='.repeat(70)}\n`);

    // Truncate objective and outcomes to 150 chars
    const truncateText = (text: string, maxLength: number = 150): string => {
      if (!text) return '';
      const cleaned = text.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
      return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
    };

    const objectiveSummary = truncateText(courseObjective);
    const outcomesSummary = truncateText(learningOutcomes);

    const courseLink = `${process.env.NEXT_PUBLIC_APP_URL}/student/course/${courseId}`;
    const priceDisplay = isPaid && coursePrice ? `₹${coursePrice}` : 'FREE';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              color: #333; 
              background-color: #f5f5f5;
              line-height: 1.6;
            }
            .container { 
              max-width: 650px; 
              margin: 0 auto; 
              padding: 0; 
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .header { 
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white; 
              padding: 40px 30px;
              text-align: center;
            }
            .header h1 { 
              font-size: 28px;
              margin-bottom: 10px;
            }
            .header .tagline {
              font-size: 14px;
              font-style: italic;
              opacity: 0.9;
              margin-top: 15px;
              border-top: 1px solid rgba(255,255,255,0.3);
              padding-top: 15px;
            }
            .logo-image {
              max-width: 180px;
              height: auto;
              margin-bottom: 15px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .greeting {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 20px;
              color: #1e3c72;
            }
            .intro-text {
              margin-bottom: 30px;
              color: #555;
            }
            .course-details {
              background-color: #f9f9f9;
              padding: 25px;
              border-radius: 6px;
              margin-bottom: 30px;
              border-left: 4px solid #2a5298;
            }
            .detail-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .detail-row:last-child {
              border-bottom: none;
            }
            .detail-label {
              font-weight: 600;
              color: #1e3c72;
              width: 35%;
            }
            .detail-value {
              color: #555;
              word-break: break-word;
            }
            .section {
              margin-bottom: 30px;
            }
            .section-title {
              font-size: 16px;
              font-weight: 700;
              color: #1e3c72;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .section-content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 6px;
              line-height: 1.7;
              color: #555;
              margin-bottom: 10px;
            }
            .view-more {
              text-align: center;
              margin-top: 10px;
            }
            .view-more a {
              color: #2a5298;
              text-decoration: none;
              font-weight: 600;
              font-size: 14px;
            }
            .view-more a:hover {
              text-decoration: underline;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: #ffffff !important;
              padding: 16px 45px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 700;
              font-size: 16px;
              text-align: center;
              margin-top: 15px;
              border: none;
              cursor: pointer;
            }
            .cta-button:hover {
              opacity: 0.9;
              text-decoration: none;
              color: #ffffff !important;
            }
            .next-steps {
              background-color: #f0f7ff;
              padding: 20px;
              border-radius: 6px;
              margin-bottom: 30px;
              border-left: 4px solid #2a5298;
            }
            .next-steps h4 {
              color: #1e3c72;
              margin-bottom: 15px;
              font-size: 15px;
            }
            .next-steps ol {
              margin-left: 20px;
              color: #555;
            }
            .next-steps li {
              margin-bottom: 8px;
            }
            .footer {
              background-color: #f5f5f5;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
              font-size: 13px;
              color: #888;
            }
            .footer-section {
              margin-bottom: 20px;
            }
            .footer-section:last-child {
              margin-bottom: 0;
            }
            .footer a {
              color: #2a5298;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
            .footer-divider {
              height: 1px;
              background-color: #e0e0e0;
              margin: 20px 0;
            }
            .unsubscribe {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #e0e0e0;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <img src="${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/logo.png" alt="Whiteboard Consultants" class="logo-image">
              <h1>Welcome to Your Learning Journey!</h1>
              <div class="tagline">"Your Future | Our Focus"</div>
            </div>

            <!-- Main Content -->
            <div class="content">
              <!-- Greeting -->
              <div class="greeting">Dear ${name},</div>
              
              <div class="intro-text">
                <p>Thank you for enrolling in <strong>${courseName}</strong>! We're delighted to have you join our community of learners. Your commitment to growth is the first step toward achieving excellence.</p>
              </div>

              <!-- Course Details -->
              <div class="course-details">
                <div class="detail-row">
                  <span class="detail-label">📚 Course Name</span>
                  <span class="detail-value"><strong>${courseName}</strong></span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">👨‍🏫 Instructor</span>
                  <span class="detail-value">${instructorName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">📂 Category</span>
                  <span class="detail-value">${courseCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">⏱️ Duration</span>
                  <span class="detail-value">${courseDuration}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">💰 Price</span>
                  <span class="detail-value"><strong>${priceDisplay}</strong></span>
                </div>
              </div>

              <!-- Course Objectives -->
              <div class="section">
                <div class="section-title">🎯 Course Objectives</div>
                <div class="section-content">
                  ${objectiveSummary || 'Course objectives will be available in the course.'}
                </div>
                <div class="view-more">
                  <a href="${courseLink}">View More in Course →</a>
                </div>
              </div>

              <!-- Learning Outcomes -->
              <div class="section">
                <div class="section-title">📖 Learning Outcomes</div>
                <div class="section-content">
                  ${outcomesSummary || 'Learning outcomes will be available in the course.'}
                </div>
                <div class="view-more">
                  <a href="${courseLink}">View More in Course →</a>
                </div>
              </div>

              <!-- Next Steps -->
              <div class="next-steps">
                <h4>📋 Next Steps:</h4>
                <ol>
                  <li>Access your course dashboard</li>
                  <li>Review the course syllabus and materials</li>
                  <li>Watch the introductory lesson</li>
                  <li>Set your learning goals for the course</li>
                </ol>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${courseLink}" class="cta-button">Access Course →</a>
              </div>

              <div style="text-align: center; color: #888; font-size: 14px; margin-bottom: 20px;">
                Happy Learning! We're here to support your success.
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-section">
                <strong>Need Help?</strong>
              </div>
              <div class="footer-section">
                📧 Email: <a href="mailto:info@whiteboardconsultant.com">info@whiteboardconsultant.com</a><br>
                📱 Phone: <a href="tel:+918583035656">+91 8583035656</a><br>
                🌐 Website: <a href="https://whiteboardconsultant.com" target="_blank">whiteboardconsultant.com</a>
              </div>
              <div class="footer-divider"></div>
              <div class="footer-section">
                The Whiteboard Consultants Team<br>
                © ${new Date().getFullYear()} Whiteboard Consultants. All rights reserved.
              </div>
              <div class="unsubscribe">
                ⚡ Have feedback? <a href="${process.env.NEXT_PUBLIC_APP_URL}/preferences">Manage email preferences</a> | 
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe">Unsubscribe</a>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const result = await sendEmail(
      email,
      `Welcome to ${courseName}! 🎓`,
      html
    );

    console.log(`✅ Enrollment welcome email sent successfully`);
    console.log(`   Message ID: ${result.messageId}`);
    console.log(`${'='.repeat(70)}\n`);

    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error) {
    console.error(`❌ Error sending enrollment welcome email:`, error);
    console.log(`${'='.repeat(70)}\n`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send enrollment email',
    };
  }
}

export default { sendEmail, sendRegistrationEmail, sendPasswordResetEmail, sendEnrollmentEmail, sendEnrollmentWelcomeEmail };
