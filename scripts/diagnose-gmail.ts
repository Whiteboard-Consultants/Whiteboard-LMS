#!/usr/bin/env tsx

/**
 * Gmail SMTP Diagnostic Script
 * Run with: npx tsx scripts/diagnose-gmail.ts
 */

import { config } from 'dotenv';
import path from 'path';
const nodemailer = require('nodemailer');

// Load environment variables from .env.local
config({ path: path.join(__dirname, '../.env.local') });

async function diagnoseGmailConnection() {
  console.log('🔍 Gmail SMTP Diagnostic Tool\n');

  // Check environment variables
  console.log('📧 Email Configuration:');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   Password: ${process.env.SMTP_PASSWORD ? '***configured***' : '❌ MISSING'}`);
  console.log();

  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.log('❌ Missing SMTP credentials. Please configure:');
    console.log('   SMTP_USER=your-email@whiteboardconsultant.com');
    console.log('   SMTP_PASSWORD=your-16-char-app-password');
    return;
  }

  // Test different configurations
  const configs = [
    {
      name: 'Standard Gmail SMTP',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    },
    {
      name: 'Gmail SMTP with SSL',
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    },
    {
      name: 'Gmail SMTP with explicit TLS',
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      }
    }
  ];

  for (const { name, config } of configs) {
    console.log(`🧪 Testing: ${name}`);
    
    try {
      const transporter = nodemailer.createTransporter(config);
      await transporter.verify();
      console.log(`✅ ${name}: CONNECTION SUCCESSFUL!`);
      console.log('🎉 This configuration works. Use these settings:\n');
      console.log(`SMTP_HOST=${config.host}`);
      console.log(`SMTP_PORT=${config.port}`);
      console.log(`SMTP_SECURE=${config.secure}`);
      console.log();
      return;
    } catch (error: any) {
      console.log(`❌ ${name}: ${error.message}`);
    }
    console.log();
  }

  console.log('🚨 All configurations failed. This suggests:');
  console.log('   1. ❌ App password is incorrect');
  console.log('   2. ❌ 2-Factor Authentication not enabled');
  console.log('   3. ❌ App passwords not generated from Google Account');
  console.log();
  console.log('📋 Next Steps:');
  console.log('   1. Go to: https://myaccount.google.com/security');
  console.log('   2. Enable 2-Step Verification');
  console.log('   3. Go to: https://myaccount.google.com/apppasswords');
  console.log('   4. Generate app password for "Mail"');
  console.log('   5. Use that password (16 chars, no spaces) in SMTP_PASSWORD');
}

diagnoseGmailConnection().catch(console.error);