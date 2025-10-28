#!/usr/bin/env tsx

/**
 * Comprehensive Google Workspace/Gmail SMTP Troubleshooting
 * Run with: npx tsx scripts/workspace-debug.ts
 */

import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

const nodemailer = require('nodemailer');

async function testWorkspaceEmail() {
  console.log('🔍 Google Workspace Email Diagnostic\n');
  
  const email = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  
  console.log('📧 Current Configuration:');
  console.log(`   Email: ${email}`);
  console.log(`   Password Length: ${password?.length} characters`);
  console.log(`   Domain: ${email?.split('@')[1]}`);
  console.log();
  
  // Check if it's Google Workspace or regular Gmail
  const isWorkspace = email?.includes('@') && !email.includes('@gmail.com');
  console.log(`📋 Account Type: ${isWorkspace ? 'Google Workspace' : 'Regular Gmail'}`);
  console.log();
  
  if (isWorkspace) {
    console.log('🏢 Google Workspace Account Detected');
    console.log('📝 For Google Workspace, you need to:');
    console.log('   1. ✅ Admin must enable "Less secure apps" for your domain');
    console.log('   2. ✅ OR enable "App passwords" in Google Admin Console');
    console.log('   3. ✅ 2-Step Verification must be enabled on your account');
    console.log('   4. ✅ Generate app password from: myaccount.google.com/apppasswords');
    console.log();
  }

  // Test different SMTP configurations for Google Workspace
  const configs = [
    {
      name: 'Google Workspace SMTP (Port 587)',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: email,
          pass: password,
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: 'Google Workspace SMTP (Port 465)',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: email,
          pass: password,
        }
      }
    },
    {
      name: 'Google Workspace SMTP with STARTTLS',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: email,
          pass: password,
        },
        tls: {
          ciphers: 'SSLv3'
        }
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`🧪 Testing: ${name}`);
    
    try {
      const transporter = nodemailer.createTransport(config);
      
      // First verify connection
      await transporter.verify();
      console.log(`✅ ${name}: SMTP Connection Verified!`);
      
      // Try sending a test email to yourself
      const info = await transporter.sendMail({
        from: `"Test System" <${email}>`,
        to: email,
        subject: 'SMTP Test - Connection Successful',
        text: 'If you receive this email, your Google Workspace SMTP is working correctly!',
        html: '<h2>✅ SMTP Test Successful!</h2><p>Your Google Workspace email integration is working.</p>'
      });
      
      console.log(`🎉 Test email sent successfully! Message ID: ${info.messageId}`);
      console.log(`📧 Check your inbox at: ${email}`);
      console.log();
      console.log('🚀 Your email configuration is working! The contact form will now send notifications.');
      return;
      
    } catch (error: any) {
      console.log(`❌ ${name}: ${error.code} - ${error.message}`);
      
      // Provide specific guidance based on error
      if (error.code === 'EAUTH') {
        console.log('   💡 Authentication failed - check app password');
      } else if (error.code === 'ECONNECTION') {
        console.log('   💡 Connection failed - check network/firewall');
      } else if (error.code === 'ESOCKET') {
        console.log('   💡 Socket error - try different port/security settings');
      }
    }
    console.log();
  }

  console.log('❌ All configurations failed. Next steps:');
  console.log();
  console.log('🔧 For Google Workspace Accounts:');
  console.log('   1. Contact your Google Workspace admin');
  console.log('   2. Ask them to enable "Less secure apps" or "App passwords"');
  console.log('   3. Verify 2-Step Authentication is enabled on your account');
  console.log('   4. Generate a new app password at: myaccount.google.com/apppasswords');
  console.log();
  console.log('🆘 Alternative: Use a regular Gmail account for testing');
  console.log('   - Create a regular @gmail.com account');
  console.log('   - Enable 2FA and generate app password');
  console.log('   - Test with that account first');
}

testWorkspaceEmail().catch(console.error);