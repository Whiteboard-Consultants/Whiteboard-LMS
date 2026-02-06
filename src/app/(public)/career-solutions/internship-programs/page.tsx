'use client';

import { useState } from 'react';
import { Briefcase, Palette, Share2, TrendingUp, Code, ChevronDown, ChevronUp, MapPin, Clock, Award, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Program data structure
const internshipPrograms = [
  {
    id: 'pixel-prodigy',
    title: 'PIXEL PRODIGY',
    domain: 'Graphic Design',
    positions: '3-4',
    icon: Palette,
    gradient: 'blue' as const,
    objective: 'To provide hands-on experience in creating visual assets while developing a professional portfolio through real-world design projects.',
    responsibilities: [
      'Create visual content for marketing campaigns, social media, and website',
      'Design infographics, banners, brochures, and other promotional materials',
      'Collaborate with marketing team to understand brand guidelines and project requirements',
      'Assist in developing visual concepts and layouts that meet brand standards'
    ],
    deliverables: [
      'Complete design portfolio showcasing 5-7 major projects',
      'Creation of branded templates for ongoing company use',
      'Weekly progress reports on assigned projects',
      'Final presentation of work accomplished during internship'
    ],
    skillsGained: ['Graphic Design', 'Adobe Creative Suite', 'Brand Guidelines', 'Portfolio Development'],
  },
  {
    id: 'outreach-oracle',
    title: 'OUTREACH ORACLE',
    domain: 'Sales & Outreach',
    positions: '5',
    icon: Share2,
    gradient: 'purple' as const,
    objective: 'To provide practical experience in B2B/B2C sales processes while developing communication skills and understanding customer acquisition strategies.',
    responsibilities: [
      'Assist with lead generation and prospect research',
      'Draft outreach emails and follow-up communications',
      'Support sales team in scheduling meetings and demonstrations',
      'Help maintain CRM database accuracy',
      'Participate in sales meetings to understand deal progression'
    ],
    deliverables: [
      'Detailed prospect research reports',
      'Weekly activity logs showing outreach metrics',
      'Contribution to meeting scheduling success rate',
      'Documentation of best practices discovered during outreach'
    ],
    skillsGained: ['Sales Process', 'CRM Management', 'Email Outreach', 'Lead Generation'],
  },
  {
    id: 'media-maverick',
    title: 'MEDIA MAVERICK',
    domain: 'Digital Marketing',
    positions: '2',
    icon: TrendingUp,
    gradient: 'green' as const,
    objective: 'To provide hands-on experience implementing digital marketing campaigns while developing analytical skills to measure and optimize performance.',
    responsibilities: [
      'Assist in creating content for social media platforms',
      'Help monitor and analyse campaign performance metrics',
      'Research market trends and competitor activities',
      'Support email marketing initiatives',
      'Contribute to content calendar planning'
    ],
    deliverables: [
      'Social media content calendar with proposed posts',
      'Biweekly analytics reports on campaign performance',
      'Competitive analysis report',
      'Final presentation on a campaign they helped implement'
    ],
    skillsGained: ['Content Marketing', 'Social Media Strategy', 'Analytics', 'Campaign Management'],
  },
  {
    id: 'algo-whisperer',
    title: 'ALGO WHISPERER',
    domain: 'Website SEO',
    positions: '2',
    icon: Code,
    gradient: 'indigo' as const,
    objective: 'To provide practical experience in optimizing website content for search engines while developing technical and analytical SEO skills.',
    responsibilities: [
      'Conduct keyword research and analysis',
      'Audit website content for SEO opportunities',
      'Assist in optimizing on-page elements (meta descriptions, headers, etc.)',
      'Help with content creation focused on SEO best practices',
      'Track and report on website analytics and search rankings'
    ],
    deliverables: [
      'Comprehensive SEO audit with recommendations',
      'Keyword research report with implementation suggestions',
      'Optimized content for 5-10 key web pages',
      'Final report showing improvements in search metrics'
    ],
    skillsGained: ['SEO Optimization', 'Keyword Research', 'Technical SEO', 'Analytics'],
  }
];

const whyChooseUs = [
  {
    title: 'Real Portfolio Development',
    description: 'Build 5-7+ professional pieces you can showcase to employers',
    icon: Award,
  },
  {
    title: 'Mentorship & Guidance',
    description: 'Direct feedback from industry professionals',
    icon: Briefcase,
  },
  {
    title: 'Professional Deliverables',
    description: 'Create assets that benefit the company and your resume',
    icon: TrendingUp,
  },
  {
    title: 'Flexible Structure',
    description: 'Customizable duration and intensity based on your needs',
    icon: Clock,
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Application & Assessment',
    items: ['Submit internship application', 'Assessment of skills & interests', 'Role matching'],
  },
  {
    number: '02',
    title: 'Onboarding & Orientation',
    items: ['Program briefing', 'Team introductions', 'Project kickoff'],
  },
  {
    number: '03',
    title: 'Hands-on Execution',
    items: ['Weekly mentorship sessions', 'Deliverable creation', 'Real-world project work'],
  },
  {
    number: '04',
    title: 'Evaluation & Transition',
    items: ['Final deliverable review', 'Performance assessment', 'Career guidance & next steps'],
  },
];

const testimonials = [
  {
    name: 'Riddhi Sanchety',
    role: 'Amity University - BAJMC Batch (2027)',
    quote: 'I had an exceptional internship experience at Whiteboard Consultants with creative freedom and support to grow. My mentor\'s (Mr Navnit Daniel Alley) guidance helped me refine skills and deliver impactful designs. I appreciated the collaborative environment and the opportunities beyond my role. This experience boosted at my conference and prepared me for the future. I am grateful to have worked with a talented team.',
    company: '',
  },
  {
    name: 'Sonali Sivangi Roy',
    role: 'Amity University - BAJMC Batch (2027)',
    quote: 'I joined Whiteboard Consultants for my summer internship as an outreach intern. It was a valuable learning experience that helped me bridge the gap between theory and practical knowledge. I gained hands-on exposure to real-world projects in outreach, improved my research and communication skills, and learned the importance of teamwork, deadlines, and creative problem-solving. The guidance and feedback from the mentors made the experience both enriching and confidence-building, and it has significantly contributed to my professional growth.',
    company: '',
  },
  {
    name: 'Anoushka Sundar',
    role: 'Amity University - BA(Eng) Batch (2027)',
    quote: 'My eight-week summer internship at Whiteboard Consultants as an Outreach Oracle and Media Maverick was truly transformative. Under the exceptional guidance of Mr. Navnit Daniel Alley and mentors Nigel Vincent, Prateek Chaudhari, and Shumaila Shaukat Ali, I gained invaluable experience in strategic outreach, content writing, and professional communication. Whiteboard Consultants provided a nurturing yet challenging environment that pushed me beyond my comfort zone. From organizing seminars for the University of Wollongong to developing public speaking skills and mastering LinkedIn optimization, every phase of the internship was thoughtfully designed to build real-world competencies. The organization\'s commitment to intern development was evident in the personalized mentorship, hands-on responsibilities, and exposure to cutting-edge AI tools like NotebookLM and Perplexity. What distinguishes Whiteboard Consultants is their holistic approach, they don\'t just assign tasks, they invest in your growth. I was nervous about public speaking and uncertain about professional communication, I left with published content, optimized digital presence, and confidence in my abilities. The skills I acquired in strategic outreach, content creation, and educational marketing are directly applicable to my career aspirations. This internship has profoundly shaped my career aspirations and provided clarity on my professional path in communications and content strategy. The practical experience in educational outreach, digital marketing, and strategic communication has equipped me with competencies that will serve as a strong foundation for my future endeavors. I am deeply grateful to Whiteboard Consultants for this exceptional opportunity and for believing in my potential. The knowledge, skills, and confidence I have gained will continue to guide my professional journey for years to come.',
    company: '',
  },
];

const faqs = [
  {
    question: 'What is the duration of internships?',
    answer: 'Programs typically run 3-6 months, customizable based on your availability and project requirements.',
  },
  {
    question: 'Are internships paid or unpaid?',
    answer: 'Our internships are unpaid positions focused on hands-on experience, professional portfolio building, and career development.',
  },
  {
    question: 'What are the eligibility requirements?',
    answer: 'We welcome college students, recent graduates, and professionals looking to transition into these fields. Basic foundational knowledge in the domain is preferred.',
  },
  {
    question: 'Will I receive a certificate?',
    answer: 'Yes, you\'ll receive a comprehensive completion certificate with detailed performance review and skills assessment.',
  },
  {
    question: 'Is there a possibility of conversion to full-time?',
    answer: 'Top performers demonstrating exceptional commitment and output are considered for potential role conversions to full-time positions.',
  },
  {
    question: 'How often are mentorship sessions held?',
    answer: 'Weekly 1-on-1 mentorship sessions are standard, with additional group sessions and code reviews as needed for project support.',
  },
  {
    question: 'What skills will I develop?',
    answer: 'Industry-specific technical skills, professional communication, project management, portfolio development, and valuable soft skills for career advancement.',
  },
  {
    question: 'How do you support student learning?',
    answer: 'Through weekly mentorship, real project assignments, constructive feedback, peer learning, and personalized career guidance tailored to your goals.',
  },
];

function ProgramCard({ program }: { program: typeof internshipPrograms[0] }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = program.icon;

  return (
    <Card 
      variant={program.gradient}
      className="h-full hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className={`h-5 w-5 text-${program.gradient}-600 dark:text-${program.gradient}-400`} />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                {program.domain}
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {program.title}
            </CardTitle>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {program.positions} Positions
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-foreground/70 dark:text-slate-300/70 mb-4">
          {program.objective}
        </p>

        {!expanded && (
          <div className="space-y-3 flex-1">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                Key Responsibilities
              </h4>
              <ul className="text-xs text-foreground/60 dark:text-slate-300/60 space-y-1">
                {program.responsibilities.slice(0, 2).map((resp, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
                <li className="text-primary/70 italic">+ {program.responsibilities.length - 2} more responsibilities</li>
              </ul>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                Responsibilities
              </h4>
              <ul className="text-xs text-foreground/60 dark:text-slate-300/60 space-y-2">
                {program.responsibilities.map((resp, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                Deliverables
              </h4>
              <ul className="text-xs text-foreground/60 dark:text-slate-300/60 space-y-2">
                {program.deliverables.map((deliv, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                Skills You'll Gain
              </h4>
              <div className="flex flex-wrap gap-2">
                {program.skillsGained.map((skill, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-white/40 dark:bg-slate-900/40 text-slate-900 dark:text-white px-2 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-primary text-xs font-semibold mt-4 hover:opacity-80 transition-opacity"
        >
          {expanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>View Details</span>
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-white/20 dark:border-slate-700/20 rounded-lg p-4 hover:border-primary/20 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-4 text-left"
      >
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex-1">
          {question}
        </h4>
        <div className="flex-shrink-0 mt-1">
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-primary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-400" />
          )}
        </div>
      </button>
      {expanded && (
        <p className="text-sm text-foreground/60 dark:text-slate-300/60 mt-3">
          {answer}
        </p>
      )}
    </div>
  );
}

export default function InternshipProgramsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-700/60 p-8 md:p-12 mb-12">
            <div className="max-w-3xl">
              <Link href="/career-solutions" className="text-primary hover:underline text-sm font-semibold mb-4 flex items-center gap-1">
                ← Back to Career Solutions
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Internship Programs
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6">
                Launch Your Career with Hands-On Experience
              </h2>
              <p className="text-lg text-foreground/70 dark:text-slate-300/70 mb-8">
                Gain real-world experience through our specialized internship programs. Choose from 4 career tracks with 12-13 positions available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#internships">
                  <Button size="lg" className="w-full sm:w-auto">
                    Explore Programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Schedule Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: '12-13', label: 'Positions Available' },
              { value: '4', label: 'Career Tracks' },
              { value: '3-6', label: 'Months Duration' },
              { value: '100%', label: 'Mentorship Support' },
            ].map((stat, i) => (
              <Card key={i} variant={(['blue', 'green', 'purple', 'indigo'] as const)[i]} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs md:text-sm text-foreground/60 dark:text-slate-300/60 font-medium">
                    {stat.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Internship Programs Section */}
      <section id="internships" className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Internship Programs
            </h2>
            <p className="text-lg text-foreground/70 dark:text-slate-300/70">
              Choose from 4 specialized internship tracks designed to build your professional portfolio and career ready skills.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {internshipPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Why Choose Our Internships
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <Card key={i} variant={(['blue', 'green', 'purple', 'indigo'] as const)[i]}>
                  <CardContent className="pt-6">
                    <IconComponent className={`h-8 w-8 text-${['blue', 'green', 'purple', 'indigo'][i]}-600 dark:text-${['blue', 'green', 'purple', 'indigo'][i]}-400 mb-4`} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-foreground/60 dark:text-slate-300/60">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Your Internship Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={i} className="relative h-full">
                <Card variant={(['blue', 'green', 'purple', 'indigo'] as const)[i]} className="h-full">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <div className="text-4xl font-bold text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <ul className="space-y-2 flex-grow">
                      {step.items.map((item, j) => (
                        <li key={j} className="text-sm text-foreground/60 dark:text-slate-300/60 flex gap-2">
                          <span className="text-primary">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Success Stories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <Card key={i} variant={(['blue', 'green', 'purple'] as const)[i]}>
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} className="text-yellow-400">★</span>
                    ))}
                  </div>
                  <p className="text-sm text-foreground/70 dark:text-slate-300/70 mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-foreground/60 dark:text-slate-300/60">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-primary font-semibold mt-1">
                      {testimonial.company}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-primary p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Launch Your Career?
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Join our next cohort of emerging professionals and gain real-world experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/simple-register">
                <Button size="lg" variant="secondary">
                  Apply Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" className="border-2 border-white bg-transparent text-white hover:bg-white/10">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
