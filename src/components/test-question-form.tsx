
'use client';

import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, PlusCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { addTestQuestion, updateTestQuestion } from "@/app/instructor/tests/actions";
import { TestQuestion, QuestionType } from "@/types";
import { Textarea } from "./ui/textarea";
import { RichTextEditor } from "./rich-text-editor";

const formSchema = z.object({
  type: z.enum(['mcq', 'descriptive'] as const, {
    errorMap: () => ({ message: 'Please select a question type' })
  }),
  text: z.string().min(1, "Question text is required."),
  options: z.array(z.string().min(1, "Option text cannot be empty.")).optional(),
  correctOption: z.coerce.number().min(0).nullable().optional(),
  solution: z.string().optional(),
  marks: z.coerce.number().int().positive("Marks must be a positive number."),
  negativeMarks: z.coerce.number().int().nonnegative("Negative marks cannot be negative.").optional(),
  sectionId: z.string().optional().nullable(),
  passageId: z.string().optional().nullable(),
}).refine(data => {
  // For MCQ, must have at least 2 options
  if (data.type === 'mcq') {
    return data.options && data.options.length >= 2;
  }
  return true;
}, {
  message: "MCQ must have at least two options.",
  path: ["options"],
}).refine(data => {
  // For MCQ, must have correct option selected
  if (data.type === 'mcq') {
    return data.correctOption !== null && data.correctOption !== undefined && data.correctOption < (data.options?.length || 0);
  }
  return true;
}, {
  message: "Please select a correct answer.",
  path: ["correctOption"],
});

interface TestSection {
    id: string;
    name: string;
    order_number?: number;
}

interface TestPassage {
    id: string;
    testId: string;
    title: string;
    displayOrder: number;
}

interface TestQuestionFormProps {
    testId: string;
    existingQuestion?: TestQuestion | null;
    onSuccess: () => void;
    currentQuestionCount: number;
    sections?: TestSection[];
    passages?: TestPassage[];
}

