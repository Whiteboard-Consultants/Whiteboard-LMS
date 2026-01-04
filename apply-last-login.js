const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
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
    console.log('🚀 Applying last_login migration...');
    
    // 1. Add last_login column
    console.log('1️⃣ Adding last_login column...');
    const { error: addColError } = await supabase.rpc('execute_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;'
    }).catch(err => ({ error: err.message }));
    
    if (addColError && !addColError.includes('already exists')) {
      console.error('Error adding column:', addColError);
    } else {
      console.log('✓ Column added/verified');
    }
    
    // 2. Create index
    console.log('2️⃣ Creating index...');
    const { error: indexError } = await supabase.rpc('execute_sql', {
      sql: 'CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);'
    }).catch(err => ({ error: err.message }));
    
    if (indexError && !indexError.includes('already exists')) {
      console.error('Error creating index:', indexError);
    } else {
      console.log('✓ Index created/verified');
    }
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();
