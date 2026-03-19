#!/usr/bin/env node

/**
 * Script to seed test series and tests into the database
 * This creates a purchasable test series with sample tests
 */

const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Import Supabase client
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTests() {
  try {
    console.log('🌱 Starting test data seeding...\n');

    // Step 1: Get instructor or fallback to first user
    console.log('📋 Step 1: Finding instructor...');
    const { data: users, error: usersError } = await supabase
      .from('auth.users')
      .select('id, email')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      // Try alternative approach
      console.log('⚠️  Could not fetch from auth.users directly, using rpc...');
    }

    // Step 2: Create test series
    console.log('\n📚 Step 2: Creating test series...');
    
    const seriesResult = await supabase.rpc('create_test_series_with_tests');
    
    if (seriesResult.error) {
      console.log('⚠️  RPC not available, using direct insert...');
      
      // Get an instructor (try finding in auth first, then fallback to profiles)
      let instructorId = null;
      
      // Try to get from auth.users via RPC (Supabase-specific approach)
      console.log('Finding users in the system...');
      
      // First try profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(5);
      
      if (!profilesError && profiles && profiles.length > 0) {
        // Try to find instructor first
        const instructor = profiles.find(p => p.role === 'instructor');
        if (instructor) {
          instructorId = instructor.id;
          console.log('✅ Found instructor in profiles:', instructorId);
        } else {
          // Fallback to any user
          instructorId = profiles[0].id;
          console.log('⚠️  Using first user from profiles as instructor:', instructorId);
        }
      } else {
        // Try auth.users as fallback (for actual Supabase auth)
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authUsers && authUsers.users && authUsers.users.length > 0) {
          instructorId = authUsers.users[0].id;
          console.log('✅ Using auth user:', instructorId);
        } else {
          console.error('❌ No users found in database or auth');
          console.error('   Create a user first by signing up or checking your database');
          process.exit(1);
        }
      }

      // Create series
      const { data: series, error: seriesError } = await supabase
        .from('test_series')
        .insert({
          title: 'Campus Recruitment Full Mock Series',
          description: 'Complete mock test series for campus recruitment with Quantitative Aptitude, Verbal Ability, and Logical Reasoning',
          topic_area: 'Campus Recruitment',
          instructor_id: instructorId,
          is_published: true,
          price: 588.00,
          is_purchasable: true,
          discount_percentage: 10
        })
        .select()
        .single();

      if (seriesError) {
        console.error('❌ Error creating series:', seriesError);
        process.exit(1);
      }

      console.log('✅ Created series:', {
        id: series.id,
        title: series.title,
        price: series.price
      });

      // Step 3: Create tests
      console.log('\n🧪 Step 3: Creating tests...');
      
      const tests = [
        {
          title: 'Quantitative Aptitude - Mock 1',
          description: 'Mock test for quantitative aptitude with focus on fundamental concepts',
          topic: 'Quantitative Aptitude',
          difficulty_level: 'Medium',
          price: 199.00,
          order_within_topic: 1,
          duration: 90,
          total_marks: 100,
          pass_marks: 70
        },
        {
          title: 'Verbal Ability - Mock 1',
          description: 'Mock test for verbal ability including reading comprehension and vocabulary',
          topic: 'Verbal Ability',
          difficulty_level: 'Medium',
          price: 199.00,
          order_within_topic: 1,
          duration: 60,
          total_marks: 100,
          pass_marks: 70
        },
        {
          title: 'Logical Reasoning - Mock 1',
          description: 'Mock test for logical reasoning with various types of puzzles and arrangements',
          topic: 'Logical Reasoning',
          difficulty_level: 'Medium',
          price: 199.00,
          order_within_topic: 1,
          duration: 75,
          total_marks: 100,
          pass_marks: 70
        }
      ];

      for (const test of tests) {
        const { data: createdTest, error: testError } = await supabase
          .from('tests')
          .insert({
            ...test,
            series_id: series.id,
            instructor_id: instructorId,
            is_published: true,
            is_free: false,
            type: 'mock'
          })
          .select()
          .single();

        if (testError) {
          console.error(`❌ Error creating test "${test.title}":`, testError);
        } else {
          console.log(`✅ Created test: ${createdTest.title} (ID: ${createdTest.id})`);
        }
      }

      console.log('\n✅ Seeding complete!');
      console.log('\n📊 Summary:');
      console.log(`   Series ID: ${series.id}`);
      console.log(`   Series Title: ${series.title}`);
      console.log(`   Series Price: ₹${series.price}`);
      console.log(`   Tests Created: 3`);
      console.log('\n💡 You can now test the purchase flow with this series!');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

seedTests();
