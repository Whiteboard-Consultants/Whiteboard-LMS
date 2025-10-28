

'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, PlusCircle, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Question } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SortableQuestionProps {
  question: Question;
  index: number;
  updateQuestion: (index: number, field: keyof Question, value: string | number | null) => void;
  addOption: (questionIndex: number) => void;
  updateOption: (questionIndex: number, optionIndex: number, value: string) => void;
  removeOption: (questionIndex: number, optionIndex: number) => void;
  removeQuestion: (questionIndex: number) => void;
}

const SortableQuestionItem = ({ question, index, updateQuestion, addOption, updateOption, removeOption, removeQuestion }: SortableQuestionProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className={cn("p-4 border rounded-md bg-background", isDragging && "shadow-lg")}>
            <div className="flex items-start gap-2">
                <button type="button" {...attributes} {...listeners} className="cursor-grab p-1 mt-1.5">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-grow space-y-4">
                    <div className="flex items-center justify-between">
                         <Label htmlFor={`question-${index}`} className="text-base font-semibold">Question {index + 1}</Label>
                         <Button type="button" variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="text-destructive h-7 w-7"><X className="h-4 w-4" /></Button>
                    </div>
                     <Textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                        placeholder="Enter question text..."
                        className="min-h-[100px]"
                    />

                    <div className="space-y-2">
                         <Label>Question Type</Label>
                         <Select
                            value={question.type || 'mcq'}
                            onValueChange={(value) => updateQuestion(index, 'type', value)}
                         >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mcq">Multiple Choice</SelectItem>
                                <SelectItem value="descriptive">Descriptive</SelectItem>
                            </SelectContent>
                         </Select>
                    </div>
                    {question.type !== 'descriptive' && (
                        <>
                            <div className="space-y-2">
                                <Label>Options</Label>
                                <RadioGroup
                                    value={question.correctAnswerIndex !== null ? question.correctAnswerIndex.toString() : ''}
                                    onValueChange={(value) => updateQuestion(index, 'correctAnswerIndex', parseInt(value))}
                                >
                                    {question.options.map((option, optionIndex) => (
                                        <div key={optionIndex} className="flex items-center gap-2">
                                            <RadioGroupItem value={optionIndex.toString()} id={`option-${index}-${optionIndex}`} />
                                            <Input
                                                value={option}
                                                onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                                placeholder={`Option ${optionIndex + 1}`}
                                            />
                                            <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index, optionIndex)} className="text-destructive h-8 w-8 shrink-0"><X className="h-4 w-4" /></Button>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => addOption(index)}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                        </>
                    )}

                    <div>
                        <Label htmlFor={`explanation-${index}`}>Explanation/Solution</Label>
                         <Textarea
                            id={`explanation-${index}`}
                            value={question.explanation || ''}
                            onChange={(e) => updateQuestion(index, 'explanation', e.target.value)}
                            placeholder="Explain why this is the correct answer or provide a model answer..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


interface QuizEditorProps {
  value: string; // The stringified JSON of Question[]
  onChange: (value: Question[]) => void;
}

export function QuizEditor({ value, onChange }: QuizEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    try {
      const parsedQuestions = JSON.parse(value || '[]');
      if (Array.isArray(parsedQuestions)) {
        // Ensure each question has a unique ID for dnd-kit
        const questionsWithIds = parsedQuestions.map(q => ({ ...q, id: q.id || uuidv4() }));
        setQuestions(questionsWithIds);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
    }
  }, [value]);

  const sensors = useSensors(useSensor(PointerSensor));
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        setQuestions((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const reordered = arrayMove(items, oldIndex, newIndex);
            onChange(reordered);
            return reordered;
        });
    }
  };

  const updateAndNotify = (newQuestions: Question[]) => {
    setQuestions(newQuestions);
    onChange(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      type: 'mcq',
      questionText: '',
      options: ['', ''],
      correctAnswerIndex: null,
      explanation: '',
    };
    updateAndNotify([...questions, newQuestion]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    updateAndNotify(newQuestions);
  };

  const updateQuestion = (index: number, field: keyof Question, value: unknown) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    updateAndNotify(newQuestions);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    updateAndNotify(newQuestions);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    updateAndNotify(newQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    if(newQuestions[questionIndex].correctAnswerIndex === optionIndex) {
        newQuestions[questionIndex].correctAnswerIndex = null;
    }
    updateAndNotify(newQuestions);
  };

  return (
    <Card className="p-4 bg-muted/50">
        <CardContent className="p-0">
          <div className="space-y-4">
             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions} strategy={verticalListSortingStrategy}>
                   {Array.isArray(questions) && questions.map((question, index) => (
                    <SortableQuestionItem
                        key={question.id}
                        question={question}
                        index={index}
                        updateQuestion={updateQuestion}
                        addOption={addOption}
                        updateOption={updateOption}
                        removeOption={removeOption}
                        removeQuestion={removeQuestion}
                    />
                   ))}
                </SortableContext>
             </DndContext>
            <Button type="button" onClick={addQuestion} className="w-full" variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Question
            </Button>
          </div>
        </CardContent>
    </Card>
  );
}
