'use server';

import { revalidatePath } from 'next/cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Test, TestQuestion } from '@/types';

// Use admin client for server actions to bypass RLS
const db = supabaseAdmin || supabase;

async function updateTestQuestionCount(testId: string) {
    try {
        // Count actual questions for this test
        const { count, error } = await db
            .from('test_questions')
            .select('*', { count: 'exact', head: true })
            .eq('test_id', testId);

        if (error) {
            console.error('Error counting questions:', error);
            return;
        }

        // Update the test record with the actual count
        const { error: updateError } = await db
            .from('tests')
            .update({ question_count: count || 0 })
            .eq('id', testId);

        if (updateError) {
            console.error('Error updating question count:', updateError);
        }
    } catch (error) {
        console.error('Error in updateTestQuestionCount:', error);
    }
}

export async function createTest(testData: any) {
    try {
        // Use correct column names that exist in the database
        const { data, error } = await db
            .from('tests')
            .insert({
                title: testData.title,
                description: testData.description,
                time_limit: testData.duration, // Using time_limit instead of duration
                instructor_id: testData.instructorId,
                course_id: testData.courseId,
                course_title: testData.courseTitle,
                type: testData.type || 'assessment',
                is_time_limited: testData.isTimeLimited ?? true,
                passing_score: testData.passingScore || 80,
                max_attempts: testData.maxAttempts || null,
                show_results: testData.showResults ?? true,
                allow_review: testData.allowReview ?? true,
                question_count: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating test:', error);
            return { success: false, error: `Failed to create test: ${error.message}` };
        }

        revalidatePath('/instructor/tests');
        revalidatePath('/admin/tests');
        return { success: true, testId: data.id };
    } catch (error: any) {
        console.error('Create test error:', error);
        return {
            success: false,
            error: 'Failed to create test. Please try again.'
        };
    }
}

export async function updateTest(testId: string, testData: any) {
    try {
        const updateData: any = {};
        
        if (testData.title !== undefined) updateData.title = testData.title;
        if (testData.description !== undefined) updateData.description = testData.description;
        if (testData.duration !== undefined) updateData.time_limit = testData.duration;
        if (testData.instructorId !== undefined) updateData.instructor_id = testData.instructorId;
        if (testData.courseId !== undefined) updateData.course_id = testData.courseId;
        if (testData.courseTitle !== undefined) updateData.course_title = testData.courseTitle;
        if (testData.type !== undefined) updateData.type = testData.type;
        if (testData.isTimeLimited !== undefined) updateData.is_time_limited = testData.isTimeLimited;
        if (testData.passingScore !== undefined) updateData.passing_score = testData.passingScore;
        if (testData.maxAttempts !== undefined) updateData.max_attempts = testData.maxAttempts;
        if (testData.showResults !== undefined) updateData.show_results = testData.showResults;
        if (testData.allowReview !== undefined) updateData.allow_review = testData.allowReview;

        const { error } = await db
            .from('tests')
            .update(updateData)
            .eq('id', testId);

        if (error) {
            console.error('Error updating test:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/instructor/tests');
        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update test error:', error);
        return { success: false, error: 'Failed to update test' };
    }
}

export async function deleteTest(testId: string) {
    try {
        const { error } = await db
            .from('tests')
            .delete()
            .eq('id', testId);

        if (error) {
            console.error('Error deleting test:', error);
            return { success: false, error: error.message };
        }

        revalidatePath('/instructor/tests');
        return { success: true };
    } catch (error: any) {
        console.error('Delete test error:', error);
        return { success: false, error: 'Failed to delete test' };
    }
}

export async function addTestQuestion(testId: string, questionData: Omit<TestQuestion, 'id' | 'testId'>) {
    console.log('🚀 Starting addTestQuestion:', {
        testId,
        testIdType: typeof testId,
        testIdString: typeof testId === 'string' ? testId : 'NOT A STRING',
        questionData
    });
    
    // Handle case where parameters might be swapped or incorrect
    let cleanTestId: string;
    let cleanQuestionData: any;
    
    if (typeof testId === 'object' && testId && 'testId' in testId) {
        // Parameters seem to be swapped or structured differently
        cleanQuestionData = testId;
        cleanTestId = (testId as any).testId;
        console.log('🔧 Parameters appear swapped, extracting testId from object');
    } else if (typeof testId === 'string' && questionData) {
        cleanTestId = testId;
        cleanQuestionData = questionData;
    } else {
        console.error('❌ Invalid parameters:', { testId, questionData });
        return { success: false, error: 'Invalid parameters provided' };
    }
    
    console.log('🔧 Clean testId:', cleanTestId);
    
    // Validate cleaned parameters
    if (!cleanTestId || typeof cleanTestId !== 'string') {
        console.error('❌ Invalid testId after cleanup:', cleanTestId);
        return { success: false, error: 'Invalid test ID provided' };
    }
    
    if (!cleanQuestionData || typeof cleanQuestionData !== 'object') {
        console.error('❌ Invalid questionData after cleanup:', cleanQuestionData);
        return { success: false, error: 'Invalid question data provided' };
    }
    
    try {
        // Get the current highest order number for this test
        console.log('📊 Querying for existing questions...');
        const { data: existingQuestions, error: orderError } = await db
            .from('test_questions')
            .select('order_number')
            .eq('test_id', cleanTestId)
            .order('order_number', { ascending: false })
            .limit(1);

        console.log('📊 Query result:', { existingQuestions, orderError });

        if (orderError) {
            console.error('❌ Error getting question order:', {
                error: orderError,
                testId: cleanTestId,
                query: 'SELECT order_number FROM test_questions WHERE test_id = ? ORDER BY order_number DESC LIMIT 1'
            });
            return { success: false, error: `Database error: ${orderError.message}` };
        }

        const nextOrderNumber = existingQuestions && existingQuestions.length > 0 
            ? (existingQuestions[0].order_number || 0) + 1 
            : 0;

        const insertData = {
            test_id: cleanTestId,
            question_text: cleanQuestionData.text,
            options: cleanQuestionData.options,
            correct_answer: cleanQuestionData.correctOption,
            explanation: cleanQuestionData.solution || '',
            points: cleanQuestionData.marks || 1,
            order_number: nextOrderNumber
        };

        console.log('💾 Insert data:', insertData);

        const { data, error } = await db
            .from('test_questions')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            console.error('❌ Error inserting question:', error);
            return { success: false, error: `Failed to add question: ${error.message}` };
        }

        console.log('✅ Question added successfully:', data.id);
        
        // Update question count in tests table
        await updateTestQuestionCount(cleanTestId);
        
        revalidatePath(`/instructor/tests/edit/${cleanTestId}`);
        revalidatePath('/instructor/tests');
        return { success: true, questionId: data.id };

    } catch (error: any) {
        console.error('❌ Add question error:', error);
        return {
            success: false,
            error: 'Failed to add question. Please try again.'
        };
    }
}

export async function updateTestQuestion(questionId: string, questionData: Partial<TestQuestion>) {
    try {
        const updateData: any = {};
        
        if (questionData.text) updateData.question_text = questionData.text;
        if (questionData.options) updateData.options = questionData.options;
        if (questionData.correctOption !== undefined) updateData.correct_answer = questionData.correctOption;
        if (questionData.solution !== undefined) updateData.explanation = questionData.solution;
        if (questionData.marks !== undefined) updateData.points = questionData.marks;
        if (questionData.order !== undefined) updateData.order_number = questionData.order;

        const { error } = await db
            .from('test_questions')
            .update(updateData)
            .eq('id', questionId);

        if (error) {
            console.error('Error updating question:', error);
            return { success: false, error: error.message };
        }

        if (questionData.testId) {
            revalidatePath(`/instructor/tests/edit/${questionData.testId}`);
        }
        return { success: true };
    } catch (error: any) {
        console.error('Update question error:', error);
        return { success: false, error: 'Failed to update question' };
    }
}

export async function deleteTestQuestion(questionId: string) {
    try {
        // First get the test_id before deleting
        const { data: questionData, error: fetchError } = await db
            .from('test_questions')
            .select('test_id')
            .eq('id', questionId)
            .single();

        if (fetchError) {
            console.error('Error fetching question:', fetchError);
            return { success: false, error: fetchError.message };
        }

        const testId = questionData.test_id;

        const { error } = await db
            .from('test_questions')
            .delete()
            .eq('id', questionId);

        if (error) {
            console.error('Error deleting question:', error);
            return { success: false, error: error.message };
        }

        // Update question count in tests table
        await updateTestQuestionCount(testId);

        revalidatePath('/instructor/tests');
        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Delete question error:', error);
        return { success: false, error: 'Failed to delete question' };
    }
}

export async function updateTestQuestionOrder(testId: string, questions: TestQuestion[]) {
    try {
        // Update each question's order
        const updatePromises = questions.map((question, index) =>
            db
                .from('test_questions')
                .update({ order_number: index })
                .eq('id', question.id)
        );

        const results = await Promise.all(updatePromises);
        
        // Check for any errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
            console.error('Errors updating question order:', errors);
            return { success: false, error: 'Failed to update question order' };
        }

        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Update question order error:', error);
        return { success: false, error: 'Failed to update question order' };
    }
}

export async function getTestQuestions(testId: string) {
    try {
        console.log('🔍 Server: Fetching questions for testId:', testId);
        
        const { data, error } = await db
            .from('test_questions')
            .select('*')
            .eq('test_id', testId)
            .order('order_number', { ascending: true });

        if (error) {
            console.error('❌ Server: Error fetching questions:', error);
            return { success: false, error: error.message, questions: [] };
        }

        console.log('✅ Server: Questions fetched:', data?.length || 0);
        return { success: true, questions: data || [] };
    } catch (error: any) {
        console.error('❌ Server: Fetch questions error:', error);
        return { success: false, error: 'Failed to fetch questions', questions: [] };
    }
}