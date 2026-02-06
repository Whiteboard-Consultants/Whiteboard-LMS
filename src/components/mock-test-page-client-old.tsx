'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BookOpen, DollarSign, Clock, Star } from 'lucide-react';
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
    const searchParams = useSearchParams();
    const [tests, setTests] = useState<Test[]>(initialTests);
    const [isLoading, setIsLoading] = useState(false);

    // Filter states
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

    // Local filtering for search
    const filteredTests = tests.filter((test) => {
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

    const getDifficultyColor = (difficulty?: DifficultyLevel) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-green-100 text-green-800';
            case 'Medium':
                return 'bg-blue-100 text-blue-800';
            case 'Medium-Hard':
                return 'bg-orange-100 text-orange-800';
            case 'Hard':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">
                        Mock Test Series
                    </h1>
                    <p className="text-lg text-slate-600">
                        Practice with comprehensive mock tests across multiple topics and difficulty levels.
                        Sharpen your skills with our carefully curated test series.
                    </p>
                </div>

                {/* Filters Section */}
                <Card className="mb-8 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Filter Tests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Search Tests
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Search by title, topic, or description..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="max-w-md"
                                />
                            </div>

                            {/* Filter Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Series Filter */}
                                {filterOptions?.series && filterOptions.series.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Test Series
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

                                {/* Topic Filter */}
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

                                {/* Difficulty Filter */}
                                {filterOptions?.difficulties && filterOptions.difficulties.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Difficulty Level
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

                                {/* Min Price Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Min Price ($)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        min="0"
                                    />
                                </div>

                                {/* Max Price Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Max Price ($)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="1000"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        min="0"
                                    />
                                </div>

                                {/* Instructor Filter */}
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

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t">
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
                        </div>
                    </CardContent>
                </Card>

                {/* Results Section */}
                <div className="mb-6">
                    <p className="text-slate-600">
                        Showing <span className="font-semibold text-slate-900">{filteredTests.length}</span> test{filteredTests.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Tests Grid */}
                {filteredTests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredTests.map((test) => (
                            <Card
                                key={test.id}
                                className="overflow-hidden hover:shadow-lg transition-shadow duration-200 flex flex-col"
                            >
                                <CardHeader className="pb-3">
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <CardTitle className="text-base leading-tight">{test.title}</CardTitle>
                                            </div>
                                            {test.difficultyLevel && (
                                                <Badge className={`whitespace-nowrap ${getDifficultyColor(test.difficultyLevel)}`}>
                                                    {test.difficultyLevel}
                                                </Badge>
                                            )}
                                        </div>
                                        {test.seriesTitle && (
                                            <p className="text-sm text-slate-500">{test.seriesTitle}</p>
                                        )}
                                        {test.instructorName && (
                                            <p className="text-sm text-slate-500">By: {test.instructorName}</p>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="flex-1 pb-4 space-y-4">
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {test.description}
                                    </p>

                                    {/* Test Info */}
                                    <div className="space-y-2 text-sm text-slate-600">
                                        {test.topic && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{test.topic}</span>
                                            </div>
                                        )}
                                        {test.duration && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{Math.floor(test.duration / 60)} minutes</span>
                                            </div>
                                        )}
                                        {test.questionCount && (
                                            <div className="flex items-center gap-2">
                                                <Star className="w-4 h-4" />
                                                <span>{test.questionCount} questions</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Price */}
                                    <div className="pt-2 border-t">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-blue-600" />
                                            <span className="font-semibold text-slate-900">
                                                {test.isFree || test.price === 0 ? 'Free' : `$${test.price}`}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Action Button */}
                                <div className="px-6 py-3 border-t bg-slate-50">
                                    <Button
                                        onClick={() => router.push(`/test/${test.id}`)}
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                    >
                                        View & Purchase
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="text-slate-400 mb-4">
                            <BookOpen className="w-16 h-16 mx-auto opacity-20" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">No tests found</h3>
                        <p className="text-slate-600 mb-6">
                            Try adjusting your filters or search criteria to find more tests.
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
                            variant="outline"
                        >
                            Clear Filters
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
