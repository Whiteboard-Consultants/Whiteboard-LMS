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

async function createMissingCourses() {
  try {
    console.log('📚 Creating course entries for all test series...\n');

    // Get all series
    const { data: series, error: seriesError } = await supabaseAdmin
      .from('test_series')
      .select('id, title, price, discount_percentage')
      .order('created_at', { ascending: true });

    if (seriesError) {
      console.log('❌ Error fetching series:', seriesError.message);
      return;
    }

    if (!series || series.length === 0) {
      console.log('❌ No series found!');
      return;
    }

    console.log(`Found ${series.length} series to process:\n`);

    // Get a default instructor
    const { data: users } = await supabaseAdmin  
      .from('auth.users')
      .select('id')
      .limit(1);

    const instructorId = users && users[0] ? users[0].id : '00000000-0000-0000-0000-000000000000';

    for (const s of series) {
      // Check if course already exists
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('courses')
        .select('id')
        .eq('id', s.id)
        .single();

      if (existing) {
        console.log(`✅ Course already exists: ${s.title}`);
        continue;
      }

      // Create course entry
      const { data: course, error: insertError } = await supabaseAdmin
        .from('courses')
        .insert({
          id: s.id,
          title: s.title,
          description: `Test series: ${s.title}`,
          instructor: instructorId,
          category: 'Mock Tests',
          price: s.price || 0,
          type: 'free'
        })
        .select()
        .single();

      if (insertError) {
        console.log(`❌ Failed to create course for "${s.title}": ${insertError.message}`);
      } else {
        console.log(`✅ Created course: ${s.title}`);
      }
    }

    console.log('\n✅ All series now have course entries!');

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

createMissingCourses();
