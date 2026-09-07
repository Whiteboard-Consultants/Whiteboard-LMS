#!/usr/bin/env tsx

/**
 * Test script to verify email configuration
 * Run with: npx tsx scripts/test-email.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

import { sendAdminNotification, sendAutoReply } from '../src/lib/email-service';

const testSubmission = {
  firstName: 'Test',
  lastName: 'Configuration',
  email: 'info@whiteboardconsultant.com', // Using your own email for auto-reply test
  phone: '+91-8583035656',
  inquiryType: 'Email Configuration Test',
  message: 'This is a test message to verify Google Workspace email integration is working correctly.',
  submittedAt: new Date().toISOString(),
};

async function testEmailConfiguration() {
  console.log('🧪 Testing email configuration...\n');

  // Check environment variables
  const requiredEnvVars = [
    'SMTP_USER',
    'SMTP_PASSWORD', 
    'ADMIN_EMAIL'
  ];

  const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingEnvVars.length > 0) {
    console.error('❌ Missing environment variables:');
    missingEnvVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\n💡 Add these to your .env.local file');
    process.exit(1);
  }

  console.log('✅ Environment variables configured');
  console.log(`📧 SMTP User: ${process.env.SMTP_USER}`);
  console.log(`📧 Admin Email: ${process.env.ADMIN_EMAIL}`);
  console.log();

  try {
    // Test admin notification
    console.log('📤 Testing admin notification...');
    const adminResult = await sendAdminNotification(testSubmission);
    console.log(adminResult ? '✅ Admin notification sent' : '❌ Admin notification failed');

    // Test auto-reply (change email to your own for testing)
    console.log('📤 Testing auto-reply...');
    const autoReplyResult = await sendAutoReply(testSubmission);
    console.log(autoReplyResult ? '✅ Auto-reply sent' : '❌ Auto-reply failed');

    if (adminResult && autoReplyResult) {
      console.log('\n🎉 Email configuration is working correctly!');
      console.log('🚀 Your contact form is ready to send notifications');
    } else {
      console.log('\n⚠️  Some email functions failed');
      console.log('💡 Check your SMTP credentials and network connection');
    }

  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

testEmailConfiguration();