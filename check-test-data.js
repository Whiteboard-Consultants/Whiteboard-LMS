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

async function checkTestData() {
  try {
    console.log('📊 Checking test data with series_id...\n');

    // Get all tests
    const { data: tests, error: testError } = await supabaseAdmin
      .from('tests')
      .select('id, title, series_id');

    if (testError) {
      console.log('❌ Error fetching tests:', testError.message);
      return;
    }

    if (!tests || tests.length === 0) {
      console.log('❌ No tests found!');
      return;
    }

    console.log(`✅ Found ${tests.length} test(s):\n`);
    tests.forEach(test => {
      console.log(`  Title: ${test.title}`);
      console.log(`    ID: ${test.id}`);
      console.log(`    Series ID: ${test.series_id || '❌ NULL'}\n`);
    });

    // Get the series themselves
    console.log('\n📚 Checking test series:\n');
    const { data: series, error: seriesError } = await supabaseAdmin
      .from('test_series')
      .select('id, title');

    if (seriesError) {
      console.log('❌ Error fetching series:', seriesError.message);
      return;
    }

    if (!series || series.length === 0) {
      console.log('❌ No series found!');
      return;
    }

    series.forEach(s => {
      console.log(`  Title: ${s.title}`);
      console.log(`    ID: ${s.id}\n`);
    });

    // Check courses
    console.log('\n🏫 Checking courses:\n');
    const { data: courses, error: courseError } = await supabaseAdmin
      .from('courses')
      .select('id, title');

    if (courseError) {
      console.log('ℹ️  No courses data (or permission denied)');
    } else if (courses && courses.length > 0) {
      courses.forEach(c => {
        console.log(`  Title: ${c.title}`);
        console.log(`    ID: ${c.id}\n`);
      });
    } else {
      console.log('❌ No courses found');
    }

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

checkTestData();
