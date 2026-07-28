import {
  BriefcaseBusiness,
  Globe2,
  GraduationCap,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

type PathwayCard = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
};

const CARDS: PathwayCard[] = [
  {
    icon: Globe2,
    eyebrow: 'Study Abroad',
    title:
      'Study Abroad: Build global careers in fintech, AI/ML and management',
    body: 'Explore international programs in fintech, business analytics, data science, AI & ML, digital finance and technology‑focused MBAs across leading study destinations. We help you select universities and courses that directly map to high‑growth roles highlighted in the Future of Jobs Report 2025—Fintech Engineers, Big Data Specialists, AI & ML Specialists, and technology‑savvy.',
    points: [
      'Shortlist countries, universities and programs where fintech, AI/ML and tech MBAs are strategic priorities.',
      'Get guidance on admissions, SOPs, scholarships and visas for future‑ready degrees.',
      'Understand the ROI and global career pathways for fintech, AI/ML and management programs.',
    ],
  },
  {
    icon: GraduationCap,
    eyebrow: 'Foreign Universities in India',
    title:
      'Foreign Universities in India: Global‑standard tech and management programs, Indian campuses',
    body: 'Access foreign universities in India that offer cutting‑edge programs at the intersection of business, finance and technology—such as analytics, fintech and digital transformation—at campuses like UOW India and Deakin GIFT City. These programs embed AI, data and innovation into the curriculum, aligning with the Future of Jobs 2025 demand for fintech engineers and AI & ML specialists.',
    points: [
      'Discover India‑based foreign campuses with strong fintech, analytics and technology‑management offerings.',
      'Learn how these degrees can serve as a bridge to global fintech and AI/ML roles while you study in India.',
      'Get clarity on admission processes, credit transfer possibilities and future mobility options.',
    ],
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: 'Career Counselling',
    title: 'Career Counselling: Align your path with fintech, AI/ML and MBAs',
    body: 'Our counsellors help you navigate the evolving job market in financial technology and AI, and design a roadmap that connects your current profile to advanced degrees and future roles. We work with you to clarify whether you should target specialised master’s programs in fintech or data science, AI/ML‑focused tracks, technology‑driven MBAs, or a combination over time.',
    points: [
      'One‑on‑one sessions to map your interests and strengths to fintech, AI/ML and management roles.',
      'Guidance on sequencing: certifications → specialised master’s → MBA, depending on your goals and experience.',
      'A personalised plan linking skills, internships, projects and higher studies to in‑demand job roles.',
    ],
  },
  {
    icon: Sparkles,
    eyebrow: 'Upskill',
    title:
      'Online Degrees & Certifications: Build the skills that future fintech and AI roles demand',
    body: 'With a large share of today’s skills projected to become outdated by 2030, structured upskilling in AI, data and digital finance is essential. Through our focused learning programs, we help you build practical capabilities in analytics tools, programming foundations, AI literacy, cybersecurity basics and high‑impact professional skills like communication, problem‑solving and leadership.',
    points: [
      'Skill tracks aligned with high‑growth roles: fintech engineer, AI/ML specialist, big data analyst and tech‑savvy manager.',
      'Hands‑on exposure to tools and concepts: data analysis, dashboards, algorithm fundamentals, digital risk awareness.',
      'Integration with your study‑abroad or foreign‑campus plans, so your degree and skills reinforce each other.',
    ],
  },
];

export function BgesPathwaysSection() {
  return (
    <section className="relative overflow-hidden bg-[hsl(209,100%,29%)] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 50% at 15% 10%, rgba(56,189,248,0.28), transparent 55%), radial-gradient(ellipse 60% 45% at 90% 80%, rgba(232,160,32,0.18), transparent 50%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.06), transparent 60%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-3xl sm:mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-200">
            Your pathways
          </p>
          <h2 className="mt-3 text-balance text-2xl font-bold leading-snug tracking-tight sm:text-3xl xl:text-4xl">
            Four ways to future‑proof your career in fintech, AI/ML and management
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:gap-8">
          {CARDS.map(({ icon: Icon, eyebrow, title, body, points }) => (
            <article
              key={title}
              className="group flex h-full flex-col rounded-2xl border border-white/25 bg-white/10 p-6 shadow-[0_8px_32px_rgba(0,30,60,0.25)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/15 sm:p-7"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/25 bg-white/15 text-[#E8A020] shadow-inner">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-100/90">
                  {eyebrow}
                </p>
              </div>

              <h3 className="text-xl font-bold leading-snug tracking-tight text-white">
                {title}
              </h3>

              <p className="mt-4 text-[16px] leading-relaxed text-sky-50/90">
                {body}
              </p>

              <ul className="mt-5 space-y-3 border-t border-white/15 pt-5">
                {points.map((point) => (
                  <li key={point} className="flex gap-3 text-[16px] leading-relaxed text-sky-50/85">
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E8A020]"
                      aria-hidden
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
