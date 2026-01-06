import nodemailer from 'nodemailer';

// Email configuration - support both SMTP2GO and Gmail App Password
const createTransporter = () => {
  // Try SMTP2GO first
  if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.smtp2go.com',
      port: parseInt(process.env.SMTP_PORT || '2525'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  
  // Fallback to Gmail App Password
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''),
      },
    });
  }
  
  throw new Error('No email service configured (SMTP2GO or Gmail App Password required)');
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
    const hasSMTP2GO = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
    const hasGmailAppPassword = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    if (!process.env.ADMIN_EMAIL) {
      console.warn('Admin email not configured. Skipping resume admin notification.');
      return false;
    }
    
    if (!hasSMTP2GO && !hasGmailAppPassword) {
      console.warn('No email service configured (SMTP2GO or Gmail App Password). Skipping resume admin notification.');
      return false;
    }

    const transporter = createTransporter();
    await transporter.verify();

    const adminEmail = process.env.ADMIN_EMAIL;
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;

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
    const hasSMTP2GO = process.env.SMTP_USER && process.env.SMTP_PASSWORD;
    const hasGmailAppPassword = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
    
    if (!hasSMTP2GO && !hasGmailAppPassword) {
      console.warn('No email service configured (SMTP2GO or Gmail App Password). Skipping resume confirmation.');
      return false;
    }

    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || process.env.GMAIL_USER;

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