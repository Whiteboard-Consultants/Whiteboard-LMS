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
import { ArrowLeft, BookOpen, Clock, Zap, TrendingUp } from 'lucide-react';

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
    difficulty?: string | null;
    duration_minutes?: number | null;
    total_questions?: number | null;
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
                selectedDifficulty === 'all' || test.difficulty === selectedDifficulty;
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
                .map((t) => t.difficulty)
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

            {/* Hero Content Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="rounded-2xl bg-gradient-to-br from-blue-50/70 via-white/60 to-indigo-50/70 dark:from-blue-950/30 dark:via-slate-900/40 dark:to-indigo-950/30 backdrop-blur-md border border-blue-100/40 dark:border-blue-900/40 p-8 md:p-12 shadow-lg">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-8">
                        Ace Your Dream Company Placement
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-3">Why Campus Mock Tests</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Top IT companies hire based on performance, not just potential. Mock tests replicate TCS, Infosys, Wipro, Capgemini, and Accenture exam patterns, helping you compete with thousands of candidates nationwide.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400 mb-3">What&apos;s Inside</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Complete test series covering Quantitative Aptitude, Logical Reasoning, and Verbal Ability. Get 100+ questions with company-specific patterns, difficulty levels matching actual exams, and detailed solutions that teach problem-solving strategies.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-3">How to Excel</h3>
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                Practice with realistic time limits, analyze performance reports to identify weak topics, focus your revision strategically, and build the speed and accuracy that recruiters demand. Track improvement across multiple attempts until you&apos;re placement-ready.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

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
                                className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors cursor-pointer bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40"
                                onClick={() => handleTestClick(test.id)}
                            >
                                <CardHeader>
                                    <CardTitle className="text-lg line-clamp-2">
                                        {test.title}
                                    </CardTitle>
                                    {test.description && (
                                        <CardDescription className="line-clamp-2">
                                            {test.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>

                                <CardContent className="flex-1 flex flex-col">
                                    <div className="space-y-3 flex-1 pb-4">
                                        {test.total_questions && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Questions:</span>
                                                <span className="font-medium text-foreground">
                                                    {test.total_questions}
                                                </span>
                                            </div>
                                        )}
                                        {test.duration_minutes && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Duration:</span>
                                                <span className="font-medium text-foreground">
                                                    {test.duration_minutes} min
                                                </span>
                                            </div>
                                        )}
                                        {test.topic && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Topic:</span>
                                                <span className="font-medium text-foreground">
                                                    {test.topic}
                                                </span>
                                            </div>
                                        )}
                                        {test.difficulty && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground">Difficulty:</span>
                                                <Badge
                                                    className={`text-xs ${getDifficultyColor(
                                                        test.difficulty
                                                    )}`}
                                                >
                                                    {test.difficulty}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>

                                    <Button 
                                        variant="default" 
                                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleTestClick(test.id);
                                        }}
                                    >
                                        Start Test
                                    </Button>
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
                <Card className="mb-8 border-border/40 bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/40">
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
            </div>
        </div>
    );
}
