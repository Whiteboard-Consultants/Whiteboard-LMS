'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addTestPassage, updateTestPassage } from "@/app/instructor/tests/actions";
import { RichTextFormField } from "./rich-text-form-field";

interface TestPassage {
    id: string;
    testId: string;
    title: string;
    content: string;
    displayOrder: number;
}

interface TestPassageFormProps {
    testId: string;
    existingPassage?: TestPassage | null;
    onSuccess: () => void;
}

const formSchema = z.object({
    title: z.string().min(1, "Passage title is required.").min(3, "Title should be at least 3 characters."),
    content: z.string().min(1, "Passage content is required."),
});

export function TestPassageForm({ testId, existingPassage, onSuccess }: TestPassageFormProps) {
    const { toast } = useToast();
    const isEditMode = !!existingPassage;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: existingPassage?.title || "",
            content: existingPassage?.content || "",
        }
    });

    const { control } = form;
    const { isSubmitting } = form.formState;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            const passageData = {
                testId: testId,
                title: values.title,
                content: values.content,
                displayOrder: existingPassage?.displayOrder || 0,
            };

            const result = isEditMode
                ? await updateTestPassage(existingPassage.id, passageData)
                : await addTestPassage(testId, passageData);
            
            if (result.success) {
                toast({ title: "Success", description: `Passage ${isEditMode ? 'updated' : 'created'}.` });
                onSuccess();
            } else {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Error", description: error.message || "Failed to save passage" });
        }
    }

    return (
        <div className="p-1">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Passage Title */}
                    <FormField
                        control={control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passage Title</FormLabel>
                                <FormControl>
                                    <Input 
                                        placeholder="e.g., 'Reading Comprehension Passage 1'" 
                                        {...field} 
                                        disabled={isSubmitting}
                                    />
                                </FormControl>
                                <FormDescription>
                                    A clear title to identify this passage
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Passage Content with RTE */}
                    <FormField
                        control={control}
                        name="content"
                        render={({ field }) => (
                            <RichTextFormField 
                                field={field}
                                label="Passage Content"
                                placeholder="Paste or write the passage content here..."
                                description="Supports formatted text, lists, and links"
                                disabled={isSubmitting}
                                height="400px"
                            />
                        )}
                    />

                    {/* Submit Button */}
                    <div className="flex gap-3">
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? 'Update Passage' : 'Create Passage'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
