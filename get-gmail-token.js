#!/usr/bin/env node

/**
 * Gmail OAuth2 Token Generator for WhitedgeLMS
 * 
 * This script generates a refresh token for Gmail SMTP authentication
 * Usage: node get-gmail-token.js <authorization-code>
 */

const https = require('https');
const url = require('url');

// Your OAuth2 credentials (from Google Cloud Console)
const CLIENT_ID = '270610995591-44ljhomjib3d8j3qm0ccmatkc92obgq0.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

/**
 * Step 1: Generate the authorization URL
 */
function generateAuthUrl() {
  const params = new url.URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  return authUrl;
}

/**
 * Step 2: Exchange authorization code for tokens
 */
function getTokens(code) {
  return new Promise((resolve, reject) => {
    const postData = new url.URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI
    }).toString();

    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
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
            reject(new Error(`Error from Google: ${response.error_description || response.error}`));
          } else {
            resolve(response);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  const code = process.argv[2];

  if (!code) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     Gmail OAuth2 Token Generator for WhitedgeLMS           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📋 STEP 1: Get Authorization Code\n');
    console.log('Visit this URL in your browser and authorize access:\n');

    const authUrl = generateAuthUrl();
    console.log(`🔗 ${authUrl}\n`);

    console.log('📌 Instructions:');
    console.log('1. Click the link above');
    console.log('2. Sign in with your Gmail account');
    console.log('3. Grant access to "WhitedgeLMS"');
    console.log('4. You\'ll be redirected to localhost');
    console.log('5. Copy the "code" parameter from the URL\n');

    console.log('Example URL after redirect:');
    console.log('http://localhost:3000/api/auth/callback?code=4/0AY0e-g...\n');

    console.log('📝 Then run this command with the code:\n');
    console.log('node get-gmail-token.js "4/0AY0e-g..."\n');

    process.exit(0);
  }

  console.log('\n⏳ Exchanging authorization code for tokens...\n');

  try {
    const tokens = await getTokens(code);

    console.log('✅ SUCCESS! Here are your tokens:\n');
    console.log('─'.repeat(60));
    console.log('\n📌 ADD THESE TO YOUR .env.local FILE:\n');

    console.log(`GMAIL_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GMAIL_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log(`GMAIL_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`GMAIL_TOKEN_EXPIRY=${Date.now() + (tokens.expires_in * 1000)}`);
    console.log(`SMTP_USER=info@whiteboardconsultant.com\n`);

    console.log('─'.repeat(60));
    console.log('\n📋 TOKEN DETAILS:\n');
    console.log(`Access Token: ${tokens.access_token.substring(0, 50)}...`);
    console.log(`Refresh Token: ${tokens.refresh_token}`);
    console.log(`Expires In: ${tokens.expires_in} seconds (${Math.round(tokens.expires_in / 3600)} hours)\n`);

    console.log('─'.repeat(60));
    console.log('\n✨ NEXT STEPS:\n');
    console.log('1. Copy the GMAIL_* variables above');
    console.log('2. Add them to .env.local');
    console.log('3. Save and close the file');
    console.log('4. Restart your dev server: npm run dev');
    console.log('5. Test email sending\n');

    console.log('💡 NOTE: The refresh token is permanent and never expires.');
    console.log('Keep it safe in .env.local (protected by .gitignore)\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nPossible issues:');
    console.error('- Invalid or expired authorization code');
    console.error('- Code was already used');
    console.error('- Network connectivity issue');
    console.error('\n🔄 Try again: Visit the authorization URL above to get a fresh code\n');
    process.exit(1);
  }
}

main();
