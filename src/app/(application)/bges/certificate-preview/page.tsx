'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CertificatePrintStyles,
  RiasecParticipationCertificate,
} from '@/components/riasec/RiasecParticipationCertificate';
import { Lato } from 'next/font/google';

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const STUDENT_NAME = 'Navnit Daniel Alley';
const COMPLETION_DATE = 'July 29, 2026';

/**
 * Temporary visual preview for the BGES RIASEC participation certificate.
 * Visit: http://localhost:3000/bges/certificate-preview
 */
export default function BgesCertificatePreviewPage() {
  return (
    <>
      <CertificatePrintStyles />
      <div className={`${lato.className} flex min-h-screen flex-col items-center bg-slate-200 p-4 sm:p-8`}>
        <div className="print-hidden mb-4 flex w-full max-w-5xl items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            Dummy preview — {STUDENT_NAME} · {COMPLETION_DATE}
          </p>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>

        <RiasecParticipationCertificate
          studentName={STUDENT_NAME}
          completionDate={COMPLETION_DATE}
        />
      </div>
    </>
  );
}
