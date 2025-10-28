'use client';

import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, Circle, Loader2, LinkIcon, Video, Mic, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import type { Course, Enrollment, Lesson } from '@/types';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Card, CardContent } from './ui/card';
import { RichTextRenderer } from './rich-text-renderer';
import { QuizTaker } from './quiz-taker';
import { updateProgress } from '@/app/student/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

interface StudentCourseViewProps {
  course: Course;
  enrollment: Enrollment;
}

const lessonTypeIcons: { [key in Lesson['type']]: React.ReactNode } = {
    text: <FileText className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />,
    audio: <Mic className="h-4 w-4" />,
    document: <FileText className="h-4 w-4" />,
    embed: <LinkIcon className="h-4 w-4" />,
    quiz: <HelpCircle className="h-4 w-4" />,
    assignment: <BookOpen className="h-4 w-4" />,
};

export function StudentCourseView({ course, enrollment: initialEnrollment }: StudentCourseViewProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState(initialEnrollment);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  
  const completedLessonIds = useMemo(() => new Set(enrollment?.completedLessons || []), [enrollment]);

  useEffect(() => {
    setEnrollment(initialEnrollment);
  }, [initialEnrollment]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data: lessonsData, error } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', course.id)
          .order('order_number');
        console.log('Supabase lessonsData:', lessonsData);
        console.log('Supabase lessons error:', error);
        if (error) {
          console.error("Supabase Error:", error);
          toast({
            variant: "destructive",
            title: "Error loading content",
            description: "Could not fetch course lessons. Please check your connection.",
          });
        } else {
          setLessons(lessonsData || []);
          if (!selectedLesson && lessonsData && lessonsData.length > 0) {
            setSelectedLesson(lessonsData[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast({
          variant: "destructive",
          title: "Error loading content",
          description: "Could not fetch course lessons. Please check your connection.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();

    // Set up real-time subscription for lessons
    const channel = supabase
      .channel(`course_${course.id}_lessons`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `courseId=eq.${course.id}`
      }, (payload) => {
        fetchLessons(); // Refetch lessons when changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [course.id, selectedLesson, toast]);

  const parentLessons = useMemo(() => lessons.filter(l => !l.parentId), [lessons]);
  
  const handleMarkAsComplete = async () => {
    if (!selectedLesson) return;
    setIsCompleting(true);

    const result = await updateProgress(enrollment.id, course.id, selectedLesson.id);
    
    if (result.success && result.updatedEnrollment) {
      toast({ title: 'Progress Saved!' });
      setEnrollment(result.updatedEnrollment);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setIsCompleting(false);
  };
  
  const handleQuizSubmit = async (answers: (number | null)[]) => {
      if (!selectedLesson || (selectedLesson.type !== 'quiz' && selectedLesson.type !== 'assignment')) {
        console.error('Invalid lesson for quiz/assignment submission:', selectedLesson);
        return;
      }
      
      setIsCompleting(true);

      try {
        const result = await updateProgress(enrollment.id, course.id, selectedLesson.id, {
            questions: selectedLesson.questions || [],
            answers,
        });

        if (result.success && result.updatedEnrollment) {
            const submissionType = selectedLesson.type === 'assignment' ? 'Assignment' : 'Quiz';
            toast({ title: `${submissionType} Submitted!` });
            setEnrollment(result.updatedEnrollment);
            if (result.quizAttemptId) {
                router.push(`/student/quiz-results/${result.quizAttemptId}`);
            }
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error || 'Failed to submit' });
        }
      } catch (error) {
        console.error('Error in handleQuizSubmit:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred' });
      } finally {
        setIsCompleting(false);
      }
  }

  const renderContent = () => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!selectedLesson) {
    return <p className="text-center text-muted-foreground">Select a lesson to begin.</p>;
  }

  const LessonIcon = lessonTypeIcons[selectedLesson.type];
  const isValidUrl =
    typeof selectedLesson.content === "string" &&
    (selectedLesson.content.startsWith("http://") ||
      selectedLesson.content.startsWith("https://"));

  let contentNode: React.ReactNode = null;
  if (selectedLesson.type === "text") {
    contentNode = <RichTextRenderer content={selectedLesson.content || ""} />;
  } else if (selectedLesson.type === "video") {
    const isDirectVideo =
      isValidUrl &&
      (selectedLesson.content.endsWith(".mp4") ||
        selectedLesson.content.endsWith(".webm") ||
        selectedLesson.content.endsWith(".ogg"));
    if (isDirectVideo) {
      contentNode = (
        <video
          controls
          controlsList="nodownload"
          src={selectedLesson.content}
          className="w-full rounded-lg"
        />
      );
    } else {
      contentNode = (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
          <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">External Content</h3>
          <p className="text-muted-foreground mb-4">
            This lesson contains external content like a video or document.
          </p>
          {isValidUrl ? (
            <Button asChild>
              <a
                href={selectedLesson.content}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Content
              </a>
            </Button>
          ) : (
            <Button disabled variant="secondary">
              Invalid or missing content link
            </Button>
          )}
        </div>
      );
    }
  } else if (selectedLesson.type === "audio") {
    contentNode = (
      <audio
        controls
        controlsList="nodownload"
        src={selectedLesson.content}
        className="w-full"
      />
    );
  } else if (
    selectedLesson.type === "document" ||
    selectedLesson.type === "embed"
  ) {
    contentNode = (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-muted rounded-lg">
        <LinkIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold">External Content</h3>
        <p className="text-muted-foreground mb-4">
          This lesson contains external content like a video or document.
        </p>
        {isValidUrl ? (
          <Button asChild>
            <a
              href={selectedLesson.content}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open Content
            </a>
          </Button>
        ) : (
          <Button disabled variant="secondary">
            Invalid or missing content link
          </Button>
        )}
      </div>
    );
  } else if (
    selectedLesson.type === "quiz" ||
    selectedLesson.type === "assignment"
  ) {
    contentNode = (
      <QuizTaker
        questions={selectedLesson.questions || []}
        onSubmit={handleQuizSubmit}
        lessonType={selectedLesson.type}
      />
    );
  } else {
    contentNode = (
      <p className="text-muted-foreground">
        This lesson type is not supported yet.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {LessonIcon}
          <span className="capitalize">{selectedLesson.type}</span>
        </div>
        <h1 className="text-3xl font-bold font-headline">
          {selectedLesson.title}
        </h1>
      </header>

      {selectedLesson.objectives && (
        <div className="p-4 bg-muted/50 rounded-lg">
          <h3 className="font-semibold mb-2">Lesson Objectives</h3>
          <RichTextRenderer content={selectedLesson.objectives} />
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none">{contentNode}
                {!completedLessonIds.has(selectedLesson.id) &&
          selectedLesson.type !== "quiz" &&
          selectedLesson.type !== "assignment" && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleMarkAsComplete} disabled={isCompleting}>
                {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Mark as Complete
              </Button>
            </div>
        )}
      </div>
    </div>
  );
};

// Main component return
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar lesson list */}
      <aside className="md:w-64 w-full md:sticky md:top-24 flex-shrink-0 mb-6 md:mb-0">
        <div className="bg-muted/50 rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4 tracking-tight">Lessons</h2>
          <ul className="space-y-2">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className={cn(
                    "w-full text-left p-2 rounded flex items-center gap-3 text-sm transition-colors group",
                    selectedLesson?.id === lesson.id
                      ? "bg-primary/10 text-primary font-semibold shadow"
                      : "hover:bg-muted"
                  )}
                  aria-current={selectedLesson?.id === lesson.id ? 'page' : undefined}
                >
                  {completedLessonIds.has(lesson.id) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate flex-1">{lesson.title}</span>
                  <span className="ml-auto opacity-60 group-hover:opacity-100">
                    {lessonTypeIcons[lesson.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
      {/* Main lesson content */}
      <main className="flex-1 min-w-0">
        {renderContent()}
      </main>
    </div>
  );
}