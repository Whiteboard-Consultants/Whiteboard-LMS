export const GCC_HERO_DESTINATIONS = [
  'UK',
  'Germany',
  'France',
  'Dubai',
  'India',
  '...and Others',
] as const;

export const GCC_EVENT_FACTS = [
  { label: 'Dates', value: 'September 30 & October 1, 2026' },
  {
    label: 'Time',
    value: '10:00 AM – 5:00 PM (Day 1 Expo)\n10:30 AM - 1:30 PM (Day 2 Fintech Masterclass)',
  },
  { label: 'Venue', value: 'Bhawanipur Global Campus, Kolkata' },
  {
    label: 'Organized by',
    value:
      'Higher Education Development Centre (HEDC), Bhawanipur Global Campus in partnership with Whiteboard Consultants',
  },
] as const;

export const GCC_WHY_ATTEND = [
  {
    title: 'Direct 1-on-1 University Access',
    description:
      'Skip generic search engines and speak face-to-face with official representatives from leading international universities.',
  },
  {
    title: '15-Minute Institutional Briefings',
    description:
      'Get quick, structured insights into top global programs, eligibility criteria, and upcoming intake deadlines.',
  },
  {
    title: 'On-the-Spot Profile Evaluation',
    description:
      'Receive personalized guidance regarding course selection, post-study work visas, and admission requirements.',
  },
  {
    title: 'Scholarships & Financial Aid',
    description:
      'Uncover exclusive funding, grants, and practical education loan roadmaps directly from experts.',
  },
  {
    title: 'Fintech Industry Spotlight',
    description:
      'FinTech Rewired: Money. Markets. Machines. — an exclusive masterclass with Dr. Hiteksha Upadhyay of the University of Wollongong Australia in India, GIFT City.',
  },
] as const;

export const GCC_SCHEDULE = [
  {
    day: 'Day 1',
    date: 'September 30, 2026',
    time: '10:00 AM – 5:00 PM',
    track: 'Global Career Camp 2026',
    expect: [
      'Live Spotlights: 15-min university presentations',
      'Dedicated Counselling Desks: 1-on-1 consultations',
      'Advisory Zones: Visa, documentation, IELTS/GRE prep & education loans',
    ],
    audience: 'All Undergraduate & Postgraduate Students',
  },
  {
    day: 'Day 2',
    date: 'October 1, 2026',
    time: '10:30 AM - 1:30 PM',
    track: 'FinTech Rewired: Money. Markets. Machines.',
    question: 'Can You Trust an Algorithm With Your Money?',
    expect: [
      'Led by Dr. Hiteksha Upadhyay, Assistant Professor of Finance and Business Analytics, University of Wollongong Australia in India, GIFT City',
    ],
    audience: 'Curated for 3rd-Year BBA Cohorts',
  },
] as const;

export const GCC_MASTERCLASS_HIGHLIGHTS = [
  'How financial services were unbundled, and what replaced the traditional bank.',
  'Payment rails, settlement speed and the infrastructure beneath everyday transactions.',
  'Why scale and speed made algorithmic decision-making unavoidable in finance.',
  'How a credit decision is constructed: the five Cs, credit scores and underwriting logic.',
  'Traditional scorecards compared with machine-learning models: accuracy, explainability and audit.',
  'Career opportunities in model risk, governance, credit analytics and financial technology.',
] as const;

export const GCC_SPEAKER = {
  name: 'Dr. Hiteksha Upadhyay',
  bio: 'Dr. Hiteksha Upadhyay is an Assistant Professor of Finance and Business Analytics at the University of Wollongong Australia in India, GIFT City. An accomplished academician, researcher, data storyteller, and finance professional, she brings more than 15 years of experience in higher education, academic coordination, research, and student mentoring.',
} as const;

export const GCC_ZONES = [
  {
    number: '01',
    title: 'University Presentation Briefings',
    when: 'Day 1',
    intro:
      'Attend concise 15-minute spotlight sessions presented by visiting global university delegates covering:',
    points: [
      'University profiles, campus life, and core academic strengths',
      'Popular degree programs, specializations, and curriculum design',
      'Application timelines, cutoff criteria, and standardized test targets',
      'Post-study work rights and regional employment prospects',
    ],
  },
  {
    number: '02',
    title: 'Dedicated 1-on-1 Counselling Desks',
    when: 'Day 1',
    intro:
      'Sit down individually with official university representatives and certified advisors to address your specific goals:',
    points: [
      'Profile Assessment: Evaluate your transcripts and build a targeted application strategy.',
      'Country Matching: Compare living costs, work permits, and culture across the UK, USA, Germany, France, New Zealand, and more.',
      'Scholarship Navigation: Discover university-specific aid and merit scholarships tailored to international applicants.',
    ],
  },
  {
    number: '03',
    title: 'FinTech Rewired: Money. Markets. Machines.',
    when: 'Day 2',
    intro:
      'Can You Trust an Algorithm With Your Money? An exclusive masterclass with Dr. Hiteksha Upadhyay at the University of Wollongong Australia in India, GIFT City.',
    points: GCC_MASTERCLASS_HIGHLIGHTS,
  },
] as const;

export const GCC_FAQS = [
  {
    question: 'Is Global Career Camp 2026 free to attend?',
    answer:
      'Yes. Reserve a free pass. There is no ticket fee for the campus expo or the sessions listed on this page.',
  },
  {
    question: 'Who should attend?',
    answer:
      'Day 1 is open to all undergraduate and postgraduate students. The Day 2 Fintech Masterclass is curated for 3rd-year BBA cohorts.',
  },
  {
    question: 'Which study destinations are featured?',
    answer:
      'UK, USA, Germany, France, New Zealand, Dubai, and India.',
  },
  {
    question: 'Where and when is the event?',
    answer:
      'Bhawanipur Global Campus, Kolkata. Day 1 is September 30, 2026, from 10:00 AM to 5:00 PM. Day 2 is October 1, 2026, from 10:30 AM to 1:30 PM.',
  },
] as const;
