
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getQuizAttempt } from '@/app/student/actions';
import { getTestAttempt, getTestAttemptForResults } from '@/app/student/assessment-actions';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ImprovementSuggestions } from '@/components/improvement-suggestions';

interface QuizAttemptData {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  enrollment_id: string;
  answers: number[];
  questions: Array<{
    id: string;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation?: string;
  }>;
  score: number;
  total_questions: number;
  submitted_at: string;
  test_title?: string;
  course_title?: string;
  courses?: {
    id: string;
    title: string;
  };
  percentage?: number;
  certificateEligible?: boolean;
  improvementSuggestions?: any[];
  sectionScores?: any[];
  weakAreas?: any[];
}

export default function QuizResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attemptId as string;

  const [attempt, setAttempt] = useState<QuizAttemptData | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    const fetchAttempt = async () => {
      try {
        // Try to get test attempt with full details (for enhanced testing system)
        const testAttemptResults = await getTestAttemptForResults(attemptId);
        
        if (testAttemptResults) {
          // Use the detailed test attempt data with questions and answers
          setCourseId(testAttemptResults.course_id);
          setAttempt(testAttemptResults as unknown as QuizAttemptData);
        } else {
          // Try quiz attempt for legacy quizzes
          const quizResult = await getQuizAttempt(attemptId);
          
          if (quizResult) {
            console.log('📝 Quiz attempt loaded:', {
              id: quizResult.id,
              courseId: quizResult.course_id,
              score: quizResult.score,
              questions: quizResult.questions?.length || 0
            });
            setCourseId(quizResult.course_id);
            setAttempt(quizResult as unknown as QuizAttemptData);
          } else {
            console.error('❌ Failed to load quiz attempt:', attemptId);
            setError('Failed to load quiz results');
          }
        }
      } catch (err) {
        setError('Failed to load quiz results.');
        console.error('Error fetching attempt:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);
  
  if (loading) return <Skeleton className="h-screen w-full" />;
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;
  if (!attempt) return <div className="text-center p-8">No attempt data found.</div>;
  
  // Log the attempt data for debugging
  console.log('📊 Quiz attempt loaded on results page:', {
    id: attempt.id,
    score: attempt.score,
    scoreType: typeof attempt.score,
    totalQuestions: attempt.total_questions,
    totalQuestionsType: typeof attempt.total_questions,
    questionCount: attempt.questions?.length,
    questionsType: typeof attempt.questions,
    questionsIsArray: Array.isArray(attempt.questions),
    answersCount: attempt.answers?.length,
    firstQuestion: attempt.questions?.[0],
    allQuestionsKeys: attempt.questions?.[0] ? Object.keys(attempt.questions[0]) : [],
    attemptKeys: Object.keys(attempt)
  });
  
  // Calculate percentage from score and total questions
  const percentage = attempt.percentage ?? (attempt.total_questions > 0 ? Math.round((attempt.score / attempt.total_questions) * 100) : 0);

  return (
    <div>
        <div className="mb-4">
            <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                    if (courseId) {
                        router.push(`/student/course/${courseId}`);
                    } else {
                        router.push('/student/dashboard');
                    }
                }}
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
            </Button>
        </div>
        <PageHeader 
            title="Review Your Answers" 
            description={attempt.test_title || attempt.courses?.title ? `${attempt.test_title || 'Test'} - ${attempt.courses?.title || 'Course'}` : undefined}
        />
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader><CardTitle>Your Score</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">{attempt.score} / {attempt.total_questions}</p>
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
                <CardHeader><CardTitle>Result</CardTitle></CardHeader>
                <CardContent>
                    <p className={cn("text-4xl font-bold", percentage >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400')}>
                        {percentage >= 70 ? 'Pass' : 'Fail'}
                    </p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">Review Your Answers</h2>
                <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                    {percentage >= 70 ? "Passed Quiz" : "Failed Quiz"}
                </Badge>
                {percentage >= 70 && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <Award className="h-3 w-3 mr-1" />
                        Good Job!
                    </Badge>
                )}
            </div>

            {/* Improvement Suggestions Section */}
            {attempt.improvementSuggestions && attempt.improvementSuggestions.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-xl font-semibold mb-4">Personalized Improvement Plan</h3>
                    <ImprovementSuggestions 
                        suggestions={attempt.improvementSuggestions}
                        certificateEligible={attempt.certificateEligible ?? percentage >= 70}
                    />
                </div>
            )}
            
            {attempt.questions && attempt.questions.length > 0 && (
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-semibold text-green-800 dark:text-green-200">
                                    Correct Answers: {attempt.score}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-red-600" />
                                <span className="font-semibold text-red-800 dark:text-red-200">
                                    Incorrect Answers: {attempt.total_questions - attempt.score}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {attempt.questions && attempt.questions.length > 0 ? attempt.questions.map((question, index) => {
                const userAnswer = attempt.answers[index];
                const isCorrect = userAnswer === question.correctAnswerIndex;
                return (
                    <Card key={index} className={cn(
                        "transition-all",
                        isCorrect 
                            ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800' 
                            : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800'
                    )}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    Question {index + 1}
                                    {isCorrect ? (
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                    )}
                                </CardTitle>
                                <Badge variant={isCorrect ? "secondary" : "destructive"}>
                                    {isCorrect ? "Correct" : "Incorrect"}
                                </Badge>
                            </div>
                            <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground">
                                {question.questionText}
                            </div>
                        </CardHeader>
                        <CardContent>
                           <div className="space-y-3">
                                {question.options.map((option: string, optIndex: number) => {
                                    const isUserAnswer = userAnswer === optIndex;
                                    const isCorrectAnswer = question.correctAnswerIndex === optIndex;
                                    return (
                                        <div key={optIndex} className={cn(
                                            "flex items-center gap-3 p-3 rounded-md border text-sm transition-all",
                                            isCorrectAnswer 
                                                ? 'bg-green-100 border-green-300 dark:bg-green-800/20 dark:border-green-700' 
                                                : isUserAnswer 
                                                ? 'bg-red-100 border-red-300 dark:bg-red-800/20 dark:border-red-700'
                                                : 'bg-muted/30 border-muted-foreground/20'
                                        )}>
                                            <div className="flex items-center gap-2">
                                                {isCorrectAnswer && (
                                                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                )}
                                                {isUserAnswer && !isCorrectAnswer && (
                                                    <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                )}
                                                {!isUserAnswer && !isCorrectAnswer && (
                                                    <div className="h-4 w-4" />
                                                )}
                                            </div>
                                            <span className={cn(
                                                "flex-1",
                                                isCorrectAnswer && "font-medium text-green-800 dark:text-green-200",
                                                isUserAnswer && !isCorrectAnswer && "font-medium text-red-800 dark:text-red-200"
                                            )}>
                                                {String.fromCharCode(65 + optIndex)}. {option}
                                            </span>
                                            {isUserAnswer && (
                                                <Badge variant="outline" className="text-xs">
                                                    Your Answer
                                                </Badge>
                                            )}
                                        </div>
                                    )
                                })}
                           </div>
                           
                           {!isCorrect && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <h4 className="font-semibold text-blue-800 dark:text-blue-200">Correct Answer</h4>
                                    </div>
                                    <p className="text-blue-700 dark:text-blue-300 text-sm mb-2">
                                        The correct answer is: <strong>{String.fromCharCode(65 + question.correctAnswerIndex)}. {question.options[question.correctAnswerIndex]}</strong>
                                    </p>
                                    {question.explanation && (
                                        <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-800/30 rounded border-l-4 border-blue-400">
                                            <h5 className="font-medium text-blue-800 dark:text-blue-200 text-sm mb-1">Explanation:</h5>
                                            <p className="text-blue-700 dark:text-blue-300 text-sm">{question.explanation}</p>
                                        </div>
                                    )}
                                </div>
                           )}
                           
                           {isCorrect && question.explanation && (
                                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                        <h4 className="font-semibold text-green-800 dark:text-green-200">Great Job!</h4>
                                    </div>
                                    <div className="p-3 bg-green-100 dark:bg-green-800/30 rounded border-l-4 border-green-400">
                                        <h5 className="font-medium text-green-800 dark:text-green-200 text-sm mb-1">Explanation:</h5>
                                        <p className="text-green-700 dark:text-green-300 text-sm">{question.explanation}</p>
                                    </div>
                                </div>
                           )}
                        </CardContent>
                    </Card>
                )
            }) : (
                <Card>
                    <CardContent className="p-6 text-center">
                        <h3 className="text-lg font-semibold mb-2">Test Submitted Successfully!</h3>
                        <p className="text-muted-foreground">
                            Your test has been submitted and will be reviewed. You can check your results in your dashboard.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    </div>
  );
}
