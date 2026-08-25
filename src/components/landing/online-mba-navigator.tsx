'use client';

import { Lato, Montserrat } from 'next/font/google';
import { cn } from '@/lib/utils';

const lato = Lato({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const COLORS = {
  primary: '#004B93',
  bgBlue: '#005CB4',
  red: '#C9002B',
  dark: '#1A2340',
  midblue: '#1A6CC8',
  teal: '#00A99D',
  gold: '#E8A020',
  cream: '#F5F7FA',
} as const;

function ChipIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="14" y="14" width="20" height="20" rx="3" stroke={color} strokeWidth="2.5" />
      <rect x="20" y="20" width="8" height="8" rx="1.5" fill={color} />
      <line x1="24" y1="4" x2="24" y2="14" stroke={color} strokeWidth="2.5" />
      <line x1="24" y1="34" x2="24" y2="44" stroke={color} strokeWidth="2.5" />
      <line x1="4" y1="24" x2="14" y2="24" stroke={color} strokeWidth="2.5" />
      <line x1="34" y1="24" x2="44" y2="24" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

function AiIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="24" cy="20" r="12" stroke={color} strokeWidth="2.5" />
      <path
        d="M24 8v4M24 32v6M12 20h4M32 20h4"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M18 40h12" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="20" r="4" fill={color} />
    </svg>
  );
}

function TargetIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="20" cy="20" r="15" stroke={color} strokeWidth="2.5" />
      <circle cx="20" cy="20" r="9" stroke={color} strokeWidth="2.5" />
      <circle cx="20" cy="20" r="3" fill={color} />
      <path d="M30 10l8-4-4 8-8 4z" fill={color} />
    </svg>
  );
}

function ScalesIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <line x1="24" y1="6" x2="24" y2="30" stroke={color} strokeWidth="2.5" />
      <path d="M8 14h16M40 14H24" stroke={color} strokeWidth="2.5" />
      <path
        d="M4 14l4 8h8l-4-8z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M32 14l4 8h8l-4-8z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="14" y="34" width="20" height="8" rx="2" stroke={color} strokeWidth="2.5" />
    </svg>
  );
}

function GrowthIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <polyline
        points="6,38 16,28 24,34 42,12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points="32,12 42,12 42,22"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="42" cy="10" r="5" fill="none" stroke={color} strokeWidth="2" />
      <text
        x="42"
        y="13"
        fontSize="6"
        textAnchor="middle"
        fill={color}
        className={montserrat.className}
      >
        CDO
      </text>
    </svg>
  );
}

function ForkIcon({ color }: { color: string }) {
  return (
    <svg className="h-11 w-11 shrink-0" viewBox="0 0 48 48" fill="none" aria-hidden>
      <line x1="24" y1="44" x2="24" y2="22" stroke={color} strokeWidth="2.5" />
      <path
        d="M24 22C24 14 14 14 14 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 22C24 14 34 14 34 6"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="14" cy="6" r="3.5" fill={color} />
      <circle cx="34" cy="6" r="3.5" fill={color} />
    </svg>
  );
}

function PersonIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function CompassGraphic() {
  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 220 220"
      className="mx-auto h-36 w-36 sm:h-44 sm:w-44"
      aria-hidden
    >
      <circle cx="110" cy="110" r="96" fill="none" stroke={COLORS.teal} strokeWidth="2" />
      <circle
        cx="110"
        cy="110"
        r="80"
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="1.5"
        strokeDasharray="3 4"
      />
      <g>
        <polygon points="110,20 122,110 110,200 98,110" fill={COLORS.primary} />
        <polygon points="20,110 110,98 200,110 110,122" fill={COLORS.teal} />
      </g>
      <g transform="rotate(45 110 110)">
        <polygon points="110,45 118,110 110,175 102,110" fill={COLORS.gold} />
        <polygon points="45,110 110,102 175,110 110,118" fill={COLORS.gold} />
      </g>
      <circle
        cx="110"
        cy="110"
        r="12"
        fill="#FFFFFF"
        stroke={COLORS.dark}
        strokeWidth="2.5"
      />
    </svg>
  );
}

type Accent = 'teal' | 'gold' | 'midblue';

const ACCENT: Record<Accent, string> = {
  teal: COLORS.teal,
  gold: COLORS.gold,
  midblue: COLORS.midblue,
};

function PivotCard({
  accent,
  title,
  description,
  icon,
  align = 'left',
}: {
  accent: Accent;
  title: string;
  description: string;
  icon: React.ReactNode;
  align?: 'left' | 'right';
}) {
  const color = ACCENT[accent];

  return (
    <div
      className={cn(
        'mb-4 rounded-[10px] border border-[#E3E7EE] border-l-[5px] bg-white p-5 shadow-[0_1px_3px_rgba(26,35,64,0.06)] last:mb-0',
        align === 'right' && 'lg:text-right'
      )}
      style={{ borderLeftColor: color }}
    >
      <div className={cn('mb-3.5', align === 'right' && 'lg:flex lg:justify-end')}>{icon}</div>
      <h3 className="mb-2 text-[17px] font-bold leading-snug sm:text-[19px]" style={{ color: COLORS.dark }}>
        {title}
      </h3>
      <p className="text-[13px] leading-[1.55] text-[#4B5468] sm:text-[13.5px]">{description}</p>
    </div>
  );
}

