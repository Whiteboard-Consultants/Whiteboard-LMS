

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createLesson } from "@/app/instructor/lessons/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  type: z.enum(["text", "video", "audio", "document", "embed", "quiz", "assignment"]),
});

interface CreateLessonFormProps {
  courseId: string;
  parentId?: string | null;
  onSuccess: () => void;
  currentLessonCount: number;
}

export function CreateLessonForm({ courseId, parentId, onSuccess, currentLessonCount }: CreateLessonFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "text",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const lessonData = {
          ...values,
          courseId,
          parentId: parentId || null,
      };
      const result = await createLesson(lessonData, currentLessonCount);

      if (result.success) {
        toast({
          title: "Lesson Created",
          description: "Your new lesson has been added.",
        });
        form.reset();
        onSuccess();
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
       toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to create lesson.",
      });
    }
  }

  return (
    <div className="p-1">
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
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="document">Document</SelectItem>
                        <SelectItem value="embed">Embed</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                    </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? "Creating..." : "Create Lesson"}
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
