// Script to re-generate and upload missing certificate PDFs for already approved enrollments
import 'dotenv/config';
import { supabase } from '@/lib/supabase';
import { generateAndUploadCertificate } from '@/app/admin/certificate-generation';

async function regenerateMissingCertificates() {
  // 1. Find all approved enrollments missing certificate_url
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('id, user_id, course_id')
    .eq('certificate_status', 'approved')
    .is('certificate_url', null);

  if (error) {
    console.error('Error fetching enrollments:', error);
    return;
  }

  if (!enrollments || enrollments.length === 0) {
    console.log('No missing certificates found.');
    return;
  }

  for (const enrollment of enrollments) {
    try {
      // Fetch user info
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', enrollment.user_id)
        .single();
      if (userError || !user) throw userError || new Error('User not found');

      // Fetch course info
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('title, instructor_id')
        .eq('id', enrollment.course_id)
        .single();
      if (courseError || !course) throw courseError || new Error('Course not found');

      // Fetch instructor info
      const { data: instructor, error: instructorError } = await supabase
        .from('users')
        .select('name')
        .eq('id', course.instructor_id)
        .single();
      if (instructorError || !instructor) throw instructorError || new Error('Instructor not found');

      // Generate and upload certificate PDF
      const certificateUrl = await generateAndUploadCertificate({
        enrollmentId: enrollment.id,
        studentName: user.name || '',
        courseTitle: course.title || '',
        instructorName: instructor.name || '',
      });

      // Update enrollment with certificate_url
      await supabase
        .from('enrollments')
        .update({ certificate_url: certificateUrl })
        .eq('id', enrollment.id);

      console.log(`Certificate generated for enrollment ${enrollment.id}`);
    } catch (err) {
      console.error(`Error processing enrollment ${enrollment.id}:`, err);
    }
  }

  console.log('Certificate regeneration complete.');
}

regenerateMissingCertificates();
