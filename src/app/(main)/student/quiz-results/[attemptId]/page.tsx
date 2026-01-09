
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
  answers: (number | string | null)[];
  questions: Array<{
    id: string;
    type?: 'mcq' | 'descriptive';
    questionText: string;
    options?: string[];
    correctAnswerIndex?: number;
    correctAnswerText?: string;
    userAnswerIndex?: number;
    userAnswer?: string;
    correct?: boolean;
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
  grading_status?: 'pending' | 'reviewed' | 'graded';
  instructor_feedback?: string;
  instructor_score?: number;
  graded_at?: string;
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
        
        // Check if it's a successful test attempt (has id and course_id, not success/error)
        if (testAttemptResults && 'id' in testAttemptResults && 'course_id' in testAttemptResults && !('success' in testAttemptResults)) {
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
  const debugInfo = {
    id: attempt.id,
    score: attempt.score,
    scoreType: typeof attempt.score,
    totalQuestions: attempt.total_questions,
    totalQuestionsType: typeof attempt.total_questions,
    questionCount: attempt.questions?.length,
    questionsType: typeof attempt.questions,
    questionsIsArray: Array.isArray(attempt.questions),
    answersCount: attempt.answers?.length,
    percentage: attempt.percentage,
    firstQuestion: attempt.questions?.[0],
    allQuestionsKeys: attempt.questions?.[0] ? Object.keys(attempt.questions[0]) : [],
    attemptKeys: Object.keys(attempt)
  };
  console.log('📊 Quiz attempt loaded on results page:', debugInfo);
  console.log('Raw score value:', attempt.score);
  console.log('Raw total_questions value:', attempt.total_questions);
  console.log('Full attempt object keys:', Object.keys(attempt).join(', '));
  
  // Separate MCQ and Descriptive questions
  const mcqQuestions = attempt.questions?.filter(q => !q.type || q.type === 'mcq') || [];
  const descriptiveQuestions = attempt.questions?.filter(q => q.type === 'descriptive') || [];
  
  // Calculate score and percentage based only on MCQ questions
  const mcqScore = attempt.score; // This is already the MCQ score from scoring logic
  const mcqTotal = mcqQuestions.length;
  const percentage = mcqTotal > 0 ? Math.round((mcqScore / mcqTotal) * 100) : 0;
  
  // Only show Pass/Fail if there are MCQ questions to grade
  const hasOnlyDescriptive = mcqTotal === 0 && descriptiveQuestions.length > 0;
  const showPassFail = !hasOnlyDescriptive;

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
            title={hasOnlyDescriptive ? "Assessment Submitted for Review" : "Review Your Answers"} 
            description={attempt.test_title || attempt.courses?.title ? `${attempt.test_title || 'Test'} - ${attempt.courses?.title || 'Course'}` : undefined}
        />
        
        {hasOnlyDescriptive ? (
            // Show descriptive-only message
            <Card className="mb-8 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                Assessment Successfully Submitted
                            </h3>
                            <p className="text-blue-800 dark:text-blue-200">
                                Your assessment containing {descriptiveQuestions.length} {descriptiveQuestions.length === 1 ? 'question' : 'questions'} has been successfully submitted for review. An instructor will evaluate your responses and provide detailed feedback within 3-5 business days.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : (
            // Show MCQ score cards
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader><CardTitle>Your Score (MCQ)</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold">{mcqScore} / {mcqTotal}</p>
                        <p className="text-sm text-muted-foreground mt-2">{mcqTotal === 0 ? 'No MCQ questions' : 'Auto-graded questions only'}</p>
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
        )}

        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold">{hasOnlyDescriptive ? 'Your Responses' : 'Review Your Answers'}</h2>
                {showPassFail && (
                    <>
                        <Badge variant={percentage >= 70 ? "default" : "destructive"}>
                            {percentage >= 70 ? "Passed Quiz" : "Failed Quiz"}
                        </Badge>
                        {percentage >= 70 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                <Award className="h-3 w-3 mr-1" />
                                Good Job!
                            </Badge>
                        )}
                    </>
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

            {/* Instructor Feedback Section */}
            {attempt.instructor_feedback && (
                <div className="mb-8">
                    <Card className="border-blue-300 bg-blue-50 dark:bg-blue-900/20">
                        <CardHeader className="border-b border-blue-200 dark:border-blue-800">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Instructor Feedback</CardTitle>
                                {attempt.graded_at && (
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                        Provided {new Date(attempt.graded_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="prose prose-sm max-w-none dark:prose-invert text-slate-700 dark:text-slate-300">
                                    <p className="whitespace-pre-wrap">{attempt.instructor_feedback}</p>
                                </div>
                                {attempt.instructor_score !== null && attempt.instructor_score !== undefined && (
                                    <div className="p-4 bg-white dark:bg-slate-950 rounded border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Descriptive Questions Score</p>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {attempt.instructor_score} / 100
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
            
            {attempt.questions && attempt.questions.length > 0 && (() => {
                const mcqIncorrect = mcqTotal - mcqScore;
                return (
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {mcqTotal > 0 && (
                            <>
                                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <span className="font-semibold text-green-800 dark:text-green-200">
                                                Correct (MCQ): {mcqScore}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-5 w-5 text-red-600" />
                                            <span className="font-semibold text-red-800 dark:text-red-200">
                                                Incorrect (MCQ): {mcqIncorrect}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        {descriptiveQuestions.length > 0 && (
                            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 md:col-span-2">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Award className="h-5 w-5 text-amber-600" />
                                        <span className="font-semibold text-amber-800 dark:text-amber-200">
                                            Descriptive Questions Submitted for Review: {descriptiveQuestions.length}
                                        </span>
                                    </div>
                                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                                        ℹ️ Descriptive answers are not auto-graded. An instructor will review these answers and provide feedback.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                );
            })()}
            
            {attempt.questions && attempt.questions.length > 0 ? attempt.questions.map((question, index) => {
                const userAnswer = attempt.answers[index];
                const isDescriptive = question.type === 'descriptive';
                const isCorrect = !isDescriptive && userAnswer === question.correctAnswerIndex;
                
                // For descriptive questions, show a different layout
                if (isDescriptive) {
                    return (
                        <Card key={index} className="transition-all border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        Question {index + 1}
                                        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Descriptive</Badge>
                                    </CardTitle>
                                    <Badge className="bg-blue-600 hover:bg-blue-700">
                                        Submitted for Review
                                    </Badge>
                                </div>
                                <div className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground mt-2">
                                    {question.questionText}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Student's Answer */}
                                    <div className="p-4 border rounded-lg bg-white dark:bg-slate-950 border-amber-200 dark:border-amber-800">
                                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-amber-600" />
                                            Your Answer
                                        </h4>
                                        <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                                            {typeof userAnswer === 'string' ? userAnswer : '(No answer provided)'}
                                        </p>
                                    </div>
                                    
                                    {/* Suggested Model Answer */}
                                    {question.explanation && (
                                        <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                                            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                                Suggested Model Answer
                                            </h4>
                                            <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                                                {question.explanation}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Review Status */}
                                    <div className="p-3 border rounded-lg bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                                        <p className="text-sm text-amber-900 dark:text-amber-100">
                                            <strong>⏳ Pending Instructor Review:</strong> This answer will be reviewed by an instructor who will provide personalized feedback.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }
                
                // MCQ Question Layout
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
                                {question.options?.map((option: string, optIndex: number) => {
                                    const isUserAnswer = userAnswer === optIndex;
                                    const isCorrectAnswer = question.correctAnswerIndex !== undefined && question.correctAnswerIndex === optIndex;
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
                           
                           {/* Always show the correct answer and explanation for learning */}
                           <div className={cn(
                               "mt-4 p-4 border rounded-lg",
                               isCorrect 
                                   ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                   : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                           )}>
                               <div className="flex items-center gap-2 mb-2">
                                   {isCorrect ? (
                                       <>
                                           <CheckCircle className="h-4 w-4 text-green-600" />
                                           <h4 className="font-semibold text-green-800 dark:text-green-200">Correct Answer Explanation</h4>
                                       </>
                                   ) : (
                                       <>
                                           <TrendingUp className="h-4 w-4 text-blue-600" />
                                           <h4 className="font-semibold text-blue-800 dark:text-blue-200">Correct Answer</h4>
                                       </>
                                   )}
                               </div>
                               <p className={cn("text-sm mb-2", isCorrect ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300')}>
                                   The correct answer is: <strong>{question.correctAnswerText}</strong>
                               </p>
                               {question.explanation && (
                                   <div className={cn("mt-3 p-3 rounded border-l-4", 
                                       isCorrect 
                                           ? 'bg-green-100 dark:bg-green-800/30 border-green-400'
                                           : 'bg-blue-100 dark:bg-blue-800/30 border-blue-400'
                                   )}>
                                       <h5 className={cn("font-medium text-sm mb-1", isCorrect ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200')}>Explanation:</h5>
                                       <p className={cn("text-sm", isCorrect ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300')}>{question.explanation}</p>
                                   </div>
                               )}
                           </div>
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
