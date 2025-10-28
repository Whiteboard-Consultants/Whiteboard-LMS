

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { TestAttempt, TestQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export default function TestResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!attemptId) return;
        const fetchAttemptData = async () => {
            try {
                // Fetch attempt from Supabase
                const { data: attemptDataArr, error: attemptError } = await supabase
                    .from('testAttempts')
                    .select('*')
                    .eq('id', attemptId)
                    .single();
                if (attemptError || !attemptDataArr) {
                    setError('Test attempt not found.');
                    setLoading(false);
                    return;
                }
                setAttempt(attemptDataArr as TestAttempt);

                // Fetch questions from Supabase
                const { data: questionsData, error: questionsError } = await supabase
                    .from('questions')
                    .select('*')
                    .eq('testId', attemptDataArr.testId)
                    .order('order', { ascending: true });
                if (questionsError) {
                    setQuestions([]);
                } else {
                    setQuestions(questionsData as TestQuestion[] ?? []);
                }
            } catch (err) {
                setError('Failed to load test results.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttemptData();
    }, [attemptId]);
  
  if (loading) return <Skeleton className="h-screen w-full" />;
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;
  if (!attempt) return <div className="text-center p-8">No attempt data found.</div>;
  
  const percentage = (attempt.totalMarks ?? 0) > 0 ? Math.round(((attempt.score ?? 0) / (attempt.totalMarks ?? 1)) * 100) : 0;

  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm" onClick={() => router.back()}>
                <span><ArrowLeft className="mr-2 h-4 w-4" />Back to Course/Dashboard</span>
            </Button>
        </div>
        <PageHeader title="Test Results & Review" />
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader><CardTitle>Your Score</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{attempt.score} / {attempt.totalMarks}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Percentage</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{percentage}%</p>
                    <Progress value={percentage} className="mt-2" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p>Correct: {attempt.correctAnswers}</p>
                    <p>Incorrect: {attempt.incorrectAnswers}</p>
                    <p>Unattempted: {attempt.unattempted}</p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Review Your Answers</h2>
            {questions.map((question, index) => {
                const userAnswer = attempt.answers[index];
                const isCorrect = userAnswer?.optionIndex === question.correctOption;
                const isUnattempted = userAnswer?.optionIndex === null || userAnswer == null;

                return (
                    <Card key={index} className={cn(
                        isCorrect ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700' 
                        : isUnattempted ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700'
                        : 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                    )}>
                        <CardHeader>
                            <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                             <div className="prose prose-sm max-w-none dark:prose-invert"><p>{question.text}</p></div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-2">
                                {question.options.map((option, optIndex) => {
                                    const isUserAnswer = userAnswer?.optionIndex === optIndex;
                                    const isCorrectAnswer = question.correctOption === optIndex;
                                    return (
                                        <div key={optIndex} className={cn(
                                            "flex items-center gap-3 p-3 rounded-md border text-sm",
                                            isCorrectAnswer ? 'bg-blue-100 border-blue-400 dark:bg-blue-800/30 dark:border-blue-600' : 'bg-background/50 dark:bg-slate-800/30 dark:border-slate-700',
                                            isUserAnswer && !isCorrectAnswer ? 'bg-red-100 border-red-400 dark:bg-red-800/30 dark:border-red-600' : ''
                                        )}>
                                            {isCorrectAnswer ? <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" /> : isUserAnswer ? <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0"/> : <div className="h-5 w-5 flex-shrink-0" />}
                                            <span className="text-foreground">{option}</span>
                                        </div>
                                    )
                                })}
                           </div>
                           {question.solution && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 dark:border-blue-400">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Explanation</h4>
                                    <div className="prose prose-sm max-w-none text-blue-700 dark:prose-invert"><p>{question.solution}</p></div>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    </div>
  );
}
