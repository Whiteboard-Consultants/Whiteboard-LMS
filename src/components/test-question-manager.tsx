
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, GripVertical, Trash2, Edit } from 'lucide-react';
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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { supabase } from '@/lib/supabase';
import type { TestQuestion } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { TestQuestionForm } from './test-question-form';
import { deleteTestQuestion, updateTestQuestionOrder, getTestQuestions } from '@/app/instructor/tests/actions';
import { RichTextRenderer } from './rich-text-renderer';

function SortableQuestionItem({ question, onEdit }: { question: TestQuestion, onEdit: (question: TestQuestion) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: question.id });
    const { toast } = useToast();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
    };

    const handleDelete = async () => {
        const result = await deleteTestQuestion(question.id);
        if (result.success) {
            toast({ title: "Question Deleted" });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    return (
        <div ref={setNodeRef} style={style} className="group flex items-start justify-between p-3 bg-background rounded-lg border">
            <div className="flex items-start gap-2 flex-grow">
                <button type="button" {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-1">
                    <RichTextRenderer content={question.text} />
                </div>
            </div>
            <div className="flex items-center gap-1">
                 <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onEdit(question)}>
                    <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this question.</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export function TestQuestionManager({ testId }: { testId: string }) {
    const { toast } = useToast();
    const [questions, setQuestions] = useState<TestQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));

    useEffect(() => {
        console.log('🔄 TestQuestionManager useEffect triggered:', { testId });
        if (!testId) return;

        const fetchQuestions = async () => {
            console.log('🔍 Client: Fetching questions for testId:', testId);
            
            try {
                const result = await getTestQuestions(testId);
                console.log('🔍 Client: Server action result:', result);

                if (!result.success) {
                    throw new Error(result.error);
                }

                const data = result.questions;
                console.log('🔍 Client: Raw database questions:', data);
                
                const mappedQuestions = (data || []).map((q: any) => {
                    const mapped = {
                        id: q.id,
                        testId: q.test_id,
                        order: q.order_number,
                        text: q.question_text,
                        options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
                        correctOption: parseInt(q.correct_answer) || 0,
                        solution: q.explanation || '',
                        marks: q.points || 1,
                        negativeMarks: 0
                    };
                    console.log('📝 Mapped question:', mapped);
                    return mapped;
                });

                console.log('📊 All mapped questions:', mappedQuestions);
                setQuestions(mappedQuestions);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching questions:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error fetching questions',
                    description: 'Please try again.'
                });
                setLoading(false);
            }
        };

        fetchQuestions();

        // Set up real-time subscription
        const channel = supabase
            .channel('test_questions')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'test_questions',
                filter: `test_id=eq.${testId}`
            }, () => {
                fetchQuestions();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [testId, toast]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = questions.findIndex((q) => q.id === active.id);
            const newIndex = questions.findIndex((q) => q.id === over.id);
            const reordered = arrayMove(questions, oldIndex, newIndex);
            
            setQuestions(reordered);
            
            const result = await updateTestQuestionOrder(testId, reordered);
            if (!result.success) {
                toast({ variant: "destructive", title: "Error", description: (result as any).error || "Failed to update question order" });
                setQuestions(questions); // Revert on failure
            }
        }
    };

    const handleOpenForm = (question: TestQuestion | null) => {
        setEditingQuestion(question);
        setIsFormOpen(true);
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Test Questions</h2>
                 <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenForm(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto pr-6 -mr-6">
                            <TestQuestionForm 
                                testId={testId}
                                onSuccess={() => setIsFormOpen(false)} 
                                existingQuestion={editingQuestion}
                                currentQuestionCount={questions.length}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
             <div className="p-4 border rounded-lg bg-background space-y-4">
                 {loading ? (
                    <p>Loading...</p>
                 ) : questions.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={questions} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {questions.map(q => (
                                    <SortableQuestionItem key={q.id} question={q} onEdit={handleOpenForm} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        No questions have been added to this test yet.
                    </div>
                )}
            </div>
        </div>
    );
}
