'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, Award, BookOpen, Briefcase, Globe, HeartHandshake, Shield, Sun, Users, Star, FileText, BarChart, Book, Milestone, ListChecks, Clock, Banknote, Home, Plane, Telescope, CalendarCheck, Landmark, MapPin, XCircle, Euro, Code } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const partnerPrograms = [
  {
    id: 'uow-partnership',
    title: 'UOW Partnership Program',
    description: 'Direct admission pathway to University of Wollongong with exclusive benefits and streamlined application process.',
    icon: <Award className="w-8 h-8 text-blue-500" />,
    features: [
      'Guaranteed admission with meeting requirements',
      'Scholarship opportunities up to 20%',
      'Dedicated support throughout application process',
      'Fast-track visa processing',
      'Pre-departure orientation program'
    ],
    applicationDeadline: 'Rolling Admissions',
    intakePeriods: ['February', 'July', 'September'],
    category: 'University Partnerships'
  },
  {
    id: 'deakin-partnership',
    title: 'Deakin University Partnership',
    description: 'Special partnership with Deakin University, Australia offering preferred admission and credit transfer opportunities.',
    icon: <Globe className="w-8 h-8 text-green-500" />,
    features: [
      'Priority admission processing',
      'Credit transfer options',
      'Scholarship eligibility',
      'Dual degree programs',
      'Industry internship placements'
    ],
    applicationDeadline: 'Varies by Program',
    intakePeriods: ['March', 'July', 'November'],
    category: 'International Partnerships'
  },
  {
    id: 'uk-university-consortium',
    title: 'UK University Consortium',
    description: 'Access to 15+ UK universities through a single application platform with simplified requirements.',
    icon: <Briefcase className="w-8 h-8 text-purple-500" />,
    features: [
      'One application, multiple universities',
      'Reduced application fees',
      'Guaranteed accommodation placement',
      'Dedicated student support',
      'Visa assistance program'
    ],
    applicationDeadline: 'Varies by Program',
    intakePeriods: ['January', 'May', 'September'],
    category: 'University Networks'
  },
  {
    id: 'canada-college-alliance',
    title: 'Canada College Alliance',
    description: 'Partnership with top Canadian colleges offering streamlined admission and work permit assistance.',
    icon: <MapPin className="w-8 h-8 text-red-500" />,
    features: [
      'Direct college admission',
      'Work permit guarantee',
      'English language support',
      'Accommodation assistance',
      'Post-graduation work support'
    ],
    applicationDeadline: 'Varies by Program',
    intakePeriods: ['January', 'May', 'September'],
    category: 'College Partnerships'
  }
];

