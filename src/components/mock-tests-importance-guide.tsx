'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Zap, BarChart3, Clock, Brain, CheckCircle } from 'lucide-react';

export function MockTestsImportanceGuide() {
    return (
        <section className="py-12 px-4 md:px-6 lg:px-8 mb-8">
            <div className="max-w-6xl mx-auto">
                {/* Main Title */}
                <div className="mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                        Master Your Exams with Strategic Practice
                    </h2>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                        Transform your exam preparation with targeted practice that builds confidence and results
                    </p>
                </div>

                {/* Three Main Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Why Practice Matters */}
                    <Card className="overflow-hidden bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/10 border-blue-200/50 dark:border-blue-900/40 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                    <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                    Why Practice Matters
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Mock tests bridge the gap between preparation and performance. They build exam confidence, reveal knowledge gaps, and sharpen time management skills—turning anxiety into readiness.
                            </p>
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Build exam confidence</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Identify knowledge gaps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Master time management</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* What We Offer */}
                    <Card className="overflow-hidden bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-950/30 dark:to-purple-950/10 border-purple-200/50 dark:border-purple-900/40 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                    <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                    What We Offer
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Comprehensive mock test series for Campus Placements (TCS, Infosys, Wipro, Capgemini, Accenture), IELTS, TOEFL, and competitive exams.
                            </p>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Each series features realistic questions, detailed solutions, and performance analytics to track your progress.
                            </p>
                        </CardContent>
                    </Card>

                    {/* How It Works */}
                    <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-50/50 dark:from-emerald-950/30 dark:to-emerald-950/10 border-emerald-200/50 dark:border-emerald-900/40 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                    <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                    How It Works
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-2">
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">1</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Take timed tests in simulated exam conditions</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">2</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Receive instant feedback with explanations</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">3</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Analyze detailed performance reports</span>
                                </div>
                                <div className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-bold text-emerald-600 dark:text-emerald-400">4</span>
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Focus revision on weak areas & repeat</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Benefits Grid */}
                <div className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-emerald-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-emerald-950/20 rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-8 md:p-12">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                        Your Path to Success
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                    <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Targeted Practice</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Focus on areas that matter most for your exam
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                                    <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Time Management</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Master pacing with realistic timed conditions
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                    <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Performance Insights</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Track progress with detailed analytics
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="mb-3 flex justify-center">
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-full">
                                    <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                                </div>
                            </div>
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Rapid Improvement</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                See measurable progress with every attempt
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
