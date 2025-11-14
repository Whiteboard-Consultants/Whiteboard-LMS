const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTests() {
  const { data, error } = await supabase
    .from('tests')
    .select('id, title, description')
    .limit(5);

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Tests:', JSON.stringify(data, null, 2));
  }
}

checkTests();