export function TestQuestionForm({ testId, existingQuestion, onSuccess, currentQuestionCount, sections = [], passages = [] }: TestQuestionFormProps) {
    const { toast } = useToast();
    const isEditMode = !!existingQuestion;
    const [questionType, setQuestionType] = React.useState<QuestionType>(
        existingQuestion?.type || 'mcq'
    );
    
    // Debug: Log sections received and existing question data
    React.useEffect(() => {
        console.log('🎯 TestQuestionForm received sections:', sections);
        console.log('🎯 Sections count:', sections.length);
        console.log('🎯 TestQuestionForm existingQuestion:', existingQuestion);
        console.log('🎯 TestQuestionForm existingQuestion.sectionId:', existingQuestion?.sectionId);
        console.log('🎯 TestQuestionForm isEditMode:', isEditMode);
        if (existingQuestion) {
            console.log('🎯 Existing question text:', existingQuestion.text);
            console.log('🎯 Existing question type:', existingQuestion.type);
            console.log('🎯 Existing question options:', existingQuestion.options);
            console.log('🎯 Existing question sectionId:', existingQuestion.sectionId);
        }
    }, [sections, existingQuestion, isEditMode]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: existingQuestion?.type || 'mcq',
            text: existingQuestion?.text || "",
            options: existingQuestion?.options || ["", ""],
            correctOption: existingQuestion?.correctOption ?? null,
            solution: existingQuestion?.solution || "",
            marks: existingQuestion?.marks || 1,
            negativeMarks: existingQuestion?.negativeMarks || 0,
            sectionId: existingQuestion?.sectionId || null,
            passageId: existingQuestion?.passageId || null,
        }
    });

    // Log form default values
    React.useEffect(() => {
        console.log('📋 Form defaultValues text:', form.getValues('text'));
        console.log('📋 Form watch text:', form.watch('text'));
    }, [form]);

    React.useEffect(() => {
        const type = form.watch('type');
        setQuestionType(type as QuestionType);
        
        // Reset options and correctOption when switching to descriptive
        if (type === 'descriptive') {
            form.setValue('options', []);
            form.setValue('correctOption', null);
        } else {
            // Ensure MCQ has at least 2 options
            const currentOptions = form.getValues('options');
            if (!currentOptions || currentOptions.length < 2) {
                form.setValue('options', ["", ""]);
            }
        }
    }, [form.watch('type')]);

    const { control } = form;
    const { isSubmitting } = form.formState;
    const options = form.watch("options") || [];

    const addOption = () => {
        form.setValue("options", [...options, ""]);
    };

    const removeOption = (index: number) => {
        const currentCorrect = form.getValues("correctOption");
        if (currentCorrect === index) {
            form.setValue("correctOption", null);
        }
        form.setValue("options", options.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const questionData: Omit<TestQuestion, 'id' | 'testId'> & { sectionId?: string | null, passageId?: string | null } = {
            type: values.type,
            text: values.text,
            options: values.type === 'descriptive' ? [] : (values.options || []),
            correctOption: values.type === 'descriptive' ? null : (values.correctOption ?? null),
            solution: values.solution || '',
            marks: values.marks,
            negativeMarks: values.negativeMarks || 0,
            order: isEditMode ? existingQuestion.order : currentQuestionCount,
        };
        
        // Handle section assignment - convert 'no-section' to null
        const sectionId = values.sectionId && values.sectionId !== 'no-section' ? values.sectionId : null;
        (questionData as any).sectionId = sectionId;  // Always include, even if null

        // Handle passage assignment - convert 'no-passage' to null
        const passageId = values.passageId && values.passageId !== 'no-passage' ? values.passageId : null;
        (questionData as any).passageId = passageId;  // Always include, even if null

        const result = isEditMode
            ? await updateTestQuestion(existingQuestion.id, questionData as any)
            : await addTestQuestion(testId, questionData as any);
        
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
                    {/* Question Type Selector */}
                    <FormField
                        control={control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select question type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="mcq">Multiple Choice (MCQ)</SelectItem>
                                        <SelectItem value="descriptive">Descriptive Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {questionType === 'mcq' 
                                        ? 'Students select from predefined options' 
                                        : 'Students provide their own written answer'}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Section Assignment */}
                    <FormField
                        control={control}
                        name="sectionId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assign to Section</FormLabel>
                                <Select 
                                    onValueChange={(value) => field.onChange(value || null)} 
                                    value={field.value || 'no-section'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a section (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="no-section">No Section</SelectItem>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={section.id}>
                                                {section.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {sections.length === 0 
                                        ? 'Create sections in the test settings first' 
                                        : 'Optional: Organize this question into a test section'}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Passage Assignment */}
                    <FormField
                        control={control}
                        name="passageId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Reading Passage (Optional)</FormLabel>
                                <Select 
                                    onValueChange={(value) => field.onChange(value || null)} 
                                    value={field.value || 'no-passage'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a passage (optional)" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="no-passage">No Passage</SelectItem>
                                        {passages.map((passage) => (
                                            <SelectItem key={passage.id} value={passage.id}>
                                                {passage.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    {passages.length === 0 
                                        ? 'Create passages in the test settings first' 
                                        : 'Optional: Link this question to a reading passage or case study'}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Question Text with Rich Text Editor */}
                    <FormField
                        control={control}
                        name="text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Text</FormLabel>
                                <FormControl>
                                    <RichTextEditor 
                                        content={field.value}
                                        onChange={field.onChange}
                                        placeholder="Enter your question here with formatting..."
                                        height="300px"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Enter the question text with formatting
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    
                    {/* MCQ Options - Only shown for MCQ type */}
                    {questionType === 'mcq' && (
                        <>
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
                                                value={field.value?.toString() ?? ''}
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
                        </>
                    )}
                    
                    {/* Model Answer / Solution */}
                    <FormField
                        control={control}
                        name="solution"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>{questionType === 'mcq' ? 'Solution/Explanation' : 'Model Answer'}</FormLabel>
                                <FormControl>
                                    <RichTextEditor 
                                        content={field.value || ''}
                                        onChange={field.onChange}
                                        placeholder={questionType === 'descriptive' 
                                            ? 'Provide the ideal/expected answer for this question...' 
                                            : 'Explain why this is the correct answer...'}
                                        height="300px"
                                    />
                                </FormControl>
                                <FormDescription>
                                    {questionType === 'descriptive'
                                        ? 'This will be shown to instructors for reference when evaluating student answers'
                                        : 'This will be shown to students after they submit'}
                                </FormDescription>
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
                                <FormDescription className="text-xs">Only for MCQ</FormDescription>
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
