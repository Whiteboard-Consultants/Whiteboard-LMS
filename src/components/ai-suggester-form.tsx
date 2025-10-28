"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lightbulb, Loader2 } from "lucide-react";

import { getCourseSuggestions } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { SuggestCourseContentOutput } from "@/ai/flows/suggest-course-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  courseDescription: z
    .string()
    .min(20, { message: "Please provide a description of at least 20 characters." }),
});

export function AiSuggesterForm() {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<SuggestCourseContentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);

    const result = await getCourseSuggestions(values);

    if (result.success && result.data) {
      setSuggestions(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
              <CardDescription>
                Provide a detailed description of your course. The more detail you provide, the better the suggestions will be.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="courseDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., 'This is a comprehensive course for beginners who want to learn web development from scratch. We will cover HTML5, CSS3, Flexbox, Grid, JavaScript ES6+, DOM manipulation, and build several real-world projects...'"
                        className="min-h-[180px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="ml-auto">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Suggestions"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {suggestions && (
        <div>
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">Generated Suggestions</h2>
            <Alert className="mb-6 bg-primary/5 border-primary/20">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Here are some ideas!</AlertTitle>
                <AlertDescription>
                    Use these suggestions as a starting point. Feel free to mix, match, and modify them to fit your unique teaching style.
                </AlertDescription>
            </Alert>
            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Course Structure</AccordionTrigger>
                    <AccordionContent className="prose max-w-none text-muted-foreground whitespace-pre-wrap p-2 bg-muted/50 rounded-md">
                        {suggestions.courseStructureSuggestions}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-lg font-semibold">Exercise Types</AccordionTrigger>
                    <AccordionContent className="prose max-w-none text-muted-foreground whitespace-pre-wrap p-2 bg-muted/50 rounded-md">
                        {suggestions.exerciseTypeSuggestions}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-lg font-semibold">Assignments</AccordionTrigger>
                    <AccordionContent className="prose max-w-none text-muted-foreground whitespace-pre-wrap p-2 bg-muted/50 rounded-md">
                        {suggestions.assignmentSuggestions}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
      )}
    </div>
  );
}
