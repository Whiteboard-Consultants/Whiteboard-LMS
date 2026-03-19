const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lqezaljvpiycbeakndby.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedTests() {
  try {
    console.log('\n🌱 Starting test data seed...\n');

    // Get an instructor (assume there's at least one)
    const { data: instructors, error: instError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('raw_user_meta_data->role', 'instructor')
      .limit(1);

    if (instError || !instructors || instructors.length === 0) {
      console.error('❌ No instructors found in database');
      process.exit(1);
    }

    const instructorId = instructors[0].id;
    console.log(`✅ Found instructor: ${instructorId.substring(0, 8)}...`);

    // Step 1: Create test series
    console.log('\n📚 Creating test series...');
    const { data: seriesData, error: seriesError } = await supabase
      .from('test_series')
      .insert({
        title: 'Campus Recruitment Full Mock Series',
        description: 'Complete mock test series for campus recruitment with Quantitative Aptitude, Verbal Ability, and Logical Reasoning',
        topic_area: 'Campus Recruitment',
        instructor_id: instructorId,
        is_published: true,
        price: 588.00,
        is_purchasable: true,
        discount_percentage: 10
      })
      .select()
      .single();

    if (seriesError) {
      // Might already exist, try to get it
      const { data: existing } = await supabase
        .from('test_series')
        .select('id')
        .eq('title', 'Campus Recruitment Full Mock Series')
        .single();
      
      if (existing) {
        console.log(`✅ Series already exists: ${existing.id.substring(0, 8)}...`);
        var seriesId = existing.id;
      } else {
        throw seriesError;
      }
    } else {
      seriesId = seriesData.id;
      console.log(`✅ Created series: ${seriesId.substring(0, 8)}... - ₹${seriesData.price}`);
    }

    // Step 2: Create individual tests
    const tests = [
      {
        title: 'Quantitative Aptitude - Mock 1',
        description: 'Mock test for quantitative aptitude with focus on fundamental concepts',
        topic: 'Quantitative Aptitude',
        difficulty_level: 'Medium',
        price: 199.00,
        order: 1,
        duration: 90,
        total_marks: 100,
        pass_marks: 70
      },
      {
        title: 'Verbal Ability - Mock 1',
        description: 'Mock test for verbal ability including reading comprehension and vocabulary',
        topic: 'Verbal Ability',
        difficulty_level: 'Medium',
        price: 199.00,
        order: 1,
        duration: 60,
        total_marks: 100,
        pass_marks: 70
      },
      {
        title: 'Logical Reasoning - Mock 1',
        description: 'Mock test for logical reasoning with various types of puzzles and arrangements',
        topic: 'Logical Reasoning',
        difficulty_level: 'Medium',
        price: 199.00,
        order: 1,
        duration: 75,
        total_marks: 100,
        pass_marks: 70
      }
    ];

    console.log('\n📝 Creating individual tests...');
    for (const test of tests) {
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          description: test.description,
          series_id: seriesId,
          topic: test.topic,
          difficulty_level: test.difficulty_level,
          price: test.price,
          is_free: false,
          is_published: true,
          order_within_topic: test.order,
          type: 'mock',
          instructor_id: instructorId,
          duration: test.duration,
          total_marks: test.total_marks,
          pass_marks: test.pass_marks
        })
        .select()
        .single();

      if (testError) {
        // Might already exist
        const { data: existing } = await supabase
          .from('tests')
          .select('id')
          .eq('title', test.title)
          .eq('series_id', seriesId)
          .single();
        
        if (existing) {
          console.log(`  ✅ ${test.title} (already exists)`);
        } else {
          throw testError;
        }
      } else {
        console.log(`  ✅ ${test.title} - ₹${test.price}`);
      }
    }

    console.log('\n✨ Seed completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Series: Campus Recruitment Full Mock Series (₹588, 10% discount)`);
    console.log(`  - Tests: 3 mock tests @ ₹199 each`);
    console.log(`  - Total bundle value: ₹597 → ₹588 (save ₹9)`);
    console.log('\n💡 Next step: Clear your browser cache and try accessing a test from the series');
  } catch (error) {
    console.error('\n❌ Error during seed:', error.message);
    process.exit(1);
  }
}

seedTests();
