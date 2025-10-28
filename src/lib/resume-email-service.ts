import nodemailer from 'nodemailer';

// Email configuration - reuse the existing transporter setup
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export interface ResumeSubmissionData {
  id: string;
  name: string;
  email: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  submittedAt: string;
}

export async function sendResumeAdminNotification(submission: ResumeSubmissionData): Promise<boolean> {
  try {
    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.ADMIN_EMAIL) {
      console.warn('Email configuration missing. Skipping resume admin notification.');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    // Format file size
    const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const subject = `New Resume Submission - Free Evaluation Request`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">📄 New Resume Evaluation Request</h2>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">Applicant Details</h3>
          <p><strong>Name:</strong> ${submission.name}</p>
          <p><strong>Email:</strong> <a href="mailto:${submission.email}">${submission.email}</a></p>
          <p><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📎 Resume File Details</h3>
          <p><strong>File Name:</strong> ${submission.fileName}</p>
          <p><strong>File Size:</strong> ${formatFileSize(submission.fileSize)}</p>
          <p><strong>File Type:</strong> ${submission.fileType.split('/')[1]?.toUpperCase()}</p>
          <p><strong>Download:</strong> <a href="${submission.fileUrl}" style="color: #2563eb;" target="_blank">Click to Download Resume</a></p>
        </div>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">⏰ Action Required</h3>
          <p style="margin: 0;">Please review the resume and provide feedback within 24-48 hours to maintain service quality.</p>
          <div style="margin-top: 15px;">
            <a href="mailto:${submission.email}?subject=Resume Evaluation Feedback - ${submission.name}" 
               style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
              Reply to Applicant
            </a>
          </div>
        </div>

        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">📋 Admin Actions</h3>
          <p style="margin: 0;">
            View and manage this submission in your 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/resume-submissions" style="color: #2563eb;">
              Admin Dashboard
            </a>
          </p>
        </div>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #64748b; font-size: 12px; margin: 0;">
          This notification was sent from your Whiteboard Consultants resume evaluation system.
          <br>
          Submission ID: ${submission.id}
        </p>
      </div>
    `;

    const textContent = `
New Resume Evaluation Request

Applicant Details:
Name: ${submission.name}
Email: ${submission.email}
Submitted: ${new Date(submission.submittedAt).toLocaleString()}

Resume File Details:
File Name: ${submission.fileName}
File Size: ${formatFileSize(submission.fileSize)}
File Type: ${submission.fileType.split('/')[1]?.toUpperCase()}
Download: ${submission.fileUrl}

Action Required:
Please review the resume and provide feedback within 24-48 hours.

Reply directly to: ${submission.email}
View in admin dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/resume-submissions

Submission ID: ${submission.id}
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: adminEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('Resume admin notification sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send resume admin notification:', error);
    return false;
  }
}

export async function sendResumeConfirmation(submission: ResumeSubmissionData): Promise<boolean> {
  try {
    // Check if email configuration is available
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email configuration missing. Skipping resume confirmation.');
      return false;
    }

    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const subject = `Resume Received - Free Evaluation in Progress`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Whiteboard Consultants</h1>
          <p style="color: #64748b; margin: 5px 0 0 0;">Your Career Success Partner</p>
        </div>
        
        <h2 style="color: #1e40af;">📄 Resume Received Successfully!</h2>
        
        <p>Dear ${submission.name},</p>
        
        <p>Thank you for submitting your resume for our <strong>Free Resume Evaluation</strong> service. We have successfully received your resume and our expert career consultants will begin reviewing it shortly.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">📋 Submission Details</h3>
          <p style="margin: 5px 0;"><strong>Submission ID:</strong> ${submission.id}</p>
          <p style="margin: 5px 0;"><strong>File Name:</strong> ${submission.fileName}</p>
          <p style="margin: 5px 0;"><strong>Submitted:</strong> ${new Date(submission.submittedAt).toLocaleString()}</p>
        </div>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">⏰ What Happens Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li><strong>Review Process:</strong> Our career experts will analyze your resume within 24-48 hours</li>
            <li><strong>Comprehensive Evaluation:</strong> We'll assess format, content, keywords, and overall effectiveness</li>
            <li><strong>Personalized Feedback:</strong> You'll receive detailed recommendations for improvement</li>
            <li><strong>Follow-up Support:</strong> Our team will contact you with next steps and additional services</li>
          </ul>
        </div>

        <div style="background-color: #fef2f2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #dc2626;">🎯 What We'll Analyze</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Resume format and visual appeal</li>
            <li>Content relevance and impact</li>
            <li>Industry-specific keywords</li>
            <li>ATS (Applicant Tracking System) compatibility</li>
            <li>Achievement quantification</li>
            <li>Overall professional presentation</li>
          </ul>
        </div>

        <p>In the meantime, feel free to:</p>
        <ul>
          <li>Explore our <a href="${process.env.NEXT_PUBLIC_APP_URL}/courses" style="color: #2563eb;">career development courses</a></li>
          <li>Read our <a href="${process.env.NEXT_PUBLIC_APP_URL}/blog" style="color: #2563eb;">career tips and insights</a></li>
          <li>Follow us on social media for regular career advice</li>
        </ul>

        <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #065f46;">📞 Need Immediate Help?</h3>
          <p style="margin: 0;">Call us at <a href="tel:+918583035656" style="color: #2563eb;">+91 85830 35656</a></p>
          <p style="margin: 5px 0 0 0;">Or email us at <a href="mailto:info@whiteboardconsultant.com" style="color: #2563eb;">info@whiteboardconsultant.com</a></p>
        </div>

        <p>Best regards,<br>
        <strong>The Whiteboard Consultants Career Team</strong></p>

        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e2e8f0;">
        
        <p style="color: #64748b; font-size: 12px; margin: 0; text-align: center;">
          This is an automated confirmation. Please do not reply directly to this email.
          <br>
          © 2025 Whiteboard Consultants. All rights reserved.
        </p>
      </div>
    `;

    const textContent = `
Resume Received - Free Evaluation in Progress

Dear ${submission.name},

Thank you for submitting your resume for our Free Resume Evaluation service. We have successfully received your resume and our expert career consultants will begin reviewing it shortly.

Submission Details:
- Submission ID: ${submission.id}
- File Name: ${submission.fileName}
- Submitted: ${new Date(submission.submittedAt).toLocaleString()}

What Happens Next?
- Review Process: Our career experts will analyze your resume within 24-48 hours
- Comprehensive Evaluation: We'll assess format, content, keywords, and overall effectiveness
- Personalized Feedback: You'll receive detailed recommendations for improvement
- Follow-up Support: Our team will contact you with next steps and additional services

Need immediate help?
Call us at +91 85830 35656
Email: info@whiteboardconsultant.com

Best regards,
The Whiteboard Consultants Career Team

This is an automated confirmation. Please do not reply directly to this email.
    `.trim();

    const info = await transporter.sendMail({
      from: `"Whiteboard Consultants" <${fromEmail}>`,
      to: submission.email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    console.log('Resume confirmation sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Failed to send resume confirmation:', error);
    return false;
  }
}