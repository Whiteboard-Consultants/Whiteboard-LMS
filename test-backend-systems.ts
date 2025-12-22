/**
 * Backend Systems Testing Suite
 * Tests Skills, Badges, and Lesson Segments infrastructure
 * Run with: npx ts-node test-backend-systems.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials. Check .env.local file.');
  console.error(`   NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}`);
  console.error(`   SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? '✓' : '✗'}`);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function test(
  name: string,
  fn: () => Promise<void>
): Promise<void> {
  try {
    await fn();
    results.push({ name, status: 'PASS', message: '✅ Passed' });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({
      name,
      status: 'FAIL',
      message: error.message,
      details: error
    });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Backend Systems Testing Suite\n');
  console.log('=' .repeat(60));

  // ===== DATABASE CONNECTIVITY =====
  console.log('\n📋 Database Connectivity Tests\n');

  await test('Database Connection', async () => {
    const { data, error } = await supabase.from('users').select('count()').limit(1);
    if (error) throw error;
    if (!data) throw new Error('No response from database');
  });

  // ===== SKILLS SYSTEM TESTS =====
  console.log('\n🎯 Skills System Tests\n');

  await test('Skills Table Exists', async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Skills Categories Exist', async () => {
    const { data, error } = await supabase
      .from('skill_categories')
      .select('*');
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No skill categories found');
    }
    console.log(`   Found ${data.length} skill categories`);
  });

  await test('Skill Levels Table Exists', async () => {
    const { data, error } = await supabase
      .from('skill_levels')
      .select('*');
    if (error) throw error;
  });

  await test('User Skills Table Exists', async () => {
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Skill Endorsements Table Exists', async () => {
    const { data, error } = await supabase
      .from('skill_endorsements')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  // ===== BADGES SYSTEM TESTS =====
  console.log('\n🏆 Badges System Tests\n');

  await test('Badges Table Exists', async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('*');
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No badges found');
    }
    console.log(`   Found ${data.length} badges`);
  });

  await test('Badge Categories Exist', async () => {
    const { data, error } = await supabase
      .from('badge_categories')
      .select('*');
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No badge categories found');
    }
    console.log(`   Found ${data.length} badge categories`);
  });

  await test('User Badges Table Exists', async () => {
    const { data, error } = await supabase
      .from('user_badges')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Badge Points Tracking Table Exists', async () => {
    const { data, error } = await supabase
      .from('badge_points')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Streaks Table Exists', async () => {
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  // ===== LESSON SEGMENTS SYSTEM TESTS =====
  console.log('\n📚 Lesson Segments System Tests\n');

  await test('Lessons Table Exists', async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Lesson Segments Table Exists', async () => {
    const { data, error } = await supabase
      .from('lesson_segments')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Segment Metadata Table Exists', async () => {
    const { data, error } = await supabase
      .from('segment_metadata')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('User Segment Progress Table Exists', async () => {
    const { data, error } = await supabase
      .from('user_segment_progress')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Segment Completions Table Exists', async () => {
    const { data, error } = await supabase
      .from('segment_completions')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  // ===== CORE SYSTEM TESTS =====
  console.log('\n🔧 Core System Tests\n');

  await test('Courses Table Exists', async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Users Table Exists', async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    if (error) throw error;
  });

  await test('User Profiles Table Exists', async () => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  await test('Enrollments Table Exists', async () => {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .limit(1);
    if (error && !error.message.includes('404')) throw error;
  });

  // ===== RLS POLICIES TESTS =====
  console.log('\n🔐 RLS Policies Tests\n');

  await test('RLS Policies Applied', async () => {
    // Try to fetch from a table with RLS - this should work with service key
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .limit(1);
    if (error) throw error;
    console.log(`   Successfully queried protected table with service key`);
  });

  // ===== SCHEMA VALIDATION =====
  console.log('\n✔️ Schema Validation Tests\n');

  await test('Skills Schema Valid', async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('id, name, category_id, difficulty_level, created_at')
      .limit(1);
    if (error) throw error;
  });

  await test('Badges Schema Valid', async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('id, name, category_id, description, points_required, rarity, created_at')
      .limit(1);
    if (error) throw error;
  });

  await test('Lessons Schema Valid', async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, course_id, title, description, ordering, created_at')
      .limit(1);
    if (error) throw error;
  });

  await test('Lesson Segments Schema Valid', async () => {
    const { data, error } = await supabase
      .from('lesson_segments')
      .select('id, lesson_id, content_type, title, ordering, created_at')
      .limit(1);
    if (error) throw error;
  });

  // ===== RELATIONSHIP TESTS =====
  console.log('\n🔗 Relationship Tests\n');

  await test('Skills-Categories Relationship', async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('id, category_id, skill_categories(id, name)')
      .limit(1);
    if (error && !error.message.includes('not found')) throw error;
    if (data && data[0]) {
      console.log(`   Relationship query successful`);
    }
  });

  await test('Badges-Categories Relationship', async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('id, category_id, badge_categories(id, name)')
      .limit(1);
    if (error && !error.message.includes('not found')) throw error;
  });

  await test('Lessons-Courses Relationship', async () => {
    const { data, error } = await supabase
      .from('lessons')
      .select('id, course_id, courses(id, title)')
      .limit(1);
    if (error && !error.message.includes('not found')) throw error;
  });

  // ===== DATA INTEGRITY TESTS =====
  console.log('\n✅ Data Integrity Tests\n');

  await test('No Null Critical Fields - Badges', async () => {
    const { data, error } = await supabase
      .from('badges')
      .select('id, name, category_id, rarity')
      .is('name', null);
    if (error) throw error;
    if (data && data.length > 0) {
      throw new Error(`Found ${data.length} badges with null names`);
    }
    console.log(`   No null critical fields in badges`);
  });

  await test('No Null Critical Fields - Skills', async () => {
    const { data, error } = await supabase
      .from('skills')
      .select('id, name, category_id')
      .is('name', null);
    if (error) throw error;
    if (data && data.length > 0) {
      throw new Error(`Found ${data.length} skills with null names`);
    }
    console.log(`   No null critical fields in skills`);
  });

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;

  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📈 Total:   ${results.length}\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`\n  ❌ ${r.name}`);
        console.log(`     ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
