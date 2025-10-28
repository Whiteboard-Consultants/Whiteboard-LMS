

'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, GripVertical, Trash2, FileText, Video, Mic, File as FileIcon, Link2, HelpCircle, Edit, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
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

import type { Lesson } from '@/types';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { CreateLessonForm } from './create-lesson-form';
import { EnhancedLessonForm } from './enhanced-lesson-form';
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
import { deleteLesson, updateLessonOrder } from '@/app/instructor/lessons/actions';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const lessonTypeIcons: Record<Lesson['type'], React.ReactNode> = {
    text: <FileText className="h-5 w-5 text-muted-foreground" />,
    video: <Video className="h-5 w-5 text-muted-foreground" />,
    audio: <Mic className="h-5 w-5 text-muted-foreground" />,
    document: <FileIcon className="h-5 w-5 text-muted-foreground" />,
    embed: <Link2 className="h-5 w-5 text-muted-foreground" />,
    quiz: <HelpCircle className="h-5 w-5 text-muted-foreground" />,
    assignment: <BookOpen className="h-5 w-5 text-muted-foreground" />,
};

function SortableLessonItem({ lesson, isSubLesson = false, onAddSubLesson, onDelete }: { lesson: Lesson, isSubLesson?: boolean, onAddSubLesson: (parentId: string, type?: 'simple' | 'enhanced') => void, onDelete: () => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lesson.id });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const { toast } = useToast();

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 'auto',
    };

    const handleDeleteLesson = async () => {
        const result = await deleteLesson(lesson.id, lesson.courseId, lesson.assetUrl);
        if (result.success) {
            toast({ title: "Lesson Deleted" });
            // Trigger parent refresh
            onDelete();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.error });
        }
    };
    
    return (
        <div ref={setNodeRef} style={style} className={cn("group flex items-center justify-between p-2 bg-background rounded-lg border", isSubLesson && "ml-8")}>
            <div className="flex items-center gap-2 flex-grow">
                <button type="button" {...attributes} {...listeners} className="cursor-grab p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className='flex items-center justify-center h-8 w-8 rounded-full'>
                    {lessonTypeIcons[lesson.type]}
                </div>
                <span className="font-medium text-sm">{lesson.title}</span>
            </div>
            <div className="flex items-center gap-1">
                {!isSubLesson && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Sub-lesson
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => onAddSubLesson(lesson.id, 'simple')}>
                                Simple Sub-lesson
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onAddSubLesson(lesson.id, 'enhanced')}>
                                Multi-Content Sub-lesson
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8" asChild>
                    <Link href={`/instructor/courses/edit/${lesson.courseId}/lessons/${lesson.id}`}>
                        <Edit className="h-4 w-4" />
                    </Link>
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the lesson and any sub-lessons attached to it.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => { handleDeleteLesson(); setIsDeleteDialogOpen(false); }}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}


