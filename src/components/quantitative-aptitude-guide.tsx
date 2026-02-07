'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, Target, Award, TrendingUp, AlertCircle } from 'lucide-react';

export function QuantitativeAptitudeGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4 py-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Quantitative Aptitude Mock Tests
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          For TCS/Infosys/Wipro/Capgemini/Accenture/eLitmus Campus Recruitment
        </p>
        <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
      </div>

      {/* About Section */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-2xl">About This Mock Test Series</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Series Overview */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Series Overview</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              This comprehensive mock test series has been meticulously designed to mirror the actual quantitative aptitude sections of leading IT companies' campus recruitment tests. Based on extensive analysis of previous year question patterns from <strong>TCS NQT, Infosys HackWithInfy, Wipro NLTH, Capgemini, Accenture, and eLitmus pH Test</strong>, these mocks provide an authentic simulation of the real examination environment.
            </p>
            
            {/* What's Inside */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg space-y-2 mb-4">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-500" />
                What's Inside:
              </h4>
              <ul className="space-y-2 text-slate-700 dark:text-slate-300 ml-7">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>5 Full-Length Mock Tests</strong> - Each containing 20 carefully curated questions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>100 Unique Questions</strong> - Covering the entire quantitative aptitude syllabus</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Medium to High Difficulty Level</strong> - Designed to challenge and sharpen your problem-solving skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Complete Solutions</strong> - Step-by-step explanations for every single question</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Pattern-Based Learning</strong> - Questions reflect actual company recruitment trends</span>
                </li>
              </ul>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Difficulty Distribution:</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">30% Medium Difficulty</span>
                  <div className="w-40 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[30%] h-full bg-green-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">50% Medium-High Difficulty</span>
                  <div className="w-40 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[50%] h-full bg-yellow-500" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 dark:text-slate-300">20% High Difficulty</span>
                  <div className="w-40 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[20%] h-full bg-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Best Practices Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Best Practices for Approaching These Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Before You Begin */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Before You Begin
            </h3>
            
            <div className="space-y-4">
              <div className="border-l-2 border-blue-500 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">1. Create Exam-Like Conditions</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-1 ml-4">
                  <li>✓ Find a quiet, distraction-free environment</li>
                  <li>✓ Keep a timer visible (recommend 30 minutes per mock for realistic practice)</li>
                  <li>✓ Have only a pen, paper, and calculator (if permitted in your target exam)</li>
                  <li>✓ No phones, internet, or reference materials during the test</li>
                </ul>
              </div>

              <div className="border-l-2 border-purple-500 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">2. Prepare Your Mindset</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-1 ml-4">
                  <li>✓ Treat each mock as a real examination</li>
                  <li>✓ Accept that you won't know all answers immediately - that's the learning opportunity</li>
                  <li>✓ Focus on accuracy over speed initially; speed will develop with practice</li>
                </ul>
              </div>

              <div className="border-l-2 border-green-500 pl-4">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">3. Have Resources Ready</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-1 ml-4">
                  <li>✓ Rough sheets for calculations</li>
                  <li>✓ A separate notebook to track mistakes and learnings</li>
                  <li>✓ Formula sheet (prepare one before starting the series)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* During the Test */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">During the Test</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Strategic Time Management (30 minutes total)</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>• <strong>First 2 minutes:</strong> Quick scan of all 20 questions</li>
                  <li>• <strong>Identify easy wins:</strong> Mark 5-7 questions you can solve quickly (1 minute each)</li>
                  <li>• <strong>Tackle medium questions:</strong> Allocate 1.5-2 minutes per question</li>
                  <li>• <strong>Difficult questions:</strong> Attempt strategically or skip if time-pressed</li>
                  <li>• <strong>Last 5 minutes:</strong> Review marked questions and double-check calculations</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Question Selection</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>• Start with your strongest topics to build confidence and momentum</li>
                  <li>• Don't get stuck on one question for more than 3 minutes</li>
                  <li>• If stuck, mark for review and move on</li>
                  <li>• In MCQs, elimination strategy can be powerful</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Avoid Common Pitfalls</h4>
                <ul className="text-slate-700 dark:text-slate-300 space-y-2 ml-4">
                  <li>• Don't assume question patterns - read each question completely</li>
                  <li>• Watch for tricky wording like "at least," "at most," "excluding"</li>
                  <li>• Be careful with negative numbers, ratios, and percentage calculations</li>
                  <li>• Don't rush through formula application - verify you're using the right one</li>
                </ul>
              </div>
            </div>
          </div>

          {/* After the Test */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">After the Test</h3>
            
            <div className="space-y-3 text-slate-700 dark:text-slate-300">
              <p><strong>1. Immediate Review (Within 30 Minutes)</strong></p>
              <ul className="ml-4 space-y-1 mb-4">
                <li>• Go through ALL questions, not just incorrect ones</li>
                <li>• Understand why correct answers are right</li>
                <li>• For wrong answers: Identify if it was a concept gap, calculation error, or time pressure</li>
              </ul>

              <p><strong>2. Error Analysis (Critical Step)</strong></p>
              <p className="ml-4 mb-4">Create an error log with these columns: Question Type, Error Category, What I'll Do Differently Next Time, Related Formula/Concept to Revise</p>

              <p><strong>3. Progressive Practice</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• <strong>Mock 1-2:</strong> Take untimed to focus on accuracy and understanding</li>
                <li>• <strong>Mock 3-4:</strong> Introduce time pressure (35 minutes)</li>
                <li>• <strong>Mock 5:</strong> Full exam simulation (30 minutes)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Outcomes Section */}
      <Card className="border-t-4 border-t-green-500">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Award className="w-6 h-6 text-green-500" />
            Learning Outcomes & Growth Trajectory
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Conceptual Mastery</h4>
              <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Command over 15+ core quantitative topics</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Pattern recognition within 10-15 seconds</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Deep understanding of fundamental formulas</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Technical Skills</h4>
              <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> Enhanced calculation speed and accuracy</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> Proficiency in mental math</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" /> Mastery of approximation techniques</li>
              </ul>
            </div>

            <div className="bg-purple-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Exam Skills</h4>
              <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" /> Effective time allocation</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" /> Smart question selection</li>
                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" /> Pressure management</li>
              </ul>
            </div>

            <div className="bg-amber-50 dark:bg-slate-800 p-4 rounded-lg">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Performance Tracking</h4>
              <ul className="text-slate-700 dark:text-slate-300 space-y-2 text-sm">
                <li>After Mock 1: Baseline (target 60%+)</li>
                <li>After Mock 3: Progress check (target 70%+)</li>
                <li>After Mock 5: Final assessment (target 75-80%+)</li>
              </ul>
            </div>
          </div>

          {/* Competency Levels */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Expected Competency Levels</h4>
            <div className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-slate-800 rounded">
                <Badge className="bg-green-600">Mocks 1-2</Badge>
                <span>Beginner → Intermediate: From struggling with formulas → Applying formulas correctly</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-slate-800 rounded">
                <Badge className="bg-yellow-600">Mocks 3-4</Badge>
                <span>Intermediate → Advanced: From formula application → Pattern recognition</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-slate-800 rounded">
                <Badge className="bg-purple-600">Mock 5 + Revision</Badge>
                <span>Advanced → Expert: From problem-solving → Speed problem-solving</span>
              </div>
            </div>
          </div>

          {/* Success Benchmarks */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Success Benchmarks by Company</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                { company: 'TCS NQT', score: '12-14 correct (60-70%)' },
                { company: 'Infosys', score: '13-15 correct (65-75%)' },
                { company: 'Wipro', score: '14-15 correct (70-75%)' },
                { company: 'Capgemini', score: '13-15 correct (65-75%)' },
                { company: 'Accenture', score: '12-14 correct (60-70%)' },
                { company: 'eLitmus (>85 percentile)', score: '16-18 correct (80-90%)' }
              ].map((item) => (
                <div key={item.company} className="bg-slate-50 dark:bg-slate-800 p-3 rounded">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.company}</p>
                  <p className="text-slate-600 dark:text-slate-400">{item.score}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Formulas Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Key Formula Quick Reference</CardTitle>
          <CardDescription>
            Ensure you're comfortable with these formula families before starting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Speed, Time & Distance',
                formulas: ['Speed = Distance/Time', 'Average Speed = 2xy/(x+y)']
              },
              {
                title: 'Time & Work',
                formulas: ['Work = Rate × Time', 'Combined work rate = Sum of individual rates']
              },
              {
                title: 'Profit & Loss',
                formulas: ['Profit% = (Profit/CP) × 100', 'SP = CP × (100 + Profit%)/100']
              },
              {
                title: 'Interest',
                formulas: ['SI = (P × R × T)/100', 'CI = P(1 + R/100)^T - P']
              },
              {
                title: 'Geometry',
                formulas: ['Area of circle = πr²', 'Volume of cylinder = πr²h']
              },
              {
                title: 'Algebra',
                formulas: ['(a+b)² = a² + 2ab + b²', 'a² - b² = (a+b)(a-b)']
              }
            ].map((section) => (
              <div key={section.title} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{section.title}</h4>
                <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 font-mono">
                  {section.formulas.map((formula, idx) => (
                    <li key={idx} className="bg-white dark:bg-slate-900 p-2 rounded">
                      {formula}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Tips Section */}
      <Card className="border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-500" />
            Final Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: 'Consistency Over Intensity', desc: 'Daily 1-hour practice beats 7-hour weekend marathons' },
              { title: 'Learn from Every Question', desc: 'Even correct answers can teach you faster methods' },
              { title: 'Build Your Formula Sheet', desc: 'Writing formulas yourself aids memory retention' },
              { title: 'Join Study Groups', desc: 'Explaining concepts to others deepens your understanding' },
              { title: 'Stay Updated', desc: 'Check official company websites for latest test patterns' },
              { title: 'Physical Well-being', desc: 'Good sleep and nutrition directly impact calculation speed' },
              { title: 'Positive Self-Talk', desc: 'Replace "I can\'t" with "I\'m learning to"' },
              { title: 'Celebrate Progress', desc: 'Track improvements, no matter how small' }
            ].map((tip) => (
              <div key={tip.title} className="space-y-1">
                <h4 className="font-semibold text-slate-900 dark:text-white">{tip.title}</h4>
                <p className="text-sm text-slate-700 dark:text-slate-300">{tip.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-white dark:bg-slate-800 rounded-lg border-l-4 border-l-amber-500">
            <p className="text-slate-700 dark:text-slate-300 font-semibold">
              💡 Remember: <strong>These mocks are not just tests; they're training tools.</strong> Every mistake is a stepping stone to mastery. Your goal isn't perfection on the first attempt—it's continuous improvement across all five mocks.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mt-3">
              <strong>Now, let's begin your journey to placement success!</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
