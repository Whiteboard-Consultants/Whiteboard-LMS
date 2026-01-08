'use client';

import { useState } from 'react';
import { Briefcase, Users, Lightbulb, Zap, Code, ChevronDown, ChevronUp, Clock, Award, ArrowRight, BookOpen, Rocket, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Training Program data structure
const trainingPrograms = [
  {
    id: 'corporate-training',
    title: 'CORPORATE TRAINING',
    category: 'Professional Development',
    duration: '1-3 months',
    icon: Briefcase,
    gradient: 'blue' as const,
    objective: 'Customized training solutions designed to enhance employee skills, boost productivity, and drive organizational growth through practical, real-world focused interventions.',
    offerings: [
      'Leadership & Management Programs',
      'Sales Excellence & Negotiation Skills',
      'Communication & Soft Skills',
      'Technical Skills & Certifications',
      'Change Management & Transformation',
      'Team Building & Culture Development'
    ],
    deliverables: [
      'Customized training design and delivery',
      'Pre and post-training assessments',
      'Performance improvement metrics',
      'Ongoing coaching and support',
      'Measurable ROI tracking',
      'Comprehensive feedback and reports'
    ],
    benefits: ['Increased Productivity', 'Better Employee Retention', 'Enhanced Performance', 'Competitive Advantage'],
  },
  {
    id: 'campus-recruitment-training',
    title: 'INSTITUTIONAL TRAINING',
    category: 'Educational Programs',
    duration: '6 months - 1 year',
    icon: Users,
    gradient: 'green' as const,
    objective: 'Purpose-built training programs for educational institutions, helping students develop campus recruitment readiness and career-ready skills aligned with industry standards and employability requirements.',
    offerings: [
      'Campus Recruitment Preparation',
      'Interview & Aptitude Training',
      'Resume & LinkedIn Optimization',
      'Soft Skills & Professional Etiquette',
      'Group Discussion & Communication Skills',
      'Industry Connection & Placement Support'
    ],
    deliverables: [
      'Customized recruitment training delivery',
      'Mock interview sessions and feedback',
      'Student skill assessments and reports',
      'Industry partner connections for placements',
      'Alumni success stories and case studies',
      'Performance tracking and improvement plans'
    ],
    benefits: ['Better Campus Placements', 'Higher Selection Rates', 'Industry Readiness', 'Student Success'],
  },
  {
    id: 'bootcamp-programs',
    title: 'INTENSIVE BOOTCAMPS',
    category: 'Accelerated Learning',
    duration: '2-12 weeks',
    icon: Rocket,
    gradient: 'purple' as const,
    objective: 'High-intensity, focused training programs designed for rapid skill acquisition and immediate application in real-world scenarios.',
    offerings: [
      'Full-Stack Development Bootcamp',
      'Data Analytics & AI/ML Bootcamp',
      'Digital Marketing Bootcamp',
      'UI/UX Design Bootcamp',
      'Sales Excellence Bootcamp',
      'Leadership Acceleration Program'
    ],
    deliverables: [
      'Hands-on project-based learning',
      'Portfolio development',
      'Capstone project completion',
      'Industry mentor access',
      'Job readiness certification',
      'Placement assistance'
    ],
    benefits: ['Rapid Upskilling', 'Portfolio Ready', 'Job Placement Support', 'Industry Mentors'],
  },
  {
    id: 'workshop-seminars',
    title: 'WORKSHOPS & SEMINARS',
    category: 'Specialized Training',
    duration: '1-5 days',
    icon: Lightbulb,
    gradient: 'indigo' as const,
    objective: 'Short-duration, focused learning experiences on specific topics, emerging technologies, and professional development areas delivered by industry experts.',
    offerings: [
      'Emerging Technology Workshops',
      'Professional Skill Updates',
      'Industry Trend Seminars',
      'Certification Prep Programs',
      'Leadership Talks & Masterclasses',
      'Innovation & Creativity Workshops'
    ],
    deliverables: [
      'Expert-led sessions',
      'Practical hands-on activities',
      'Resource materials & toolkits',
      'Networking opportunities',
      'Participation certificates',
      'Follow-up resources'
    ],
    benefits: ['Focused Learning', 'Expert Insights', 'Networking', 'Current Trends'],
  },
  {
    id: 'custom-programs',
    title: 'CUSTOMIZED PROGRAMS',
    category: 'Tailored Solutions',
    duration: 'Flexible',
    icon: Code,
    gradient: 'cyan' as const,
    objective: 'Bespoke training solutions designed specifically for your organization, team, or individual needs ensuring maximum relevance and impact.',
    offerings: [
      'Custom Curriculum Design',
      'Onsite or Online Delivery',
      'Mixed Learning Modalities',
      'Blended Learning Approaches',
      'Mentoring & Coaching Programs',
      'Executive Education Programs'
    ],
    deliverables: [
      'Needs assessment and analysis',
      'Custom course development',
      'Flexible delivery options',
      'Real-world case studies',
      'Ongoing support & updates',
      'ROI measurement and reporting'
    ],
    benefits: ['Perfect Fit', 'Flexible Delivery', 'Cost Effective', 'Measurable Results'],
  }
];

const whyChooseTraining = [
  {
    title: 'Expert Instructors',
    description: 'Learn from industry professionals with years of real-world experience and practical expertise',
    icon: BookOpen,
  },
  {
    title: 'Practical Learning',
    description: 'Hands-on, project-based learning that you can immediately apply to your role',
    icon: Zap,
  },
  {
    title: 'Flexible Options',
    description: 'Multiple delivery formats: online, offline, hybrid, self-paced, or cohort-based',
    icon: Clock,
  },
  {
    title: 'Career Growth',
    description: 'Gain skills that boost your career prospects and earning potential significantly',
    icon: TrendingUp,
  },
];

const workflowSteps = [
  {
    number: '01',
    title: 'Assessment & Planning',
    items: ['Identify skill gaps', 'Define learning objectives', 'Customize program path'],
  },
  {
    number: '02',
    title: 'Program Design',
    items: ['Curriculum development', 'Resource preparation', 'Delivery method selection'],
  },
  {
    number: '03',
    title: 'Training Delivery',
    items: ['Expert instruction', 'Hands-on projects', 'Continuous support & feedback'],
  },
  {
    number: '04',
    title: 'Evaluation & Growth',
    items: ['Skill assessment', 'Performance tracking', 'Certification & career guidance'],
  },
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Corporate Training Participant - Manager',
    quote: 'The training transformed how I lead my team. Practical, engaging, and immediately applicable. Highly recommend!',
    company: 'Tech Corp India',
  },
  {
    name: 'Isha Patel',
    role: 'Bootcamp Graduate - Full Stack Developer',
    quote: 'Intensive bootcamp prepared me perfectly for the industry. Got placed within 2 weeks of completion.',
    company: 'StartUp Solutions',
  },
  {
    name: 'Amit Singh',
    role: 'Institution Training Participant - Student',
    quote: 'This training gave me the confidence and skills I needed. My placement interview went smoothly!',
    company: 'Engineering College XYZ',
  },
];

