
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

interface GenerateAndUploadCertificateParams {
  enrollmentId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  date?: Date;
}

export async function generateAndUploadCertificate({
  enrollmentId,
  studentName,
  courseTitle,
  instructorName,
  date = new Date(),
}: GenerateAndUploadCertificateParams) {
  try {
    const formattedDate = format(date, 'dd MMMM yyyy');
    console.log('[Certificate] Generating certificate for:', { studentName, courseTitle, instructorName, formattedDate });
    
    // Generate a certificate URL (placeholder - in production, generate actual PDF)
    const certificateUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/certificates/${enrollmentId}.pdf`;
    
    // Update enrollment with certificate_url
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ 
        certificate_url: certificateUrl,
        certificate_approved_at: new Date().toISOString()
      })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('[Certificate] Error updating enrollment with certificate URL:', updateError, { enrollmentId, certificateUrl });
      throw new Error('Failed to update enrollment with certificate URL: ' + updateError.message);
    }

    console.log('[Certificate] Certificate approved and URL set:', { enrollmentId, certificateUrl });
    return certificateUrl;
  } catch (err) {
    console.error('[Certificate] Fatal error in generateAndUploadCertificate:', err, { enrollmentId, studentName, courseTitle, instructorName });
    throw err;
  }
}
