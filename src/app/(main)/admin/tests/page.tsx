'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Clock, Target, Eye, RotateCcw, MoreVertical, Edit, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { deleteTest } from '@/app/instructor/tests/actions';
import type { Test, TestType } from '@/types';

interface ExtendedTest extends Test {
  instructor_name?: string;
  attempt_count?: number;
}

export default function AdminTestsPage() {
  const { toast } = useToast();
  const { userData } = useAuth();
  const [tests, setTests] = useState<ExtendedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchTests();
    }
  }, [userData]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      
      // Fetch tests with instructor information
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select(`
          *,
          users!tests_instructor_id_fkey (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (testsError) {
        console.error('Error fetching tests:', testsError);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch tests',
        });
        return;
      }

      // Map the data and get attempt counts
      const mappedTests = await Promise.all(
        (testsData || []).map(async (test) => {
          // Get attempt count for each test
          const { count } = await supabase
            .from('test_attempts')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', test.id);

          return {
            id: test.id,
            title: test.title,
            description: test.description,
            type: test.type || 'assessment',
            duration: test.duration,
            isTimeLimited: test.is_time_limited ?? true,
            passingScore: test.passing_score || 80,
            maxAttempts: test.max_attempts,
            showResults: test.show_results ?? true,
            allowReview: test.allow_review ?? true,
            instructorId: test.instructor_id,
            questionCount: test.question_count || 0,
            createdAt: test.created_at,
            courseId: test.course_id,
            courseTitle: test.course_title,
            instructor_name: test.users?.name || 'Unknown',
            attempt_count: count || 0,
          } as ExtendedTest;
        })
      );

      setTests(mappedTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      return;
    }

    setDeleting(testId);
    try {
      const result = await deleteTest(testId);
      if (result.success) {
        setTests(prev => prev.filter(test => test.id !== testId));
        toast({
          title: 'Success',
          description: 'Test deleted successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to delete test',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred',
      });
    } finally {
      setDeleting(null);
    }
  };

  const getTestTypeIcon = (type: TestType) => {
    switch (type) {
      case 'practice':
        return <RotateCcw className="h-4 w-4" />;
      case 'final':
        return <Target className="h-4 w-4" />;
      case 'assessment':
        return <Eye className="h-4 w-4" />;
      case 'quiz':
        return <Clock className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  const getTestTypeBadge = (type: TestType) => {
    const colors = {
      practice: 'bg-blue-100 text-blue-800',
      final: 'bg-red-100 text-red-800',
      assessment: 'bg-green-100 text-green-800',
      quiz: 'bg-yellow-100 text-yellow-800',
    };

    return (
      <Badge variant="secondary" className={colors[type] || colors.assessment}>
        <div className="flex items-center gap-1">
          {getTestTypeIcon(type)}
          <span className="capitalize">{type}</span>
        </div>
      </Badge>
    );
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || test.type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (userData?.role !== 'admin') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Test Management"
        description="Manage all tests across the platform"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Practice Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.type === 'practice').length}</p>
              </div>
              <RotateCcw className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Final Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.type === 'final').length}</p>
              </div>
              <Target className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">{tests.reduce((sum, test) => sum + (test.attempt_count || 0), 0)}</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search tests or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="practice">Practice Tests</SelectItem>
              <SelectItem value="final">Final Tests</SelectItem>
              <SelectItem value="assessment">Assessments</SelectItem>
              <SelectItem value="quiz">Quizzes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button asChild>
          <Link href="/admin/tests/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Link>
        </Button>
      </div>

      {/* Tests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
          <CardDescription>
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <TableRow key={test.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{test.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {test.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTestTypeBadge(test.type)}</TableCell>
                      <TableCell>{test.instructor_name}</TableCell>
                      <TableCell>
                        {test.isTimeLimited ? formatDuration(test.duration) : 'No limit'}
                      </TableCell>
                      <TableCell>{test.questionCount}</TableCell>
                      <TableCell>{test.attempt_count}</TableCell>
                      <TableCell>
                        {test.courseTitle ? (
                          <Link 
                            href={`/admin/courses/${test.courseId}`}
                            className="text-blue-600 hover:underline"
                          >
                            {test.courseTitle}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">No course</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(test.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tests/edit/${test.id}`}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Test
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tests/${test.id}/questions`}>
                                <Eye className="h-4 w-4 mr-2" />
                                Manage Questions
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/tests/${test.id}/attempts`}>
                                <Clock className="h-4 w-4 mr-2" />
                                View Attempts
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeleteTest(test.id)}
                              disabled={deleting === test.id}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deleting === test.id ? 'Deleting...' : 'Delete Test'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Eye className="h-8 w-8 mb-2" />
                        <p>No tests found</p>
                        <p className="text-sm">Create your first test to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}