'use client';

import { useState } from 'react';
import { Briefcase, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const internshipHighlights = [
  {
    title: 'PIXEL PRODIGY',
    description: 'Graphic Design Internship - Build a professional design portfolio',
    positions: '3-4 Positions',
    gradient: 'blue' as const,
  },
  {
    title: 'OUTREACH ORACLE',
    description: 'Sales & Outreach - Master B2B/B2C sales processes',
    positions: '5 Positions',
    gradient: 'purple' as const,
  },
  {
    title: 'MEDIA MAVERICK',
    description: 'Digital Marketing - Launch marketing campaigns that convert',
    positions: '2 Positions',
    gradient: 'green' as const,
  },
  {
    title: 'ALGO WHISPERER',
    description: 'Website SEO - Optimize content for search engines',
    positions: '2 Positions',
    gradient: 'indigo' as const,
  },
];

const trainingHighlights = [
  {
    title: 'Corporate Training Programs',
    description: 'Upskill teams with customized corporate training',
    participants: 'For Teams',
    gradient: 'blue' as const,
  },
  {
    title: 'Intensive Bootcamps',
    description: 'Fast-track skill development with hands-on projects',
    participants: 'For Individuals',
    gradient: 'green' as const,
  },
  {
    title: 'Professional Certifications',
    description: 'Industry-recognized credentials for career advancement',
    participants: 'For Professionals',
    gradient: 'purple' as const,
  },
  {
    title: 'Workshops & Seminars',
    description: 'Focused learning on emerging technologies',
    participants: 'For Everyone',
    gradient: 'indigo' as const,
  },
];

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-semibold text-sm md:text-base rounded-lg transition-all duration-300 ${
        active
          ? 'bg-primary text-white shadow-lg'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function CareerSolutionsHub() {
  const [activeTab, setActiveTab] = useState<'internships' | 'training'>('internships');

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <section className="py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-700/60 p-8 md:p-12 mb-12">
            <div className="max-w-3xl mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                Career Solutions Hub
              </h1>
              <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6">
                Internship Programs & Professional Training
              </h2>
              <p className="text-lg text-foreground/70 dark:text-slate-300/70">
                Choose your path: gain hands-on experience through internships or upskill with our professional training programs. Both worlds covered.
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-col sm:flex-row gap-3">
              <TabButton
                active={activeTab === 'internships'}
                onClick={() => setActiveTab('internships')}
              >
                <Briefcase className="inline-block h-4 w-4 mr-2" />
                Internship Programs
              </TabButton>
              <TabButton
                active={activeTab === 'training'}
                onClick={() => setActiveTab('training')}
              >
                <BookOpen className="inline-block h-4 w-4 mr-2" />
                Skill Development & Training
              </TabButton>
            </div>
          </div>
        </div>
      </section>

      {/* Internships Tab Content */}
      {activeTab === 'internships' && (
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Internship Programs
              </h2>
              <p className="text-lg text-foreground/70 dark:text-slate-300/70">
                4 specialized internship tracks with 12-13 total positions. Build your portfolio with real-world projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {internshipHighlights.map((program, i) => (
                <Card
                  key={i}
                  variant={program.gradient}
                  className="hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {program.title}
                        </CardTitle>
                      </div>
                      <div className="bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {program.positions}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-foreground/70 dark:text-slate-300/70 mb-6">
                      {program.description}
                    </p>
                    <Link href="/career-solutions/internship-programs" className="no-underline">
                      <Button variant="outline" className="w-full">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { value: '4', label: 'Career Tracks' },
                { value: '12-13', label: 'Total Positions' },
                { value: '3-6', label: 'Months Duration' },
                { value: '100%', label: 'Mentorship' },
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

            {/* CTA */}
            <div className="rounded-2xl bg-primary p-8 md:p-12 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Build Your Portfolio?</h3>
              <p className="text-primary-foreground/80 mb-8">
                Join our next internship cohort and gain real-world experience with industry mentorship.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/career-solutions/internship-programs">
                  <Button size="lg" variant="secondary">
                    Explore All Programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/simple-register">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10 dark:text-white"
                  >
                    Apply Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Training Tab Content */}
      {activeTab === 'training' && (
        <section className="py-20 px-4 md:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Skill Development & Professional Training
              </h2>
              <p className="text-lg text-foreground/70 dark:text-slate-300/70">
                From corporate training to professional certifications, we cover both student and professional development needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {trainingHighlights.map((program, i) => (
                <Card
                  key={i}
                  variant={program.gradient}
                  className="hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                          {program.title}
                        </CardTitle>
                      </div>
                      <div className="bg-white/50 dark:bg-slate-900/50 px-3 py-1 rounded-full">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {program.participants}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <p className="text-sm text-foreground/70 dark:text-slate-300/70 mb-6">
                      {program.description}
                    </p>
                    <Link href="/career-solutions/skill-development" className="no-underline">
                      <Button variant="outline" className="w-full">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: 'Flexible Learning',
                  description: 'Choose from part-time, full-time, or self-paced options',
                },
                {
                  title: 'Industry-Recognized',
                  description: 'Earn certifications valued by employers worldwide',
                },
                {
                  title: 'Expert Instruction',
                  description: 'Learn from experienced professionals and subject matter experts',
                },
              ].map((benefit, i) => (
                <Card
                  key={i}
                  variant={(['blue', 'green', 'purple'] as const)[i]}
                  className="text-center"
                >
                  <CardContent className="pt-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-foreground/60 dark:text-slate-300/60">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA */}
            <div className="rounded-2xl bg-primary p-8 md:p-12 text-center text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Upskill for Your Future</h3>
              <p className="text-green-100 mb-8">
                Choose from corporate training, bootcamps, certifications, and workshops designed for every career stage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/career-solutions/skill-development">
                  <Button size="lg" variant="secondary">
                    View All Programs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white/10"
                  >
                    Get Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Career Solutions */}
      <section className="py-20 px-4 md:px-6 lg:px-8 bg-white/30 dark:bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            Why Choose Whitedge Career Solutions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: 'Dual-Path Approach',
                description: 'Whether you want hands-on internship experience or structured training, we have the right program for you.',
                gradient: 'blue' as const,
              },
              {
                title: 'Real-World Projects',
                description: 'All programs include practical projects that build actual portfolio pieces.',
                gradient: 'green' as const,
              },
              {
                title: 'Mentorship Excellence',
                description: 'Access to experienced professionals who guide your career development.',
                gradient: 'purple' as const,
              },
              {
                title: 'Career Support',
                description: 'Comprehensive support from application through job placement assistance.',
                gradient: 'indigo' as const,
              },
            ].map((item, i) => (
              <Card key={i} variant={item.gradient}>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-foreground/60 dark:text-slate-300/60">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
