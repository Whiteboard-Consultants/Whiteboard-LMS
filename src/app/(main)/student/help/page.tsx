'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search, BookOpen, Target, Award, BarChart3, GraduationCap, Zap } from 'lucide-react';

const helpSections = [
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    icon: BarChart3,
    color: 'text-blue-600',
    description: 'Understand your learning progress at a glance',
    content: [
      {
        question: 'What metrics are shown on my dashboard?',
        answer: 'Your dashboard displays: Total Courses (courses you\'ve enrolled in), Tests Completed (assessments you\'ve taken), Average Score (your overall performance), and Learning Streak (consecutive days of activity). These metrics help you track your overall learning progress and engagement.',
      },
      {
        question: 'How is my average score calculated?',
        answer: 'Your average score is calculated from all completed tests and assessments. It\'s the mean of all your test scores and helps you understand your overall performance across different subjects and difficulty levels.',
      },
      {
        question: 'What is a learning streak?',
        answer: 'A learning streak tracks consecutive days on which you engage with the LMS (complete courses, take tests, or practice skills). Keep your streak going to maintain momentum in your learning journey!',
      },
    ],
  },
  {
    id: 'tests',
    title: 'Tests & Assessments',
    icon: GraduationCap,
    color: 'text-purple-600',
    description: 'Master the testing process and improve your scores',
    content: [
      {
        question: 'How do I take a test?',
        answer: 'Navigate to the Tests section, select a test you want to take, and click "Start Test". You\'ll be presented with questions one at a time. Use "Save & Next" to move between questions and "Save & Submit" on the final question to complete the test. You cannot go back to previous questions, so review carefully before moving forward.',
      },
      {
        question: 'What do the different test types mean?',
        answer: 'Practice Tests allow unlimited attempts with immediate feedback, ideal for learning. Quizzes are shorter evaluations that count toward your course progress. Final Tests/Assessments are cumulative evaluations used to determine course completion and certification eligibility.',
      },
      {
        question: 'How are scores calculated?',
        answer: 'Scores are based on correct answers out of total questions. You\'ll see your score as both a number (e.g., 8/10) and percentage (80%). Some tests may have different point values per question, which will be displayed before you start.',
      },
      {
        question: 'Can I retake a test?',
        answer: 'Retake options depend on the test type. Practice tests can typically be retaken unlimited times. Quizzes and final assessments usually have limited attempts (check the course details). Each attempt is recorded separately so you can track your improvement.',
      },
      {
        question: 'What does "Mark for Review" do?',
        answer: 'Marking a question for review flags it with a special indicator in the question palette. This helps you track questions you found difficult or want to reconsider, but doesn\'t change your answer. You can still review marked questions before submitting.',
      },
    ],
  },
  {
    id: 'skills',
    title: 'Skills Dashboard',
    icon: Zap,
    color: 'text-orange-600',
    description: 'Track and develop your professional skills',
    content: [
      {
        question: 'What are proficiency levels?',
        answer: 'Skills are rated in four levels: Beginner (just started learning), Intermediate (basic competency), Advanced (strong proficiency), and Expert (mastery). Your proficiency level is determined by courses completed and practice activity. Higher levels unlock more advanced courses.',
      },
      {
        question: 'What is mastery percentage?',
        answer: 'Mastery percentage (0-100%) represents your overall competency in a skill based on: courses completed, test scores, practice frequency, and time since last practice. It increases with engagement and decreases if you haven\'t practiced in a while.',
      },
      {
        question: 'How can I improve my skill levels?',
        answer: 'To improve: 1) Enroll in and complete relevant courses, 2) Practice regularly through quizzes and tests, 3) Review course materials and recommended resources, 4) Maintain consistency - regular practice improves mastery faster than sporadic effort.',
      },
      {
        question: 'What are skill categories?',
        answer: 'Skills are organized into categories like Technical, Professional Development, Soft Skills, etc. Viewing by category helps you understand your strengths and identify gaps within specific domains.',
      },
      {
        question: 'How do skill endorsements work?',
        answer: 'Endorsements are validations from instructors or peers that you have demonstrated a particular skill. While primarily tracked for future peer features, they serve as recognition of your competency beyond test scores.',
      },
    ],
  },
  {
    id: 'goals',
    title: 'Learning Goals & Gap Analysis',
    icon: Target,
    color: 'text-green-600',
    description: 'Set targets and identify areas for improvement',
    content: [
      {
        question: 'What is a learning goal?',
        answer: 'A learning goal is a specific skill development target you set for yourself. It includes a goal title, description, target role (optional), specific skills you want to master, priority level, and a target completion date. Goals help you stay focused on meaningful skill development.',
      },
      {
        question: 'How do I create a learning goal?',
        answer: 'Go to Skills Dashboard → Gap Analysis tab → Click "Create Learning Goal". Fill in your goal details, select the skills you want to develop from your available skills list, set the priority, and optionally add a target date. Click "Create Goal" to save it.',
      },
      {
        question: 'What is gap analysis?',
        answer: 'Gap analysis shows the difference between your current skill proficiency and your target proficiency level set in your learning goals. It helps identify: Total Gaps (number of skills needing improvement), Average Gap (average improvement percentage needed), and Critical Areas (highest-priority skills to focus on).',
      },
      {
        question: 'How do I interpret the gap analysis results?',
        answer: 'The dashboard shows: Total Gaps = number of skills with proficiency below your target, Average Gap % = average improvement needed across all goals, Critical Areas = top 5 skills you should focus on. These recommendations are prioritized by importance and gap size.',
      },
      {
        question: 'How can I close my skill gaps?',
        answer: 'To close gaps: 1) Identify high-priority skills in recommendations, 2) Enroll in relevant courses listed under each skill, 3) Complete assessments to boost your mastery percentage, 4) Practice regularly to maintain and improve proficiency, 5) Monitor your gap analysis dashboard to track progress.',
      },
      {
        question: 'Can I update or delete learning goals?',
        answer: 'Yes, in the Gap Analysis tab, each learning goal card has a delete button (trash icon). Simply click to remove a goal. Currently, to update goals, delete and recreate them with new details. Future versions will support in-place editing.',
      },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificates & Achievements',
    icon: Award,
    color: 'text-red-600',
    description: 'Earn and showcase your accomplishments',
    content: [
      {
        question: 'How do I earn a certificate?',
        answer: 'Certificates are earned by completing courses that offer them. Requirements typically include: attending all course modules, passing the final assessment with a minimum score (usually 60-70%), and meeting any additional course-specific requirements. Check course details for specific requirements.',
      },
      {
        question: 'What certificates are available?',
        answer: 'Certificates vary by course. Some are skill-based (e.g., "Python Programming Certificate"), role-based (e.g., "Data Science Professional"), or achievement-based (e.g., "100 Days Learning Streak"). Check the course page to see what certificates are available.',
      },
      {
        question: 'Can I share my certificates?',
        answer: 'Yes! Once earned, you can download certificates as PDF files and share them on professional profiles like LinkedIn. Certificates include issue date, your name, course title, and a verification code for authenticity.',
      },
      {
        question: 'How can I verify a certificate\'s authenticity?',
        answer: 'Each certificate has a unique verification code. Recipients can enter this code on our verification page to confirm the certificate\'s authenticity, issue date, and recipient name.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Finding & Enrolling in Courses',
    icon: BookOpen,
    color: 'text-teal-600',
    description: 'Discover and manage your learning content',
    content: [
      {
        question: 'How do I find courses?',
        answer: 'Use the Courses & Reports section to browse available courses. You can filter by: category, difficulty level, duration, and search by keywords. Recommended courses based on your current skills and goals are highlighted.',
      },
      {
        question: 'How do I enroll in a course?',
        answer: 'Click on any course card to view details. If interested, click the "Enroll" button. Most courses are free; some may require enrollment codes. Once enrolled, you\'ll see course content and can start learning immediately.',
      },
      {
        question: 'What should I know before enrolling?',
        answer: 'Check the course prerequisites (required prior knowledge), estimated duration, number of modules, whether it offers certificates, and what skills it develops. Start with foundational courses in a skill area before advanced ones.',
      },
      {
        question: 'How do I track my course progress?',
        answer: 'In "My Courses", you\'ll see progress bars for each enrolled course showing completion percentage, modules completed, and estimated time remaining. Your progress is auto-saved as you complete lessons and assessments.',
      },
      {
        question: 'Can I pause or drop a course?',
        answer: 'Yes, you can pause courses (saving your progress) or drop them (removing from your dashboard). Your progress can be recovered if you re-enroll. Dropping a course removes any earned points but doesn\'t affect completed certificates.',
      },
    ],
  },
  {
    id: 'tips',
    title: 'Best Practices & Tips',
    icon: Zap,
    color: 'text-yellow-600',
    description: 'Maximize your learning effectiveness',
    content: [
      {
        question: 'How can I learn more effectively?',
        answer: 'Best practices: 1) Set specific learning goals, 2) Study consistently (aim for daily engagement), 3) Mix different content types (videos, readings, quizzes), 4) Review difficult concepts regularly, 5) Take breaks to avoid burnout, 6) Track your progress using the dashboard.',
      },
      {
        question: 'How should I manage my time?',
        answer: 'Time management tips: 1) Schedule dedicated learning time, 2) Start with shorter courses to build momentum, 3) Use the course duration estimates to plan, 4) Break large courses into daily chunks, 5) Use your learning streak as motivation to maintain consistency.',
      },
      {
        question: 'How do I maintain a learning streak?',
        answer: 'Keep your streak alive by: 1) Completing at least one learning activity daily (course lesson, test, or practice), 2) Scheduling consistent learning times, 3) Setting calendar reminders, 4) Celebrating milestones (7-day, 30-day, etc.) to stay motivated.',
      },
      {
        question: 'What should I do if I\'m stuck on a concept?',
        answer: 'If struggling: 1) Review the lesson materials multiple times, 2) Check if prerequisite courses would help, 3) Look for additional practice problems, 4) Use the forums or messaging to ask instructors, 5) Don\'t rush - take time to truly understand before moving forward.',
      },
      {
        question: 'How do I choose which course to take next?',
        answer: 'Consider: 1) Your learning goals - choose courses targeting skill gaps, 2) Difficulty progression - don\'t skip prerequisites, 3) Duration - avoid overcommitting, 4) Relevance - focus on applicable skills for your role, 5) Recommendations - follow suggested learning paths.',
      },
    ],
  },
];

export default function StudentHelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const filteredSections = helpSections
    .map(section => ({
      ...section,
      content: section.content.filter(
        item =>
          item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter(section => section.content.length > 0 || searchTerm === '');

  const totalQuestions = helpSections.reduce((sum, s) => sum + s.content.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Learning Center</h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
            Everything you need to know to make the most of your learning journey
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search help topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{helpSections.length}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Topics</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{totalQuestions}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Questions</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">24/7</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">Always</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Updated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Sections */}
        <div className="space-y-8">
          {filteredSections.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    No results found for "{searchTerm}"
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Try searching with different keywords
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredSections.map(section => {
              const Icon = section.icon;
              return (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader className={`pb-4 ${section.color} bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Icon className={`h-6 w-6 ${section.color} mt-1`} />
                        <div>
                          <CardTitle className="text-2xl">{section.title}</CardTitle>
                          <CardDescription className="mt-2">{section.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">{section.content.length} Q&As</Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <Accordion
                      type="single"
                      collapsible
                      value={expandedItem || ''}
                      onValueChange={setExpandedItem}
                    >
                      {section.content.map((item, index) => {
                        const itemId = `${section.id}-${index}`;
                        return (
                          <AccordionItem key={itemId} value={itemId}>
                            <AccordionTrigger className="hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-lg">
                              <span className="text-left font-medium">{item.question}</span>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                              {item.answer}
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💬</div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Still need help?</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  Can't find what you're looking for? Reach out to our support team through the Messages section.
                </p>
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
