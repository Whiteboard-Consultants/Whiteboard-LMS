

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, Video, FileText, Mic, Link2, BookOpen, HelpCircle } from "lucide-react";
import dynamic from 'next/dynamic';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { updateLesson } from "@/app/instructor/lessons/actions";
import type { Lesson } from "@/types";

import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RichTextEditor } from "./rich-text-editor";

const QuizEditor = dynamic(() => import('./quiz-editor').then(mod => mod.QuizEditor), { ssr: false });


const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  type: z.enum(["text", "video", "audio", "document", "embed", "quiz", "assignment"]),
  objectives: z.string().optional(),
  content: z.string().optional(),
});

interface EditLessonFormProps {
  lesson: Lesson;
}

export function EditLessonForm({ lesson }: EditLessonFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: lesson.title || "",
      type: lesson.type || 'text',
      objectives: lesson.objectives || "",
      content: lesson.type === 'quiz' || lesson.type === 'assignment' ? JSON.stringify(lesson.questions || []) : lesson.content || "",
    },
  });

  const { formState, watch } = form;
  const { isDirty, isSubmitting } = formState;

  const lessonType = watch('type');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateLesson(lesson.id, lesson.courseId, values);

      if (result.success) {
        toast({
          title: "Lesson Updated",
          description: "Your lesson has been successfully updated.",
        });
        form.reset(values);
      } else {
        throw new Error(result.error || "Failed to update lesson.");
      }
    } catch (error: unknown) {
        toast({
            variant: "destructive",
            title: "Operation Failed",
            description: (error as Error).message,
        });
    }
  }

  const renderContentInput = () => {
    switch(lessonType) {
        case 'text':
             return (
                 <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Text Content</FormLabel>
                        <FormControl>
                            <RichTextEditor
                                content={field.value || ''}
                                onChange={field.onChange}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             );
        case 'video':
        case 'audio':
        case 'document':
        case 'embed':
             return (
                 <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Content URL</FormLabel>
                        <FormControl>
                            <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
             );
        case 'quiz':
        case 'assignment':
            return (
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                         <FormItem>
                            <FormLabel>{lessonType === 'quiz' ? 'Quiz Questions' : 'Assignment Questions'}</FormLabel>
                            <FormControl>
                                <QuizEditor
                                    value={field.value || '[]'}
                                    onChange={(newValue) => form.setValue('content', JSON.stringify(newValue), { shouldDirty: true })}
                                />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            );
        default:
            return null;
    }
  }

  return (
    <div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Introduction to React" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Lesson Objectives</FormLabel>
                <FormControl>
                     <RichTextEditor
                        content={field.value || ''}
                        onChange={field.onChange}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
        />
        
        <Separator />
        
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
                <FormLabel>Lesson Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a lesson type" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="text"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Text</div></SelectItem>
                        <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video</div></SelectItem>
                        <SelectItem value="audio"><div className="flex items-center gap-2"><Mic className="h-4 w-4" /> Audio</div></SelectItem>
                        <SelectItem value="document"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Document</div></SelectItem>
                        <SelectItem value="embed"><div className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Embed</div></SelectItem>
                        <SelectItem value="quiz"><div className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Quiz</div></SelectItem>
                        <SelectItem value="assignment"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Assignment</div></SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
          )}
        />

        {renderContentInput()}
        
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
        </div>
      </form>
    </Form>
   </div>
  );
}
