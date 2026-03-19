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

async function createCourse() {
  try {
    // Series ID from our seeded data
    const seriesId = 'dddf9f85-dfd6-41df-82b4-71bacd8f3aa8';

    // Get instructor ID (use any user)
    const { data: users } = await supabaseAdmin
      .from('auth.users')
      .select('id')
      .limit(1);

    const instructorId = users && users[0] ? users[0].id : '00000000-0000-0000-0000-000000000000';

    // Check if course exists
    const { data: existing } = await supabaseAdmin
      .from('courses')
      .select('*')
      .eq('id', seriesId)
      .single();

    if (existing) {
      console.log('✅ Course already exists:', existing);
      return;
    }

    // Create course entry mapping to series
    const { data: course, error } = await supabaseAdmin
      .from('courses')
      .insert({
        id: seriesId,
        title: 'Campus Recruitment Full Mock Series',
        description: 'Test series for submissions',
        instructor: instructorId,
        category: 'Mock Tests'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating course:', error.message);
      return;
    }

    console.log('✅ Course created:', course);
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
  }
}

createCourse();
