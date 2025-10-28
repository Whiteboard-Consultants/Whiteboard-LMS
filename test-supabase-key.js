const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://lqezaljvpiycbeakndby.supabase.co';
const publishableKey = 'sb_publishable_Duv2J_lUs2OQSALg9Z4KTg_d7N20D-j';

console.log('🧪 Testing Supabase Key Configuration\n');
console.log('URL:', supabaseUrl);
console.log('Key:', publishableKey.substring(0, 30) + '...');
console.log('Key Format:', publishableKey.startsWith('sb_publishable_') ? '✅ CORRECT' : '❌ WRONG');

try {
  const client = createClient(supabaseUrl, publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  console.log('\n✅ Supabase client created successfully');
  console.log('Client ready for auth operations');
} catch (error) {
  console.error('\n❌ Error creating client:', error.message);
}
