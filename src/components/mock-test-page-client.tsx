'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, IndianRupee, Clock, Users, ChevronRight, Search, 
  TrendingUp, Award, Briefcase, Globe, Brain, Target
} from 'lucide-react';
import { MockTestsImportanceGuide } from '@/components/mock-tests-importance-guide';
import { generateSlug } from '@/lib/slug-utils';
import type { Test, DifficultyLevel } from '@/types';

// Helper to safely render HTML content - decode HTML entities
const sanitizeAndRenderHTML = (html: string): string => {
  if (!html) return '';
  // Decode HTML entities
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&');
};

interface FilterOptions {
    series: { id: string; title: string }[];
    topics: string[];
    difficulties: DifficultyLevel[];
    priceRange: { min: number; max: number };
    instructors: { id: string; name: string }[];
}

interface MockTestPageClientProps {
    initialTests: Test[];
    filterOptions: FilterOptions | null;
}

// Topic metadata for better discovery
const TOPIC_METADATA: Record<string, { icon: React.ReactNode; color: string; description: string; category: string }> = {
    'QA': { 
        icon: <Brain className="w-6 h-6" />, 
        color: 'from-purple-500 to-purple-600', 
        description: 'Quantitative Aptitude - Mathematical reasoning & calculations',
        category: 'Campus Recruitment'
    },
    'VA': { 
        icon: <BookOpen className="w-6 h-6" />, 
        color: 'from-blue-500 to-blue-600', 
        description: 'Verbal Ability - Reading, grammar & communication',
        category: 'Campus Recruitment'
    },
    'LRDI': { 
        icon: <Target className="w-6 h-6" />, 
        color: 'from-green-500 to-green-600', 
        description: 'Logic & Data Interpretation - Problem solving',
        category: 'Campus Recruitment'
    },
    'TOEFL': { 
        icon: <Globe className="w-6 h-6" />, 
        color: 'from-amber-500 to-amber-600', 
        description: 'TOEFL exam preparation - English proficiency',
        category: 'English Tests'
    },
    'IELTS': { 
        icon: <Award className="w-6 h-6" />, 
        color: 'from-red-500 to-red-600', 
        description: 'IELTS exam preparation - English language skills',
        category: 'English Tests'
    },
};

