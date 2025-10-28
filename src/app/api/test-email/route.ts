import { sendEmail, sendRegistrationEmail } from '@/lib/email-oauth2';

/**
 * Test email endpoint for SMTP2GO configuration
 * 
 * Usage: GET /api/test-email
 * 
 * This endpoint tests the email configuration by sending a test email
 */
export async function GET(request: Request) {
  try {
    console.log('🧪 Testing SMTP2GO Email Configuration...');

    // Test 1: Send a simple test email
    console.log('\n📧 Test 1: Sending simple test email...');
    const testResult = await sendEmail(
      'info@whiteboardconsultant.com',
      '✅ WhitedgeLMS SMTP2GO Email Test',
      `
        <h1>✅ SMTP2GO Email Test Successful!</h1>
        <p>This email confirms that your WhitedgeLMS email system is working correctly with SMTP2GO.</p>
        <p><strong>Configuration Details:</strong></p>
        <ul>
          <li>✅ SMTP Server: mail.smtp2go.com:2525</li>
          <li>✅ Authentication: API Key</li>
          <li>✅ SMTP Connection: Successful</li>
          <li>✅ Email Sending: Working</li>
        </ul>
        <p>Timestamp: ${new Date().toISOString()}</p>
        <p><strong>You're ready to send production emails!</strong></p>
      `
    );

    console.log('✅ Test 1 passed:', testResult);

    // Test 2: Send a registration email simulation
    console.log('\n📧 Test 2: Sending registration confirmation email...');
    const registrationResult = await sendRegistrationEmail(
      'info@whiteboardconsultant.com',
      'WhitedgeLMS Admin',
      'https://yourdomain.com/confirm-email'
    );

    console.log('✅ Test 2 passed:', registrationResult);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'All SMTP2GO email tests passed! ✅',
        tests: {
          test1_simple_email: testResult,
          test2_registration_email: registrationResult,
        },
        configuration: {
          smtpHost: process.env.SMTP_HOST,
          smtpPort: process.env.SMTP_PORT,
          smtpUser: process.env.SMTP_USER,
          provider: 'SMTP2GO',
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Email test failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'SMTP2GO email test failed. Check the console for details.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
