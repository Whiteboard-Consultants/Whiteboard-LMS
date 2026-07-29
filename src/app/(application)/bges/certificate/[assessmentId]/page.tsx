'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Printer } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  CertificatePrintStyles,
  formatCertificateDate,
  RiasecParticipationCertificate,
} from '@/components/riasec/RiasecParticipationCertificate';
import { Lato } from 'next/font/google';

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

type CertificatePayload = {
  id: string;
  fullName: string | null;
  completedAt: string;
  campaign: string | null;
};

export default function BgesCertificatePage() {
  const params = useParams();
  const assessmentId = params.assessmentId as string;
  const [data, setData] = useState<CertificatePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/riasec/certificate/${assessmentId}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || 'Failed to load certificate');
        }
        setData(json.assessment);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load certificate');
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) {
      void load();
    }
  }, [assessmentId]);

  if (loading) {
    return (
      <div className={`${lato.className} flex min-h-screen items-center justify-center bg-slate-200`}>
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(209,100%,29%)]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${lato.className} flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-200 p-6`}>
        <p className="text-destructive">{error || 'Certificate not found'}</p>
        <Button asChild variant="outline">
          <Link href="/bges">Back to event</Link>
        </Button>
      </div>
    );
  }

  const studentName = data.fullName?.trim() || 'Participant';
  const completionDate = formatCertificateDate(data.completedAt);

  return (
    <>
      <CertificatePrintStyles />
      <div className={`${lato.className} flex min-h-screen flex-col items-center bg-slate-200 p-4 sm:p-8`}>
        <div className="print-hidden mb-4 flex w-full max-w-5xl items-center justify-between gap-3">
          <Button asChild variant="outline">
            <Link href="/bges">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button type="button" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>

        <RiasecParticipationCertificate
          studentName={studentName}
          completionDate={completionDate}
        />
      </div>
    </>
  );
}
