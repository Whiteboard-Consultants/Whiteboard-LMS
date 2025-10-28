/**
 * Test script to verify the Bearer token auth flow works end-to-end
 * This simulates what happens when:
 * 1. User logs in (session stored in localStorage)
 * 2. Client tries to fetch /api/admin/users with authenticatedFetch
 * 3. Server validates the Bearer token
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lqezaljvpiycbeakndby.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZXphbGp2cGl5Y2JlYWtuZGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NzI0OTYsImV4cCI6MjA3NDA0ODQ5Nn0.FehxMVZlGq1w7NtuXlBlmCraa1mQJ5JpT6oML9PA_I8';

const TEST_EMAIL = 'admin@whitedgelms.com';
const TEST_PASSWORD = 'Admin@123456';

async function testAuthFlow() {
  console.log('\n========== TESTING AUTH FLOW ==========\n');
  
  try {
    // Step 1: Create Supabase client
    console.log('Step 1: Creating Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('✅ Supabase client created\n');

    // Step 2: Try to login
    console.log(`Step 2: Attempting login with ${TEST_EMAIL}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return;
    }
    
    if (!data.session) {
      console.error('❌ Login succeeded but no session returned');
      return;
    }
    
    console.log('✅ Login successful');
    console.log(`   Access Token: ${data.session.access_token.substring(0, 30)}...`);
    console.log(`   User ID: ${data.session.user?.id}\n`);

    // Step 3: Check what's in the session
    console.log('Step 3: Checking current session with getSession()...');
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) {
      console.log('✅ getSession() found session');
      console.log(`   Access Token: ${sessionData.session.access_token.substring(0, 30)}...`);
    } else {
      console.log('❌ getSession() returned null\n');
    }

    // Step 4: Make authenticated request to /api/admin/users
    console.log('Step 4: Making authenticated request to /api/admin/users...');
    console.log(`   Authorization Header: Bearer ${data.session.access_token.substring(0, 30)}...\n`);
    
    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.session.access_token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`✅ Request completed with status: ${response.status}`);
    
    if (response.ok) {
      const users = await response.json();
      console.log(`✅ Successfully fetched ${Array.isArray(users) ? users.length : 0} users`);
      if (Array.isArray(users) && users.length > 0) {
        console.log(`   Sample user: ${users[0].name || users[0].email}`);
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ Request failed: ${response.status}`);
      console.error(`   Response: ${errorText.substring(0, 200)}`);
    }

    console.log('\n========== TEST COMPLETE ==========\n');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testAuthFlow();
