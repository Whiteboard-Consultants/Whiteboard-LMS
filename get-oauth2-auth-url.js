#!/usr/bin/env node

/**
 * Gmail OAuth2 Authorization URL Generator
 * This generates the URL you need to visit to authorize Gmail access
 */

const CLIENT_ID = '270610995591-44ljhomjib3d8j3qm0ccmatkc92obgq0.apps.googleusercontent.com';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';
const SCOPES = 'https://www.googleapis.com/auth/gmail.send';

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=${encodeURIComponent(SCOPES)}&prompt=consent&response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

console.log('\n🔐 Gmail OAuth2 Authorization URL\n');
console.log('Copy and open this URL in your browser:');
console.log('═'.repeat(100));
console.log(authUrl);
console.log('═'.repeat(100));
console.log('\nSteps:');
console.log('  1. Copy the URL above');
console.log('  2. Open it in your browser');
console.log('  3. Select your Gmail account (navnit.alley@whiteboardconsultant.com)');
console.log('  4. Click "Allow" to authorize');
console.log('  5. You will be redirected to http://localhost:3000/api/auth/callback?code=...');
console.log('  6. Copy the entire URL from the address bar');
console.log('  7. Run: node complete-oauth2-auth.js');
console.log('  8. Paste the full redirect URL when prompted\n');
