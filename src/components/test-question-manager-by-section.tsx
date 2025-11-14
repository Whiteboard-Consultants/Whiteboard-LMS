'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { getTestQuestions, updateTestQuestionOrder, deleteTestQuestion, getTestPassages } from '@/app/instructor/tests/actions';
import { getTestSections } from '@/app/instructor/tests/actions';
import type { TestQuestion, TestPassage } from '@/types';
import { TestQuestionForm } from './test-question-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface TestSection {
    id: string;
    name: string;
    description?: string;
    duration?: number;
    order_number: number;
}

interface SortableQuestionItemProps {
    question: TestQuestion;
    sectionName?: string;
    onEdit: (question: TestQuestion) => void;
    onDelete: (id: string) => void;
}

function SortableQuestionItem({ question, sectionName, onEdit, onDelete }: SortableQuestionItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-start gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50"
        >
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                    <Badge variant={question.type === 'mcq' ? 'default' : 'secondary'}>
                        {question.type === 'mcq' ? 'MCQ' : 'Descriptive'}
                    </Badge>
                    <Badge variant="outline">{question.marks} marks</Badge>
                    {question.negativeMarks ? <Badge variant="outline">-{question.negativeMarks}</Badge> : null}
                </div>
                <div 
                    className="font-medium text-sm"
                    dangerouslySetInnerHTML={{ __html: question.text }}
                    style={{
                        display: 'block'
                    } as React.CSSProperties}
                />
                {(() => {
                    console.log('Question text content:', question.text);
                    console.log('Contains HTML:', question.text.includes('<') && question.text.includes('>'));
                    return null;
                })()}
                <style jsx>{`
                    div {
                        --tw-prose-body: currentColor;
                    }
                    div p {
                        margin-bottom: 0.5rem;
                        display: block;
                    }
                    div strong {
                        font-weight: bold;
                    }
                    div em {
                        font-style: italic;
                    }
                    div ul {
                        list-style-type: disc;
                        margin-left: 1.5rem;
                    }
                    div ol {
                        list-style-type: decimal;
                        margin-left: 1.5rem;
                    }
                    div li {
                        margin-left: 0.5rem;
                    }
                    div h1 { font-size: 1.875rem; font-weight: bold; }
                    div h2 { font-size: 1.5rem; font-weight: bold; }
                    div h3 { font-size: 1.25rem; font-weight: bold; }
                `}</style>
                {question.type === 'mcq' && question.options && (
                    <p className="text-xs text-muted-foreground mt-1">{question.options.length} options</p>
                )}
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(question)}>
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(question.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}

export function TestQuestionManagerBySection({ testId }: { testId: string }) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [sections, setSections] = useState<TestSection[]>([]);
    const [passages, setPassages] = useState<TestPassage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

    useEffect(() => {
        fetchData();
    }, [testId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [questionsResult, sectionsResult, passagesResult] = await Promise.all([
                getTestQuestions(testId),
                getTestSections(testId),
                getTestPassages(testId),
            ]);

            if (questionsResult.success) {
                setQuestions(questionsResult.questions || []);
            } else {
                toast({ variant: 'destructive', title: 'Error', description: questionsResult.error });
            }

            if (sectionsResult.success) {
                setSections(sectionsResult.sections || []);
            }

            if (passagesResult.success) {
                setPassages(passagesResult.passages || []);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load data' });
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over?.id);
            const reordered = arrayMove(questions, oldIndex, newIndex);
            setQuestions(reordered);

            const result = await updateTestQuestionOrder(testId, reordered);
            if (!result.success) {
                toast({ variant: 'destructive', title: 'Error', description: (result as any).error });
                setQuestions(questions);
            }
        }
    };

    const handleDelete = async (questionId: string) => {
        if (confirm('Are you sure you want to delete this question?')) {
            const result = await deleteTestQuestion(questionId);
            if (result.success) {
                setQuestions((prev) => prev.filter((q) => q.id !== questionId));
                toast({ title: 'Success', description: 'Question deleted' });
                fetchData();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: (result as any).error });
            }
        }
    };

    const handleOpenForm = (question: TestQuestion | null) => {
        setEditingQuestion(question);
        setIsFormOpen(true);
    };

    // Group questions by section
    const questionsBySection: { [key: string]: TestQuestion[] } = {};
    const unassignedQuestions: TestQuestion[] = [];

    questions.forEach((q) => {
        if (q.sectionId) {
            if (!questionsBySection[q.sectionId]) {
                questionsBySection[q.sectionId] = [];
            }
            questionsBySection[q.sectionId].push(q);
        } else {
            unassignedQuestions.push(q);
        }
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Test Questions</h2>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenForm(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl w-full max-h-[95vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>
                                {editingQuestion ? 'Edit Question' : 'Add New Question'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto flex-1 pr-4">
                            <TestQuestionForm
                                testId={testId}
                                onSuccess={() => {
                                    setIsFormOpen(false);
                                    fetchData();
                                }}
                                existingQuestion={editingQuestion}
                                currentQuestionCount={questions.length}
                                sections={sections}
                                passages={passages}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <p className="text-muted-foreground">Loading questions...</p>
            ) : questions.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground py-8">
                            No questions have been added to this test yet.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <div className="space-y-6">
                        {/* Render sections with their questions */}
                        {sections.length > 0 &&
                            sections.map((section) => {
                                const sectionQuestions = questionsBySection[section.id] || [];
                                return (
                                    <Card key={section.id}>
                                        <CardHeader>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="flex items-center gap-2">
                                                        {section.name}
                                                        <Badge variant="secondary">{sectionQuestions.length} Q</Badge>
                                                    </CardTitle>
                                                    {section.description && (
                                                        <CardDescription>{section.description}</CardDescription>
                                                    )}
                                                    {section.duration && (
                                                        <CardDescription className="mt-1">
                                                            ⏱️ {section.duration} minutes
                                                        </CardDescription>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <SortableContext
                                                items={sectionQuestions}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="space-y-2">
                                                    {sectionQuestions.map((q) => (
                                                        <SortableQuestionItem
                                                            key={q.id}
                                                            question={q}
                                                            sectionName={section.name}
                                                            onEdit={handleOpenForm}
                                                            onDelete={handleDelete}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </CardContent>
                                    </Card>
                                );
                            })}

                        {/* Render unassigned questions */}
                        {unassignedQuestions.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        Unassigned Questions
                                        <Badge variant="secondary">{unassignedQuestions.length} Q</Badge>
                                    </CardTitle>
                                    <CardDescription>
                                        These questions are not assigned to any section
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <SortableContext
                                        items={unassignedQuestions}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-2">
                                            {unassignedQuestions.map((q) => (
                                                <SortableQuestionItem
                                                    key={q.id}
                                                    question={q}
                                                    onEdit={handleOpenForm}
                                                    onDelete={handleDelete}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </DndContext>
            )}
        </div>
    );
}
