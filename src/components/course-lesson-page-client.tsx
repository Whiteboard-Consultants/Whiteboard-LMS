'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LessonViewer } from '@/components/lesson-viewer';
import { supabase } from '@/lib/supabase';
import type { Lesson } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface CourseLessonPageClientProps {
  courseId: string;
  lessonId: string;
  userId?: string;
}

export function CourseLessonPageClient({ 
  courseId, 
  lessonId, 
  userId 
}: CourseLessonPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showLessonList, setShowLessonList] = useState(false);

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        // Fetch current lesson
        const { data: lessonData, error: lessonError } = await supabase
          .from('lessons')
          .select('*')
          .eq('id', lessonId)
          .single();

        if (lessonError) {
          throw lessonError;
        }

        // Fetch all lessons for navigation
        const { data: allLessonsData, error: allLessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId)
          .order('order_number', { ascending: true });

        if (allLessonsError) {
          throw allLessonsError;
        }

        // Transform lesson data
        const transformedLesson: Lesson = {
          id: lessonData.id,
          title: lessonData.title,
          type: lessonData.type as Lesson['type'],
          content: lessonData.content || '',
          objectives: lessonData.objectives,
          assetUrl: lessonData.asset_url,
          courseId: lessonData.course_id,
          parentId: lessonData.parent_id,
          order: lessonData.order_number || 0,
          createdAt: lessonData.created_at,
        };

        const transformedAllLessons: Lesson[] = allLessonsData.map(l => ({
          id: l.id,
          title: l.title,
          type: l.type as Lesson['type'],
          content: l.content || '',
          objectives: l.objectives,
          assetUrl: l.asset_url,
          courseId: l.course_id,
          parentId: l.parent_id,
          order: l.order_number || 0,
          createdAt: l.created_at,
        }));

        setLesson(transformedLesson);
        setAllLessons(transformedAllLessons);
        
        // TODO: Check if lesson is completed for this user
        // This would require checking enrollment/progress data
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching lesson:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load lesson content.',
        });
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [courseId, lessonId, toast]);

  const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  const handleLessonComplete = async () => {
    setIsCompleted(true);
    
    // TODO: Update user progress in database
    // This would involve updating enrollment/progress tables
    
    toast({
      title: 'Lesson Completed!',
      description: 'Your progress has been saved.',
    });

    // Auto-navigate to next lesson after a delay
    if (nextLesson) {
      setTimeout(() => {
        router.push(`/courses/${courseId}/lessons/${nextLesson.id}`);
      }, 2000);
    }
  };

  const handleProgress = (progress: number) => {
    // TODO: Update lesson progress in real-time
    console.log('Lesson progress:', progress);
  };

  const navigateToLesson = (targetLessonId: string) => {
    router.push(`/courses/${courseId}/lessons/${targetLessonId}`);
    setShowLessonList(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The lesson you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push(`/courses/${courseId}`)}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground">
                Lesson {currentLessonIndex + 1} of {allLessons.length}
              </span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLessonList(!showLessonList)}
            >
              <List className="h-4 w-4 mr-2" />
              All Lessons
            </Button>
          </div>
        </div>
      </div>

      {/* Lesson List Sidebar */}
      {showLessonList && (
        <div className="fixed inset-y-0 right-0 w-80 bg-background border-l shadow-lg z-20 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Course Lessons</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLessonList(false)}
              >
                ×
              </Button>
            </div>
            <div className="space-y-2">
              {allLessons.map((l, index) => (
                <div
                  key={l.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    l.id === lessonId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => navigateToLesson(l.id)}
                >
                  <div className="text-sm font-medium">{index + 1}. {l.title}</div>
                  <div className="text-xs opacity-75 capitalize">{l.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <LessonViewer
        lesson={lesson}
        onComplete={handleLessonComplete}
        onProgress={handleProgress}
        isCompleted={isCompleted}
        estimatedDuration={10} // TODO: Calculate from content
      />

      {/* Navigation Footer */}
      <div className="border-t bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex justify-between items-center">
            <div>
              {previousLesson ? (
                <Button
                  variant="outline"
                  onClick={() => navigateToLesson(previousLesson.id)}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous: {previousLesson.title}
                </Button>
              ) : (
                <div />
              )}
            </div>
            
            <div>
              {nextLesson ? (
                <Button
                  onClick={() => navigateToLesson(nextLesson.id)}
                >
                  Next: {nextLesson.title}
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/courses/${courseId}`)}
                >
                  Course Complete!
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}