
'use client';

import { useEffect, useState } from 'react';
import { fetchQuizAttemptsForLessons } from '@/app/(main)/instructor/reports/content-efficacy-actions';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import type { QuizAttempt, Lesson } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

interface ContentEfficacyReportProps {
  courseId: string;
  lessons: Lesson[];
}

interface QuestionStats {
  questionText: string;
  correctPercentage: number;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];


export function ContentEfficacyReport({ courseId, lessons }: ContentEfficacyReportProps) {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!courseId || !user) {
        setLoading(false);
        setAttempts([]);
        return;
    }

    // Fetch quiz attempts from the database using server action
    const fetchAttempts = async () => {
      setLoading(true);
      try {
        const lessonIds = lessons.map(l => l.id);
        console.log('📚 Content Efficacy - Fetching attempts for lessons:', lessonIds);
        const result = await fetchQuizAttemptsForLessons(lessonIds);

        console.log('📊 Content Efficacy - Fetch result:', {
          success: result.success,
          error: result.error,
          dataLength: result.data?.length || 0,
          firstAttempt: result.data?.[0],
        });

        if (!result.success) {
          console.error('Error fetching quiz attempts:', result.error);
          setAttempts([]);
        } else if (result.data) {
          // Map database attempts to QuizAttempt type
          // Note: This assumes quiz_attempts table has the questions/answers structure
          console.log('✅ Setting attempts with data:', result.data);
          setAttempts(result.data as any);
        }
      } catch (err) {
        console.error('Exception fetching quiz attempts:', err);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    if (lessons.length > 0) {
      fetchAttempts();
    } else {
      setLoading(false);
    }
  }, [courseId, user, lessons]);

  const quizLessons = lessons.filter(lesson => lesson.type === 'quiz');
  
  console.log('📖 Content Efficacy - All lessons:', lessons.length);
  console.log('📝 Content Efficacy - Quiz lessons:', quizLessons.length, quizLessons);
  console.log('📊 Content Efficacy - Attempts loaded:', attempts.length);

  const getStatsForQuiz = (lessonId: string): QuestionStats[] => {
    console.log('🔍 getStatsForQuiz called with lessonId:', lessonId);
    console.log('🔍 Attempting to filter', attempts.length, 'attempts');
    console.log('🔍 Attempt lessonIds:', attempts.map(a => a.lessonId));
    
    const relevantAttempts = attempts.filter(a => a.lessonId === lessonId);
    console.log('🔍 Found', relevantAttempts.length, 'relevant attempts for lesson', lessonId);
    
    if (relevantAttempts.length === 0) return [];

    const firstAttempt = relevantAttempts[0];
    console.log('🔍 First attempt has', firstAttempt.questions?.length || 0, 'questions');
    
    if (!firstAttempt.questions) return [];

    const questionStats: Record<number, { correct: number; total: number }> = {};

    relevantAttempts.forEach(attempt => {
      attempt.questions.forEach((question, index) => {
        if (!questionStats[index]) {
          questionStats[index] = { correct: 0, total: 0 };
        }
        questionStats[index].total++;
        if (attempt.answers[index] === question.correctAnswerIndex) {
          questionStats[index].correct++;
        }
      });
    });

    return firstAttempt.questions.map((question, index) => {
        const stats = questionStats[index];
        return {
            questionText: `Q${index + 1}: ${question.questionText.substring(0, 30)}...`,
            correctPercentage: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
        };
    });
  };
  
  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (quizLessons.length === 0) {
      // Debug: Log the lessons to see what types are available
      console.log('[ContentEfficacy] Lessons received:', lessons);
      console.log('[ContentEfficacy] Quiz lessons after filter:', quizLessons);
      console.log('[ContentEfficacy] Lesson types:', lessons.map(l => ({ id: l.id, title: l.title, type: l.type })));
      
      return (
         <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
            <div className="flex flex-col items-center gap-2">
                <h3 className="text-xl font-bold tracking-tight">No Quizzes Found</h3>
                <p className="text-sm text-muted-foreground">
                    Add a quiz to this course to see content efficacy reports.
                </p>
            </div>
        </div>
      )
  }

  return (
    <div className="space-y-6">
      {quizLessons.length > 0 ? (
        quizLessons.map(quiz => {
          const stats = getStatsForQuiz(quiz.id);
          const uniqueStudentAttempts = new Set(attempts.filter(a => a.lessonId === quiz.id).map(a => a.userId)).size;
          const attemptText = uniqueStudentAttempts === 1 ? "student attempt" : "student attempts";
          
          return (
            <Card key={quiz.id}>
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>
                  {uniqueStudentAttempts > 0 
                    ? `Based on ${uniqueStudentAttempts} ${attemptText}.`
                    : `No student attempts yet. Students will take this quiz and their performance will appear here.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.length > 0 ? (
                  <ResponsiveContainer width="100%" height={stats.length * 50 + 50}>
                    <BarChart data={stats} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                      <YAxis dataKey="questionText" type="category" width={150} />
                      <Tooltip
                          formatter={(value) => [`${value}% Correct`, ''] }
                          labelFormatter={(label) => label.split(': ')[1]}
                          cursor={{fill: 'hsl(var(--muted))'}}
                          contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              borderColor: 'hsl(var(--border))',
                          }}
                      />
                      <Bar dataKey="correctPercentage" barSize={20}>
                         {stats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Waiting for student responses...</p>
                    <p className="text-xs mt-2">Quiz performance data will display here once students complete this quiz.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })
      ) : (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight">No Quizzes Found</h3>
            <p className="text-sm text-muted-foreground">
              Add a quiz to this course to see content efficacy reports.
            </p>
            {lessons.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded text-left">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-200">Debug Info:</p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">Lessons found: {lessons.length}</p>
                <p className="text-xs text-amber-800 dark:text-amber-300">Quiz lessons: {quizLessons.length}</p>
                <div className="text-xs text-amber-700 dark:text-amber-400 mt-2">Lesson types:</div>
                <ul className="text-xs text-amber-700 dark:text-amber-400">
                  {lessons.map(l => (
                    <li key={l.id}>{l.title}: {l.type}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

      