/**
 * RIASEC Assessment Results Email Service
 * Sends personalized results to students and summary to admin
 */

import { createTransporter } from '@/lib/email-service';
import { RIASECProfile } from '@/lib/riasec-data';

interface RIASECEmailPayload {
  assessment: any;
  scores: Record<string, number>;
  profileDetails: (RIASECProfile | null)[];
}

/**
 * Send RIASEC assessment results email to student and admin
 */
export async function sendRIASECResultsEmail(payload: RIASECEmailPayload) {
  try {
    const transporter = await createTransporter();

    if (!transporter) {
      throw new Error('Email transporter not available');
    }

    const { assessment, scores, profileDetails } = payload;
    const studentEmail = assessment.email;
    const adminEmail = process.env.ADMIN_EMAIL;

    // Send to student
    if (studentEmail) {
      await sendStudentResultsEmail(transporter, assessment, scores, profileDetails, studentEmail);
    }

    // Send to admin
    if (adminEmail) {
      await sendAdminSummaryEmail(transporter, assessment, scores, adminEmail);
    }
  } catch (error) {
    console.error('Error sending RIASEC results emails:', error);
    throw error;
  }
}

/**
 * Send detailed results email to student
 */
async function sendStudentResultsEmail(
  transporter: any,
  assessment: any,
  scores: Record<string, number>,
  profileDetails: (RIASECProfile | null)[],
  studentEmail: string
) {
  const studentName = assessment.full_name || 'Student';
  const topProfile = profileDetails[0];

  const profileSectionsHtml = profileDetails
    .filter(p => p !== null)
    .map((profile, index) => {
      if (!profile) return '';
      const rankLabel = ['Primary', 'Secondary', 'Tertiary'][index];
      return `
        <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid ${profile.color}; margin: 15px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: ${profile.color}; font-size: 18px;">
            <span style="display: inline-block; background-color: ${profile.color}; color: white; width: 30px; height: 30px; border-radius: 50%; text-align: center; line-height: 30px; margin-right: 10px; font-weight: bold;">${profile.code}</span>
            ${rankLabel}: ${profile.name}
          </h3>
          <p style="margin: 0 0 12px 0; color: #475569; line-height: 1.6;">${profile.description}</p>
          
          <div style="margin-top: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">Your Strengths:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #475569;">
              ${profile.strengths.map(strength => `<li style="margin-bottom: 4px;">${strength}</li>`).join('')}
            </ul>
          </div>

          <div style="margin-top: 12px;">
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 14px;">Career Examples:</h4>
            <div style="color: #475569;">${profile.careerExamples.join(', ')}</div>
          </div>

          <div style="margin-top: 12px; color: #64748b; font-size: 14px;">
            Score: <strong>${scores[profile.id.toLowerCase()]}/30</strong>
          </div>
        </div>
      `;
    })
    .join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
        <h1 style="margin: 0 0 10px 0; font-size: 28px;">Your Career Assessment Results</h1>
        <p style="margin: 0; font-size: 16px; opacity: 0.9;">RIASEC Career Profile Analysis</p>
      </div>

      <!-- Main Content -->
      <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">
          Hi <strong>${studentName}</strong>,
        </p>

        <p style="margin: 0 0 20px 0; color: #475569; line-height: 1.6;">
          Thank you for completing the RIASEC Career Assessment! Your results provide valuable insights into your career interests and personality traits.
        </p>

        <p style="margin: 0 0 20px 0; color: #475569; line-height: 1.6;">
          Based on your responses, ${topProfile ? `your primary career interest profile is <strong>${topProfile.name}</strong>` : 'here are your profile results'}.
        </p>

        <!-- Profile Results -->
        ${profileSectionsHtml}

        <!-- Score Summary -->
        <div style="background-color: #f0f4ff; padding: 20px; border-radius: 6px; margin-top: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #1e40af;">Your Complete Scores:</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            ${Object.entries(scores)
              .map(([type, score]) => {
                const profileName = type.charAt(0).toUpperCase() + type.slice(1);
                return `
                  <div>
                    <div style="color: #475569; font-size: 14px; margin-bottom: 5px;">${profileName}</div>
                    <div style="background-color: white; height: 8px; border-radius: 4px; overflow: hidden;">
                      <div style="background-color: #667eea; height: 100%; width: ${(score / 30) * 100}%; border-radius: 4px;"></div>
                    </div>
                    <div style="color: #64748b; font-size: 12px; margin-top: 3px;">${score}/30</div>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>

        <!-- Next Steps -->
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 20px; border-radius: 6px; margin-top: 30px;">
          <h3 style="margin: 0 0 15px 0; color: #047857;">Next Steps:</h3>
          <ol style="margin: 0; padding-left: 20px; color: #065f46;">
            <li style="margin-bottom: 8px;">Explore career paths related to your profile</li>
            <li style="margin-bottom: 8px;">Discuss results with a career advisor or mentor</li>
            <li style="margin-bottom: 8px;">Consider courses and programs that align with your interests</li>
            <li>Build skills relevant to your career goals</li>
          </ol>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px; text-align: center;">
          <p style="margin: 0;">This assessment is a snapshot of your interests. Career paths are diverse and your interests may evolve.</p>
          <p style="margin: 10px 0 0 0;">Questions? Contact us at ${process.env.ADMIN_EMAIL || 'support@whiteboardconsultant.com'}</p>
        </div>
      </div>
    </div>
  `;

  const textContent = `
Career Assessment Results

Hi ${studentName},

Your RIASEC Assessment Results:

${profileDetails
  .filter(p => p !== null)
  .map(
    (profile, index) => `
${['Primary', 'Secondary', 'Tertiary'][index]}: ${profile?.name}
${profile?.description}

Strengths: ${profile?.strengths.join(', ')}
Job Examples: ${profile?.careerExamples.join(', ')}
Score: ${scores[profile?.id?.toLowerCase() || '']} / 30
`
  )
  .join('\n')}

Questions? Contact us at ${process.env.ADMIN_EMAIL || 'support@whiteboardconsultant.com'}
  `;

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.GMAIL_USER;

  await transporter.sendMail({
    from: fromEmail,
    to: studentEmail,
    subject: `Your RIASEC Career Assessment Results`,
    text: textContent,
    html: htmlContent,
  });

  console.log(`Career assessment email sent to ${studentEmail}`);
}

/**
 * Send summary email to admin with assessment data
 */
async function sendAdminSummaryEmail(
  transporter: any,
  assessment: any,
  scores: Record<string, number>,
  adminEmail: string
) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; margin-bottom: 20px;">New RIASEC Assessment Completed</h2>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af;">Student Information</h3>
        <p><strong>Name:</strong> ${assessment.full_name}</p>
        <p><strong>Email:</strong> <a href="mailto:${assessment.email}">${assessment.email}</a></p>
        <p><strong>Completed:</strong> ${new Date(assessment.completed_at).toLocaleString()}</p>
      </div>

      <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0; color: #1e40af;">Assessment Results</h3>
        <p><strong>Primary Profile:</strong> ${assessment.primary_profile}</p>
        <p><strong>Secondary Profile:</strong> ${assessment.secondary_profile}</p>
        <p><strong>Tertiary Profile:</strong> ${assessment.tertiary_profile}</p>
        
        <h4 style="margin-top: 15px; margin-bottom: 10px;">Scores:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Realistic: ${scores.realistic}/30</li>
          <li>Investigative: ${scores.investigative}/30</li>
          <li>Artistic: ${scores.artistic}/30</li>
          <li>Social: ${scores.social}/30</li>
          <li>Enterprising: ${scores.enterprising}/30</li>
          <li>Conventional: ${scores.conventional}/30</li>
        </ul>
      </div>

      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h4 style="margin-top: 0;">Assessment ID:</h4>
        <code style="font-family: monospace; color: #666;">${assessment.id}</code>
      </div>

      <p style="color: #666; font-size: 12px;">
        This is an automated notification from your RIASEC assessment system.
        Log in to your dashboard to view detailed analytics.
      </p>
    </div>
  `;

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.GMAIL_USER;

  await transporter.sendMail({
    from: fromEmail,
    to: adminEmail,
    subject: `New RIASEC Assessment: ${assessment.full_name}`,
    html: htmlContent,
  });

  console.log(`Admin notification email sent to ${adminEmail}`);
}
