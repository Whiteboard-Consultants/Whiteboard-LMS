
import React from 'react';
import { supabase } from '@/lib/supabase';
import { renderToBuffer } from '@react-pdf/renderer';
import CertificatePDF from '@/components/CertificatePDF';
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
  // 1. Render PDF to buffer
  try {
    const formattedDate = format(date, 'MMMM d, yyyy');
    console.log('[Certificate] Generating PDF for:', { studentName, courseTitle, instructorName, formattedDate });
    const pdfBuffer = await renderToBuffer(
      <CertificatePDF
        studentName={studentName}
        courseTitle={courseTitle}
        date={formattedDate}
        instructorName={instructorName}
      />
    );

    // 2. Upload to Supabase Storage
    const filePath = `certificates/${enrollmentId}.pdf`;
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (error) {
      console.error('[Certificate] Error uploading PDF:', error, { filePath });
      throw new Error('Failed to upload certificate PDF: ' + error.message);
    }

    // 3. Get public URL
    const { data: publicUrlData, error: publicUrlError } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl;

    if (publicUrlError || !publicUrl) {
      console.error('[Certificate] Error getting public URL:', publicUrlError, { filePath });
      throw new Error('Failed to get public URL for certificate PDF');
    }

    // 4. Update enrollment with certificate_url
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ certificate_url: publicUrl })
      .eq('id', enrollmentId);

    if (updateError) {
      console.error('[Certificate] Error updating enrollment with certificate URL:', updateError, { enrollmentId, publicUrl });
      throw new Error('Failed to update enrollment with certificate URL');
    }

    console.log('[Certificate] PDF generated and uploaded successfully:', { enrollmentId, publicUrl });
    return publicUrl;
  } catch (err) {
    console.error('[Certificate] Fatal error in generateAndUploadCertificate:', err, { enrollmentId, studentName, courseTitle, instructorName });
    throw err;
  }
}
