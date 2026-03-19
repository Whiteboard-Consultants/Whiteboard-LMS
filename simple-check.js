const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('test_attempts').select().limit(1).then(({data, error}) => {
  if (error) console.error('Error:', error.message);
  else if (data && data.length > 0) console.log('Columns:', Object.keys(data[0]).join(', '));
  else console.log('No data in test_attempts');
});
