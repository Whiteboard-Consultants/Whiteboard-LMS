"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Loader2, Plus, X, FileText, Video, Mic, File as FileIcon, Link2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const contentBlockSchema = z.object({
  type: z.enum(["text", "video", "audio", "document", "embed"]),
  title: z.string().min(1, "Content title is required"),
  content: z.string().min(1, "Content is required"),
  assetUrl: z.string().optional(),
});

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  primaryType: z.enum(["text", "video", "audio", "document", "embed", "quiz", "assignment"]),
  objectives: z.string().optional(),
  contentBlocks: z.array(contentBlockSchema).min(1, "At least one content block is required"),
});

interface EnhancedLessonFormProps {
  courseId: string;
  parentId?: string | null;
  onSuccess: () => void;
  currentLessonCount: number;
}

const contentTypeIcons = {
  text: <FileText className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  audio: <Mic className="h-4 w-4" />,
  document: <FileIcon className="h-4 w-4" />,
  embed: <Link2 className="h-4 w-4" />,
};

export function EnhancedLessonForm({ courseId, parentId, onSuccess, currentLessonCount }: EnhancedLessonFormProps) {
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      primaryType: "text",
      objectives: "",
      contentBlocks: [
        {
          type: "text",
          title: "Main Content",
          content: "",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contentBlocks",
  });

  const { isSubmitting } = form.formState;

  const addContentBlock = () => {
    append({
      type: "text",
      title: "",
      content: "",
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // For now, we'll store the content blocks as JSON in the content field
      // In a future enhancement, you could create a separate content_blocks table
      const structuredContent = {
        primaryContent: values.contentBlocks[0],
        additionalContent: values.contentBlocks.slice(1),
      };

      const lessonData = {
        title: values.title,
        type: values.primaryType,
        objectives: values.objectives,
        content: JSON.stringify(structuredContent),
        courseId,
        parentId: parentId || null,
      };

      const result = await createLesson(lessonData, currentLessonCount);

      if (result.success) {
        toast({
          title: "Enhanced Lesson Created",
          description: "Your lesson with multiple content types has been added.",
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
    <div className="p-1 max-h-[80vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lesson Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Introduction to Professional Branding" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="primaryType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Lesson Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary lesson type" />
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

          <FormField
            control={form.control}
            name="objectives"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Objectives (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What will students learn from this lesson?"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Content Blocks</h3>
              <Button type="button" variant="outline" size="sm" onClick={addContentBlock}>
                <Plus className="h-4 w-4 mr-2" />
                Add Content Block
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      Content Block {index + 1}
                      {index === 0 && <span className="text-xs text-muted-foreground ml-2">(Primary)</span>}
                    </CardTitle>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`contentBlocks.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="text">
                              <div className="flex items-center">
                                {contentTypeIcons.text}
                                <span className="ml-2">Text Content</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="video">
                              <div className="flex items-center">
                                {contentTypeIcons.video}
                                <span className="ml-2">Video</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="audio">
                              <div className="flex items-center">
                                {contentTypeIcons.audio}
                                <span className="ml-2">Audio</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="document">
                              <div className="flex items-center">
                                {contentTypeIcons.document}
                                <span className="ml-2">Document</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="embed">
                              <div className="flex items-center">
                                {contentTypeIcons.embed}
                                <span className="ml-2">Embed/Link</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contentBlocks.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Title</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Introduction Video, Summary Notes, Additional Resources" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`contentBlocks.${index}.content`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add your content here (text, URL, embed code, etc.)"
                            rows={3}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Creating..." : "Create Enhanced Lesson"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}