export default function PartnerProgramsClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeadlineAlert, setShowDeadlineAlert] = useState(false);

  const filteredPrograms = selectedCategory === 'all' 
    ? partnerPrograms 
    : partnerPrograms.filter(program => program.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Programs', icon: <Globe className="w-4 h-4" /> },
    { id: 'University Partnerships', label: 'University Partnerships', icon: <Award className="w-4 h-4" /> },
    { id: 'International Partnerships', label: 'International Partnerships', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'College Partnerships', label: 'College Partnerships', icon: <MapPin className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-slate-100 dark:bg-slate-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-base font-semibold text-primary uppercase tracking-wide">Partner Programs</p>
              <h1 className="font-headline text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Leading Platform for <span className="text-primary dark:text-white">Comparing Online Courses</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Compare Thousands of Courses<br />
                Trusted by Millions of Learners<br />
                Exclusive Scholarships & Discounts
              </p>
              <div className="mt-10">
                <Link href="/contact">
                  <Button size="lg" className="dark:bg-slate-dark dark:text-white dark:border dark:border-white">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/courses/Partner-Programs.png"
                alt="Partner Programs Platform"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint="partner programs platform"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="partner-programs" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Partner Programs</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover exclusive opportunities through our strategic partnerships with world-class institutions powered by RiseUpp
            </p>
          </div>

          {/* Tabs Section */}
          <section className="py-10 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 shadow-md">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-primary/10 hover:text-primary dark:hover:text-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-primary/30 flex items-center gap-2"
                    onClick={() => document.getElementById('all-programs')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    <span>All Programs</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-600 dark:hover:text-amber-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-amber-200 dark:hover:border-amber-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('free-programs')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Free Programs</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-purple-200 dark:hover:border-purple-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('management')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Briefcase className="w-5 h-5 text-purple-500" />
                    <span>Management</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-green-200 dark:hover:border-green-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('computer-science')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Code className="w-5 h-5 text-green-500" />
                    <span>Computer Science</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-600 dark:hover:text-emerald-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('finance')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Banknote className="w-5 h-5 text-emerald-500" />
                    <span>Finance</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-rose-200 dark:hover:border-rose-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('marketing')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Star className="w-5 h-5 text-rose-500" />
                    <span>Marketing</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="px-5 py-3 text-sm font-semibold rounded-full hover:bg-cyan-50 dark:hover:bg-cyan-950/30 hover:text-cyan-600 dark:hover:text-cyan-400 hover:shadow-md transition-all duration-300 border border-transparent hover:border-cyan-200 dark:hover:border-cyan-800/30 flex items-center gap-2"
                    onClick={() => document.getElementById('web-development')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Globe className="w-5 h-5 text-cyan-500" />
                    <span>Web Development</span>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* Free Courses Section */}
      <section id="free-programs" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Free Courses</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Access high-quality free courses from our partner institutions - no cost, just learning
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Storytelling</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master multivariate data visualization and storytelling techniques using Tableau. Learn to create impactful, ethical data presentations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">0.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">University of California, Irvine</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Create complex multivariate visualizations in Tableau</li>
                      <li>• Analyze statistical relationships and distributions</li>
                      <li>• Develop effective data storytelling techniques</li>
                      <li>• Implement ethical visualization practices</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-california-irvine/data-storytelling?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Book className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Analysis Using Python</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Learn Python data science techniques using pandas, numpy, and matplotlib. Master data frames, visualization, and real-world analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.4 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 px-3 py-2 rounded-lg shadow-md border border-purple-200 dark:border-purple-800 transform hover:scale-105 transition-transform">University of Pennsylvania</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Apply Python libraries for data analysis and visualization</li>
                      <li>• Load and manipulate real-world datasets using pandas</li>
                      <li>• Create data visualizations with matplotlib</li>
                      <li>• Perform data aggregation and summarization</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-pennsylvania/data-analysis-using-python?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Defining, Describing, and Visualizing Data</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master data analysis fundamentals with R: Learn to classify data, calculate statistics, and create visualizations for informed decision-making.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.8 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 transform hover:scale-105 transition-transform">University of Colorado Boulder</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Classify different types of data using measurement scales</li>
                      <li>• Master descriptive statistics calculation using R software</li>
                      <li>• Create effective data visualizations and interpret results</li>
                      <li>• Apply probability distributions for decision making</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-colorado-boulder/defining-describing-and-visualizing-data?ref=CP112" target="_blank">
                  <Button className="w-full mt-4 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Statistics for Data Science Essentials</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master probability and statistics essentials for data science, from central limit theorem to confidence intervals. Perfect for ML and AI preparation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 px-3 py-2 rounded-lg shadow-md border border-purple-200 dark:border-purple-800 transform hover:scale-105 transition-transform">University of Pennsylvania</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Master probability fundamentals and their applications in data science</li>
                      <li>• Apply the Central Limit Theorem to real-world problems</li>
                      <li>• Calculate and interpret confidence intervals</li>
                      <li>• Understand point estimation and maximum likelihood methods</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-pennsylvania/statistics-for-data-science-essentials?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Understanding and Visualization</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master data visualization techniques using Python libraries like Pandas, Matplotlib, and Seaborn for effective data analysis and communication.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.5 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 transform hover:scale-105 transition-transform">University of Colorado Boulder</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Analyze datasets using fundamental statistical measures</li>
                      <li>• Create effective visualizations using Pandas functionality</li>
                      <li>• Develop custom plots and charts with Matplotlib</li>
                      <li>• Build advanced visualizations using Seaborn</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-colorado-boulder/data-understanding-and-visualization?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Driven Decision Making</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master statistical analysis techniques for business and engineering decisions using RStudio and ROIStat.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">5.9 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 transform hover:scale-105 transition-transform">University of Colorado Boulder</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Perform statistical tests for data comparison</li>
                      <li>• Analyze relationships between variables</li>
                      <li>• Conduct two-sample tests for independent data</li>
                      <li>• Implement dependent data analysis methods</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-colorado-boulder/data-driven-decision-making?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Analysis and Visualization with Power BI</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master Power BI data visualization and analytics skills. Learn to create reports, dashboards, and perform advanced analysis for data-driven decision making.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4.6 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 text-sky-700 dark:text-sky-200 px-3 py-2 rounded-lg shadow-md border border-sky-200 dark:border-sky-800 transform hover:scale-105 transition-transform">Microsoft</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Create effective visualizations for reports and dashboards</li>
                      <li>• Design accessible and user-friendly reports</li>
                      <li>• Apply formatting and navigation techniques</li>
                      <li>• Use AI features for advanced analytics</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/microsoft/data-analysis-and-visualization-with-power-bi?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Artificial Intelligence on Microsoft Azure</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master AI fundamentals on Microsoft Azure platform. Learn to build, deploy, and manage intelligent cloud solutions with cutting-edge AI services.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">6.2 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 text-sky-700 dark:text-sky-200 px-3 py-2 rounded-lg shadow-md border border-sky-200 dark:border-sky-800 transform hover:scale-105 transition-transform">Microsoft</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand Azure AI services and their applications</li>
                      <li>• Build and deploy machine learning models</li>
                      <li>• Implement AI solutions for business problems</li>
                      <li>• Master Azure AI tools and frameworks</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/microsoft/artificial-intelligence-on-microsoft-azure?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Artificial Intelligence Essentials</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore AI fundamentals and applications in business. Learn machine learning basics, neural networks, and practical AI implementation strategies.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4.5 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg shadow-md border border-red-200 dark:border-red-800 transform hover:scale-105 transition-transform">University of Pennsylvania</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand core AI concepts and terminology</li>
                      <li>• Learn machine learning fundamentals</li>
                      <li>• Explore neural networks and deep learning</li>
                      <li>• Apply AI to real-world business scenarios</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-pennsylvania/artificial-intelligence-essentials?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-orange-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Artificial Intelligence</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Comprehensive AI course covering machine learning, deep learning, and neural networks. Build practical AI applications for real-world scenarios.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">8.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 text-orange-700 dark:text-orange-200 px-3 py-2 rounded-lg shadow-md border border-orange-200 dark:border-orange-800 transform hover:scale-105 transition-transform">Illinois Tech</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Master machine learning algorithms and techniques</li>
                      <li>• Build and train neural network models</li>
                      <li>• Apply deep learning to solve complex problems</li>
                      <li>• Develop AI-powered applications and systems</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/illinois-tech/artificial-intelligence?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Using Data Analytics in Supply Chain</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master supply chain data analytics fundamentals, from data governance to visualization. Learn to analyze and present insights for effective decision-making.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">5.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-200 px-3 py-2 rounded-lg shadow-md border border-emerald-200 dark:border-emerald-800 transform hover:scale-105 transition-transform">Unilever</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Define data analysis objectives and identify appropriate data sources</li>
                      <li>• Apply data cleaning and preparation techniques</li>
                      <li>• Conduct comprehensive data analysis using various tools</li>
                      <li>• Create effective data visualizations for decision-making</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/unilever/using-data-analytics-in-supply-chain?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Data Analysis with Tableau</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master data manipulation, exploratory analysis, and statistical techniques using Tableau for business intelligence.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.7 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-700 dark:text-indigo-200 px-3 py-2 rounded-lg shadow-md border border-indigo-200 dark:border-indigo-800 transform hover:scale-105 transition-transform">Tableau Learning Partner</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Apply data manipulation and preparation techniques</li>
                      <li>• Perform exploratory data analysis with descriptive statistics</li>
                      <li>• Create and interpret statistical visualizations</li>
                      <li>• Use Tableau's analytics features effectively</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/tableau-learning-partner/data-analysis-with-tableau?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Problem Solving with Excel</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master Excel fundamentals and advanced functions for business problem-solving with PwC's practical approach.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 text-red-700 dark:text-red-200 px-3 py-2 rounded-lg shadow-md border border-red-200 dark:border-red-800 transform hover:scale-105 transition-transform">PWC</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Master Excel navigation and basic functionality</li>
                      <li>• Learn VLookup and advanced data cleansing techniques</li>
                      <li>• Create and analyze pivot tables for data insights</li>
                      <li>• Apply Excel functions to solve business problems</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/pwc/problem-solving-with-excel?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Python for Data Science</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master Python programming essentials for data analysis, visualization, and machine learning preparation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">8 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 text-pink-700 dark:text-pink-200 px-3 py-2 rounded-lg shadow-md border border-pink-200 dark:border-pink-800 transform hover:scale-105 transition-transform">Fractal Analytics</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Master Python data manipulation and analysis</li>
                      <li>• Perform statistical analysis and data visualization</li>
                      <li>• Develop data cleaning and preprocessing skills</li>
                      <li>• Implement feature engineering techniques</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/fractal-analytics/python-for-data-science?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Data Analytics</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master the fundamentals of data analytics, from data collection to visualization, perfect for beginners starting their analytics journey.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.7 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">IBM</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand the data analytics process and ecosystem</li>
                      <li>• Learn data collection and cleaning techniques</li>
                      <li>• Master basic data mining and visualization concepts</li>
                      <li>• Explore different data analysis career paths</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ibm/introduction-to-data-analytics?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Business Intelligence (BI) Essentials</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master business intelligence analysis: data wrangling to visualization. Transform raw data into actionable insights for strategic decision-making.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">IBM</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand key BI concepts and implementation strategies</li>
                      <li>• Apply data analytics techniques for business insights</li>
                      <li>• Evaluate and select appropriate BI tools and technologies</li>
                      <li>• Develop data visualization and reporting skills</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ibm/business-intelligence-bi-essentials?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Statistics for Data Science with Python</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master Python-based statistical analysis from descriptive stats to hypothesis testing and regression. Perfect for data science beginners.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.6 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">IBM</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Calculate and apply measures of central tendency and dispersion</li>
                      <li>• Summarize and visualize data clearly for non-statisticians</li>
                      <li>• Identify appropriate hypothesis tests for common data sets</li>
                      <li>• Conduct hypothesis tests correlation tests and regression analysis</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ibm/statistics-for-data-science-with-python?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Fundamentals of Financial Risk Management</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master key risk management concepts and techniques in finance. Learn to identify, measure, and manage various types of financial risks.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">Self-paced</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 text-teal-700 dark:text-teal-200 px-3 py-2 rounded-lg shadow-md border border-teal-200 dark:border-teal-800 transform hover:scale-105 transition-transform">New York Institute of Finance</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Distinguish between financial risks and business risks</li>
                      <li>• Analyze various types of financial risk and their sources</li>
                      <li>• Evaluate risk management's value enhancement to firms</li>
                      <li>• Understand systemic risk and regulatory frameworks</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/new-york-institute-of-finance/fundamentals-of-financial-risk-management?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">FinTech: Foundations, Payments, and Regulations</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master the fundamentals of financial technology, from digital payments to regulatory frameworks. Perfect for understanding modern finance.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.6 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950 dark:to-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-200 px-3 py-2 rounded-lg shadow-md border border-fuchsia-200 dark:border-fuchsia-800 transform hover:scale-105 transition-transform">University of Pennsylvania</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand the fundamentals of FinTech and market size</li>
                      <li>• Analyze payment systems and regulatory frameworks</li>
                      <li>• Evaluate robo-advising and digital financial services</li>
                      <li>• Comprehend financial regulations in technology</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-pennsylvania/fintech-foundations-payments-and-regulations?ref=CP112" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Cybersecurity Careers</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Explore cybersecurity career paths, required skills, and industry certifications to launch your career in information security.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">2.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">IBM</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Compare roles and responsibilities in cybersecurity</li>
                      <li>• Map IT skills to different cybersecurity positions</li>
                      <li>• Identify required industry certifications</li>
                      <li>• Develop a targeted career development plan</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ibm/introduction-to-cybersecurity-careers" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Cybersecurity Foundations</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master essential cybersecurity concepts from scratch, including network basics, cloud computing, and security fundamentals.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.9 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 text-teal-700 dark:text-teal-200 px-3 py-2 rounded-lg shadow-md border border-teal-200 dark:border-teal-800 transform hover:scale-105 transition-transform">InfoSec</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand core cybersecurity concepts and the CIA triad</li>
                      <li>• Master fundamental networking principles and protocols</li>
                      <li>• Learn cloud computing basics and virtual machine setup</li>
                      <li>• Grasp essential cybersecurity terminology and concepts</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/infosec/introduction-to-cybersecurity-foundations" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-rose-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Ethical Hacking Essentials (EHE)</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Learn cybersecurity fundamentals including ethical hacking, penetration testing, and security assessment techniques.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">15.3 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 text-rose-700 dark:text-rose-200 px-3 py-2 rounded-lg shadow-md border border-rose-200 dark:border-rose-800 transform hover:scale-105 transition-transform">EC-Council</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand fundamental information security concepts</li>
                      <li>• Master ethical hacking techniques and methodologies</li>
                      <li>• Identify and assess system vulnerabilities</li>
                      <li>• Implement effective security countermeasures</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ec-council/ethical-hacking-essentials-ehe" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-cyan-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to AI for Cybersecurity</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Learn to implement AI techniques in cybersecurity, from threat detection to biometric authentication. Perfect for security professionals exploring AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">0.7 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 text-violet-700 dark:text-violet-200 px-3 py-2 rounded-lg shadow-md border border-violet-200 dark:border-violet-800 transform hover:scale-105 transition-transform">Johns Hopkins University</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Use AI techniques to detect and mitigate cyber threats</li>
                      <li>• Develop machine learning models for spam and phishing detection</li>
                      <li>• Implement AI-driven biometric authentication solutions</li>
                      <li>• Apply practical cybersecurity skills using real-world tools</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/johns-hopkins-university/introduction-to-ai-for-cybersecurity" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Cybersecurity Tools & Cyberattacks</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master cybersecurity essentials: threat detection to defense. Understand key concepts to protect data, systems & networks from cyberattacks.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.9 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">IBM</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Apply cybersecurity fundamentals to protect digital assets</li>
                      <li>• Identify and mitigate various types of cyber threats</li>
                      <li>• Implement essential security controls and best practices</li>
                      <li>• Understand authentication and access management</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/ibm/introduction-to-cybersecurity-tools-cyberattacks" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Put It to Work: Prepare for Cybersecurity Jobs</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master essential skills for cybersecurity careers: incident handling, stakeholder communication, and job preparation.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">2.42 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">Google</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Identify and escalate security incidents appropriately</li>
                      <li>• Communicate effectively with stakeholders about security matters</li>
                      <li>• Engage with the cybersecurity community and stay current</li>
                      <li>• Prepare compelling job applications and interview effectively</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/google/put-it-to-work-prepare-for-cybersecurity-jobs" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Foundations of Cybersecurity</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Begin your cybersecurity career with Google's comprehensive introduction to security fundamentals, tools, and best practices.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.45 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 px-3 py-2 rounded-lg shadow-md border border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-transform">Google</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand core cybersecurity concepts and terminology</li>
                      <li>• Identify common security threats and attack methods</li>
                      <li>• Explore essential security frameworks and controls</li>
                      <li>• Learn about key cybersecurity tools and their applications</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/google/foundations-of-cybersecurity" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <BarChart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Copilot for Cybersecurity</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Learn to leverage Microsoft Copilot's AI capabilities for advanced security analysis and threat detection.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">0.9 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 px-3 py-2 rounded-lg shadow-md border border-purple-200 dark:border-purple-800 transform hover:scale-105 transition-transform">Microsoft</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Apply Generative AI for security log analysis</li>
                      <li>• Detect and analyze password attack patterns</li>
                      <li>• Identify directory traversal attack signatures</li>
                      <li>• Leverage AI for DDoS attack detection</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/microsoft/copilot-for-cybersecurity" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Cybersecurity for Data Science</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Learn essential cybersecurity concepts and tools for data science, from CIA principles to risk mitigation strategies.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">2.1 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 transform hover:scale-105 transition-transform">University of Colorado Boulder</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand and apply CIA principles to cyber scenarios</li>
                      <li>• Identify social and technical vulnerabilities in data security</li>
                      <li>• Master ethical boundaries of cybersecurity practices</li>
                      <li>• Implement data protection strategies</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-colorado-boulder/cybersecurity-for-data-science" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Cybersecurity Testing and Prevention</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master essential penetration testing and security prevention techniques using Microsoft Azure cloud platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">4.9 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 px-3 py-2 rounded-lg shadow-md border border-purple-200 dark:border-purple-800 transform hover:scale-105 transition-transform">Microsoft</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Create and execute comprehensive penetration test plans</li>
                      <li>• Implement and configure security prevention tools</li>
                      <li>• Conduct security testing in Azure environments</li>
                      <li>• Manage and respond to vulnerabilities</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/microsoft/cybersecurity-testing-and-prevention" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Python for Cybersecurity</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master Python programming fundamentals for cybersecurity applications, including network scanning, MITRE ATT&CK framework, and initial access techniques.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">1.88 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 text-teal-700 dark:text-teal-200 px-3 py-2 rounded-lg shadow-md border border-teal-200 dark:border-teal-800 transform hover:scale-105 transition-transform">InfoSec</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Learn Python fundamentals for cybersecurity applications</li>
                      <li>• Implement network scanning and reconnaissance tools</li>
                      <li>• Understand and utilize the MITRE ATT&CK framework</li>
                      <li>• Develop scripts for initial access techniques</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/infosec/introduction-to-python-for-cybersecurity" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="group bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-white/60 dark:border-slate-700/60 hover:border-white/80 dark:hover:border-slate-600/80 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-teal-600" />
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                    FREE
                  </span>
                </div>
                <CardTitle className="text-xl mb-2">Introduction to Cybersecurity for Business</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Master fundamental cybersecurity concepts and risk management for business environments.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex-1">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">3.5 Hours</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level:</span>
                    <span className="font-medium">Beginner</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Certificate:</span>
                    <span className="font-medium text-green-600">Yes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm gap-2">
                    <span className="font-bold text-foreground">Provider:</span>
                    <span className="font-bold bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 px-3 py-2 rounded-lg shadow-md border border-cyan-200 dark:border-cyan-800 transform hover:scale-105 transition-transform">University of Colorado System</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    <strong>What you'll learn:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• Understand core cybersecurity principles and CIA triad</li>
                      <li>• Assess and manage security risks in business contexts</li>
                      <li>• Implement basic security frameworks and controls</li>
                      <li>• Identify common cyber threats and attack surfaces</li>
                    </ul>
                  </div>
                  <Link href="https://www.riseupp.com/course/university-of-colorado-system/introduction-to-cybersecurity-for-business" target="_blank">
                  <Button className="w-full mt-8 h-12">
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Partner Programs?</h2>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
                <p className="text-muted-foreground">Get guaranteed admission and special benefits not available through direct applications.</p>
              </div>
              
              <div className="text-center">
                <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground">Personal guidance from application to arrival at your chosen institution.</p>
              </div>
              
              <div className="text-center">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Streamlined Process</h3>
                <p className="text-muted-foreground">Simplified applications with faster processing times and higher success rates.</p>
              </div>
              
              <div className="text-center">
                <HeartHandshake className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Cost Savings</h3>
                <p className="text-muted-foreground">Special tuition rates and scholarship opportunities through our partnerships.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
            Contact our advisors to find the perfect partner program for your academic goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="tel:+918583035656">
              <Button size="lg" className="bg-white text-primary hover:bg-primary-foreground/90">
                <Users className="mr-2 h-4 w-4" />
                Speak with Advisor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
