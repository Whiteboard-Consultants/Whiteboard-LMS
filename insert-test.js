const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function insertTest() {
  const { data, error } = await supabase
    .from('tests')
    .insert([{
      title: 'Aptitude Test for MBA Batch',
      description: '✓ Quantitative Analysis ✓ Logical Reasoning ✓ Data Interpretation ✓ English Comprehension',
      type: 'assessment',
      duration: 7200,
      is_time_limited: true,
      passing_score: 80,
      max_attempts: 3,
      show_results: true,
      allow_review: true,
      instructor_id: '1',
      course_id: '1',
      course_title: 'MBA Preparation'
    }])
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Test created:', data);
  }
}

insertTest();
