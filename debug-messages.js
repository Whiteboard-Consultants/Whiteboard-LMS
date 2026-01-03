const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

async function checkMessages() {
  try {
    const { data: students } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .eq('role', 'student')
      .limit(1);

    if (!students || students.length === 0) {
      console.log('No students found');
      return;
    }

    const student = students[0];
    console.log(`\n✓ Found student: ${student.name} (${student.id})`);

    const { data: threads } = await supabaseAdmin
      .from('message_threads')
      .select('*')
      .eq('student_id', student.id);

    console.log(`\n✓ Found ${threads?.length || 0} message threads for student`);
    
    if (threads && threads.length > 0) {
      threads.forEach(t => {
        console.log(`  - ${t.title} (${t.is_closed ? 'closed' : 'open'})`);
      });
    } else {
      console.log('\n⚠️ No message threads exist');
      console.log('Creating test data...\n');

      const { data: courses } = await supabaseAdmin
        .from('courses')
        .select('id, title, instructor_id')
        .limit(1);

      if (!courses || courses.length === 0) {
        console.error('No courses found');
        return;
      }

      const course = courses[0];
      console.log(`✓ Using course: ${course.title}`);

      // Get or create enrollment
      const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('id')
        .eq('user_id', student.id)
        .eq('course_id', course.id)
        .limit(1);

      let enrollmentId;
      if (enrollments && enrollments.length > 0) {
        enrollmentId = enrollments[0].id;
      } else {
        const { data: newEnroll, error: enrollError } = await supabaseAdmin
          .from('enrollments')
          .insert({
            user_id: student.id,
            course_id: course.id,
            instructor_id: course.instructor_id,
            student_name: student.name,
            course_title: course.title,
            progress: 0,
            completed: false,
          })
          .select()
          .single();
        
        if (enrollError) {
          console.error('Error creating enrollment:', enrollError);
          return;
        }
        enrollmentId = newEnroll.id;
      }

      // Create thread
      const { data: newThread } = await supabaseAdmin
        .from('message_threads')
        .insert({
          title: 'Question about course material',
          description: 'I have a question regarding the assignment',
          course_id: course.id,
          enrollment_id: enrollmentId,
          instructor_id: course.instructor_id,
          student_id: student.id,
          is_closed: false,
        })
        .select()
        .single();

      console.log(`✓ Created thread: ${newThread.title}`);

      // Student message
      await supabaseAdmin
        .from('messages')
        .insert({
          thread_id: newThread.id,
          sender_id: student.id,
          body: 'Hi, I would like to clarify something about the assignment requirements.',
        });

      console.log(`✓ Created student message`);

      // Instructor reply
      await supabaseAdmin
        .from('messages')
        .insert({
          thread_id: newThread.id,
          sender_id: course.instructor_id,
          body: 'Hello! Thanks for reaching out. I would be happy to clarify the requirements.',
        });

      console.log(`✓ Created instructor reply\n`);
      console.log('✅ Test data created! Refresh the page to see the message thread');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

checkMessages();
