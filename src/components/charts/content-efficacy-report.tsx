
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

    // Temporarily disable quiz attempts fetching until schema is clarified
    const fetchAttempts = async () => {
      setLoading(true);
      // TODO: Fix schema mapping between QuizAttempt type and test_attempts table
      setAttempts([]);
      setLoading(false);
    };
    fetchAttempts();
  }, [courseId, user]);

  const quizLessons = lessons.filter(lesson => lesson.type === 'quiz');

  const getStatsForQuiz = (lessonId: string): QuestionStats[] => {
    const relevantAttempts = attempts.filter(a => a.lessonId === lessonId);
    if (relevantAttempts.length === 0) return [];

    const firstAttempt = relevantAttempts[0];
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
      {quizLessons.map(quiz => {
        const stats = getStatsForQuiz(quiz.id);
        const uniqueStudentAttempts = new Set(attempts.filter(a => a.lessonId === quiz.id).map(a => a.userId)).size;
        const attemptText = uniqueStudentAttempts === 1 ? "student attempt" : "student attempts";
        
        return (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>Based on {uniqueStudentAttempts} {attemptText}.</CardDescription>
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
                <p className="text-muted-foreground text-sm">No attempts recorded for this quiz yet.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

      