'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  Lock, 
  FileText, 
  Video, 
  Mic, 
  File as FileIcon, 
  Link2, 
  HelpCircle, 
  BookOpen,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';
import type { Lesson } from '@/types';

interface CourseCurriculumProps {
  courseId: string;
  isEnrolled?: boolean;
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

interface LessonWithPreview extends Lesson {
  isFreePreview?: boolean;
}

export function CourseCurriculum({ courseId, isEnrolled = false }: CourseCurriculumProps) {
  const [lessons, setLessons] = useState<LessonWithPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // Fetch lessons - RLS will only return lessons that are either:
        // 1. Free preview lessons (public access)
        // 2. Lessons the user is enrolled in
        const { data, error } = await supabase
          .from('lessons')
          .select('id, title, type, order_number, parent_id, is_free_preview')
          .eq('course_id', courseId)
          .order('order_number', { ascending: true });

        if (error) {
          console.error('Error fetching lessons:', error);
          return;
        }

        const transformedLessons: LessonWithPreview[] = (data || []).map(l => ({
          id: l.id,
          title: l.title,
          type: l.type as Lesson['type'],
          content: '', // Not fetching content for curriculum display
          courseId,
          parentId: l.parent_id,
          order: l.order_number || 0,
          isFreePreview: l.is_free_preview || false,
        }));

        setLessons(transformedLessons);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Curriculum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return null;
  }

  // Separate parent lessons and children
  const parentLessons = lessons.filter(l => !l.parentId);
  const childLessons = lessons.filter(l => l.parentId);

  const getLessonChildren = (parentId: string) => {
    return childLessons.filter(l => l.parentId === parentId);
  };

  const canAccess = (lesson: LessonWithPreview) => {
    return isEnrolled || lesson.isFreePreview;
  };

  const renderLessonItem = (lesson: LessonWithPreview, isChild = false) => {
    const accessible = canAccess(lesson);
    const icon = contentTypeIcons[lesson.type] || <FileText className="h-4 w-4" />;

    const content = (
      <div 
        className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
          accessible 
            ? 'hover:bg-muted cursor-pointer' 
            : 'opacity-60'
        } ${isChild ? 'ml-6' : ''}`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            lesson.isFreePreview && !isEnrolled
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-muted text-muted-foreground'
          }`}>
            {icon}
          </div>
          <div>
            <p className={`font-medium ${!accessible ? 'text-muted-foreground' : ''}`}>
              {lesson.title}
            </p>
            {lesson.isFreePreview && !isEnrolled && (
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                <Eye className="h-3 w-3 mr-1" />
                Free Preview
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {accessible ? (
            <Play className="h-4 w-4 text-primary" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
    );

    if (accessible) {
      return (
        <Link 
          key={lesson.id} 
          href={`/courses/${courseId}/lessons/${lesson.id}`}
        >
          {content}
        </Link>
      );
    }

    return <div key={lesson.id}>{content}</div>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Curriculum</CardTitle>
          <span className="text-sm text-muted-foreground">
            {lessons.length} lesson{lessons.length !== 1 ? 's' : ''}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {parentLessons.map((lesson) => (
          <div key={lesson.id}>
            {renderLessonItem(lesson)}
            {getLessonChildren(lesson.id).map((child) => renderLessonItem(child, true))}
          </div>
        ))}
        
        {!isEnrolled && lessons.some(l => l.isFreePreview) && (
          <p className="text-sm text-muted-foreground mt-4 text-center pt-4 border-t">
            <Eye className="h-4 w-4 inline mr-1" />
            Lessons marked with "Free Preview" can be viewed without enrollment
          </p>
        )}
      </CardContent>
    </Card>
  );
}