const faqs = [
  {
    question: 'What is the duration and schedule of these programs?',
    answer: 'Programs vary from 1-day workshops to 6-month-long courses. We offer flexible scheduling including evenings, weekends, online, and self-paced options to fit your lifestyle.',
  },
  {
    question: 'Are the certifications industry-recognized?',
    answer: 'Yes, our certifications are recognized by leading industry bodies and valued by employers globally. We partner with official certification providers to ensure authenticity.',
  },
  {
    question: 'What is the cost structure?',
    answer: 'Pricing varies by program type and duration. We offer flexible payment options including EMI, batch discounts, and corporate packages. Contact us for a customized quote.',
  },
  {
    question: 'Will I get placement assistance?',
    answer: 'Yes, bootcamp and certification graduates receive placement support including resume building, interview coaching, and job referrals based on performance and market fit.',
  },
  {
    question: 'Can I attend online or do I need to be onsite?',
    answer: 'All our programs are available in multiple formats: 100% online, 100% onsite, or hybrid. Choose what works best for you.',
  },
  {
    question: 'What if I fall behind or need extra support?',
    answer: 'We provide continuous mentoring, doubt-clearing sessions, extra resources, and flexible re-take options to ensure you succeed.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Yes, we offer a 7-day satisfaction guarantee. If you\'re not satisfied, we provide a full refund or program credit.',
  },
  {
    question: 'How do I choose the right program for me?',
    answer: 'Take our free skills assessment, chat with our career counselors, or attend a free demo class to understand which program aligns with your goals.',
  },
];

