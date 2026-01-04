#!/usr/bin/env node

/**
 * Populate user_skills for existing quiz attempts
 * This simulates what would happen when a student completes a quiz
 */

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

async function populateSkillsFromQuizzes() {
  try {
    console.log('📚 Populating skills from existing quiz attempts...\n');

    // 1. Get all quiz attempts
    const { data: quizAttempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('id, user_id, course_id, score, total_questions');

    if (attemptsError || !quizAttempts) {
      console.error('❌ Error fetching quiz attempts:', attemptsError?.message);
      return;
    }

    console.log(`Found ${quizAttempts.length} quiz attempts\n`);

    let skillsCreated = 0;

    // 2. For each quiz attempt, get course skills and create user skills
    for (const attempt of quizAttempts) {
      const percentage = attempt.total_questions > 0 
        ? Math.round((attempt.score / attempt.total_questions) * 100) 
        : 0;

      console.log(`\n📝 Processing quiz attempt from user ${attempt.user_id.substring(0, 8)}...`);
      console.log(`   Score: ${attempt.score}/${attempt.total_questions} (${percentage}%)`);

      // Get skills for this course
      const { data: courseSkills, error: skillsError } = await supabase
        .from('course_skills')
        .select('skill_id, proficiency_level')
        .eq('course_id', attempt.course_id);

      if (skillsError || !courseSkills) {
        console.log('   ⚠️ No skills found for this course');
        continue;
      }

      console.log(`   🎓 Found ${courseSkills.length} course skills`);

      // Create user_skills records
      for (const courseSkill of courseSkills) {
        const { data: createdSkill, error: createError } = await supabase
          .from('user_skills')
          .upsert({
            user_id: attempt.user_id,
            skill_id: courseSkill.skill_id,
            proficiency_level: courseSkill.proficiency_level,
            mastery_percentage: percentage,
            practice_count: 1,
            last_practiced_at: new Date().toISOString(),
            acquired_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,skill_id'
          })
          .select();

        if (createError) {
          console.log(`   ✗ Error creating skill:`, createError.message);
        } else {
          console.log(`   ✓ Skill tracked (mastery: ${percentage}%)`);
          skillsCreated++;
        }
      }
    }

    console.log(`\n✅ Populated ${skillsCreated} user skills from quiz attempts!`);
    console.log('\nStudents can now view their skills in the Skills Dashboard.');
    console.log('Go to: http://localhost:3000/student/skills\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

populateSkillsFromQuizzes();
