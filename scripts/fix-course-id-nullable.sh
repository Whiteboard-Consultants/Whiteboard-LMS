#!/bin/bash
# Run this script to fix the course_id constraint issue

echo "🔧 Fixing course_id NOT NULL constraint..."

# Read the migration file and execute it
MIGRATION_SQL=$(cat migrations/make_course_id_nullable.sql)

# Using psql or supabase CLI to execute
# For Supabase, you would use: supabase db execute "$(cat migrations/make_course_id_nullable.sql)"

# Or using Node.js/Supabase client
cat << 'NODEJS'
import { supabaseAdmin } from './src/lib/supabase';

async function fixCourseIdConstraint() {
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', {
      sql: `ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;`
    });
    
    if (error) {
      console.error('Error fixing constraint:', error);
    } else {
      console.log('✅ course_id is now nullable');
    }
  } catch (err) {
    console.error('Failed to execute migration:', err);
  }
}

fixCourseIdConstraint();
NODEJS

echo ""
echo "To run this migration in Supabase:"
echo "1. Go to Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Run the following SQL:"
echo ""
echo "ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;"
echo ""
echo "Or use the supabase CLI:"
echo "supabase db execute 'ALTER TABLE tests ALTER COLUMN course_id DROP NOT NULL;'"
