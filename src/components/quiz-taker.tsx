
'use client';

import { useState, useEffect } from 'react';
import type { Question } from '@/types';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { Progress } from './ui/progress';

interface QuizTakerProps {
  questions: Question[];
  onSubmit: (answers: (number | null)[]) => void;
  lessonType?: 'quiz' | 'assignment';
}

export function QuizTaker({ questions, onSubmit, lessonType = 'quiz' }: QuizTakerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setSelectedAnswers(new Array(questions.length).fill(null));
    setCurrentQuestionIndex(0);
  }, [questions]);
  
  const allQuestionsAnswered = selectedAnswers.every(answer => answer !== null);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(selectedAnswers);
    } catch (error) {
      console.error('Error submitting quiz/assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (questions.length === 0) {
    return <p className="text-muted-foreground">This quiz has no questions yet.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
       <div>
         <p className="text-sm text-muted-foreground mb-1">Question {currentQuestionIndex + 1} of {questions.length}</p>
         <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="w-full h-2" />
       </div>
       <p className="text-lg font-semibold">{currentQuestion.questionText}</p>
       <RadioGroup
            value={selectedAnswers[currentQuestionIndex]?.toString() ?? ''}
            onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            className="space-y-2"
        >
            {currentQuestion.options.map((option, index) => (
                <Label key={index} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-muted has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <span>{option}</span>
                </Label>
            ))}
       </RadioGroup>
       <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handlePrev} disabled={isSubmitting || currentQuestionIndex === 0}>
                Previous
            </Button>
            {currentQuestionIndex === questions.length - 1 ? (
                <Button onClick={handleSubmit} disabled={isSubmitting || !allQuestionsAnswered}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {lessonType === 'assignment' ? 'Submit Assignment' : 'Submit Quiz'}
                </Button>
            ) : (
                <Button onClick={handleNext} disabled={isSubmitting}>
                    Next
                </Button>
            )}
       </div>
    </div>
  );
}
