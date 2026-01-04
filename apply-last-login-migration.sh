#!/bin/bash
# Apply the last_login migration directly using Supabase admin

cat > /tmp/add_last_login.sql << 'EOF'
-- Add last_login column to users table to track user activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

-- Create or replace function to update last_login on user activity
CREATE OR REPLACE FUNCTION update_user_last_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET last_login = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_last_login TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_last_login TO service_role;
EOF

# Execute using Node to run SQL via Supabase admin
node << 'NEOF'
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    const sql = fs.readFileSync('/tmp/add_last_login.sql', 'utf8');
    
    // Split by statements and execute each one
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 50) + '...');
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement.trim() + ';'
      }).then(() => ({ error: null })).catch(err => ({ error: err }));
      
      if (error) {
        console.error('Error executing statement:', error);
      } else {
        console.log('✓ Statement executed');
      }
    }
    
    console.log('✓ Migration completed');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
NEOF
