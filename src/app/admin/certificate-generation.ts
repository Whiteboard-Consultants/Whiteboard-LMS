
import { supabaseAdmin } from '@/lib/supabase';
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
    
    console.log('[Certificate] Certificate URL generated:', { enrollmentId, certificateUrl });
    return certificateUrl;
  } catch (err) {
    console.error('[Certificate] Fatal error in generateAndUploadCertificate:', err, { enrollmentId, studentName, courseTitle, instructorName });
    throw err;
  }
}
