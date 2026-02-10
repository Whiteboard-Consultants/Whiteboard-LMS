'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCourseVideoAnalytics } from '@/app/instructor/actions';
import type { VideoProgressAnalytic } from '@/app/instructor/actions';

interface VideoAnalyticsProps {
  courseId: string;
  instructorId: string;
  courseName?: string;
}

function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function VideoAnalytics({ courseId, instructorId, courseName }: VideoAnalyticsProps) {
  const [analytics, setAnalytics] = useState<VideoProgressAnalytic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'student' | 'progress' | 'lesson'>('student');
  const [filterComplete, setFilterComplete] = useState<'all' | 'completed' | 'in-progress'>('all');

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const result = await getCourseVideoAnalytics(courseId, instructorId);
        
        if (result.success && result.data) {
          setAnalytics(result.data);
          setError(null);
        } else {
          setError(result.error || 'Failed to load analytics');
          setAnalytics([]);
        }
      } catch (err) {
        console.error('Error loading video analytics:', err);
        setError('An unexpected error occurred');
        setAnalytics([]);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [courseId, instructorId]);

  // Filter data
  let filteredData = analytics.filter(item => {
    if (filterComplete === 'completed') return item.isCompleted;
    if (filterComplete === 'in-progress') return !item.isCompleted && item.progressPercentage > 0;
    return true;
  });

  // Sort data
  filteredData = [...filteredData].sort((a, b) => {
    switch (sortBy) {
      case 'student':
        return a.studentName.localeCompare(b.studentName);
      case 'progress':
        return b.progressPercentage - a.progressPercentage;
      case 'lesson':
        return a.lessonTitle.localeCompare(b.lessonTitle);
      default:
        return 0;
    }
  });

  // Calculate summary stats
  const totalVideos = analytics.length;
  const completedVideos = analytics.filter(a => a.isCompleted).length;
  const avgProgress = totalVideos > 0 
    ? Math.round(analytics.reduce((sum, a) => sum + a.progressPercentage, 0) / totalVideos)
    : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Video Watching Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVideos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedVideos}</div>
            <p className="text-xs text-muted-foreground">
              {totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0}% completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProgress}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unique Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(analytics.map(a => a.enrollmentId)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <div>
              <CardTitle>Video Progress Details</CardTitle>
              <CardDescription>
                {courseName && `Course: ${courseName}`}
              </CardDescription>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student Name</SelectItem>
                    <SelectItem value="progress">Progress %</SelectItem>
                    <SelectItem value="lesson">Lesson Title</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Filter By Status</label>
                <Select value={filterComplete} onValueChange={(value: any) => setFilterComplete(value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Videos</SelectItem>
                    <SelectItem value="completed">Completed Only</SelectItem>
                    <SelectItem value="in-progress">In Progress Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {analytics.length === 0 
                ? 'No video watching data yet'
                : 'No videos match the selected filters'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Watch Time</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Watched</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={`${item.enrollmentId}-${item.lessonId}`}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-xs text-muted-foreground">{item.studentEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.lessonTitle}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {formatSeconds(item.watchTimeSeconds)} / {formatSeconds(item.totalDurationSeconds)}
                      </TableCell>
                      <TableCell>
                        <div className="w-32 space-y-2">
                          <Progress value={item.progressPercentage} className="h-2" />
                          <p className="text-xs text-muted-foreground">{item.progressPercentage}%</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.isCompleted ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Completed</Badge>
                        ) : item.progressPercentage > 0 ? (
                          <Badge variant="outline">In Progress</Badge>
                        ) : (
                          <Badge variant="secondary">Not Started</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {item.lastWatchedAt ? formatDate(item.lastWatchedAt) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
