
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import type { Test, TestQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TimerIcon, Book, Bookmark, RotateCcw, XSquare, ChevronsRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { submitTest } from '@/app/student/assessment-actions';
import { useBeforeunload } from 'react-beforeunload';
import { cn } from '@/lib/utils';

type AnswerStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-and-marked';

interface Answer {
    optionIndex: number | null;
    status: AnswerStatus;
}

interface TestTakerProps {
  testId: string;
}

export default function TestTaker({ testId }: TestTakerProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isIntentionalExit, setIsIntentionalExit] = useState(false);

  useBeforeunload((event) => {
    if (!isIntentionalExit) {
      event.preventDefault();
    }
  });

  const handleSubmit = useCallback(async () => {
    if (!test || !user) return;
    
    // Set flag to allow navigation after submission
    setIsIntentionalExit(true);
    
    // Convert answers to the format expected by the backend
    const answerIndices = answers.map(a => a.optionIndex !== null ? a.optionIndex : -1);
    
    // Prepare detailed answer information
    const answerDetails = questions.map((question, index) => ({
      questionIndex: index,
      selectedAnswer: answers[index].optionIndex !== null ? answers[index].optionIndex! : -1,
      isCorrect: answers[index].optionIndex === question.correctOption,
      question: question.text,
      options: question.options,
      correctAnswer: question.correctOption
    }));
    
    const result = await submitTest({
      testId: test.id,
      userId: user.id,
      answers: answerIndices,
      answerDetails
    });
    
    if (result.success && result.attemptId) {
        toast({ 
          title: "Test Submitted", 
          description: `Your test has been submitted successfully. Score: ${result.percentage}%. ${result.passed ? 'Congratulations, you passed!' : 'You need 80% to pass.'}`,
          duration: 5000
        });
        router.push(`/student/quiz-results/${result.attemptId}`);
    } else {
        toast({ variant: 'destructive', title: "Submission Failed", description: result.error });
    }
  }, [test, user, answers, questions, router, toast]);

  const loadTestAndQuestions = useCallback(async () => {
    try {
      // Load test data from Supabase
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (testError || !testData) {
        throw new Error("Test not found.");
      }
      
      setTest(testData as Test);

      // Load questions from Supabase
      const { data: questionsData, error: questionsError } = await supabase
        .from('test_questions')
        .select('*')
        .eq('test_id', testId)
        .order('order_number');

      if (questionsError) {
        throw new Error("Failed to load questions.");
      }
      
      const questions = (questionsData || []).map((q: any) => ({
        id: q.id,
        testId: q.test_id,
        text: q.question_text,
        options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
        correctOption: parseInt(q.correct_answer) || 0,
        solution: q.explanation || '',
        marks: q.points || 1,
        order: q.order_number || 0,
        negativeMarks: 0
      })) as TestQuestion[];
      
      setQuestions(questions);
      
      const initialAnswers: Answer[] = questions.map((_, i) => ({
          optionIndex: null,
          status: i === 0 ? 'not-answered' : 'not-visited',
      }));
      setAnswers(initialAnswers);
      setTimeLeft(testData.duration);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
        setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    loadTestAndQuestions();
  }, [loadTestAndQuestions]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading) { // ensure it doesn't run on initial zero state
        handleSubmit();
        return;
    };
    
    if(timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }

  }, [timeLeft, loading, handleSubmit]);


  const updateAnswerStatus = (index: number, newStatus: AnswerStatus) => {
    setAnswers(prev => {
        const newAnswers = [...prev];
        if(newAnswers[index] && newAnswers[index].status !== newStatus) {
            newAnswers[index].status = newStatus;
        }
        return newAnswers;
    });
  }
  
  const handleQuestionChange = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < questions.length) {
        const currentAnswer = answers[newIndex];
        if (currentAnswer && currentAnswer.status === 'not-visited') {
            updateAnswerStatus(newIndex, 'not-answered');
        }
        setCurrentQuestionIndex(newIndex);
    }
  }

  const handleAnswerChange = (optionIndexStr: string) => {
    const optionIndex = parseInt(optionIndexStr, 10);
    setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex].optionIndex = optionIndex;
        if (newAnswers[currentQuestionIndex].status !== 'answered-and-marked') {
            newAnswers[currentQuestionIndex].status = 'answered';
        }
        return newAnswers;
    });
  };

  const handleClearResponse = () => {
    setAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[currentQuestionIndex].optionIndex = null;
        newAnswers[currentQuestionIndex].status = 'not-answered';
        return newAnswers;
    });
  };

  const handleMarkForReview = () => {
      const currentAnswer = answers[currentQuestionIndex];
      const newStatus = currentAnswer.optionIndex !== null ? 'answered-and-marked' : 'marked';
      updateAnswerStatus(currentQuestionIndex, newStatus);
      handleNext();
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
        handleQuestionChange(currentQuestionIndex + 1);
    }
  };
  
  const handleSaveAndNext = () => {
     handleNext();
  }

  const handleExitTest = () => {
    // Set flag to allow navigation
    setIsIntentionalExit(true);
    // Navigate back to the student tests page
    router.push('/student/tests');
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const getStatusColor = (status: AnswerStatus): string => {
    switch (status) {
      case 'answered':
        return 'bg-green-500 text-white';
      case 'not-answered':
        return 'bg-red-500 text-white';
      case 'marked':
        return 'bg-purple-500 text-white';
      case 'answered-and-marked':
        return 'bg-purple-500 text-white relative after:content-["✔"] after:absolute after:bottom-0 after:right-0.5 after:text-green-300 after:text-xs';
      case 'not-visited':
      default:
        return 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (error) return <div className="text-destructive text-center p-8">{error}</div>;
  if (!test || !currentQuestion) return <div className="text-center p-8">Could not load test content.</div>;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen p-4 space-y-4">
       <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg">{test.courseTitle || test.title}</h2>
            </div>
            <div className="flex items-center gap-4">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" title="Exit Test">
                            <XSquare className="h-5 w-5" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Exit Test?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to exit this test? Your progress will not be saved and you'll return to the tests page.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Stay in Test</AlertDialogCancel>
                            <AlertDialogAction onClick={handleExitTest} className="bg-red-600 hover:bg-red-700">
                                Exit Test
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <Button variant="outline" size="icon" title="Instructions">
                    <Book className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 px-3 py-1.5 rounded-md">
                    <TimerIcon className="h-5 w-5" />
                    <span className="font-mono font-bold text-lg">{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
            </div>
       </div>

       <div className="grid grid-cols-12 gap-4">
            <div className="col-span-9">
                <Card className="min-h-[60vh]">
                    <CardContent className="p-6">
                        <p className="text-sm font-semibold mb-2">Question {currentQuestionIndex + 1}</p>
                        <div className="prose dark:prose-invert max-w-none mb-6">
                           <p>{currentQuestion.text}</p>
                        </div>
                        <RadioGroup
                            value={answers[currentQuestionIndex]?.optionIndex?.toString() ?? ''}
                            onValueChange={handleAnswerChange}
                            className="space-y-4"
                        >
                             {currentQuestion.options.map((option, index) => (
                                <Label key={index} className="flex items-start gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:bg-blue-50 has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-900/20">
                                    <RadioGroupItem value={index.toString()} />
                                    <span className="flex-1">{option}</span>
                                </Label>
                            ))}
                        </RadioGroup>
                    </CardContent>
                </Card>
                <div className="flex justify-between items-center mt-4">
                   <div className="flex items-center gap-2">
                     <Button variant="secondary" onClick={handleMarkForReview}>
                        <Bookmark className="mr-2 h-4 w-4" />
                        Mark for Review & Next
                     </Button>
                     <Button variant="outline" onClick={handleClearResponse}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear Response
                     </Button>
                   </div>
                   <Button onClick={handleSaveAndNext} className="bg-orange-500 hover:bg-orange-600">
                      Save & Next
                      <ChevronsRight className="ml-2 h-4 w-4" />
                   </Button>
                </div>
            </div>

            <div className="col-span-3">
                 <Card>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">Question Palette</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        <div className="grid grid-cols-5 gap-2">
                           {questions.map((_, index) => (
                                <button
                                    key={index}
                                    className={cn("h-8 w-8 text-xs rounded-md flex items-center justify-center font-semibold", 
                                        getStatusColor(answers[index]?.status),
                                        currentQuestionIndex === index && "ring-2 ring-blue-500 ring-offset-2"
                                    )}
                                    onClick={() => handleQuestionChange(index)}
                                >
                                    {index + 1}
                                </button>
                           ))}
                        </div>
                         <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                            <Button variant="outline" size="sm">Question Paper</Button>
                            <Button variant="outline" size="sm">Instructions</Button>
                         </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full bg-orange-500 hover:bg-orange-600">Submit</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You have answered {answers.filter(a => a.optionIndex !== null).length} out of {questions.length} questions. You cannot change your answers after submitting.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <Card className="mt-4 p-3 text-xs text-muted-foreground">
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-green-500"></div>Answered</div>
                                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-red-500"></div>Not Answered</div>
                                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-purple-500"></div>Marked for Review</div>
                                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-sm bg-gray-200"></div>Not Visited</div>
                                <div className="col-span-2 flex items-center gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-purple-500 relative after:content-['✔'] after:absolute after:bottom-0 after:-right-0.5 after:text-green-300 after:text-[10px]"></div>
                                    Answered & Marked for review
                                </div>
                            </div>
                        </Card>
                    </CardContent>
                </Card>
            </div>
       </div>
    </div>
  );
}
