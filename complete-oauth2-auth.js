#!/usr/bin/env node

/**
 * Gmail OAuth2 Token Exchange
 * Exchanges authorization code for refresh token
 */

const https = require('https');
const readline = require('readline');

const CLIENT_ID = '270610995591-44ljhomjib3d8j3qm0ccmatkc92obgq0.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'YOUR_GMAIL_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔐 Gmail OAuth2 Token Exchange\n');
console.log('This script will exchange your authorization code for a refresh token.\n');

rl.question('📝 Enter authorization code (from the callback URL): ', (authCode) => {
  if (!authCode || authCode.trim().length === 0) {
    console.error('❌ Authorization code is required!');
    rl.close();
    process.exit(1);
  }

  console.log('\n🔄 Exchanging authorization code for refresh token...\n');

  const postData = new URLSearchParams({
    code: authCode.trim(),
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code',
  }).toString();

  const options = {
    hostname: 'oauth2.googleapis.com',
    path: '/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
    },
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (response.error) {
          console.error('❌ Error exchanging code for token:');
          console.error(`   Error: ${response.error}`);
          console.error(`   Description: ${response.error_description}`);
          rl.close();
          process.exit(1);
        }

        if (!response.refresh_token) {
          console.error('❌ No refresh token in response!');
          console.error('Response:', JSON.stringify(response, null, 2));
          rl.close();
          process.exit(1);
        }

        console.log('✅ SUCCESS! Token exchange complete!\n');
        console.log('═'.repeat(100));
        console.log('\n📋 Your OAuth2 Credentials:\n');
        console.log(`Refresh Token:  ${response.refresh_token}`);
        console.log(`Access Token:   ${response.access_token}`);
        console.log(`Expires In:     ${response.expires_in} seconds`);
        console.log(`Token Type:     ${response.token_type}`);
        console.log('\n═'.repeat(100));
        
        console.log('\n📌 NEXT STEPS:\n');
        console.log('1. Copy the Refresh Token above (the long string starting with "1/")');
        console.log('2. Go to Vercel Dashboard → Project Settings → Environment Variables');
        console.log('3. Find GMAIL_REFRESH_TOKEN and update it with the new value');
        console.log('4. Redeploy the application');
        console.log('5. Test the contact form at https://www.whiteboardconsultant.com/contact\n');

        rl.close();
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
        console.error('Raw response:', data);
        rl.close();
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    rl.close();
    process.exit(1);
  });

  req.write(postData);
  req.end();
});
