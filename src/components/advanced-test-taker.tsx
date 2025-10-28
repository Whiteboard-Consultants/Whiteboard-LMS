'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, ChevronLeft, ChevronRight, Flag, RotateCcw, Send, AlertTriangle, BookmarkIcon, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { TestQuestion, Test, Answer, AnswerStatus } from '@/types';

interface AdvancedTestTakerProps {
  test: Test;
  questions: TestQuestion[];
  onSubmit: (answers: Answer[]) => Promise<void>;
  initialTimeLeft?: number;
  allowNavigation?: boolean;
  showTimer?: boolean;
}

export function AdvancedTestTaker({ 
  test, 
  questions, 
  onSubmit, 
  initialTimeLeft,
  allowNavigation = true,
  showTimer = true 
}: AdvancedTestTakerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(() => ({ optionIndex: null, status: 'not-visited' as AnswerStatus }))
  );
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || test.duration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set());

  // Timer logic
  useEffect(() => {
    if (!showTimer || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showTimer]);

  // Mark current question as visited when navigating
  useEffect(() => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      if (newAnswers[currentQuestionIndex].status === 'not-visited') {
        newAnswers[currentQuestionIndex].status = 'not-answered';
      }
      return newAnswers;
    });
  }, [currentQuestionIndex]);

  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: "Time's Up!",
      description: "The test has been automatically submitted.",
      variant: "destructive",
    });
    await handleSubmit();
  }, []);

  const handleAnswerSelect = (optionIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestionIndex] = {
        optionIndex,
        status: markedQuestions.has(currentQuestionIndex) 
          ? 'answered-and-marked' 
          : 'answered'
      };
      return newAnswers;
    });
  };

  const toggleMarkForReview = () => {
    const questionIndex = currentQuestionIndex;
    setMarkedQuestions(prev => {
      const newMarked = new Set(prev);
      if (newMarked.has(questionIndex)) {
        newMarked.delete(questionIndex);
      } else {
        newMarked.add(questionIndex);
      }
      return newMarked;
    });

    // Update answer status
    setAnswers(prev => {
      const newAnswers = [...prev];
      const currentAnswer = newAnswers[questionIndex];
      
      if (markedQuestions.has(questionIndex)) {
        // Removing mark
        if (currentAnswer.optionIndex !== null) {
          newAnswers[questionIndex].status = 'answered';
        } else {
          newAnswers[questionIndex].status = 'not-answered';
        }
      } else {
        // Adding mark
        if (currentAnswer.optionIndex !== null) {
          newAnswers[questionIndex].status = 'answered-and-marked';
        } else {
          newAnswers[questionIndex].status = 'marked';
        }
      }
      return newAnswers;
    });
  };

  const navigateToQuestion = (index: number) => {
    if (allowNavigation) {
      setCurrentQuestionIndex(index);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const getQuestionStatusColor = (status: AnswerStatus) => {
    switch (status) {
      case 'not-visited':
        return 'bg-gray-200 text-gray-600 border-gray-300';
      case 'not-answered':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'answered':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'marked':
        return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'answered-and-marked':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-200 text-gray-600 border-gray-300';
    }
  };

  const getQuestionStatusIcon = (status: AnswerStatus) => {
    switch (status) {
      case 'marked':
      case 'answered-and-marked':
        return <Flag className="h-3 w-3" />;
      case 'answered':
        return <Eye className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSubmitButtonText = () => {
    const answeredCount = answers.filter(a => a.optionIndex !== null).length;
    const unansweredCount = questions.length - answeredCount;
    
    if (unansweredCount > 0) {
      return `Submit Test (${unansweredCount} unanswered)`;
    }
    return 'Submit Test';
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel - Question Content */}
      <div className="flex-1 p-6 overflow-auto">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl">{test.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                {showTimer && (
                  <div className={cn(
                    "flex items-center gap-1 font-mono",
                    timeLeft < 300 ? "text-red-600" : "text-gray-600"
                  )}>
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={markedQuestions.has(currentQuestionIndex) ? "default" : "outline"}
                size="sm"
                onClick={toggleMarkForReview}
              >
                <BookmarkIcon className="h-4 w-4 mr-1" />
                {markedQuestions.has(currentQuestionIndex) ? 'Marked' : 'Mark for Review'}
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Progress value={progress} className="h-2" />
            
            <div className="space-y-4">
              <div className="text-lg font-medium leading-relaxed">
                {currentQuestion.text}
              </div>
              
              <RadioGroup
                value={currentAnswer.optionIndex?.toString() || ''}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-md border hover:bg-gray-50">
                    <RadioGroupItem value={index.toString()} className="mt-0.5" />
                    <Label className="flex-1 text-sm font-normal cursor-pointer">
                      <span className="font-medium mr-2">({String.fromCharCode(65 + index)})</span>
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <div className="max-w-4xl mx-auto mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setCurrentQuestionIndex(0)}>
              <RotateCcw className="h-4 w-4 mr-1" />
              First Question
            </Button>
            
            <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
              <DialogTrigger asChild>
                <Button variant="default" className="bg-red-600 hover:bg-red-700">
                  <Send className="h-4 w-4 mr-1" />
                  Submit Test
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Test</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p>Are you sure you want to submit your test? This action cannot be undone.</p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium">Summary</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <div>Answered: {answers.filter(a => a.optionIndex !== null).length} questions</div>
                      <div>Unanswered: {answers.filter(a => a.optionIndex === null).length} questions</div>
                      <div>Marked for Review: {markedQuestions.size} questions</div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
                    Continue Test
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Test'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Right Panel - Question Navigation */}
      <div className="w-80 bg-white border-l border-gray-200 p-4">
        <div className="space-y-4">
          <div className="text-lg font-semibold">Question Navigator</div>
          
          {/* Legend */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
              <span>Not Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
              <span>Not Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300 flex items-center justify-center">
                <Flag className="h-2 w-2" />
              </div>
              <span>Marked for Review</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300 flex items-center justify-center">
                <Flag className="h-2 w-2" />
              </div>
              <span>Answered & Marked</span>
            </div>
          </div>

          <Separator />

          {/* Question Grid */}
          <ScrollArea className="h-96">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const answer = answers[index];
                const isCurrentQuestion = index === currentQuestionIndex;
                
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-10 h-10 p-0 text-xs font-medium border-2 relative",
                      getQuestionStatusColor(answer.status),
                      isCurrentQuestion && "ring-2 ring-blue-500 ring-offset-1"
                    )}
                    onClick={() => navigateToQuestion(index)}
                  >
                    <span>{index + 1}</span>
                    {getQuestionStatusIcon(answer.status) && (
                      <div className="absolute -top-1 -right-1">
                        {getQuestionStatusIcon(answer.status)}
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Summary Stats */}
          <Separator />
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Answered:</span>
              <span className="font-medium text-green-600">
                {answers.filter(a => a.optionIndex !== null).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Not Answered:</span>
              <span className="font-medium text-red-600">
                {answers.filter(a => a.optionIndex === null).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Marked for Review:</span>
              <span className="font-medium text-purple-600">{markedQuestions.size}</span>
            </div>
          </div>

          {showTimer && (
            <>
              <Separator />
              <div className={cn(
                "text-center p-3 rounded-md border",
                timeLeft < 300 ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"
              )}>
                <div className="text-xs text-muted-foreground">Time Remaining</div>
                <div className={cn(
                  "text-lg font-mono font-bold",
                  timeLeft < 300 ? "text-red-600" : "text-blue-600"
                )}>
                  {formatTime(timeLeft)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}