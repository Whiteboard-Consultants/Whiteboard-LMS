'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, BookOpen, Clock, Zap, TrendingUp, Target, Brain, CheckCircle } from 'lucide-react';
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion';

interface Series {
    id: string;
    title: string;
    description?: string | null;
    topic_area?: string | null;
    instructor_id?: string | null;
    price?: number | null;
    discount_percentage?: number | null;
    is_published?: boolean;
    created_at?: string;
}

interface TestAttempt {
    id: string;
    title: string;
    description?: string | null;
    topic?: string | null;
    difficultyLevel?: string | null;
    duration?: number | null;
    questionCount?: number | null;
    price?: number | null;
    discount_percentage?: number | null;
    is_published?: boolean;
}

interface FilterOptions {
    difficulties?: string[];
    topics?: string[];
    priceRanges?: { label: string; min: number; max: number }[];
}

interface SeriesDetailClientProps {
    series: Series;
    tests: TestAttempt[];
    filterOptions: FilterOptions | null | undefined;
}

export function SeriesDetailClient({
    series,
    tests: initialTests,
    filterOptions,
}: SeriesDetailClientProps) {
    const router = useRouter();
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [selectedTopic, setSelectedTopic] = useState<string>('all');

    // Filter tests based on selected filters
    const filteredTests = useMemo(() => {
        return initialTests.filter((test) => {
            const difficultyMatch =
                selectedDifficulty === 'all' || test.difficultyLevel === selectedDifficulty;
            const topicMatch = selectedTopic === 'all' || test.topic === selectedTopic;
            return difficultyMatch && topicMatch;
        });
    }, [initialTests, selectedDifficulty, selectedTopic]);

    const handleTestClick = (testId: string) => {
        router.push(`/test/${testId}`);
    };

    const handleBackClick = () => {
        router.push('/mock-tests');
    };

    // Get unique difficulties and topics from tests
    const uniqueDifficulties = useMemo(() => {
        const difficulties = new Set<string>(
            initialTests
                .map((t) => t.difficultyLevel)
                .filter((d): d is string => !!d && d.length > 0)
        );
        return Array.from(difficulties).sort();
    }, [initialTests]);

    const uniqueTopics = useMemo(() => {
        const topics = new Set<string>(
            initialTests
                .map((t) => t.topic)
                .filter((t): t is string => !!t && t.length > 0)
        );
        return Array.from(topics).sort();
    }, [initialTests]);

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    const totalPrice = series.price || 0;
    const discountedPrice =
        totalPrice - (totalPrice * (series.discount_percentage || 0)) / 100;

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 dark:from-background dark:to-secondary/10">
            {/* Header */}
            <div className="border-b border-border/40 bg-background/95 backdrop-blur sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleBackClick}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Mock Tests
                    </Button>
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-foreground mb-2">
                                {series.title}
                            </h1>
                            {series.description && (
                                <p className="text-muted-foreground text-lg">
                                    {series.description}
                                </p>
                            )}
                        </div>
                        {series.topic_area && (
                            <Badge variant="outline" className="whitespace-nowrap">
                                {series.topic_area}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Hero Content */}
            <section className="py-12 px-4 md:px-6 lg:px-8 bg-gradient-to-br from-blue-50/70 via-white/60 to-indigo-50/70 dark:from-blue-950/20 dark:via-slate-900/30 dark:to-indigo-950/20 border-b border-slate-200/40 dark:border-slate-700/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                        Ace Your Dream Company Placement
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Why Campus Mock Tests */}
                        <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-6 border border-blue-100/50 dark:border-blue-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Why Campus Mock Tests</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Top IT companies hire based on performance, not just potential. Mock tests replicate TCS, Infosys, Wipro, Capgemini, and Accenture exam patterns, helping you compete with thousands of candidates nationwide.
                            </p>
                        </div>

                        {/* What's Inside */}
                        <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-6 border border-purple-100/50 dark:border-purple-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">What&apos;s Inside</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Complete test series covering Quantitative Aptitude, Logical Reasoning, and Verbal Ability. Get 100+ questions with company-specific patterns, difficulty levels matching actual exams, and detailed solutions that teach problem-solving strategies.
                            </p>
                        </div>

                        {/* How to Excel */}
                        <div className="bg-white/70 dark:bg-slate-800/50 rounded-xl p-6 border border-emerald-100/50 dark:border-emerald-900/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">How to Excel</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                Practice with realistic time limits, analyze performance reports to identify weak topics, focus your revision strategically, and build the speed and accuracy that recruiters demand. Track improvement across multiple attempts until you&apos;re placement-ready.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Filter by Difficulty
                        </label>
                        <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                            <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                                <SelectValue placeholder="All difficulties" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All difficulties</SelectItem>
                                {uniqueDifficulties.map((difficulty) => (
                                    <SelectItem key={difficulty} value={difficulty}>
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {uniqueTopics.length > 0 && (
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Filter by Topic
                            </label>
                            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                                <SelectTrigger className="border-border/40 bg-background/50 backdrop-blur">
                                    <SelectValue placeholder="All topics" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All topics</SelectItem>
                                    {uniqueTopics.map((topic) => (
                                        <SelectItem key={topic} value={topic}>
                                            {topic}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                        Showing {filteredTests.length} of {initialTests.length} tests
                    </div>
                </div>

                {/* Tests Grid */}
                {filteredTests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredTests.map((test) => (
                            <Card
                                key={test.id}
                                className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40 border-l-4 border-l-orange-500 rounded-lg"
                                onClick={() => handleTestClick(test.id)}
                            >
                                {/* Header with Title and Difficulty */}
                                <div className="px-6 pt-6 pb-4 border-b border-slate-200/60 dark:border-slate-700/40">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="text-lg font-bold text-foreground line-clamp-2 flex-1">
                                            {test.title}
                                        </h3>
                                        {test.difficultyLevel && (
                                            <Badge
                                                className={`text-xs whitespace-nowrap shrink-0 ${getDifficultyColor(
                                                    test.difficultyLevel
                                                )}`}
                                            >
                                                {test.difficultyLevel}
                                            </Badge>
                                        )}
                                    </div>
                                    {test.description && (
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {test.description}
                                        </p>
                                    )}
                                </div>

                                {/* Content */}
                                <CardContent className="flex-1 flex flex-col px-6 py-4 space-y-4">
                                    {/* Instructor Info */}
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        <span>Navnit Daniel Alley</span>
                                    </div>

                                    {/* Questions and Duration - Inline with better visibility */}
                                    <div className="flex items-center gap-8 text-sm">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <span className="text-muted-foreground text-xs">Questions</span>
                                                <div className="font-semibold text-foreground">
                                                    {test.questionCount ? `${test.questionCount} Q` : '-'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                            <div>
                                                <span className="text-muted-foreground text-xs">Duration</span>
                                                <div className="font-semibold text-foreground">
                                                    {test.duration ? `${Math.round(test.duration / 60)}m` : '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Difficulty Level Display */}
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-5 h-5 text-slate-400" />
                                        <div>
                                            <span className="text-muted-foreground text-xs">Difficulty</span>
                                            <div className="font-semibold text-foreground">
                                                {test.difficultyLevel ? (
                                                    <Badge className={`text-xs mt-1 ${getDifficultyColor(test.difficultyLevel)}`}>
                                                        {test.difficultyLevel}
                                                    </Badge>
                                                ) : (
                                                    <span>-</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1"></div>

                                    {/* Price and Button */}
                                    <div className="border-t border-slate-200/60 dark:border-slate-700/40 pt-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            {test.price && (
                                                <>
                                                    <span className="text-sm text-muted-foreground line-through">
                                                        ₹{(test.price * 1.5).toFixed(0)}
                                                    </span>
                                                    <span className="text-2xl font-bold text-foreground">
                                                        ₹{test.price}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <Button 
                                            variant="default" 
                                            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg h-10 font-semibold flex items-center justify-center gap-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleTestClick(test.id);
                                            }}
                                        >
                                            Start
                                            <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </Button>

                                        {/* Series Offer Banner */}
                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-center">
                                            <p className="text-xs text-emerald-700 dark:text-emerald-300">
                                                Or get entire series for <span className="font-bold">₹600</span> <span className="text-emerald-600 dark:text-emerald-400">(Save 20%)</span>
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 border-border/40 bg-card/50 backdrop-blur mb-12">
                        <CardContent>
                            <p className="text-muted-foreground mb-4">
                                No tests match your filter criteria
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedDifficulty('all');
                                    setSelectedTopic('all');
                                }}
                            >
                                Clear Filters
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* How to Use This Series - Moved to bottom */}
                <Card className="mb-8 bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            How to Use This Series
                        </CardTitle>
                        <CardDescription>
                            Maximize your preparation with our structured approach
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none text-sm">
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-foreground mb-2">Before You Start</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>Review the topic fundamentals to refresh concepts</li>
                                    <li>Set aside uninterrupted time for each test</li>
                                    <li>Don't refer to solutions before attempting all questions</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">During the Test</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>Manage time effectively across all sections</li>
                                    <li>Mark difficult questions for later review</li>
                                    <li>Attempt all questions within the time limit</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-semibold text-foreground mb-2">After the Test</h4>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li>Analyze your performance and error patterns</li>
                                    <li>Review solutions and understand alternate approaches</li>
                                    <li>Track improvement across multiple attempts</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quantitative Aptitude Mock Tests Accordion */}
                <Card className="bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
                    <CardHeader>
                        <CardTitle className="text-2xl">Quantitative Aptitude Mock Tests</CardTitle>
                        <CardDescription className="text-base">
                            For TCS/Infosys/Wipro/Capgemini/Accenture/eLitmus Campus Recruitment
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {/* About This Mock Test Series */}
                            <AccordionItem value="about">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    About This Mock Test Series
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base">Series Overview</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                                            This comprehensive mock test series has been meticulously designed to mirror the actual quantitative aptitude sections of leading IT companies&apos; campus recruitment tests. Based on extensive analysis of previous year question patterns from TCS NQT, Infosys HackWithInfy, Wipro NLTH, Capgemini, Accenture, and eLitmus pH Test, these mocks provide an authentic simulation of the real examination environment.
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base">What&apos;s Inside:</h4>
                                        <ul className="space-y-2 text-sm text-muted-foreground">
                                            <li className="flex gap-3">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                                <span><strong>5 Full-Length Mock Tests</strong> - Each containing 20 carefully curated questions</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                                <span><strong>100 Unique Questions</strong> - Covering the entire quantitative aptitude syllabus</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                                <span><strong>Medium to High Difficulty Level</strong> - Designed to challenge and sharpen your problem-solving skills</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                                <span><strong>Complete Solutions</strong> - Step-by-step explanations for every single question</span>
                                            </li>
                                            <li className="flex gap-3">
                                                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                                                <span><strong>Pattern-Based Learning</strong> - Questions reflect actual company recruitment trends</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base">Difficulty Distribution:</h4>
                                        <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                                            <li>• 30% Medium Difficulty</li>
                                            <li>• 50% Medium-High Difficulty</li>
                                            <li>• 20% High Difficulty</li>
                                        </ul>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Best Practices */}
                            <AccordionItem value="practices">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    Best Practices for Approaching These Tests
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base flex items-center gap-2">
                                            Before You Begin
                                        </h4>
                                        <ol className="space-y-3 text-sm text-muted-foreground pl-4">
                                            <li>
                                                <strong className="text-foreground">Create Exam-Like Conditions</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2 text-muted-foreground">
                                                    <li>Find a quiet, distraction-free environment</li>
                                                    <li>Keep a timer visible (recommend 30 minutes per mock for realistic practice)</li>
                                                    <li>Have only a pen, paper, and calculator (if permitted in your target exam)</li>
                                                    <li>No phones, internet, or reference materials during the test</li>
                                                </ul>
                                            </li>
                                            <li className="mt-3">
                                                <strong className="text-foreground">Prepare Your Mindset</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2 text-muted-foreground">
                                                    <li>Treat each mock as a real examination</li>
                                                    <li>Accept that you won't know all answers immediately - that's the learning opportunity</li>
                                                    <li>Focus on accuracy over speed initially; speed will develop with practice</li>
                                                </ul>
                                            </li>
                                            <li className="mt-3">
                                                <strong className="text-foreground">Have Resources Ready</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2 text-muted-foreground">
                                                    <li>Rough sheets for calculations</li>
                                                    <li>A separate notebook to track mistakes and learnings</li>
                                                    <li>Formula sheet (prepare one before starting the series)</li>
                                                </ul>
                                            </li>
                                        </ol>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base">During the Test</h4>
                                        <div className="space-y-3 text-sm text-muted-foreground">
                                            <div>
                                                <strong className="text-foreground">Strategic Time Management (30 minutes total)</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                                                    <li>First 2 minutes: Quick scan of all 20 questions</li>
                                                    <li>Identify easy wins: Mark 5-7 questions you can solve quickly (1 minute each)</li>
                                                    <li>Tackle medium questions: Allocate 1.5-2 minutes per question</li>
                                                    <li>Difficult questions: Attempt strategically or skip if time-pressed</li>
                                                    <li>Last 5 minutes: Review marked questions and double-check calculations</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <strong className="text-foreground">Smart Question Selection</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                                                    <li>Start with your strongest topics to build confidence and momentum</li>
                                                    <li>Don't get stuck on one question for more than 3 minutes</li>
                                                    <li>If stuck, mark for review and move on</li>
                                                    <li>In MCQs, elimination strategy can be powerful</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <strong className="text-foreground">Avoid Common Pitfalls</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                                                    <li>Don't assume question patterns - read each question completely</li>
                                                    <li>Watch for tricky wording like "at least," "at most," "excluding"</li>
                                                    <li>Be careful with negative numbers, ratios, and percentage calculations</li>
                                                    <li>Don't rush through formula application - verify you're using the right one</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3 text-base">After the Test</h4>
                                        <div className="space-y-3 text-sm text-muted-foreground">
                                            <div>
                                                <strong className="text-foreground">1. Immediate Review (Within 30 Minutes)</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                                                    <li>Go through ALL questions, not just incorrect ones</li>
                                                    <li>Understand why correct answers are right</li>
                                                    <li>For wrong answers: Identify if it was a concept gap, calculation error, or time pressure</li>
                                                </ul>
                                            </div>
                                            <div>
                                                <strong className="text-foreground">2. Error Analysis (Critical Step)</strong>
                                                <p className="mt-2">Create an error log with these columns: Question Type, Error Category, What I'll Do Differently Next Time, Related Formula/Concept to Revise</p>
                                            </div>
                                            <div>
                                                <strong className="text-foreground">3. Progressive Practice</strong>
                                                <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
                                                    <li>Mock 1-2: Take untimed to focus on accuracy and understanding</li>
                                                    <li>Mock 3-4: Introduce time pressure (35 minutes)</li>
                                                    <li>Mock 5: Full exam simulation (30 minutes)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Learning Outcomes */}
                            <AccordionItem value="outcomes">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    Learning Outcomes & Growth Trajectory
                                </AccordionTrigger>
                                <AccordionContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <h4 className="font-semibold text-foreground mb-3">Conceptual Mastery</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li>• Command over 15+ core quantitative topics</li>
                                                <li>• Pattern recognition within 10-15 seconds</li>
                                                <li>• Deep understanding of fundamental formulas</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <h4 className="font-semibold text-foreground mb-3">Technical Skills</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li>• Enhanced calculation speed and accuracy</li>
                                                <li>• Proficiency in mental math</li>
                                                <li>• Mastery of approximation techniques</li>
                                            </ul>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                                            <h4 className="font-semibold text-foreground mb-3">Exam Skills</h4>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li>• Effective time allocation</li>
                                                <li>• Smart question selection</li>
                                                <li>• Pressure management</li>
                                            </ul>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">Performance Tracking</h4>
                                        <ul className="space-y-2 text-sm text-muted-foreground pl-4">
                                            <li>• After Mock 1: Baseline (target 60%+)</li>
                                            <li>• After Mock 3: Progress check (target 70%+)</li>
                                            <li>• After Mock 5: Final assessment (target 75-80%+)</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">Expected Competency Levels</h4>
                                        <div className="space-y-2 text-sm text-muted-foreground">
                                            <div className="flex justify-between items-center border-b border-border/40 pb-2">
                                                <span className="font-medium text-foreground">Mocks 1-2</span>
                                                <span>Beginner → Intermediate: From struggling with formulas → Applying formulas correctly</span>
                                            </div>
                                            <div className="flex justify-between items-center border-b border-border/40 pb-2">
                                                <span className="font-medium text-foreground">Mocks 3-4</span>
                                                <span>Intermediate → Advanced: From formula application → Pattern recognition</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-medium text-foreground">Mock 5 + Revision</span>
                                                <span>Advanced → Expert: From problem-solving → Speed problem-solving</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-foreground mb-3">Success Benchmarks by Company</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">TCS NQT</span><span className="text-muted-foreground">12-14 correct (60-70%)</span></div>
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">Infosys</span><span className="text-muted-foreground">13-15 correct (65-75%)</span></div>
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">Wipro</span><span className="text-muted-foreground">14-15 correct (70-75%)</span></div>
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">Capgemini</span><span className="text-muted-foreground">13-15 correct (65-75%)</span></div>
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">Accenture</span><span className="text-muted-foreground">12-14 correct (60-70%)</span></div>
                                            <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-900/30 rounded"><span className="font-medium">eLitmus (&gt;85 percentile)</span><span className="text-muted-foreground">16-18 correct (80-90%)</span></div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Key Formulas */}
                            <AccordionItem value="formulas">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    Key Formula Quick Reference
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Ensure you're comfortable with these formula families before starting
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Speed, Time & Distance</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>Speed = Distance/Time</div>
                                                <div>Average Speed = 2xy/(x+y)</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Time & Work</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>Work = Rate × Time</div>
                                                <div>Combined work rate = Sum of individual rates</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Profit & Loss</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>Profit% = (Profit/CP) × 100</div>
                                                <div>SP = CP × (100 + Profit%)/100</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Interest</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>SI = (P × R × T)/100</div>
                                                <div>CI = P(1 + R/100)^T - P</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Geometry</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>Area of circle = πr²</div>
                                                <div>Volume of cylinder = πr²h</div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-foreground mb-3">Algebra</h4>
                                            <div className="space-y-2 text-sm text-muted-foreground font-mono bg-slate-50 dark:bg-slate-900/30 p-3 rounded">
                                                <div>(a+b)² = a² + 2ab + b²</div>
                                                <div>a² - b² = (a+b)(a-b)</div>
                                            </div>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>

                            {/* Final Tips */}
                            <AccordionItem value="tips">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                                    Final Tips for Success
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-4">
                                        <div className="border-l-4 border-blue-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Consistency Over Intensity</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Daily 1-hour practice beats 7-hour weekend marathons</p>
                                        </div>
                                        <div className="border-l-4 border-purple-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Learn from Every Question</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Even correct answers can teach you faster methods</p>
                                        </div>
                                        <div className="border-l-4 border-emerald-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Build Your Formula Sheet</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Writing formulas yourself aids memory retention</p>
                                        </div>
                                        <div className="border-l-4 border-amber-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Join Study Groups</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Explaining concepts to others deepens your understanding</p>
                                        </div>
                                        <div className="border-l-4 border-pink-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Stay Updated</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Check official company websites for latest test patterns</p>
                                        </div>
                                        <div className="border-l-4 border-cyan-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Physical Well-being</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Good sleep and nutrition directly impact calculation speed</p>
                                        </div>
                                        <div className="border-l-4 border-indigo-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Positive Self-Talk</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Replace "I can't" with "I'm learning to"</p>
                                        </div>
                                        <div className="border-l-4 border-green-500 pl-4">
                                            <h4 className="font-semibold text-foreground">Celebrate Progress</h4>
                                            <p className="text-sm text-muted-foreground mt-1">Track improvements, no matter how small</p>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
                                            <p className="text-sm font-semibold text-foreground mb-2">💡 Key Insight</p>
                                            <p className="text-sm text-muted-foreground">
                                                These mocks are not just tests; they're training tools. Every mistake is a stepping stone to mastery. Your goal isn't perfection on the first attempt—it's continuous improvement across all five mocks.
                                            </p>
                                        </div>
                                        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 mt-4">
                                            <p className="text-sm text-foreground font-semibold">
                                                Now, let's begin your journey to placement success!
                                            </p>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
