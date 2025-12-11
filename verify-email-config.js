#!/usr/bin/env node

/**
 * Email Configuration Verification Script
 * Verifies all components needed for Gmail OAuth2 email service to work
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('EMAIL SERVICE CONFIGURATION VERIFICATION');
console.log('='.repeat(70) + '\n');

// Read .env.local
const envLocalPath = path.join('/Users/navnitda/Projects/WhitedgeLMS', '.env.local');
const envContent = fs.readFileSync(envLocalPath, 'utf-8');
const lines = envContent.split('\n');

// Parse environment variables
const env = {};
lines.forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=');
    if (key && value) {
      env[key] = value;
    }
  }
});

console.log('📋 ENVIRONMENT CONFIGURATION:');
console.log('-'.repeat(70));

// Check EMAIL_SERVICE
const emailService = env.EMAIL_SERVICE;
console.log(`✓ EMAIL_SERVICE: ${emailService || '❌ NOT SET'}`);
if (emailService === 'gmail-oauth2') {
  console.log('  ✅ Correctly set to gmail-oauth2');
} else if (emailService === 'smtp2go') {
  console.log('  ⚠️  Still set to smtp2go (should be gmail-oauth2)');
} else {
  console.log('  ❌ Not properly configured');
}

// Check SMTP2GO (should be disabled)
console.log(`\n✓ SMTP2GO Status:`);
const smtpUser = env.SMTP_USER;
if (smtpUser) {
  console.log(`  ❌ SMTP_USER is set: ${smtpUser}`);
  console.log('  Should be commented out in .env.local');
} else {
  console.log('  ✅ SMTP2GO disabled (good)');
}

// Check Gmail OAuth2
console.log(`\n✓ Gmail OAuth2 Configuration:`);
const checks = [
  { key: 'GMAIL_CLIENT_ID', label: 'Client ID' },
  { key: 'GMAIL_CLIENT_SECRET', label: 'Client Secret' },
  { key: 'GMAIL_REFRESH_TOKEN', label: 'Refresh Token' },
  { key: 'GMAIL_USER', label: 'Gmail User' },
  { key: 'ADMIN_EMAIL', label: 'Admin Email' },
];

let allGmailOk = true;
checks.forEach(({ key, label }) => {
  const value = env[key];
  if (value) {
    const preview = value.length > 30 ? value.substring(0, 27) + '...' : value;
    console.log(`  ✅ ${label}: ${preview}`);
  } else {
    console.log(`  ❌ ${label}: NOT SET`);
    allGmailOk = false;
  }
});

// Summary
console.log('\n' + '='.repeat(70));
console.log('SUMMARY:');
console.log('-'.repeat(70));

const issues = [];

if (emailService !== 'gmail-oauth2') {
  issues.push('EMAIL_SERVICE not set to gmail-oauth2');
}

if (smtpUser) {
  issues.push('SMTP2GO still configured (should be disabled)');
}

if (!allGmailOk) {
  issues.push('Gmail OAuth2 credentials incomplete');
}

if (issues.length === 0) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nEmail service is configured correctly for Gmail OAuth2.');
  console.log('Ready to test contact form submissions.');
  console.log('\nNext steps:');
  console.log('1. Open http://localhost:3000/contact');
  console.log('2. Submit test form');
  console.log('3. Check server logs for email delivery status');
  console.log('4. Check email inbox for admin notification and auto-reply');
  process.exit(0);
} else {
  console.log('❌ ISSUES FOUND:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
  console.log('\nPlease fix the configuration and restart dev server.');
  process.exit(1);
}