export function CourseContentManager({ courseId }: { courseId: string }) {
    const { toast } = useToast();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateLessonOpen, setIsCreateLessonOpen] = useState(false);
    const [parentLessonId, setParentLessonId] = useState<string | null>(null);
    const [lessonCreationType, setLessonCreationType] = useState<'simple' | 'enhanced'>('simple');
    const [refreshKey, setRefreshKey] = useState(0);

    const lessonSensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));

    const fetchLessons = async () => {
        if (!courseId) return;
        
        try {
            const { data: lessonsData, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', courseId);
            
            if (error) {
                console.error("Supabase fetch error:", error);
                toast({
                    variant: 'destructive',
                    title: 'Error fetching lessons',
                    description: 'Failed to load lessons. Please try refreshing the page.'
                });
                setLoading(false);
                return;
            }

            // Debug: Log the first lesson to see available fields
            if (lessonsData && lessonsData.length > 0) {
                console.log('Sample lesson data structure:', lessonsData[0]);
                console.log('Available fields:', Object.keys(lessonsData[0]));
            }

            const lessons = lessonsData.map((lesson, index) => ({
                id: lesson.id,
                title: lesson.title,
                description: lesson.description || '',
                type: lesson.type as Lesson['type'],
                order: lesson.order_number || lesson.sort_order || lesson.order || lesson.position || index,
                parentId: lesson.parent_id,
                courseId: lesson.course_id,
                content: lesson.content || '',
                assetUrl: lesson.asset_url || '',
                duration: lesson.duration || 0,
                isRequired: lesson.is_required || false,
                createdAt: lesson.created_at,
                updatedAt: lesson.updated_at,
            })) as Lesson[];
            
            // Sort by order field
                // Sort by order field, handling potential null/undefined values
                lessons.sort((a, b) => (a.order || 0) - (b.order || 0));            setLessons(lessons);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching lessons:", error);
            toast({
                variant: 'destructive',
                title: 'Error fetching lessons',
                description: 'Failed to load lessons. Please try refreshing the page.'
            });
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();

        // Set up real-time subscription
        const channel = supabase
            .channel('lessons-changes')
            .on('postgres_changes', 
                { 
                    event: '*', 
                    schema: 'public', 
                    table: 'lessons',
                    filter: `course_id=eq.${courseId}`
                }, 
                () => {
                    console.log('Real-time lesson change detected, refreshing...');
                    // Small delay to ensure the change is fully committed
                    setTimeout(() => {
                        fetchLessons();
                    }, 100);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [courseId, toast, refreshKey]);

    const handleLessonDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = lessons.findIndex((l) => l.id === active.id);
            const newIndex = lessons.findIndex((l) => l.id === over.id);
            const reorderedLessons = arrayMove(lessons, oldIndex, newIndex);
            
            // Re-assign order based on new position, preserving parent-child relationships
            const itemsToUpdate = reorderedLessons.map((lesson, index) => ({ id: lesson.id, order: index, parentId: lesson.parentId || null }));

            const finalOrderedItems: { id: string; order: number; parentId: string | null; }[] = [];
            let orderCounter = 0;
            itemsToUpdate.filter(l => !l.parentId).forEach(parent => {
                parent.order = orderCounter++;
                finalOrderedItems.push(parent);
                itemsToUpdate.filter(l => l.parentId === parent.id).forEach(child => {
                    child.order = orderCounter++;
                    finalOrderedItems.push(child);
                })
            })

            setLessons(reorderedLessons);
            
            const result = await updateLessonOrder(finalOrderedItems.map(item => ({id: item.id, order: item.order})), courseId);
            if (!result.success) {
                toast({ variant: "destructive", title: "Error", description: result.error });
                setLessons(lessons); // Revert on failure
            }
        }
    };
    
    const openCreateLessonDialog = (parentId: string | null = null, type: 'simple' | 'enhanced' = 'simple') => {
        setParentLessonId(parentId);
        setLessonCreationType(type);
        setIsCreateLessonOpen(true);
    }
    
    const parentLessons = lessons.filter(l => !l.parentId);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-headline">Course Content</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => openCreateLessonDialog(null, 'simple')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Simple Lesson
                    </Button>
                    <Button onClick={() => openCreateLessonDialog(null, 'enhanced')}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Multi-Content Lesson
                    </Button>
                </div>
            </div>
            
            <Dialog open={isCreateLessonOpen} onOpenChange={setIsCreateLessonOpen}>
                <DialogContent className={lessonCreationType === 'enhanced' ? "sm:max-w-2xl" : "sm:max-w-md"}>
                    <DialogHeader>
                        <DialogTitle>
                            {parentLessonId ? 'Add New Sub-lesson' : 
                             lessonCreationType === 'enhanced' ? 'Add Multi-Content Lesson' : 'Add New Lesson'}
                        </DialogTitle>
                    </DialogHeader>
                    {lessonCreationType === 'simple' ? (
                        <CreateLessonForm 
                            courseId={courseId} 
                            parentId={parentLessonId}
                            onSuccess={() => {
                                setIsCreateLessonOpen(false);
                                // Force refresh lessons immediately
                                setTimeout(() => {
                                    setRefreshKey(prev => prev + 1);
                                    fetchLessons();
                                }, 200);
                            }} 
                            currentLessonCount={lessons.length} 
                        />
                    ) : (
                        <EnhancedLessonForm 
                            courseId={courseId} 
                            parentId={parentLessonId}
                            onSuccess={() => {
                                setIsCreateLessonOpen(false);
                                // Force refresh lessons immediately
                                setTimeout(() => {
                                    setRefreshKey(prev => prev + 1);
                                    fetchLessons();
                                }, 200);
                            }} 
                            currentLessonCount={lessons.length} 
                        />
                    )}
                </DialogContent>
            </Dialog>
             <div className="p-4 border rounded-lg bg-background space-y-4">
                 {loading ? (
                    <p>Loading...</p>
                 ) : parentLessons.length > 0 ? (
                    <DndContext sensors={lessonSensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
                        <SortableContext items={lessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2">
                                {parentLessons.map(parentLesson => (
                                    <div key={parentLesson.id}>
                                         <SortableLessonItem lesson={parentLesson} onAddSubLesson={openCreateLessonDialog} onDelete={() => {
                                             setRefreshKey(prev => prev + 1);
                                             fetchLessons();
                                         }} />
                                         {lessons.filter(l => l.parentId === parentLesson.id).map(subLesson => (
                                            <div key={subLesson.id} className="mt-2">
                                                 <SortableLessonItem lesson={subLesson} isSubLesson={true} onAddSubLesson={openCreateLessonDialog} onDelete={() => {
                                                     setRefreshKey(prev => prev + 1);
                                                     fetchLessons();
                                                 }} />
                                            </div>
                                         ))}
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : (
                    <div className="text-center text-muted-foreground p-8">
                        No lessons have been added yet.
                    </div>
                )}
            </div>
        </div>
    );
}
