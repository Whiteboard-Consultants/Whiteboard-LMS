#!/usr/bin/env node

/**
 * Seed default skills into the database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceRoleKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedSkills() {
  try {
    console.log('🌱 Seeding default skills...\n');

    // 1. Create skills
    const skillsData = [
      { name: 'LinkedIn Profile Optimization', category: 'Professional Development', difficulty_level: 'beginner', description: 'Ability to optimize LinkedIn profile for professional visibility and opportunities' },
      { name: 'Professional Branding', category: 'Professional Development', difficulty_level: 'intermediate', description: 'Creating and maintaining a strong professional brand' },
      { name: 'AI for Career Development', category: 'Technology', difficulty_level: 'intermediate', description: 'Leveraging AI tools for career growth and job search' },
      { name: 'Technical Communication', category: 'Communication', difficulty_level: 'intermediate', description: 'Effectively communicating technical concepts to various audiences' },
      { name: 'Interview Skills', category: 'Career Development', difficulty_level: 'intermediate', description: 'Preparing for and succeeding in job interviews' },
      { name: 'Resume Writing', category: 'Career Development', difficulty_level: 'beginner', description: 'Creating compelling resumes that highlight achievements' },
      { name: 'Networking', category: 'Professional Development', difficulty_level: 'intermediate', description: 'Building and maintaining professional relationships' },
      { name: 'Career Planning', category: 'Career Development', difficulty_level: 'intermediate', description: 'Developing and executing a strategic career plan' },
      { name: 'Public Speaking', category: 'Communication', difficulty_level: 'intermediate', description: 'Delivering presentations and public speeches effectively' },
      { name: 'Leadership Skills', category: 'Professional Development', difficulty_level: 'advanced', description: 'Leading teams and driving organizational success' },
    ];

    const { data: insertedSkills, error: skillsError } = await supabase
      .from('skills')
      .upsert(skillsData, { onConflict: 'name' })
      .select();

    if (skillsError) {
      console.error('❌ Error creating skills:', skillsError.message);
      return;
    }

    console.log(`✅ Created/verified ${insertedSkills?.length || 0} skills:`);
    insertedSkills?.forEach(skill => {
      console.log(`   • ${skill.name} (${skill.category})`);
    });

    // 2. Get the course ID for "LinkedIn Optimization with AI"
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', '%linkedin%')
      .limit(1)
      .single();

    if (courseError || !courseData) {
      console.log('\n⚠️  Could not find LinkedIn course. Skipping course_skills mapping.');
      console.log('   You can manually link skills to the course in the database.');
      return;
    }

    console.log(`\n📚 Found course: "${courseData.title}"`);

    // 3. Link the three main skills to the course
    const skillsToLink = [
      'LinkedIn Profile Optimization',
      'Professional Branding',
      'AI for Career Development'
    ];

    const { data: linkedSkills } = await supabase
      .from('skills')
      .select('id, name')
      .in('name', skillsToLink);

    if (!linkedSkills || linkedSkills.length === 0) {
      console.log('⚠️  Could not find skills to link');
      return;
    }

    const courseSkillsData = linkedSkills.map(skill => ({
      course_id: courseData.id,
      skill_id: skill.id,
      proficiency_level: 'intermediate',
      weight: 2
    }));

    const { data: mappedSkills, error: mapError } = await supabase
      .from('course_skills')
      .upsert(courseSkillsData, { onConflict: 'course_id,skill_id' })
      .select();

    if (mapError) {
      console.error('❌ Error mapping skills to course:', mapError.message);
      return;
    }

    console.log(`\n✅ Linked ${mappedSkills?.length || 0} skills to course:`);
    linkedSkills?.forEach(skill => {
      console.log(`   • ${skill.name}`);
    });

    console.log('\n🎉 Skill seeding completed successfully!');
    console.log('\nStudents who complete the "LinkedIn Optimization with AI" course');
    console.log('will now automatically gain these skills with their quiz scores!\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

seedSkills();
