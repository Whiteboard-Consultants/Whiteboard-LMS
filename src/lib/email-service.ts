import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  // Configure based on your email service provider
  // This example uses Gmail SMTP - you can configure for other providers
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
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
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.ADMIN_EMAIL) {
      console.warn('Email configuration missing. Skipping admin notification.');
      return false;
    }

    const transporter = createTransporter();

    // Verify SMTP connection
    await transporter.verify();

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
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn('Email configuration missing. Skipping auto-reply.');
      return false;
    }

    const transporter = createTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

    const subject = `Thank you for contacting Whiteboard Consultants - ${submission.inquiryType}`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
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