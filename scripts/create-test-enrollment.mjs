#!/usr/bin/env node
/**
 * Script to create test enrollment data for testing the enrollment workflow
 * Usage: node scripts/create-test-enrollment.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function createTestEnrollment() {
  console.log('🧪 Creating test enrollment data...\n');

  try {
    // Step 1: Get a student
    console.log('Step 1: Finding a student...');
    const { data: students, error: studentError } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'student')
      .limit(1);

    if (studentError || !students?.length) {
      console.error('❌ No students found in database');
      console.log('   Please create a student user first via the admin panel');
      process.exit(1);
    }

    const student = students[0];
    console.log(`✅ Found student: ${student.name} (${student.email})`);

    // Step 2: Get a course with an instructor
    console.log('\nStep 2: Finding a course...');
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select('id, title, instructor_id')
      .limit(1);

    if (courseError || !courses?.length) {
      console.error('❌ No courses found in database');
      console.log('   Please create a course first via the instructor panel');
      process.exit(1);
    }

    const course = courses[0];
    console.log(`✅ Found course: ${course.title}`);

    // Step 3: Check if enrollment already exists
    console.log('\nStep 3: Checking for existing enrollment...');
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id, status')
      .eq('user_id', student.id)
      .eq('course_id', course.id)
      .limit(1);

    if (existing?.length) {
      console.log(`ℹ️  Enrollment already exists with status: ${existing[0].status}`);
      console.log('   Not creating duplicate.\n');
      console.log('✅ Setup complete!');
      return;
    }

    // Step 4: Create enrollment as PENDING (requires admin approval)
    console.log('\nStep 4: Creating pending enrollment...');
    const { data: enrollment, error: enrollError } = await supabase
      .from('enrollments')
      .insert({
        user_id: student.id,
        course_id: course.id,
        status: 'pending',
        payment_status: 'completed',
        payment_method: 'test'
      })
      .select()
      .single();

    if (enrollError) {
      console.error('❌ Failed to create enrollment:', enrollError.message);
      process.exit(1);
    }

    console.log(`✅ Created pending enrollment!`);
    console.log(`   ID: ${enrollment.id}`);
    console.log(`   Status: pending (needs admin approval)\n`);

    // Step 5: Show what to do next
    console.log('📋 Next steps:');
    console.log('   1. Go to: http://localhost:3000/admin/enrollments');
    console.log('   2. Look in the "Pending Requests" tab');
    console.log(`   3. Approve the enrollment for ${student.name}`);
    console.log(`   4. Then check the instructor reports to see the student\n`);

    console.log('✅ Test enrollment created successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestEnrollment();
