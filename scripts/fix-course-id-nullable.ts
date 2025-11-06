#!/usr/bin/env node

/**
 * Fix the course_id NOT NULL constraint in the tests table
 * This allows tests to be created without associating them to a course
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, detectSessionInUrl: false }
});

async function fixCourseIdConstraint() {
  try {
    console.log('🔧 Attempting to make course_id nullable in tests table...');
    
    // Use RPC call to execute raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;'
    });

    if (error) {
      // If RPC doesn't exist, try alternative approach
      console.warn('⚠️  RPC method not available, attempting alternative method...');
      
      // Alternative: Use the from() method to check current schema
      const { data: tableInfo, error: schemaError } = await supabase
        .from('tests')
        .select('*')
        .limit(0);
      
      if (schemaError) {
        console.error('❌ Cannot access tests table:', schemaError.message);
        process.exit(1);
      }
      
      console.log('ℹ️  To fix the course_id constraint, please run this SQL in Supabase Dashboard:');
      console.log('');
      console.log('ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;');
      console.log('');
      console.log('Steps:');
      console.log('1. Go to https://supabase.com/dashboard/project/_/sql/new');
      console.log('2. Paste the SQL above');
      console.log('3. Click "Run"');
      console.log('4. Refresh your app');
      
    } else {
      console.log('✅ Successfully made course_id nullable!');
      console.log('✅ Tests can now be created without selecting a course');
    }
  } catch (err: any) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixCourseIdConstraint();
