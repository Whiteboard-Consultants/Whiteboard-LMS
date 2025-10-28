'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Play, 
  CheckCircle, 
  Clock, 
  FileText, 
  Video, 
  Mic, 
  File as FileIcon, 
  Link2, 
  HelpCircle, 
  BookOpen,
  Users,
  Star,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import type { Course, Lesson } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CourseOverviewClientProps {
  courseId: string;
  userId?: string;
}

const contentTypeIcons = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  document: <FileIcon className="h-4 w-4" />,
  embed: <Link2 className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
  assignment: <BookOpen className="h-4 w-4" />,
};

interface LessonWithProgress extends Lesson {
  isCompleted?: boolean;
  progress?: number;
  isMultiContent?: boolean;
  contentBlockCount?: number;
}

export function CourseOverviewClient({ courseId, userId }: CourseOverviewClientProps) {
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<LessonWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);

  // Memoize course data fetching to prevent unnecessary re-fetches
  const fetchCourseData = useCallback(async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      
      // Fetch course details (simplified query to avoid join issues)
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) {
        console.error('Course fetch error:', courseError);
        throw courseError;
      }

      // Fetch lessons
      const { data: lessonsData, error: lessonsError } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_number', { ascending: true });

      if (lessonsError) {
        console.error('Lessons fetch error:', lessonsError);
        throw lessonsError;
      }

      console.log('Fetched course data:', courseData);
      console.log('Fetched lessons data:', lessonsData);

      // Transform course data with safe defaults
      const transformedCourse: Course = {
        id: courseData.id,
        title: courseData.title || 'Untitled Course',
        description: courseData.description || '',
        instructor: {
          id: courseData.instructor_id || 'unknown',
          name: 'Instructor' // Simplified - will enhance later
        },
        imageUrl: courseData.image_url || '/placeholder-course.jpg',
        studentCount: courseData.student_count || 0,
        rating: courseData.rating || 0,
        ratingCount: courseData.rating_count || 0,
        type: (courseData.type as 'free' | 'paid') || 'free',
        price: courseData.price || 0,
        category: (courseData.category as Course['category']) || 'Test Prep',
        hasCertificate: courseData.has_certificate || false,
        duration: courseData.duration || '',
        level: (courseData.level as Course['level']) || 'Beginner',
        lessonCount: courseData.lesson_count || lessonsData?.length || 0,
        createdAt: courseData.created_at,
      };

      // Transform lessons data with error handling
      const transformedLessons: LessonWithProgress[] = (lessonsData || []).map((l, index) => {
        // Check if it's a multi-content lesson
        let isMultiContent = false;
        let contentBlockCount = 1;
        
        try {
          if (l.content && l.content.trim().startsWith('{')) {
            const parsed = JSON.parse(l.content);
            if (parsed.primaryContent && parsed.additionalContent) {
              isMultiContent = true;
              contentBlockCount = 1 + (parsed.additionalContent?.length || 0);
            }
          }
        } catch (error) {
          console.log('Not a multi-content lesson:', l.id);
        }

        return {
          id: l.id,
          title: l.title || `Lesson ${index + 1}`,
          type: (l.type as Lesson['type']) || 'text',
          content: l.content || '',
          objectives: l.objectives || null,
          assetUrl: l.asset_url || null,
          courseId: l.course_id,
          parentId: l.parent_id || null,
          order: l.order_number || index,
          createdAt: l.created_at,
          isCompleted: false, // TODO: Get from user progress
          progress: 0, // TODO: Get from user progress
          isMultiContent,
          contentBlockCount,
        };
      });

      // Calculate overall progress
      const completedLessons = transformedLessons.filter(l => l.isCompleted).length;
      const progressPercent = transformedLessons.length > 0 
        ? (completedLessons / transformedLessons.length) * 100 
        : 0;

      // Set all state at once to avoid multiple re-renders
      setCourse(transformedCourse);
      setLessons(transformedLessons);
      setOverallProgress(progressPercent);
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load course content.',
      });
    } finally {
      setLoading(false);
    }
  }, [courseId, toast]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Memoize computed values to prevent unnecessary recalculations
  const parentLessons = useMemo(() => lessons.filter(l => !l.parentId), [lessons]);
  const getSubLessons = useCallback((parentId: string) => lessons.filter(l => l.parentId === parentId), [lessons]);

  const estimateDuration = (lesson: LessonWithProgress): number => {
    // Basic duration estimation based on content type and length
    switch (lesson.type) {
      case 'video':
        return 15; // Average video lesson
      case 'audio':
        return 10; // Average audio lesson
      case 'text':
        return 5; // Reading time
      case 'quiz':
        return 8; // Quiz completion time
      case 'assignment':
        return 20; // Assignment time
      default:
        return lesson.isMultiContent ? lesson.contentBlockCount! * 7 : 5;
    }
  };

  // Show loading only initially, not during re-renders
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="space-y-6">
          <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
            <div className="h-48 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
            <p className="text-muted-foreground">
              The course you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Course Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{course.category}</Badge>
              <Badge variant="outline">{course.level}</Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {course.studentCount} students
              </Badge>
              {course.rating > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {course.rating.toFixed(1)}
                </Badge>
              )}
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight">{course.title}</h1>
            
            <p className="text-lg text-muted-foreground">{course.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>By {course.instructor.name}</span>
              {course.duration && (
                <>
                  <span>•</span>
                  <span>{course.duration}</span>
                </>
              )}
              <span>•</span>
              <span>{lessons.length} lessons</span>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>
              
              <div className="text-sm text-muted-foreground">
                {lessons.filter(l => l.isCompleted).length} of {lessons.length} lessons completed
              </div>
              
              {overallProgress === 100 ? (
                <Button className="w-full" disabled>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Course Completed!
                </Button>
              ) : (
                <Button className="w-full" asChild>
                  <Link href={`/courses/${courseId}/lessons/${parentLessons[0]?.id}`}>
                    <Play className="h-4 w-4 mr-2" />
                    {overallProgress > 0 ? 'Continue Learning' : 'Start Course'}
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Course Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>
          
          <div className="space-y-4">
            {parentLessons.map((lesson, index) => {
              const subLessons = getSubLessons(lesson.id);
              const duration = estimateDuration(lesson);
              
              return (
                <Card key={lesson.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    {/* Main Lesson */}
                    <div className="p-4 hover:bg-muted/50 transition-colors">
                      <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {contentTypeIcons[lesson.type]}
                              <h3 className="font-semibold truncate">{lesson.title}</h3>
                              {lesson.isMultiContent && (
                                <Badge variant="outline" className="text-xs">
                                  Multi-Content ({lesson.contentBlockCount})
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="capitalize">{lesson.type}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {duration} min
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {lesson.progress && lesson.progress > 0 && lesson.progress < 100 && (
                              <div className="w-16">
                                <Progress value={lesson.progress} className="h-1" />
                              </div>
                            )}
                            <Button size="sm" variant="ghost">
                              {lesson.isCompleted ? 'Review' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    {/* Sub Lessons */}
                    {subLessons.length > 0 && (
                      <div className="border-t bg-muted/20">
                        {subLessons.map((subLesson, subIndex) => {
                          const subDuration = estimateDuration(subLesson);
                          
                          return (
                            <div key={subLesson.id} className="p-4 pl-16 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                              <Link href={`/courses/${courseId}/lessons/${subLesson.id}`}>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted">
                                    {subLesson.isCompleted ? (
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <span className="text-xs">{subIndex + 1}</span>
                                    )}
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      {contentTypeIcons[subLesson.type]}
                                      <h4 className="font-medium text-sm truncate">{subLesson.title}</h4>
                                      {subLesson.isMultiContent && (
                                        <Badge variant="outline" className="text-xs">
                                          Multi-Content
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      <span className="capitalize">{subLesson.type}</span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-2 w-2" />
                                        {subDuration} min
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <Button size="sm" variant="ghost" className="text-xs">
                                    {subLesson.isCompleted ? 'Review' : 'Start'}
                                  </Button>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Course Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Lessons</span>
                <span className="font-medium">{lessons.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Multi-Content Lessons</span>
                <span className="font-medium">{lessons.filter(l => l.isMultiContent).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated Duration</span>
                <span className="font-medium">
                  {Math.round(lessons.reduce((total, l) => total + estimateDuration(l), 0) / 60 * 10) / 10}h
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Course Type</span>
                <span className="font-medium capitalize">{course.type}</span>
              </div>
            </CardContent>
          </Card>

          {course.hasCertificate && (
            <Card>
              <CardHeader>
                <CardTitle>Certificate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Earn a certificate of completion when you finish this course.
                </p>
                {overallProgress === 100 ? (
                  <Button className="w-full">
                    Download Certificate
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    Complete Course to Earn Certificate
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}