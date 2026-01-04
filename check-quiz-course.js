#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkQuizCourse() {
  try {
    // Get a quiz attempt
    const { data: attempt } = await supabase
      .from('quiz_attempts')
      .select('*')
      .limit(1)
      .single();

    if (!attempt) {
      console.log('No quiz attempts found');
      return;
    }

    console.log('Quiz attempt course_id:', attempt.course_id);

    // Get the course
    const { data: course } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', attempt.course_id)
      .single();

    console.log('Course:', course?.title);

    // Check if this course has course_skills
    const { data: courseSkills } = await supabase
      .from('course_skills')
      .select('*')
      .eq('course_id', attempt.course_id);

    console.log('Course skills linked:', courseSkills?.length || 0);

    // If no skills, let's link them manually
    if (!courseSkills || courseSkills.length === 0) {
      console.log('\nLinking skills to this course...');

      // Get the LinkedIn profile skill ID
      const { data: linkedinSkill } = await supabase
        .from('skills')
        .select('id, name')
        .ilike('name', '%linkedin%')
        .single();

      if (linkedinSkill) {
        const { error: linkError } = await supabase
          .from('course_skills')
          .insert({
            course_id: attempt.course_id,
            skill_id: linkedinSkill.id,
            proficiency_level: 'intermediate',
            weight: 3
          });

        if (!linkError) {
          console.log('✅ Linked LinkedIn skill to course');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkQuizCourse();
