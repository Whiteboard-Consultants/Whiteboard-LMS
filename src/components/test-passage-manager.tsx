'use client';

import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Edit, GripVertical } from 'lucide-react';
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
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
import { TestPassageForm } from './test-passage-form';
import { deleteTestPassage, getTestPassages } from '@/app/instructor/tests/actions';
import { RichTextRenderer } from './rich-text-renderer';

interface TestPassage {
    id: string;
    testId: string;
    title: string;
    content: string;
    displayOrder: number;
}

function SortablePassageItem({ 
    passage, 
    onEdit, 
}: { 
    passage: TestPassage, 
    onEdit: (passage: TestPassage) => void 
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: passage.id });
    const { toast } = useToast();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
    };

    const handleDelete = async () => {
        const result = await deleteTestPassage(passage.id);
        if (result.success) {
            toast({ title: "Passage Deleted" });
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    return (
        <div ref={setNodeRef} style={style} className="group flex items-start justify-between p-4 bg-background rounded-lg border">
            <div className="flex items-start gap-3 flex-grow">
                <button type="button" {...attributes} {...listeners} className="cursor-grab p-1 mt-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-2">{passage.title}</h3>
                    <div className="text-sm text-muted-foreground line-clamp-3">
                        <RichTextRenderer content={passage.content} />
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                 <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8" 
                    onClick={() => onEdit(passage)}
                >
                    <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Passage?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete the passage "{passage.title}". Linked questions will not be deleted (they'll be unlinked).
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

export function TestPassageManager({ testId }: { testId: string }) {
    const { toast } = useToast();
    const [passages, setPassages] = useState<TestPassage[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPassage, setEditingPassage] = useState<TestPassage | null>(null);

    const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));

    useEffect(() => {
        if (!testId) return;
        fetchPassages();
    }, [testId]);

    const fetchPassages = async () => {
        try {
            const result = await getTestPassages(testId);
            
            if (result.success && result.passages) {
                const mapped = (result.passages || []).map((p: any) => ({
                    id: p.id,
                    testId: p.test_id,
                    title: p.title,
                    content: p.content,
                    displayOrder: p.display_order
                }));
                setPassages(mapped);
            } else {
                console.error('Error fetching passages:', result.error);
            }
        } catch (error) {
            console.error('Error fetching passages:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load passages'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = passages.findIndex((p) => p.id === active.id);
            const newIndex = passages.findIndex((p) => p.id === over.id);
            const reordered = arrayMove(passages, oldIndex, newIndex);
            
            setPassages(reordered);
            
            // Update display order in database
            const updates = reordered.map((p, index) => ({
                ...p,
                displayOrder: index
            }));
            
            // Update each passage
            for (const passage of updates) {
                // Note: You may want to create an updateTestPassageOrder action
                // For now, we'll just update locally
            }
        }
    };

    const handleOpenForm = (passage: TestPassage | null) => {
        setEditingPassage(passage);
        setIsFormOpen(true);
    }
    
    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Reading Passages</h2>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenForm(null)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Passage
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>{editingPassage ? 'Edit Passage' : 'Add New Passage'}</DialogTitle>
                        </DialogHeader>
                        <div className="overflow-y-auto pr-6 -mr-6">
                            <TestPassageForm 
                                testId={testId}
                                onSuccess={() => {
                                    setIsFormOpen(false);
                                    fetchPassages();
                                }}
                                existingPassage={editingPassage}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            
            <div className="p-4 border rounded-lg bg-background space-y-4">
                {loading ? (
                    <p className="text-muted-foreground">Loading passages...</p>
                ) : passages.length > 0 ? (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={passages} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {passages.map(p => (
                                    <SortablePassageItem 
                                        key={p.id} 
                                        passage={p} 
                                        onEdit={handleOpenForm} 
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        <p className="mb-2">No passages have been created yet.</p>
                        <p className="text-sm">Create passages to organize reading comprehensions, case studies, and other shared content.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
