import { CheckCircle2 } from 'lucide-react';

const HIGHLIGHT = 'font-semibold text-[#E8A020]';

const BULLETS = [
  'Fintech is evolving through AI, Blockchain and Cybersecurity, driving demand for roles like Fintech Engineers, Data Security Analysts and Digital Product Leaders.',
  'AI and Machine Learning Specialists are among the top in‑demand roles to 2030, with global job postings for AI/ML talent growing far faster than the overall labour market.',
  'MBAs and management‑focused degrees that integrate Analytics, Technology and leadership are becoming critical for designing strategies around automation, AI adoption and Digital Finance.',
  'Core skills like Analytical Thinking, Technological Literacy, AI and Big Data, and human‑centred leadership are consistently ranked among the most important skills for the future of work.',
] as const;

export function BgesWhySection() {
  return (
    <section className="relative overflow-hidden bg-slate-50 text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(0,84,148,0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(232,160,32,0.1), transparent 50%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <h2 className="text-balance text-2xl font-bold leading-snug tracking-tight text-[hsl(209,100%,29%)] sm:text-3xl xl:text-4xl">
          Why Fintech, AI &amp; ML, and MBAs are at the centre of the Future of Jobs
        </h2>

        <p className="mt-6 text-[16px] leading-relaxed text-slate-700">
          AI and data‑driven technologies are set to be the most transformative
          trends of this decade, with{' '}
          <span className={HIGHLIGHT}>
            60% of employers expecting broad digital access and AI
          </span>{' '}
          to redefine their business models. In parallel, financial services are
          seeing a{' '}
          <span className={HIGHLIGHT}>
            228% projected increase in demand for AI and machine learning
            specialists
          </span>
          , as{' '}
          <span className={HIGHLIGHT}>
            nearly 95% of firms invest in AI solutions and automation
          </span>
          . This creates a unique opportunity for professionals who combine Fintech
          domain knowledge, AI/ML capabilities and strong management skills through
          advanced degrees like MBAs.
        </p>

        <ul className="mt-10 grid gap-5 sm:mt-12 sm:gap-6">
          {BULLETS.map((bullet) => (
            <li key={bullet} className="flex gap-3 sm:gap-4">
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-[#E8A020] sm:mt-1 sm:h-6 sm:w-6"
                aria-hidden
              />
              <p className="text-[16px] leading-relaxed text-slate-700">
                {bullet}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
