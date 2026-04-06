'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronDown, BookOpen, Users, Zap, MessageSquare, BarChart3, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function InstructorHelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Help & Documentation"
          description="Complete guide for instructors using WhitedgeLMS"
        />

        <Tabs defaultValue="getting-started" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8 h-auto flex-wrap">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="grading">Grading</TabsTrigger>
            <TabsTrigger value="test-reports">Test Reports</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* GETTING STARTED TAB */}
          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Getting Started as an Instructor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Your First Login</h3>
                  <ol className="space-y-3 list-decimal list-inside">
                    <li>Navigate to <code className="bg-slate-100 px-2 py-1 rounded">http://localhost:3000</code></li>
                    <li>Click "Login" and enter your instructor credentials</li>
                    <li>You'll be taken to your <strong>Instructor Dashboard</strong></li>
                    <li>Bookmark this page for quick access</li>
                  </ol>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Understanding Your Dashboard</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="font-semibold text-blue-900">📊 Dashboard Overview</p>
                      <p className="text-sm text-blue-800 mt-2">Your dashboard shows key statistics and quick links to all instructor features. It's your command center for managing courses and grading assessments.</p>
                    </div>
                    <p className="text-sm text-slate-600">From your dashboard, you can quickly access:</p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>Grading</strong> - View and grade pending assessments</li>
                      <li><strong>Announcements</strong> - Post updates for your students</li>
                      <li><strong>Messages</strong> - Communicate with students</li>
                      <li><strong>Courses & Reports</strong> - Manage course content and view analytics</li>
                      <li><strong>Tests</strong> - Create and manage assessments</li>
                      <li><strong>AI Suggester</strong> - Get AI-powered suggestions for content</li>
                    </ul>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-3">Navigation Quick Tips</h3>
                  <div className="space-y-2 text-sm">
                    <p>✨ <strong>Sidebar Navigation:</strong> Click items in the left sidebar to move between different sections</p>
                    <p>🔔 <strong>Notifications:</strong> Check for updates and alerts at the top of the page</p>
                    <p>👤 <strong>Profile Menu:</strong> Click your avatar/name (top right) to access account settings</p>
                    <p>⚙️ <strong>Mobile Friendly:</strong> The navigation adjusts for mobile devices - tap the menu icon to expand</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DASHBOARD TAB */}
          <TabsContent value="dashboard" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Understanding Your Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Your instructor dashboard is your command center. It displays all key metrics and provides quick access to important functions.</p>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold mb-2">📊 Dashboard Sections</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="font-semibold text-sm text-blue-900">Quick Stats Cards</p>
                        <p className="text-xs text-blue-800 mt-1">Shows high-level overview of your teaching metrics: total students, active courses, pending tasks, and recent activity.</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="font-semibold text-sm text-green-900">Recent Assessments</p>
                        <p className="text-xs text-green-800 mt-1">List of recently submitted assessments pending your review. Click any to start grading immediately.</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="font-semibold text-sm text-purple-900">Quick Links</p>
                        <p className="text-xs text-purple-800 mt-1">Shortcuts to frequently used features like Grading, Messages, Announcements, and Course Management.</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded">
                        <p className="font-semibold text-sm text-amber-900">Notifications</p>
                        <p className="text-xs text-amber-800 mt-1">Recent notifications including new student enrollments, messages, and system updates.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold mb-2">📈 Understanding the Metrics</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-semibold text-green-900">Active Courses</p>
                        <p className="text-slate-700">Number of courses you're currently teaching. Includes only courses with active students.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Total Students</p>
                        <p className="text-slate-700">Combined count of all students enrolled across your active courses.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Pending Reviews</p>
                        <p className="text-slate-700">Number of student assessments waiting for your feedback. This is your primary action item.</p>
                      </div>
                      <div>
                        <p className="font-semibold text-green-900">Completion Rate</p>
                        <p className="text-slate-700">Percentage of assessments you've reviewed. Higher is better - shows you're keeping up with grading.</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold mb-2">🎯 Using Dashboard Data</h3>
                    <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                      <li>Check pending reviews count to prioritize your grading workload</li>
                      <li>Monitor completion rate to stay on schedule with feedback</li>
                      <li>Use quick links to jump to frequently needed sections</li>
                      <li>Review recent activity to stay aware of course dynamics</li>
                      <li>Check notifications for important updates and messages</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* COURSES TAB */}
          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Creating and Managing Courses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="create-course">
                    <AccordionTrigger className="text-base font-semibold">Create a New Course</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <p className="font-semibold">Step 1: Access Course Management</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Click <strong>"Courses & Reports"</strong> in the sidebar</li>
                          <li>Click <strong>"New Course"</strong> button (top right)</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Step 2: Fill Course Details</p>
                        <div className="bg-slate-50 p-3 rounded text-sm space-y-2">
                          <div>
                            <p className="font-semibold text-slate-900">Course Title</p>
                            <p className="text-slate-700">Enter the course name (e.g., "LinkedIn Profile Optimization")</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Description</p>
                            <p className="text-slate-700">Write a clear description of what students will learn</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Category</p>
                            <p className="text-slate-700">Select from predefined categories (Professional Development, Skills, etc.)</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Level</p>
                            <p className="text-slate-700">Choose difficulty level: Beginner, Intermediate, or Advanced</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Price</p>
                            <p className="text-slate-700">Set course price (can be free or paid)</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Step 3: Add Course Content</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Add course thumbnail/image</li>
                          <li>Create course modules/sections</li>
                          <li>Add lessons within each module</li>
                          <li>Upload video, text, or other media content</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Step 4: Configure Assessments</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Add tests/quizzes to course lessons</li>
                          <li>Link assessments to specific learning modules</li>
                          <li>Set passing thresholds if needed</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Step 5: Publish Course</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Review all course details</li>
                          <li>Click <strong>"Publish Course"</strong> to make it available to students</li>
                          <li>Course is now visible in the student marketplace</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="manage-course">
                    <AccordionTrigger className="text-base font-semibold">Manage Course Content</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm">Once your course is published, you can make updates and manage content.</p>

                      <div className="space-y-3">
                        <p className="font-semibold">Editing Course Details</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Go to <strong>Courses & Reports</strong> → Select your course</li>
                          <li>Click <strong>"Edit"</strong> to modify course information</li>
                          <li>Update title, description, price, or other details</li>
                          <li>Click <strong>"Save Changes"</strong></li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Managing Lessons</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>View all lessons in the course structure</li>
                          <li>Add new lessons to existing modules</li>
                          <li>Reorder lessons by dragging</li>
                          <li>Edit lesson content and media</li>
                          <li>Archive or delete lessons (careful - affects student progress)</li>
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Managing Assessments</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Add quizzes or tests to lessons</li>
                          <li>Edit test questions and answers</li>
                          <li>View test performance analytics</li>
                          <li>Adjust passing scores or test settings</li>
                        </ul>
                      </div>

                      <div className="bg-amber-50 p-3 rounded">
                        <p className="text-sm text-amber-900"><strong>⚠️ Important:</strong> When editing course content, be careful about removing lessons or changing assessments, as this may affect students who are already enrolled.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="view-enrollments">
                    <AccordionTrigger className="text-base font-semibold">View Course Enrollments</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm">Track which students are enrolled in your courses and their progress.</p>

                      <div className="space-y-3">
                        <p className="font-semibold">Accessing Enrollment Data</p>
                        <ol className="list-decimal list-inside text-sm space-y-1 ml-2">
                          <li>Go to <strong>Courses & Reports</strong> in the sidebar</li>
                          <li>Select a course from the list</li>
                          <li>Click the <strong>"Enrollments"</strong> or <strong>"Students"</strong> tab</li>
                        </ol>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">What You Can See</p>
                        <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                          <p><strong>Student Names:</strong> List of all enrolled students</p>
                          <p><strong>Enrollment Date:</strong> When they joined the course</p>
                          <p><strong>Progress:</strong> How far they've progressed (lessons completed)</p>
                          <p><strong>Test Scores:</strong> Their assessment results</p>
                          <p><strong>Status:</strong> Active, completed, or dropped</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Taking Action</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Click a student name to see detailed progress</li>
                          <li>Send messages to individual students</li>
                          <li>View their assessment submissions</li>
                          <li>Check their completion status</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="course-analytics">
                    <AccordionTrigger className="text-base font-semibold">Course Analytics & Insights</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm">Understand how your course is performing and where students struggle.</p>

                      <div className="space-y-3">
                        <p className="font-semibold">Key Metrics</p>
                        <div className="space-y-2">
                          <div className="bg-green-50 p-3 rounded text-sm">
                            <p className="font-semibold text-green-900">Average Score</p>
                            <p className="text-green-800">Mean test score across all students - indicates overall course difficulty</p>
                          </div>
                          <div className="bg-blue-50 p-3 rounded text-sm">
                            <p className="font-semibold text-blue-900">Completion Rate</p>
                            <p className="text-blue-800">Percentage of enrolled students who finished the course</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded text-sm">
                            <p className="font-semibold text-purple-900">Drop-off Points</p>
                            <p className="text-purple-800">Lessons where students commonly stop progressing (identify difficult content)</p>
                          </div>
                          <div className="bg-amber-50 p-3 rounded text-sm">
                            <p className="font-semibold text-amber-900">Question Performance</p>
                            <p className="text-amber-800">Which test questions students struggle with most</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold">Using Analytics to Improve</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>If average score is low, consider reviewing lesson explanations</li>
                          <li>If completion is low, check for drop-off points and improve that content</li>
                          <li>If specific questions have low scores, rewrite or clarify them</li>
                          <li>Compare metrics over time to see improvements</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEST REPORTS TAB */}
          <TabsContent value="test-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Understanding Test Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="accessing-reports">
                    <AccordionTrigger className="text-base font-semibold">Accessing Test Reports</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>There are multiple ways to view test reports depending on what you want to analyze.</p>

                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm mb-2">Option 1: From Sidebar</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Click <strong>"Test Reports"</strong> in the sidebar</li>
                            <li>View comprehensive reports across all your tests</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">Option 2: From Courses Page</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Go to <strong>Courses & Reports</strong> → Select a course</li>
                            <li>Click <strong>"Test Reports"</strong> tab within that course</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">Option 3: From Tests Page</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Go to <strong>Tests</strong> in the sidebar</li>
                            <li>Click a test to see detailed report</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="report-overview">
                    <AccordionTrigger className="text-base font-semibold">Report Overview - Key Sections</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold mb-2">📊 Summary Statistics</p>
                          <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                            <p><strong>Total Attempts:</strong> How many students have taken the test</p>
                            <p><strong>Average Score:</strong> Mean score across all attempts (0-100)</p>
                            <p><strong>Highest Score:</strong> Best student performance</p>
                            <p><strong>Lowest Score:</strong> Lowest performance</p>
                            <p><strong>Pass Rate:</strong> Percentage of students who passed (if applicable)</p>
                          </div>
                        </div>

                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="font-semibold mb-2">📈 Score Distribution</p>
                          <div className="bg-green-50 p-3 rounded text-sm space-y-2">
                            <p>Visual graph showing how student scores are distributed across ranges (e.g., 0-25%, 25-50%, 50-75%, 75-100%)</p>
                            <p className="text-xs mt-2"><strong>What it means:</strong> A curve toward higher scores indicates easier test; spread indicates varied understanding</p>
                          </div>
                        </div>

                        <div className="border-l-4 border-purple-500 pl-4">
                          <p className="font-semibold mb-2">❓ Question Performance</p>
                          <div className="bg-purple-50 p-3 rounded text-sm space-y-2">
                            <p>Breakdown of each test question with:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                              <li><strong>Correct %:</strong> Percentage of students who answered correctly</li>
                              <li><strong>Incorrect %:</strong> Percentage who got it wrong</li>
                              <li><strong>Difficulty Index:</strong> How hard the question is overall</li>
                              <li><strong>Discrimination Index:</strong> How well it differentiates high/low performers</li>
                            </ul>
                          </div>
                        </div>

                        <div className="border-l-4 border-amber-500 pl-4">
                          <p className="font-semibold mb-2">👥 Student Breakdown</p>
                          <div className="bg-amber-50 p-3 rounded text-sm space-y-2">
                            <p>Table showing each student's:</p>
                            <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                              <li>Name and ID</li>
                              <li>Total score achieved</li>
                              <li>Time spent on test</li>
                              <li>Attempt number (if multiple attempts allowed)</li>
                              <li>Submission date/time</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="interpreting-data">
                    <AccordionTrigger className="text-base font-semibold">How to Interpret Test Data</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-sm mb-2">📌 Understanding Average Score</p>
                          <div className="bg-slate-50 p-3 rounded text-sm space-y-2">
                            <p><strong>85% or higher:</strong> Test is appropriately easy for your students - they understand the material</p>
                            <p><strong>70-85%:</strong> Optimal difficulty - challenging but achievable. Most students grasp content</p>
                            <p><strong>50-70%:</strong> Test is challenging. Consider if material needs better explanation or if test is too hard</p>
                            <p><strong>Below 50%:</strong> Test may be too difficult or students didn't understand key concepts. Review lesson content</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">📌 Analyzing Question Performance</p>
                          <div className="bg-slate-50 p-3 rounded text-sm space-y-2">
                            <p><strong>80%+ correct:</strong> Too easy - question isn't discriminating or teaching anything new</p>
                            <p><strong>50-80% correct:</strong> Good - shows students are learning and it's appropriately challenging</p>
                            <p><strong>20-50% correct:</strong> Very challenging - indicate this is a difficult concept, or question may be unclear</p>
                            <p><strong>Below 20%:</strong> Likely too hard or poorly written. Review question wording and consider revision</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-sm mb-2">📌 Using Discrimination Index</p>
                          <div className="bg-slate-50 p-3 rounded text-sm space-y-2">
                            <p><strong>What it measures:</strong> How well top performers vs. bottom performers answer the question</p>
                            <p><strong>Positive discrimination:</strong> Top students answer correctly more than low students (good - question is valid)</p>
                            <p><strong>Negative discrimination:</strong> Low students answer correctly more than high students (bad - something is wrong with question)</p>
                            <p><strong>Zero discrimination:</strong> All students answer the same (question isn't differentiating)</p>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="using-insights">
                    <AccordionTrigger className="text-base font-semibold">Taking Action Based on Reports</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <p className="text-sm mb-3">Test reports aren't just for viewing - use them to improve your course.</p>

                      <div className="space-y-3">
                        <div className="border-l-4 border-green-500 pl-4">
                          <p className="font-semibold mb-2">✅ If Average Score is Good (70%+)</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Your teaching is effective - keep this approach</li>
                            <li>Consider if test could be slightly harder to better differentiate students</li>
                            <li>Use as benchmark for future courses</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-amber-500 pl-4">
                          <p className="font-semibold mb-2">⚠️ If Average Score is Low (&lt;70%)</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Review lesson materials - is the content clear enough?</li>
                            <li>Check if questions match what was taught</li>
                            <li>Consider adding practice questions or review materials</li>
                            <li>Check which specific questions have low scores (next step)</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-red-500 pl-4">
                          <p className="font-semibold mb-2">❌ If Specific Questions Have &lt;50% Correct</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Review the lesson that teaches this concept</li>
                            <li>Check if question wording is clear and unambiguous</li>
                            <li>Verify answer key is correct</li>
                            <li>Add explanations in lesson or consider rewording question</li>
                            <li>Discuss topic in announcements or messages</li>
                          </ul>
                        </div>

                        <div className="border-l-4 border-blue-500 pl-4">
                          <p className="font-semibold mb-2">💡 High-Achieving Students Scoring Low</p>
                          <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                            <li>Indicates question has negative discrimination (something is wrong)</li>
                            <li>Review question carefully for ambiguity or errors</li>
                            <li>Consider invalidating that question for all students</li>
                            <li>Rewrite the question for next iteration</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="filtering-reports">
                    <AccordionTrigger className="text-base font-semibold">Filtering and Customizing Reports</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-3">
                        <p className="font-semibold text-sm mb-2">Report Options</p>
                        <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                          <p><strong>Date Range:</strong> Filter results by specific time period (e.g., last 7 days, last month)</p>
                          <p><strong>Course Filter:</strong> View reports for specific courses only</p>
                          <p><strong>Test Selection:</strong> Choose which test(s) to analyze</p>
                          <p><strong>Export Options:</strong> Download reports as CSV or PDF for further analysis</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="font-semibold text-sm mb-2">Export & Analysis</p>
                        <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                          <li>Export test results to Excel for deeper analysis</li>
                          <li>Create custom comparisons or trends</li>
                          <li>Share reports with course coordinators</li>
                          <li>Maintain records for accreditation or review</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GRADING TAB */}
          <TabsContent value="grading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Complete Grading Workflow
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="step1">
                    <AccordionTrigger className="text-base font-semibold">Step 1: Access the Grading Dashboard</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>Click <strong>"Grading"</strong> in the left sidebar to view all pending assessments.</p>
                      <div className="bg-blue-50 p-4 rounded mt-3">
                        <p className="text-sm"><strong>You'll see:</strong></p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>Pending Review count (assessments waiting for you)</li>
                          <li>Reviewed count (assessments you've completed)</li>
                          <li>Total count (all assessments in your courses)</li>
                          <li>List of pending assessments with student names</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step2">
                    <AccordionTrigger className="text-base font-semibold">Step 2: Select an Assessment to Grade</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>From the pending list, click on any assessment marked "Pending Review".</p>
                      <div className="bg-amber-50 p-4 rounded mt-3">
                        <p className="text-sm"><strong>Assessment opens showing:</strong></p>
                        <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                          <li>The question/prompt being assessed</li>
                          <li>The student's actual response</li>
                          <li>A suggested model answer for reference</li>
                          <li>Feedback form for your comments</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step3">
                    <AccordionTrigger className="text-base font-semibold">Step 3: Review Student Answer</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>Carefully read the student's response under <strong>"Your Answer"</strong> section.</p>
                      <div className="mt-3 space-y-2 text-sm">
                        <p><strong>✓ What to look for:</strong></p>
                        <ul className="list-disc list-inside ml-2 space-y-1">
                          <li>Clarity and coherence of their explanation</li>
                          <li>Understanding of the key concepts</li>
                          <li>Use of specific examples or details</li>
                          <li>Alignment with the suggested model answer</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step4">
                    <AccordionTrigger className="text-base font-semibold">Step 4: Compare with Model Answer (Optional)</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>Click the <strong>"Compare"</strong> button to view the model answer side-by-side with the student response.</p>
                      <div className="bg-green-50 p-4 rounded mt-3">
                        <p className="text-sm font-semibold mb-2">Benefits of comparison:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>See what key elements they included or missed</li>
                          <li>Ensure consistent grading standards</li>
                          <li>Identify specific improvement areas to mention</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step5">
                    <AccordionTrigger className="text-base font-semibold">Step 5: Write Detailed Feedback</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>In the <strong>"Feedback"</strong> text area, write constructive comments for the student:</p>
                      <div className="bg-purple-50 p-4 rounded mt-3 space-y-3">
                        <p className="text-sm"><strong>Good feedback includes:</strong></p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>✅ What they did well</li>
                          <li>💡 Specific areas for improvement</li>
                          <li>📝 Examples or clarifications</li>
                          <li>🎯 Actionable next steps</li>
                        </ul>
                        <div className="mt-4 p-3 bg-white rounded border border-purple-200">
                          <p className="text-xs font-semibold mb-2">Example Feedback:</p>
                          <p className="text-xs text-slate-700">
                            "Great response! You clearly understand how to adapt your message for different audiences. I particularly liked your emphasis on strategic thinking. To strengthen it further, try being more specific about the platforms and content types you'd recommend. This will make your strategy more concrete and actionable. Keep developing these communication skills!"
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step6">
                    <AccordionTrigger className="text-base font-semibold">Step 6: Assign Score (Optional)</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>Optionally enter a numerical score (0-100) in the Score field.</p>
                      <div className="bg-slate-50 p-4 rounded mt-3">
                        <p className="text-sm"><strong>Note:</strong> Detailed written feedback is more valuable than a score. Scores are supplementary for tracking purposes.</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step7">
                    <AccordionTrigger className="text-base font-semibold">Step 7: Submit Feedback</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>Click the blue <strong>"Submit Feedback"</strong> button to save and send your feedback to the student.</p>
                      <div className="bg-green-50 p-4 rounded mt-3 space-y-2">
                        <p className="text-sm font-semibold">✅ What happens next:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>Your feedback is saved to the database</li>
                          <li>A notification is automatically created for the student</li>
                          <li>The assessment status changes from "Pending" to "Reviewed"</li>
                          <li>Your progress updates (Pending decreases, Reviewed increases)</li>
                          <li>You're returned to the dashboard</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="step8">
                    <AccordionTrigger className="text-base font-semibold">Step 8: Student Receives Notification</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p>The student automatically receives a notification that feedback has been posted:</p>
                      <div className="bg-indigo-50 p-4 rounded mt-3">
                        <p className="text-sm"><strong>Student will see:</strong></p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>"Feedback Posted" notification in their Notifications page</li>
                          <li>The assessment name and your posted feedback</li>
                          <li>A "View" button to see full details and your feedback</li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FEATURES TAB */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Core Features Explained
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold mb-2">📊 Grading Dashboard</h3>
                    <p className="text-sm text-slate-600">Central hub showing all pending assessments, completion statistics, and quick navigation to grading tasks.</p>
                    <p className="text-xs text-slate-500 mt-2">Access: Sidebar → Grading</p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold mb-2">✍️ Feedback Form</h3>
                    <p className="text-sm text-slate-600">Rich text editor where you write detailed, constructive feedback for student assessments. Supports multi-line comments with proper formatting.</p>
                    <p className="text-xs text-slate-500 mt-2">Location: Individual assessment grading page</p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold mb-2">🔍 Answer Comparison</h3>
                    <p className="text-sm text-slate-600">Side-by-side view of student answer and model answer to ensure fair, consistent grading across all submissions.</p>
                    <p className="text-xs text-slate-500 mt-2">Access: "Compare" button on grading page</p>
                  </div>

                  <div className="border-l-4 border-amber-500 pl-4">
                    <h3 className="font-semibold mb-2">🔔 Automatic Notifications</h3>
                    <p className="text-sm text-slate-600">System automatically notifies students when you post feedback, eliminating manual notification step and keeping students informed instantly.</p>
                    <p className="text-xs text-slate-500 mt-2">Triggered: On "Submit Feedback" click</p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold mb-2">📈 Progress Tracking</h3>
                    <p className="text-sm text-slate-600">Real-time updates showing how many assessments you've reviewed, pending items, and total workload across all courses.</p>
                    <p className="text-xs text-slate-500 mt-2">Visible: Dashboard and page headers</p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-semibold mb-2">💬 Messaging System</h3>
                    <p className="text-sm text-slate-600">Communicate directly with students about their work, coursework, or general questions. Supports threaded conversations.</p>
                    <p className="text-xs text-slate-500 mt-2">Access: Sidebar → Messages</p>
                  </div>

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="font-semibold mb-2">📢 Announcements</h3>
                    <p className="text-sm text-slate-600">Post important updates, deadlines, and information to all students in your courses at once.</p>
                    <p className="text-xs text-slate-500 mt-2">Access: Sidebar → Announcements</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BEST PRACTICES TAB */}
          <TabsContent value="best-practices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Best Practices for Effective Grading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="feedback-quality">
                    <AccordionTrigger className="text-base font-semibold">📝 Writing Quality Feedback</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <div className="space-y-3">
                        <div>
                          <p className="font-semibold text-green-700 mb-2">✅ DO:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
                            <li>Be specific - reference their exact words or ideas</li>
                            <li>Balance praise with constructive criticism</li>
                            <li>Provide clear, actionable suggestions</li>
                            <li>Explain the "why" behind your feedback</li>
                            <li>Connect feedback to learning objectives</li>
                            <li>Be encouraging and supportive in tone</li>
                            <li>Keep it professional and formal</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-red-700 mb-2">❌ DON'T:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 text-slate-700">
                            <li>Just say "Good job" or "Needs improvement"</li>
                            <li>Use vague or unclear language</li>
                            <li>Make it personal or emotional</li>
                            <li>Overwhelm with too many points</li>
                            <li>Ignore strengths entirely</li>
                            <li>Use sarcasm or passive-aggressive tone</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="consistency">
                    <AccordionTrigger className="text-base font-semibold">⚖️ Maintaining Consistency</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                        <li>Use the model answer as a reference for all similar questions</li>
                        <li>Grade similar responses similarly</li>
                        <li>Document your grading criteria or rubric mentally</li>
                        <li>Take breaks between grading to maintain fairness</li>
                        <li>Review your feedback on the first few assessments to set tone</li>
                        <li>If using scores, apply them consistently across submissions</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="timing">
                    <AccordionTrigger className="text-base font-semibold">⏰ Timing and Workflow</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                        <li><strong>Turnaround Time:</strong> Aim to grade within 3-5 business days</li>
                        <li><strong>Batch Processing:</strong> Grade multiple assessments in one session for consistency</li>
                        <li><strong>Daily Goal:</strong> Set a realistic number to grade per day (e.g., 5-10)</li>
                        <li><strong>Fresh Mind:</strong> Grade when you're alert and focused, not tired</li>
                        <li><strong>Schedule:</strong> Dedicate specific times for grading to maintain routine</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="communication">
                    <AccordionTrigger className="text-base font-semibold">💬 Student Communication</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                        <li><strong>Respond to Messages:</strong> Check the Messages section regularly</li>
                        <li><strong>Clarify Expectations:</strong> Use announcements to set clear criteria</li>
                        <li><strong>Office Hours:</strong> Consider setting regular availability for student questions</li>
                        <li><strong>Feedback Tone:</strong> Remember students read this alone - be encouraging</li>
                        <li><strong>Follow-up:</strong> Offer to discuss feedback if student reaches out</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="quality-assessment">
                    <AccordionTrigger className="text-base font-semibold">🎯 Assessing Quality</AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <p className="text-sm mb-3">When evaluating a descriptive answer, consider:</p>
                      <ul className="list-disc list-inside text-sm space-y-2 text-slate-700">
                        <li><strong>Clarity:</strong> Is their explanation clear and well-organized?</li>
                        <li><strong>Completeness:</strong> Did they address all parts of the question?</li>
                        <li><strong>Accuracy:</strong> Is the information correct and well-informed?</li>
                        <li><strong>Depth:</strong> Do they show sophisticated thinking or surface-level understanding?</li>
                        <li><strong>Examples:</strong> Do they use specific, relevant examples?</li>
                        <li><strong>Analysis:</strong> Do they explain their thinking, not just state facts?</li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ TAB */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="faq1">
                    <AccordionTrigger>How do I reset my password?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Click your profile avatar (top right) → Account Settings → Change Password. Or use "Forgot Password" on the login page.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq2">
                    <AccordionTrigger>Can I edit feedback after submitting?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Not currently. Please review your feedback carefully before clicking "Submit Feedback". If you need to update feedback, contact system support.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq3">
                    <AccordionTrigger>How long does it take for students to see my feedback?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Instantly! Students receive a notification immediately when you submit feedback. They can click "View" to see your comments right away.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq4">
                    <AccordionTrigger>What if a student's answer is blank?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Still provide constructive feedback explaining what you expected and encourage them to attempt the question. You might also reach out via Messages to understand any challenges they faced.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq5">
                    <AccordionTrigger>Should I always assign a numeric score?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">No, detailed written feedback is more valuable than a score alone. Numeric scores are optional and best used to track metrics or follow a grading rubric.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq6">
                    <AccordionTrigger>Can multiple instructors grade the same assessment?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">The system is currently designed for one instructor per assessment. If you need to assign co-grading, contact system support for options.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq7">
                    <AccordionTrigger>How do I create or manage tests?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Go to Sidebar → Tests to create new assessments. The Tests section covers MCQ and descriptive question types. See the Tests documentation for detailed instructions.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq8">
                    <AccordionTrigger>Where can I see student performance analytics?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Go to Sidebar → Courses & Reports or Test Reports to view detailed analytics including class averages, question performance, and individual student progress.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq9">
                    <AccordionTrigger>How do I post an announcement?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Go to Sidebar → Announcements, click "New Announcement", write your message, select which courses it applies to, and click "Publish". All students in those courses will be notified.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq10">
                    <AccordionTrigger>What is the AI Suggester?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">The AI Suggester (Sidebar → AI Suggester) helps generate course content, feedback suggestions, and assessment ideas. It's a tool to enhance your teaching materials and speed up lesson preparation.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq11">
                    <AccordionTrigger>How do I contact support?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">For technical issues or feature requests, email info@whiteboardconsultant.com with a detailed description. Include screenshots if possible. Response time is typically 24-48 hours.</p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq12">
                    <AccordionTrigger>Can I see all my courses in one place?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm">Yes! Go to Sidebar → Courses & Reports to view all your courses, enrollment numbers, and performance metrics across all courses you teach.</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-900">
                  <strong>💡 Need more help?</strong> Check the Grading tab for step-by-step walkthrough of the complete grading process, or reach out to info@whiteboardconsultant.com for technical assistance.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <p className="font-semibold text-green-900">Ready to start grading?</p>
                <p className="text-sm text-green-800 mt-1">Head to the <strong>Grading</strong> section in your sidebar to begin reviewing student assessments. Remember, quality feedback makes a real difference in student learning!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