function ProgramCard({ program }: { program: typeof trainingPrograms[0] }) {
  const [expanded, setExpanded] = useState(false);
  const IconComponent = program.icon;

  return (
    <Card 
      variant={program.gradient as any}
      className="h-full hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="h-5 w-5" />
              <span className="text-xs font-semibold tracking-wider text-muted-foreground">
                {program.category}
              </span>
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              {program.title}
            </CardTitle>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {program.duration}
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
                What We Offer
              </h4>
              <ul className="text-xs text-foreground/60 dark:text-slate-300/60 space-y-1">
                {program.offerings.slice(0, 2).map((offer, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{offer}</span>
                  </li>
                ))}
                <li className="text-primary/70 italic">+ {program.offerings.length - 2} more offerings</li>
              </ul>
            </div>
          </div>
        )}

        {expanded && (
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                What We Offer
              </h4>
              <ul className="text-xs text-foreground/60 dark:text-slate-300/60 space-y-2">
                {program.offerings.map((offer, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{offer}</span>
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
                Key Benefits
              </h4>
              <div className="flex flex-wrap gap-2">
                {program.benefits.map((benefit, i) => (
                  <span 
                    key={i}
                    className="text-xs bg-white/40 dark:bg-slate-900/40 text-slate-900 dark:text-white px-2 py-1 rounded-full"
                  >
                    {benefit}
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

export default function SkillDevelopmentPage() {
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
                Skill Development & Professional Training
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6">
                Transform Your Career Through Continuous Learning
              </h2>
              <p className="text-lg text-foreground/70 dark:text-slate-300/70 mb-8">
                From intensive bootcamps to customized corporate training, we offer comprehensive skill development programs for students, professionals, and organizations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="#training">
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
              { value: '6+', label: 'Program Types' },
              { value: '500+', label: 'Graduates' },
              { value: '95%', label: 'Satisfaction Rate' },
              { value: '100%', label: 'Expert Support' },
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

      {/* Training Programs Section */}
      <section id="training" className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Our Training Programs
            </h2>
            <p className="text-lg text-foreground/70 dark:text-slate-300/70">
              Comprehensive training solutions tailored for students preparing for employment, professionals seeking advancement, and organizations driving growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trainingPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Why Choose Our Training Programs
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseTraining.map((item, i) => {
              const IconComponent = item.icon;
              return (
                <Card key={i} variant={(['blue', 'green', 'purple', 'indigo'] as const)[i]}>
                  <CardContent className="pt-6">
                    <IconComponent className="h-8 w-8 mb-4" />
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
            Your Learning Journey
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, i) => (
              <div key={i} className="relative">
                <Card variant={(['blue', 'green', 'purple', 'indigo'] as const)[i]}>
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-primary/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {step.title}
                    </h3>
                    <ul className="space-y-2">
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
          <div className="rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 p-8 md:p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Career?
            </h2>
            <p className="text-lg text-green-100 mb-8">
              Start your learning journey with our expert-led training programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg" variant="secondary">
                  Browse Programs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Get Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
