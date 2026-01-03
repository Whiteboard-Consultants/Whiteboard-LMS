/**
 * Comprehensive Debug Script for Instructor Reports
 * Run this to verify enrollments are being fetched correctly
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lqezaljvpiycbeakndby.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZXphbGp2cGl5Y2JlYWtuZGJ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODQ3MjQ5NiwiZXhwIjoyMDc0MDQ4NDk2fQ.4fzjOpiTl6cbLjI6_ClAp7I6r1ckgFNkrsE7mnAKMOw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const COURSE_ID = '2e16afb2-b718-4008-bfa7-81ddb3415b11';

async function diagnose() {
  console.log('🔍 COMPREHENSIVE ENROLLMENT DIAGNOSTIC\n');

  // Step 1: Check course exists and get instructor
  console.log('Step 1: Verify Course');
  console.log('─'.repeat(50));
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id, title, instructor_id')
    .eq('id', COURSE_ID)
    .single();

  if (courseError) {
    console.error('❌ Course not found:', courseError.message);
    return;
  }

  console.log('✅ Course found:');
  console.log(`   Title: ${course.title}`);
  console.log(`   ID: ${course.id}`);
  console.log(`   Instructor ID: ${course.instructor_id}\n`);

  // Step 2: Count enrollments by status
  console.log('Step 2: Check Enrollment Status Distribution');
  console.log('─'.repeat(50));
  const { data: allEnrollments, error: allEnrollmentsError } = await supabase
    .from('enrollments')
    .select('id, status, user_id, created_at')
    .eq('course_id', COURSE_ID);

  if (allEnrollmentsError) {
    console.error('❌ Error fetching enrollments:', allEnrollmentsError.message);
    return;
  }

  console.log(`Total enrollments for this course: ${allEnrollments?.length || 0}`);
  
  if (allEnrollments && allEnrollments.length > 0) {
    const statusCounts = {};
    allEnrollments.forEach(e => {
      statusCounts[e.status] = (statusCounts[e.status] || 0) + 1;
    });
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
    console.log();
  } else {
    console.log('⚠️  NO ENROLLMENTS FOUND for this course!\n');
  }

  // Step 3: Check APPROVED enrollments specifically
  console.log('Step 3: Check Approved Enrollments');
  console.log('─'.repeat(50));
  const { data: approvedEnrollments, error: approvedError } = await supabase
    .from('enrollments')
    .select('id, user_id, status, enrolled_at, instructor_id, student_name')
    .eq('course_id', COURSE_ID)
    .eq('status', 'approved');

  if (approvedError) {
    console.error('❌ Error fetching approved enrollments:', approvedError.message);
  } else if (approvedEnrollments && approvedEnrollments.length > 0) {
    console.log(`✅ Found ${approvedEnrollments.length} approved enrollment(s):`);
    approvedEnrollments.forEach((e, i) => {
      console.log(`\n   ${i + 1}. Enrollment ID: ${e.id}`);
      console.log(`      User ID: ${e.user_id}`);
      console.log(`      Student Name: ${e.student_name}`);
      console.log(`      Status: ${e.status}`);
      console.log(`      Enrolled At: ${e.enrolled_at}`);
      console.log(`      Enrollment Instructor ID: ${e.instructor_id}`);
    });
    console.log();
  } else {
    console.log('⚠️  NO APPROVED ENROLLMENTS FOUND\n');
  }

  // Step 4: Check user details for approved enrollments
  if (approvedEnrollments && approvedEnrollments.length > 0) {
    console.log('Step 4: Fetch User Details for Enrolled Students');
    console.log('─'.repeat(50));
    const userIds = approvedEnrollments.map(e => e.user_id);
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .in('id', userIds);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else if (users) {
      console.log(`✅ Found ${users.length} user(s):`);
      users.forEach(u => {
        console.log(`   - ${u.name} (${u.email}) [${u.role}]`);
      });
      console.log();
    }
  }

  // Step 5: Check RLS policies
  console.log('Step 5: Verify RLS Policies on Enrollments');
  console.log('─'.repeat(50));
  const { data: policies, error: policiesError } = await supabase
    .rpc('get_policies_for_table', { table_name: 'enrollments', schema_name: 'public' })
    .catch(() => ({ data: null, error: 'RPC function not available' }));

  if (policiesError) {
    console.log('⚠️  Could not check RLS policies via RPC');
    console.log('   Run this SQL manually in Supabase to verify:');
    console.log('   SELECT policyname, cmd, qual FROM pg_policies');
    console.log('   WHERE tablename = \'enrollments\' AND schemaname = \'public\';\n');
  } else {
    console.log('✅ RLS Policies found');
    console.log(JSON.stringify(policies, null, 2));
    console.log();
  }

  // Step 6: Summary
  console.log('Step 6: Summary & Recommendations');
  console.log('─'.repeat(50));
  
  if (!approvedEnrollments || approvedEnrollments.length === 0) {
    console.log('❌ ISSUE: No approved enrollments found');
    console.log('\nRECOMMENDATIONS:');
    console.log('1. Check if students have enrolled in this course');
    console.log('2. Verify enrollment status is "approved" (not "pending")');
    console.log('3. Check admin panel at /admin/enrollments to approve pending requests');
    console.log('4. Run this query manually:');
    console.log(`   SELECT * FROM enrollments WHERE course_id = '${COURSE_ID}';`);
  } else {
    console.log(`✅ SUCCESS: Found ${approvedEnrollments.length} approved enrollment(s)`);
    console.log('\nIf students still don\'t appear on the page:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify server action is being called correctly');
    console.log('3. Check that frontend is receiving the data');
  }
}

diagnose().catch(console.error);