export function MockTestPageClient({
    initialTests,
    filterOptions
}: MockTestPageClientProps) {
    const router = useRouter();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Scroll to top when topic is selected
    useEffect(() => {
        if (selectedTopic) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [selectedTopic]);

    // Group tests by topic
    const groupedByTopic = initialTests.reduce((acc, test) => {
        const topic = test.topic || 'Other';
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(test);
        return acc;
    }, {} as Record<string, Test[]>);

    // Filter tests based on search and selected topic
    let displayedTests = selectedTopic 
        ? groupedByTopic[selectedTopic] || [] 
        : Object.values(groupedByTopic).flat();

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        displayedTests = displayedTests.filter(test => 
            test.title.toLowerCase().includes(query) ||
            test.description?.toLowerCase().includes(query) ||
            test.topic?.toLowerCase().includes(query)
        );
    }

    const getDifficultyColor = (difficulty?: DifficultyLevel) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-blue-100 text-blue-800';
            case 'Medium-Hard': return 'bg-orange-100 text-orange-800';
            case 'Hard': return 'bg-red-100 text-red-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const getDifficultyBgColor = (difficulty?: DifficultyLevel) => {
        switch (difficulty) {
            case 'Easy': return 'border-l-4 border-l-green-500';
            case 'Medium': return 'border-l-4 border-l-blue-500';
            case 'Medium-Hard': return 'border-l-4 border-l-orange-500';
            case 'Hard': return 'border-l-4 border-l-red-500';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
            {/* Hero Section */}
            <section className="py-20 px-4 md:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-50/70 via-white/60 to-indigo-50/70 dark:from-blue-950/30 dark:via-slate-900/40 dark:to-indigo-950/30 backdrop-blur-md border border-blue-100/40 dark:border-blue-900/40 p-8 md:p-12 mb-4 shadow-lg">
                        <div className="max-w-3xl mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
                                Practice & Master Your Skills
                            </h1>
                            <h2 className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-6">
                                Expert-Designed Mock Tests & Practice Series
                            </h2>
                            <p className="text-lg text-foreground/70 dark:text-slate-300/70">
                                Prepare for competitive exams, campus recruitment, or language proficiency tests with expertly-designed test series across multiple difficulty levels.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                            <Input
                                placeholder="Search tests by name, topic, or instructor..."
                                className="h-12 pl-12 pr-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 rounded-lg shadow-lg border-0"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSelectedTopic(null);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Mock Tests Importance Guide */}
                <MockTestsImportanceGuide />

                {/* Topic Categories Section */}
                {!selectedTopic && !searchQuery && (
                    <>
                        <div className="mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">Explore by Topic</h2>
                            <p className="text-lg text-foreground/70 dark:text-slate-300/70">Select a topic to see all available tests</p>
                        </div>

                        {/* Topic Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                            {Object.entries(groupedByTopic).map(([topic, tests]) => {
                                const metadata = TOPIC_METADATA[topic] || { 
                                    icon: <BookOpen className="w-6 h-6" />, 
                                    color: 'from-slate-500 to-slate-600',
                                    description: `Practice tests for ${topic}`,
                                    category: 'Other'
                                };
                                // Get the series name from the first test in this topic
                                const seriesName = tests[0]?.seriesTitle || 'Unknown';
                                const seriesId = tests[0]?.seriesId;
                                const hasSeriesPricing = tests[0]?.seriesPrice && tests[0]?.seriesPrice > 0;
                                const seriesPrice = tests[0]?.seriesPrice;
                                const discountPercentage = tests[0]?.discountPercentage || 0;

                                const testCount = tests.length;
                                const difficulties = [...new Set(tests.map(t => t.difficultyLevel))];
                                const avgPrice = tests.reduce((sum, t) => sum + (t.price || 0), 0) / testCount;
                                const totalIndividualCost = tests.reduce((sum, t) => sum + (t.price || 0), 0);
                                const savings = totalIndividualCost - (seriesPrice || totalIndividualCost);
                                const seriesHref = `/mock-tests/${encodeURIComponent(generateSlug(seriesName))}`;

                                return (
                                    <Link
                                        key={topic}
                                        href={seriesHref}
                                        className="block h-full no-underline"
                                    >
                                        <Card
                                            className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white dark:bg-slate-800/50 border border-white/80 dark:border-slate-700/50 flex flex-col h-full"
                                        >
                                            {/* Card Content */}
                                            <CardHeader className="pb-3">
                                                <div className="space-y-2">
                                                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {topic}
                                                    </CardTitle>
                                                    <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                                                        {seriesName}
                                                    </p>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="p-6 flex flex-col h-full">
                                                <div className="space-y-4 flex-1">
                                                    <p className="text-sm text-foreground/70 dark:text-slate-300/70">
                                                        {metadata.description}
                                                    </p>

                                                    {/* Series Package Badge */}
                                                    {hasSeriesPricing && (
                                                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-3 border border-green-200 dark:border-green-800/50">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase tracking-wide">Bundle Offer</p>
                                                                    <p className="text-sm font-bold text-green-900 dark:text-green-100">₹{seriesPrice}</p>
                                                                    {discountPercentage > 0 && (
                                                                        <p className="text-xs text-green-600 dark:text-green-400">Save {discountPercentage}% vs individual</p>
                                                                    )}
                                                                </div>
                                                                <Badge className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                                                                    Save ₹{savings.toFixed(0)}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                                                        <div className="text-center">
                                                            <div className="font-bold text-lg text-slate-900 dark:text-white">{testCount}</div>
                                                            <div className="text-xs text-foreground/60 dark:text-slate-400">Tests</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-lg text-slate-900 dark:text-white">{difficulties.length}</div>
                                                            <div className="text-xs text-foreground/60 dark:text-slate-400">Levels</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="font-bold text-lg text-slate-900 dark:text-white">
                                                                {avgPrice === 0 ? 'Free' : `₹${avgPrice.toFixed(0)}`}
                                                            </div>
                                                            <div className="text-xs text-foreground/60 dark:text-slate-400">Price</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <span className="inline-flex items-center justify-center w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium h-10 px-4 py-2 mt-6 group/btn">
                                                    Explore Tests <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                </span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Tests Display Section */}
                {(selectedTopic || searchQuery) && (
                    <div className="py-16">
                        {/* Breadcrumb / Back Button */}
                        {selectedTopic && (
                            <div className="mb-8 flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedTopic(null)}
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                    ← Back to Topics
                                </Button>
                                <div className="text-foreground/70 dark:text-slate-300/70">
                                    Showing {displayedTests.length} test{displayedTests.length !== 1 ? 's' : ''} in <span className="font-bold text-slate-900 dark:text-white">{selectedTopic}</span>
                                </div>
                            </div>
                        )}

                        {displayedTests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayedTests.map((test) => (
                                    <Card
                                        key={test.id}
                                        className={`overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group bg-white dark:bg-slate-800/50 border border-white/80 dark:border-slate-700/50 ${getDifficultyBgColor(test.difficultyLevel)}`}
                                        onClick={() => router.push(`/student/tests/${test.id}/take`)}
                                    >
                                        {/* Header */}
                                        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1">
                                                    <CardTitle className="text-lg line-clamp-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {test.title}
                                                    </CardTitle>
                                                </div>
                                                {test.difficultyLevel && (
                                                    <Badge className={`whitespace-nowrap flex-shrink-0 ${getDifficultyColor(test.difficultyLevel)}`}>
                                                        {test.difficultyLevel}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>

                                        {/* Content */}
                                        <CardContent className="flex-1 py-4 space-y-4">
                                            {test.description && (
                                                <div 
                                                    className="text-sm text-foreground/70 dark:text-slate-300/70 line-clamp-2 prose prose-xs dark:prose-invert max-w-none [&_*]:my-1 [&_p]:m-0 [&_h4]:m-0 [&_ul]:my-1 [&_li]:my-0"
                                                    dangerouslySetInnerHTML={{ __html: sanitizeAndRenderHTML(test.description) }}
                                                ></div>
                                            )}

                                            {/* Metadata */}
                                            <div className="space-y-3">
                                                {test.instructorName && (
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                                        <span className="text-slate-700 dark:text-slate-300 font-medium">{test.instructorName}</span>
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 gap-3">
                                                    {test.questionCount !== undefined && (
                                                        <div className="flex items-center gap-2 text-sm text-foreground/60 dark:text-slate-400">
                                                            <BookOpen className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                                            <span>{test.questionCount} Q</span>
                                                        </div>
                                                    )}
                                                    {test.duration && (
                                                        <div className="flex items-center gap-2 text-sm text-foreground/60 dark:text-slate-400">
                                                            <Clock className="w-4 h-4 text-slate-400" />
                                                            <span>{Math.floor(test.duration / 60)}m</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>

                                        {/* Footer */}
                                        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 px-6 py-4">
                                            <div className="space-y-3">
                                                {/* Individual Test Price */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="font-bold text-slate-900 dark:text-white">
                                                            {test.isFree || test.price === 0 ? 'Free' : `₹${test.price}`}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/student/tests/${test.id}/take`);
                                                        }}
                                                    >
                                                        Start <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                
                                                {/* Series Package Info if applicable */}
                                                {test.seriesPrice && test.seriesPrice > 0 && (
                                                    <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 border border-green-200 dark:border-green-800/50 text-xs">
                                                        <p className="text-green-700 dark:text-green-300 font-medium">
                                                            Or get entire series for <span className="font-bold">₹{test.seriesPrice}</span>
                                                            {test.discountPercentage > 0 && (
                                                                <span className="text-green-600 dark:text-green-400"> (Save {test.discountPercentage}%)</span>
                                                            )}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <BookOpen className="w-20 h-20 mx-auto text-slate-300 mb-4" />
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No tests found</h3>
                                <p className="text-slate-600 mb-8">
                                    Try adjusting your search or exploring other topics.
                                </p>
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedTopic(null);
                                    }}
                                >
                                    ← Back to Topics
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
