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
 * Create a Nodemailer transporter with Gmail OAuth2
 */
export async function createEmailTransport() {
  try {
    const emailService = process.env.EMAIL_SERVICE || 'gmail-oauth2';
    
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📧 EMAIL SERVICE INITIALIZATION`);
    console.log(`${'='.repeat(70)}`);
    console.log(`🔍 Current EMAIL_SERVICE setting: "${emailService}"`);
    
    // Use Gmail OAuth2
    if (emailService === 'gmail-oauth2' || !process.env.SMTP_HOST) {
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
      // Fallback to SMTP2GO
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

    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
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

export default { sendEmail, sendRegistrationEmail, sendPasswordResetEmail, sendEnrollmentEmail };
