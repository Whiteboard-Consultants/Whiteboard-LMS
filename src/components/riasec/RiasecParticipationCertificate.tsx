'use client';

import { Great_Vibes, Lato } from 'next/font/google';

const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

const lato = Lato({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export type RiasecParticipationCertificateProps = {
  studentName: string;
  completionDate: string;
  className?: string;
};

export function formatCertificateDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * BGES RIASEC Certificate of Participation — HTML overlay on certificate.webp
 */
export function RiasecParticipationCertificate({
  studentName,
  completionDate,
  className = '',
}: RiasecParticipationCertificateProps) {
  return (
    <div
      id="certificate-content"
      className={`${lato.className} relative w-full max-w-5xl aspect-[1.414/1] bg-white shadow-2xl overflow-hidden ${className}`}
      style={{
        backgroundImage: 'url(/certificate.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center calc(50% - 3%)',
      }}
    >
      <div className="relative z-10 flex h-full flex-col items-center px-[8%] pt-[7%] pb-[6%] text-center text-slate-900">
        <div className="mt-[2%]">
          <h1
            className={`${greatVibes.className} leading-none text-black`}
            style={{ fontSize: 'clamp(3rem, 8vw, 114px)' }}
          >
            Certificate
          </h1>
          <p
            className="mt-1 font-normal tracking-wide text-black"
            style={{ fontSize: 'clamp(1.25rem, 3.2vw, 48px)' }}
          >
            Of Participation
          </p>
        </div>

        <p
          className="mt-[3.5%] text-black"
          style={{ fontSize: 'clamp(0.9rem, 1.6vw, 24px)' }}
        >
          This Certificate is proudly presented to
        </p>

        <h2
          className={`${greatVibes.className} mt-[1.5%] text-[#004B93] leading-tight`}
          style={{ fontSize: 'clamp(2rem, 5vw, 72px)' }}
        >
          {studentName}
        </h2>
        <div className="mt-2 h-px w-[70%] max-w-xl bg-slate-800/80" />

        <p
          className="mt-[2.5%] max-w-2xl text-black leading-relaxed"
          style={{ fontSize: 'clamp(0.75rem, 1.1vw, 15px)' }}
        >
          For successfully completing the RIASEC Test and Participating in the{' '}
          <span className="font-bold">&quot;Future of Jobs&quot;</span> Seminar
        </p>

        <p
          className="mt-[1.25%] mb-[8%] text-black"
          style={{ fontSize: 'clamp(0.75rem, 1.1vw, 15px)' }}
        >
          Date of completion: {completionDate}
        </p>

        <div
          className="mt-auto grid w-full grid-cols-[1fr_18%_1fr] items-start gap-x-2 px-[6%] pb-[1%]"
          style={{ fontSize: 'clamp(0.7rem, 1.05vw, 15px)' }}
        >
          <div className="text-center">
            <p className="font-bold uppercase tracking-wide leading-none">
              PRATEEK CHAUDHURI
            </p>
            <div className="mx-auto my-1 h-px w-full min-w-[8rem] bg-slate-700" />
            <p className="uppercase tracking-wide">MENTOR</p>
          </div>

          <div aria-hidden />

          <div className="text-center">
            <p className="font-bold uppercase tracking-wide leading-none">
              WHITEBOARD CONSULTANTS
            </p>
            <div className="mx-auto my-1 h-px w-full min-w-[8rem] bg-slate-700" />
            <p className="uppercase tracking-wide">MANAGEMENT</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificatePrintStyles() {
  return (
    <style>{`
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body * {
          visibility: hidden;
        }
        #certificate-content, #certificate-content * {
          visibility: visible;
        }
        #certificate-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          margin: 0;
          padding: 0;
          border: none;
          box-shadow: none !important;
        }
        .print-hidden {
          display: none !important;
        }
      }
    `}</style>
  );
}