const REC_ROWS = [
  {
    label: 'Reporting Pro',
    sub: 'No coding',
    track: 'Business Analytics',
    result: 'CU Online / NMIMS',
    color: COLORS.midblue,
    dotBg: '#E6F1FB',
    rowBg: '#F3F7FC',
  },
  {
    label: 'CS / IT',
    sub: '1+ yrs experience',
    track: 'Data Science / BI',
    result: 'Manipal MAHE / JAIN',
    color: COLORS.teal,
    dotBg: '#E1F5EE',
    rowBg: '#F0FAF9',
  },
  {
    label: 'Career Changer',
    sub: 'Any stream',
    track: 'General Management',
    result: 'ICFAI / Amity',
    color: COLORS.gold,
    dotBg: '#FAEEDA',
    rowBg: '#FCF6EC',
  },
] as const;

export function OnlineMbaNavigator() {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-[#E3E7EE] shadow-lg',
        lato.className
      )}
      style={{ background: COLORS.cream }}
    >
      <div
        className="relative flex items-center overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-10"
        style={{ background: COLORS.primary }}
      >
        <div
          className="pointer-events-none absolute -right-16 -top-32 h-[280px] w-[280px] rounded-full opacity-55 sm:h-[360px] sm:w-[360px]"
          style={{ background: COLORS.bgBlue }}
          aria-hidden
        />
        <h2
          className={cn(
            'relative z-10 text-xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-[32px] xl:text-[36px]',
            lato.className
          )}
        >
          The Online MBA Navigator: Matching Career Pain Points to Programs
        </h2>
      </div>

      <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.05fr_1fr] lg:gap-8 xl:gap-9">
          {/* Left */}
          <div>
            <p
              className={cn(
                'mb-5 text-[13px] font-bold uppercase tracking-[1.5px] sm:text-[15px]',
                montserrat.className
              )}
              style={{ color: COLORS.primary }}
            >
              Specialized &amp; Technical Career Pivots
            </p>
            <PivotCard
              accent="teal"
              icon={<ChipIcon color={COLORS.teal} />}
              title="The Tech-to-Leadership Pivot"
              description="Best for IT professionals seeking credit-linked, rigorous programs that respect their existing technical base."
            />
            <PivotCard
              accent="gold"
              icon={<AiIcon color={COLORS.gold} />}
              title="AI-Future Proofing for Any Background"
              description="Specialized tracks for non-technical graduates to gain business-relevant AI skills without a CS degree."
            />
            <PivotCard
              accent="midblue"
              icon={<TargetIcon color={COLORS.midblue} />}
              title="Industry-Specific Applied Analytics"
              description="Deep-dives for Finance (Fintech/Blockchain) and Marketing (Consumer Data/ROI) professionals to avoid role disruption."
            />
          </div>

          {/* Center */}
          <div className="flex flex-col">
            <div className="mb-4 flex justify-center">
              <CompassGraphic />
            </div>

            <div className="overflow-hidden rounded-[10px] border border-[#E3E7EE] bg-white shadow-[0_1px_3px_rgba(26,35,64,0.06)]">
              <div
                className={cn(
                  'px-3 py-3.5 text-center text-[12px] font-bold uppercase tracking-[1.2px] text-white sm:text-[14px]',
                  montserrat.className
                )}
                style={{ background: COLORS.primary }}
              >
                Recommendation Engine Overview
              </div>

              {REC_ROWS.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-1 gap-2 border-b border-[#EEF1F6] px-4 py-3.5 last:border-b-0 sm:grid-cols-[1.1fr_1.1fr_1fr] sm:items-center sm:gap-2 sm:px-5"
                  style={{ background: row.rowBg }}
                >
                  <div className="flex items-center gap-2.5 text-[13px] font-bold sm:text-[13.5px]" style={{ color: COLORS.dark }}>
                    <div
                      className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"
                      style={{ background: row.dotBg }}
                    >
                      <PersonIcon color={row.color} />
                    </div>
                    <span>
                      {row.label}
                      <span className="block text-[11px] font-normal text-[#7A8194]">{row.sub}</span>
                    </span>
                  </div>
                  <div className="text-left text-[13px] font-bold sm:text-center sm:text-[13.5px]" style={{ color: COLORS.dark }}>
                    {row.track}
                  </div>
                  <div
                    className="text-left text-[13px] font-bold sm:text-right"
                    style={{ color: COLORS.midblue }}
                  >
                    {row.result}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div>
            <p
              className={cn(
                'mb-5 text-[13px] font-bold uppercase tracking-[1.5px] lg:text-right sm:text-[15px]',
                montserrat.className
              )}
              style={{ color: COLORS.primary }}
            >
              Strategic Management &amp; Leadership
            </p>
            <PivotCard
              accent="teal"
              align="right"
              icon={<ScalesIcon color={COLORS.teal} />}
              title="Management-First Analytics"
              description="Prioritizes business framing over coding depth for professionals wanting analytics-led decisions without leaving their roles."
            />
            <PivotCard
              accent="gold"
              align="right"
              icon={<GrowthIcon color={COLORS.gold} />}
              title='The "Head of Analytics" Track'
              description="Designed for long-term pivots into CDO roles using research-based portfolio deliverables and capstones."
            />
            <PivotCard
              accent="midblue"
              align="right"
              icon={<ForkIcon color={COLORS.midblue} />}
              title="Flexible Generalist vs. Budget Options"
              description="Provides a choice between broad, brand-recognized flexible MBAs or high-value, no-frills budget programs."
            />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'flex flex-col gap-2 border-t border-[#E3E7EE] px-5 py-4 text-[12px] text-[#7A8194] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10',
          montserrat.className
        )}
      >
        <span>
          <b style={{ color: COLORS.primary }}>Whiteboard Consultants</b>
          {' · Your Future. Our Focus.'}
        </span>
        <span>whiteboardconsultant.com</span>
      </div>
    </div>
  );
}
