
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { addTestQuestion, updateTestQuestion } from "@/app/instructor/tests/actions";
import { TestQuestion } from "@/types";
import { Textarea } from "./ui/textarea";

const formSchema = z.object({
  text: z.string().min(1, "Question text is required."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).min(2, "Must have at least two options."),
  correctOption: z.coerce.number().min(0, "Please select a correct answer."),
  solution: z.string().optional(),
  marks: z.coerce.number().int().positive("Marks must be a positive number."),
  negativeMarks: z.coerce.number().int().nonnegative("Negative marks cannot be negative.").optional(),
}).refine(data => data.correctOption < data.options.length, {
    message: "Correct option index is out of bounds.",
    path: ["correctOption"],
});

interface TestQuestionFormProps {
    testId: string;
    existingQuestion?: TestQuestion | null;
    onSuccess: () => void;
    currentQuestionCount: number;
}

export function TestQuestionForm({ testId, existingQuestion, onSuccess, currentQuestionCount }: TestQuestionFormProps) {
    const { toast } = useToast();
    const isEditMode = !!existingQuestion;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            text: existingQuestion?.text || "",
            options: existingQuestion?.options || ["", ""],
            correctOption: existingQuestion?.correctOption ?? undefined,
            solution: existingQuestion?.solution || "",
            marks: existingQuestion?.marks || 1,
            negativeMarks: existingQuestion?.negativeMarks || 0,
        }
    });

    const { isSubmitting, control, watch } = form;
    const options = watch("options");

    const addOption = () => {
        form.setValue("options", [...options, ""]);
    };

    const removeOption = (index: number) => {
        const currentCorrect = form.getValues("correctOption");
        if (currentCorrect === index) {
            form.setValue("correctOption", undefined);
        }
        form.setValue("options", options.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const questionData = {
            ...values,
            solution: values.solution || '',
            order: isEditMode ? existingQuestion.order : currentQuestionCount,
        };

        const result = isEditMode
            ? await updateTestQuestion(existingQuestion.id, questionData)
            : await addTestQuestion(testId, questionData);
        
        if (result.success) {
            toast({ title: "Success", description: `Question ${isEditMode ? 'updated' : 'added'}.` });
            onSuccess();
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
    }
    
    return (
        <div className="p-1">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Text</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={control}
                        name="options"
                        render={() => (
                            <FormItem>
                                <FormLabel>Options</FormLabel>
                                <div className="space-y-2">
                                {options.map((_, index) => (
                                    <FormField
                                        key={index}
                                        control={control}
                                        name={`options.${index}`}
                                        render={({ field }) => (
                                            <FormItem className="flex items-center gap-2">
                                                <FormControl>
                                                    <Input {...field} placeholder={`Option ${index + 1}`} />
                                                </FormControl>
                                                {options.length > 2 && <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)}><X className="h-4 w-4" /></Button>}
                                            </FormItem>
                                        )}
                                    />
                                ))}
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addOption}><PlusCircle className="mr-2 h-4 w-4" /> Add Option</Button>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="correctOption"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                        value={field.value?.toString()}
                                        className="grid grid-cols-2 gap-2"
                                    >
                                        {options.map((option, index) => (
                                            <FormItem key={index} className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <RadioGroupItem value={index.toString()} />
                                                </FormControl>
                                                <Label className="font-normal truncate">{option || `Option ${index + 1}`}</Label>
                                            </FormItem>
                                        ))}
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                     <FormField
                        control={control}
                        name="solution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Solution/Explanation</FormLabel>
                                <FormControl>
                                    <Textarea className="min-h-24" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name="marks"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Marks</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name="negativeMarks"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Negative Marks</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditMode ? "Save Changes" : "Add Question"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
