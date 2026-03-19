const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAttempts() {
  try {
    console.log('🔍 Fetching recent test attempts...\n');

    // Get the most recent test attempts
    const { data: attempts, error } = await supabase
      .from('test_attempts')
      .select('id, test_id, user_id, score, total_marks, answers, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Error fetching attempts:', error);
      return;
    }

    if (!attempts || attempts.length === 0) {
      console.log('No test attempts found');
      return;
    }

    console.log(`Found ${attempts.length} recent attempts:\n`);

    for (const attempt of attempts) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`Attempt ID: ${attempt.id}`);
      console.log(`Test ID: ${attempt.test_id}`);
      console.log(`Score: ${attempt.score}/${attempt.total_marks}`);
      console.log(`Created: ${attempt.created_at}`);
      console.log(`\nAnswers Field:`);
      console.log(`  Type: ${typeof attempt.answers}`);
      console.log(`  Is Array: ${Array.isArray(attempt.answers)}`);
      console.log(`  Raw Value: ${JSON.stringify(attempt.answers)}`);
      
      if (Array.isArray(attempt.answers)) {
        console.log(`  Length: ${attempt.answers.length}`);
        console.log(`  First 10 items: ${attempt.answers.slice(0, 10).join(', ')}`);
      } else if (attempt.answers === null || attempt.answers === undefined) {
        console.log('  ⚠️ Answers is NULL or UNDEFINED');
      } else {
        console.log(`  ⚠️ Unexpected type for answers`);
      }
    }
    
    // Also check a specific test to see how many questions it has
    if (attempts.length > 0 && attempts[0].test_id) {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🔍 Checking test questions for the first attempt...');
      
      const { data: questions, error: qError } = await supabase
        .from('test_questions')
        .select('id, question_text, correct_answer, order_number')
        .eq('test_id', attempts[0].test_id)
        .order('order_number', { ascending: true });
      
      if (!qError && questions) {
        console.log(`Found ${questions.length} questions`);
        console.log(`Attempt has ${Array.isArray(attempts[0].answers) ? attempts[0].answers.length : 'unknown'} answers`);
        if (questions.length > 0) {
          console.log('\nFirst 3 questions & answers:');
          questions.slice(0, 3).forEach((q, idx) => {
            const studentAnswer = Array.isArray(attempts[0].answers) ? attempts[0].answers[idx] : undefined;
            console.log(`  Q${idx + 1}: correct=${q.correct_answer}, student=${studentAnswer}`);
          });
        }
      }
    }

  } catch (err) {
    console.error('❌ Exception occurred:', err);
  }
}

debugAttempts();
