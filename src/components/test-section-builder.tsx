'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { createTestSection, updateTestSection, deleteTestSection, getTestSections, reorderTestSections } from '@/app/instructor/tests/actions';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required').max(100),
  description: z.string().max(500).optional(),
  duration: z.coerce.number().positive('Duration must be positive').optional(),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

interface TestSection {
  id: string;
  testId: string;
  name: string;
  description?: string;
  duration?: number;
  order_number: number;
  createdAt?: string;
}

interface TestSectionBuilderProps {
  testId: string;
  onSectionsChange?: (sections: TestSection[]) => void;
}

function SortableSectionItem({ section, onEdit, onDelete }: { section: TestSection; onEdit: (section: TestSection) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-3 border rounded-lg bg-background hover:bg-muted/50"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      <div className="flex-1">
        <h3 className="font-semibold">{section.name}</h3>
        {section.description && <p className="text-sm text-muted-foreground">{section.description}</p>}
        {section.duration && <Badge variant="outline" className="mt-1">{section.duration} mins</Badge>}
      </div>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => onEdit(section)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(section.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

export function TestSectionBuilder({ testId, onSectionsChange }: TestSectionBuilderProps) {
  const [sections, setSections] = useState<TestSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<TestSection | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: { name: '', description: '', duration: undefined },
  });

  useEffect(() => {
    fetchSections();
  }, [testId]);

  const fetchSections = async () => {
    setLoading(true);
    const result = await getTestSections(testId);
    if (result.success) {
      setSections(result.sections || []);
      onSectionsChange?.(result.sections || []);
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setLoading(false);
  };

  const onSubmit = async (values: SectionFormValues) => {
    try {
      if (editingSection) {
        const result = await updateTestSection(editingSection.id, values);
        if (result.success) {
          toast({ title: 'Success', description: 'Section updated' });
          fetchSections();
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
      } else {
        const result = await createTestSection(testId, values);
        if (result.success) {
          toast({ title: 'Success', description: 'Section created' });
          fetchSections();
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingSection(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to save section' });
    }
  };

  const handleDelete = async (sectionId: string) => {
    if (confirm('Are you sure you want to delete this section? Questions will remain but be unassigned.')) {
      const result = await deleteTestSection(sectionId);
      if (result.success) {
        toast({ title: 'Success', description: 'Section deleted' });
        fetchSections();
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    }
  };

  const handleEdit = (section: TestSection) => {
    setEditingSection(section);
    form.reset({
      name: section.name,
      description: section.description,
      duration: section.duration,
    });
    setIsDialogOpen(true);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over?.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      setSections(reordered);
      await reorderTestSections(
        testId,
        reordered.map((s, idx) => ({ id: s.id, order_number: idx }))
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Test Sections
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingSection(null);
                  form.reset();
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSection ? 'Edit Section' : 'Create New Section'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Section Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Verbal Ability, Quantitative Ability, Logical Reasoning" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Brief description of this section..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration in Minutes (Optional)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 40" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">{editingSection ? 'Update' : 'Create'} Section</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Organize test questions into sections like Verbal Ability, Quantitative Ability, etc.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading sections...</p>
        ) : sections.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No sections created yet. Create sections to organize your test questions.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((section) => (
                  <SortableSectionItem key={section.id} section={section} onEdit={handleEdit} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
