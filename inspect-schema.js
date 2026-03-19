require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function inspectSchema() {
  try {
    console.log('📊 Inspecting test_attempts table schema...\n');

    // Try to get info via information_schema directly from Supabase
    const { data: schemaData, error: schemaError } = await supabaseAdmin
      .rpc('get_columns', { 
        p_table_name: 'test_attempts',
        p_table_schema: 'public'
      });

    if (schemaError || !schemaData) {
      console.log('ℹ️  Direct schema query unavailable. Testing via insertion...\n');
      
      // Try minimal insert
      const { error: insertError, data: insertData } = await supabaseAdmin
        .from('test_attempts')
        .insert({
          test_id: '00000000-0000-0000-0000-000000000001',
          user_id: '00000000-0000-0000-0000-000000000002',
          enrollment_id: '00000000-0000-0000-0000-000000000003'
        })
        .select();

      if (insertError) {
        console.log('❌ Minimal insert failed with error:');
        console.log('   Message:', insertError.message);
        console.log('   Code:', insertError.code);
        console.log('   Details:', insertError.details);
        console.log('\n✅ This tells us the required fields!\n');
      } else {
        console.log('✅ Minimal insert succeeded!');
        console.log('   Required fields: test_id, user_id, enrollment_id');
      }
    } else {
      console.log('Columns:', schemaData);
    }

    // Get a sample test attempt if any exist
    const { data: samples } = await supabaseAdmin
      .from('test_attempts')
      .select('*')
      .limit(1);

    if (samples && samples.length > 0) {
      console.log('\n📄 Sample test_attempt record structure:');
      const record = samples[0];
      Object.keys(record).forEach(key => {
        console.log(`  ${key}: ${typeof record[key]} = ${JSON.stringify(record[key]).substring(0, 50)}`);
      });
    } else {
      console.log('\nℹ️  No existing test_attempt records found.');
    }
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    console.error(err);
  }
}

inspectSchema();
