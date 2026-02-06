'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, DollarSign, Clock, Users, TrendingUp, ChevronRight } from 'lucide-react';
import type { Test, DifficultyLevel } from '@/types';

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
    initialFilters?: {
        series?: string;
        topic?: string;
        difficulty?: string;
        minPrice?: number;
        maxPrice?: number;
        instructor?: string;
    };
}

export function MockTestPageClient({
    initialTests,
    filterOptions,
    initialFilters
}: MockTestPageClientProps) {
    const router = useRouter();
    const [tests, setTests] = useState<Test[]>(initialTests);
    const [showFilters, setShowFilters] = useState(false);
    const [sortBy, setSortBy] = useState('newest');

    const [filters, setFilters] = useState({
        series: initialFilters?.series || '',
        topic: initialFilters?.topic || '',
        difficulty: initialFilters?.difficulty || '',
        minPrice: initialFilters?.minPrice || '',
        maxPrice: initialFilters?.maxPrice || '',
        instructor: initialFilters?.instructor || '',
        search: ''
    });

    // Apply filters
    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.series) params.set('series', filters.series);
        if (filters.topic) params.set('topic', filters.topic);
        if (filters.difficulty) params.set('difficulty', filters.difficulty);
        if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
        if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));
        if (filters.instructor) params.set('instructor', filters.instructor);

        router.push(`/mock-tests?${params.toString()}`);
    };

    // Local search and sort
    let filteredTests = tests.filter((test) => {
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            return (
                test.title.toLowerCase().includes(searchLower) ||
                test.description?.toLowerCase().includes(searchLower) ||
                test.topic?.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    // Sort tests
    if (sortBy === 'price-low') {
        filteredTests.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
        filteredTests.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'difficulty') {
        const difficultyOrder = { 'Easy': 0, 'Medium': 1, 'Medium-Hard': 2, 'Hard': 3 };
        filteredTests.sort((a, b) => 
            (difficultyOrder[a.difficultyLevel || 'Medium'] || 1) - 
            (difficultyOrder[b.difficultyLevel || 'Medium'] || 1)
        );
    }

    // Group tests by series
    const groupedByTopic = filteredTests.reduce((acc, test) => {
        const topic = test.topic || 'Other';
        if (!acc[topic]) acc[topic] = [];
        acc[topic].push(test);
        return acc;
    }, {} as Record<string, Test[]>);

    const getDifficultyColor = (difficulty?: DifficultyLevel) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'Medium':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Medium-Hard':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'Hard':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const getDifficultyBgColor = (difficulty?: DifficultyLevel) => {
        switch (difficulty) {
            case 'Easy':
                return 'border-l-4 border-l-green-500';
            case 'Medium':
                return 'border-l-4 border-l-blue-500';
            case 'Medium-Hard':
                return 'border-l-4 border-l-orange-500';
            case 'Hard':
                return 'border-l-4 border-l-red-500';
            default:
                return '';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl font-bold mb-4">Master Your Skills</h1>
                        <p className="text-xl text-blue-100 mb-8">
                            Practice with expertly-crafted mock tests and achieve your goals
                        </p>

                        {/* Search Bar */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search tests by title, topic, or instructor..."
                                className="h-12 px-4 bg-white text-slate-900 placeholder-slate-500 rounded-lg shadow-lg flex-1"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                            <Button
                                onClick={() => setShowFilters(!showFilters)}
                                variant="secondary"
                                className="h-12 px-6 font-semibold"
                            >
                                {showFilters ? 'Hide' : 'Show'} Filters
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters Panel */}
                {showFilters && (
                    <Card className="mb-8 border-2">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">Refine Your Search</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Series */}
                                {filterOptions?.series && filterOptions.series.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Series
                                        </label>
                                        <Select value={filters.series} onValueChange={(value) => setFilters({ ...filters, series: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Series" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Series</SelectItem>
                                                {filterOptions.series.map((series) => (
                                                    <SelectItem key={series.id} value={series.id}>
                                                        {series.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Topic */}
                                {filterOptions?.topics && filterOptions.topics.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Topic
                                        </label>
                                        <Select value={filters.topic} onValueChange={(value) => setFilters({ ...filters, topic: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Topics" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Topics</SelectItem>
                                                {filterOptions.topics.map((topic) => (
                                                    <SelectItem key={topic} value={topic}>
                                                        {topic}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Difficulty */}
                                {filterOptions?.difficulties && filterOptions.difficulties.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Difficulty
                                        </label>
                                        <Select value={filters.difficulty} onValueChange={(value) => setFilters({ ...filters, difficulty: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Levels" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Levels</SelectItem>
                                                {filterOptions.difficulties.map((difficulty) => (
                                                    <SelectItem key={difficulty} value={difficulty}>
                                                        {difficulty}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Instructor */}
                                {filterOptions?.instructors && filterOptions.instructors.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Instructor
                                        </label>
                                        <Select value={filters.instructor} onValueChange={(value) => setFilters({ ...filters, instructor: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Instructors" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">All Instructors</SelectItem>
                                                {filterOptions.instructors.map((instructor) => (
                                                    <SelectItem key={instructor.id} value={instructor.id}>
                                                        {instructor.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 mt-6 pt-6 border-t">
                                <Button onClick={applyFilters} className="bg-blue-600 hover:bg-blue-700">
                                    Apply Filters
                                </Button>
                                <Button
                                    onClick={() => {
                                        setFilters({
                                            series: '',
                                            topic: '',
                                            difficulty: '',
                                            minPrice: '',
                                            maxPrice: '',
                                            instructor: '',
                                            search: ''
                                        });
                                        router.push('/mock-tests');
                                    }}
                                    variant="outline"
                                >
                                    Clear All
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Sort and Results Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {filteredTests.length > 0 ? `${filteredTests.length} Test${filteredTests.length !== 1 ? 's' : ''}` : 'No tests found'}
                        </h2>
                        <p className="text-slate-600">Available for practice</p>
                    </div>
                    {filteredTests.length > 0 && (
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest First</SelectItem>
                                <SelectItem value="difficulty">Easiest to Hardest</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>

                {/* Content */}
                {filteredTests.length > 0 ? (
                    <div className="space-y-12">
                        {Object.entries(groupedByTopic).map(([topic, topicTests]) => (
                            <div key={topic}>
                                {/* Topic Header */}
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-blue-600" />
                                        {topic}
                                    </h3>
                                    <p className="text-slate-600 mt-1">
                                        {topicTests.length} test{topicTests.length !== 1 ? 's' : ''} available
                                    </p>
                                </div>

                                {/* Tests Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {topicTests.map((test) => (
                                        <Card
                                            key={test.id}
                                            className={`overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer group ${getDifficultyBgColor(test.difficultyLevel)}`}
                                        >
                                            {/* Card Header with Difficulty */}
                                            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-slate-100">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
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

                                            {/* Card Content */}
                                            <CardContent className="flex-1 py-4 space-y-4">
                                                {test.description && (
                                                    <p className="text-sm text-slate-600 line-clamp-2">
                                                        {test.description}
                                                    </p>
                                                )}

                                                {/* Test Metadata */}
                                                <div className="space-y-3">
                                                    {/* Instructor */}
                                                    {test.instructorName && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                                            <span className="text-slate-700 font-medium">{test.instructorName}</span>
                                                        </div>
                                                    )}

                                                    {/* Questions and Duration */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {test.questionCount !== undefined && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <BookOpen className="w-4 h-4 text-slate-400" />
                                                                <span>{test.questionCount} Q</span>
                                                            </div>
                                                        )}
                                                        {test.duration && (
                                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                                <Clock className="w-4 h-4 text-slate-400" />
                                                                <span>{Math.floor(test.duration / 60)}m</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>

                                            {/* Card Footer with Price and CTA */}
                                            <div className="border-t bg-slate-50 px-6 py-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                                        <span className="font-bold text-slate-900">
                                                            {test.isFree || test.price === 0 ? 'Free' : `$${test.price}`}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        onClick={() => router.push(`/test/${test.id}`)}
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 gap-1"
                                                    >
                                                        Start <ChevronRight className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <div className="text-slate-300 mb-4">
                            <BookOpen className="w-20 h-20 mx-auto opacity-40" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No tests found</h3>
                        <p className="text-slate-600 mb-8">
                            Try adjusting your filters or search to discover available tests.
                        </p>
                        <Button
                            onClick={() => {
                                setFilters({
                                    series: '',
                                    topic: '',
                                    difficulty: '',
                                    minPrice: '',
                                    maxPrice: '',
                                    instructor: '',
                                    search: ''
                                });
                                router.push('/mock-tests');
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Clear Filters & Browse All
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
