'use client';

import { Zap, Users, Target, Award, BarChart3, Lightbulb } from 'lucide-react';

export function CourseBenefitsSection() {
  const benefits = [
    {
      icon: Zap,
      title: 'Master ATS Systems',
      description: 'Learn how to optimize your resume to pass automated screening systems that filter 75% of applications.',
    },
    {
      icon: BarChart3,
      title: 'Quantify Your Achievements',
      description: 'Transform vague bullet points into powerful, metrics-driven accomplishments that get noticed by recruiters.',
    },
    {
      icon: Users,
      title: 'Professional Brand Consistency',
      description: 'Align your resume, cover letter, and LinkedIn profile for a cohesive professional presence.',
    },
    {
      icon: Target,
      title: 'Strategic Application Strategy',
      description: 'Discover the exact framework used by candidates who land interviews at top companies.',
    },
    {
      icon: Award,
      title: 'Interview-Winning Techniques',
      description: 'Transform your application materials into an interview-winning strategy that gets results.',
    },
    {
      icon: Lightbulb,
      title: 'Career Transition Framework',
      description: 'Navigate career changes with confidence using our proven positioning techniques.',
    },
  ];

  return (
    <section className="py-20 bg-muted/20 dark:bg-slate-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            What You'll Learn
          </h2>
          <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
            Master the complete framework for creating resumes and cover letters that get past ATS systems and land interviews.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-500/50 bg-white dark:bg-slate-900/60 hover:bg-blue-50 dark:hover:bg-slate-800/80 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="mb-4">
                  <div className="inline-flex p-3 rounded-lg bg-blue-100 dark:bg-blue-500/25 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300 group-hover:text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-slate-300">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
