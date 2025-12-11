#!/usr/bin/env node

/**
 * Email Service Verification Tool
 * This script verifies which email service (OAuth2 vs SMTP2GO) is configured
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '═'.repeat(80));
console.log('📧 EMAIL SERVICE VERIFICATION');
console.log('═'.repeat(80) + '\n');

// Read .env.local
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const envLines = envContent.split('\n');

// Extract key values
const env = {};
envLines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && key.trim() && !key.trim().startsWith('#')) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 Current Configuration:\n');

// Check EMAIL_SERVICE
const emailService = env.EMAIL_SERVICE || 'gmail-oauth2';
console.log(`📌 EMAIL_SERVICE: "${emailService}"`);

if (emailService === 'gmail-oauth2') {
  console.log('\n✅ OAUTH2 CONFIGURATION DETECTED\n');
  
  // OAuth2 Details
  console.log('Gmail OAuth2 Settings:');
  console.log(`  📧 Gmail User: ${env.GMAIL_USER || '❌ NOT SET'}`);
  console.log(`  🔑 Client ID: ${env.GMAIL_CLIENT_ID ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  🔐 Client Secret: ${env.GMAIL_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  🎫 Refresh Token: ${env.GMAIL_REFRESH_TOKEN ? '✅ SET (' + env.GMAIL_REFRESH_TOKEN.substring(0, 20) + '...)' : '❌ NOT SET'}`);
  
  console.log('\n📊 Authentication Method:');
  console.log('  🔐 Type: OAuth2 with Refresh Token');
  console.log('  📱 Service: Gmail SMTP (Google\'s secure servers)');
  console.log('  🛡️  Security: High (OAuth2, no passwords stored)');
  console.log('  ✅ 2-Step Verification: Supported');
  console.log('  ⏰ Token Refresh: Automatic');
  
  console.log('\n🔄 Email Flow:');
  console.log('  1. App requests access token from Google using refresh token');
  console.log('  2. Google validates and returns access token');
  console.log('  3. App uses access token to send email via Gmail SMTP');
  console.log('  4. Gmail SMTP authenticates using OAuth2 (XOAUTH2)');
  console.log('  5. Email sent through Google\'s infrastructure');
  
  console.log('\n⚠️  Status:');
  if (!env.GMAIL_REFRESH_TOKEN) {
    console.log('  ❌ Refresh token not set - Authorization needed');
    console.log('  Run: node get-oauth2-auth-url.js');
  } else {
    console.log('  ✅ Refresh token configured');
    console.log('  ℹ️  Note: If emails fail, token may have expired');
    console.log('  Run: node get-oauth2-auth-url.js to refresh');
  }
  
} else if (emailService === 'smtp2go') {
  console.log('\n⚠️  SMTP2GO CONFIGURATION DETECTED\n');
  
  console.log('SMTP2GO Settings:');
  console.log(`  📧 User: ${env.SMTP_USER || '❌ NOT SET'}`);
  console.log(`  🔐 Password: ${env.SMTP_PASSWORD ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`  📮 From: ${env.SMTP_FROM_EMAIL || '❌ NOT SET'}`);
  console.log(`  🌐 Host: ${env.SMTP_HOST || '❌ NOT SET'}`);
  console.log(`  🔌 Port: ${env.SMTP_PORT || '❌ NOT SET'}`);
  
  console.log('\n📊 Authentication Method:');
  console.log('  🔐 Type: Basic SMTP (Username/Password)');
  console.log('  📱 Service: SMTP2GO third-party relay');
  console.log('  🛡️  Security: Medium (API key in env, no OAuth)');
  console.log('  ⏰ Token Refresh: Not needed');
  
} else {
  console.log(`\n⚠️  UNKNOWN EMAIL SERVICE: "${emailService}"\n`);
}

console.log('\n' + '═'.repeat(80) + '\n');

// Summary
console.log('🎯 QUICK ANSWER:');
console.log(`   You are using: ${emailService === 'gmail-oauth2' ? '✅ GMAIL OAUTH2' : '⚠️  ' + emailService.toUpperCase()}`);
if (emailService === 'gmail-oauth2') {
  console.log('   NOT using SMTP2GO - confirmed!');
  console.log('   Your emails are sent via Google\'s Gmail SMTP with OAuth2 authentication');
}
console.log('\n');
