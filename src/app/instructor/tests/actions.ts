'use server';

import { revalidatePath } from 'next/cache';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import type { Test, TestQuestion, TestPassage } from '@/types';

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
        console.log('🔧 createTest called with testData:', testData);
        console.log('🔧 Sections in testData:', testData.sections);
        
        // Ensure course_id is null if not provided or if it's the "none" placeholder
        const courseId = testData.courseId && testData.courseId !== 'none' ? testData.courseId : null;
        
        // Use correct column names that exist in the database
        const { data, error } = await db
            .from('tests')
            .insert({
                title: testData.title,
                description: testData.description,
                duration: testData.duration, // Using duration (in seconds from form * 60)
                instructor_id: testData.instructorId,
                course_id: courseId,
                course_title: testData.courseTitle,
                type: testData.type || 'assessment',
                is_time_limited: testData.isTimeLimited ?? true,
                passing_score: testData.passingScore || 80,
                max_attempts: testData.maxAttempts || null,
                show_results: testData.showResults ?? true,
                allow_review: testData.allowReview ?? true,
                question_count: 0,
                // Series fields
                series_id: testData.seriesId || null,
                topic: testData.topic || null,
                difficulty_level: testData.difficultyLevel || null,
                price: testData.price || 0,
                is_free: testData.isFree ?? true
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating test:', error);
            return { success: false, error: `Failed to create test: ${error.message}` };
        }

        // Handle series pricing if provided
        if (testData.seriesId && (testData.seriesPrice !== undefined || testData.discountPercentage !== undefined || testData.isPurchasableSeries !== undefined)) {
            try {
                const seriesUpdateData: any = {};
                
                if (testData.seriesPrice !== undefined) seriesUpdateData.price = testData.seriesPrice;
                if (testData.discountPercentage !== undefined) seriesUpdateData.discount_percentage = testData.discountPercentage;
                if (testData.isPurchasableSeries !== undefined) seriesUpdateData.is_purchasable = testData.isPurchasableSeries;
                
                console.log('💾 [createTest] Setting series pricing:', {
                  seriesId: testData.seriesId,
                  seriesPrice: testData.seriesPrice,
                  discountPercentage: testData.discountPercentage,
                  isPurchasableSeries: testData.isPurchasableSeries
                });
                
                const { error: seriesError } = await db
                  .from('test_series')
                  .update(seriesUpdateData)
                  .eq('id', testData.seriesId);
                
                if (seriesError) {
                  console.error('⚠️ [createTest] Warning: Failed to update series pricing:', seriesError);
                  // Don't fail the entire operation if series pricing update fails
                } else {
                  console.log('✅ [createTest] Series pricing set successfully');
                }
            } catch (seriesError) {
              console.error('⚠️ [createTest] Warning: Error setting series pricing:', seriesError);
              // Don't fail the entire operation if series pricing update fails
            }
        }

        // Save sections if provided
        if (testData.sections && testData.sections.length > 0) {
            try {
                console.log('📚 Attempting to save sections:', testData.sections);
                
                const sectionsToInsert = testData.sections.map((section: any, index: number) => ({
                    test_id: data.id,
                    name: section.name,
                    description: section.description || null,
                    duration: section.duration || null,
                    order_number: index + 1
                }));

                console.log('📚 Formatted sections to insert:', sectionsToInsert);

                const { data: insertedSections, error: sectionsError } = await db
                    .from('test_sections')
                    .insert(sectionsToInsert)
                    .select();

                if (sectionsError) {
                    console.error('❌ Failed to create test sections:', sectionsError);
                    // Don't fail the entire operation if sections fail to save
                } else {
                    console.log('✅ Test sections created successfully:', insertedSections);
                }
            } catch (sectionError) {
                console.error('❌ Error saving test sections:', sectionError);
                // Don't fail the entire operation if sections fail to save
            }
        } else {
            console.log('⚠️ No sections provided or sections array is empty');
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

export async function createBulkQuestions(testId: string, questions: any[]) {
    try {
        console.log('📝 createBulkQuestions called with:', {
            testId,
            questionsCount: questions ? questions.length : 0,
            questions: questions ? questions.slice(0, 2) : [] // Log first 2 for inspection
        });

        if (!testId) {
            console.error('❌ testId is empty/null');
            return { success: false, error: 'Test ID is required' };
        }

        if (!questions || questions.length === 0) {
            console.log('⚠️ No questions provided');
            return { success: true, message: 'No questions to create' };
        }

        const questionsToInsert = questions.map((q: any, index: number) => {
            const formatted = {
                test_id: testId,
                question_text: (q.text || '').substring(0, 1000),
                options: Array.isArray(q.options) ? q.options : [],
                correct_answer: (q.correctAnswer || 'A'),
                explanation: (q.explanation || '').substring(0, 2000),
                points: 1,
                negative_marks: 0,
                order_number: index + 1,
                question_type: 'multiple_choice'
            };
            console.log(`📊 Q${index + 1} formatted:`, { 
                text: formatted.question_text.substring(0, 50), 
                optionsCount: formatted.options.length,
                answer: formatted.correct_answer
            });
            return formatted;
        });

        console.log(`💾 Inserting ${questionsToInsert.length} questions into database...`);

        const { data, error } = await db
            .from('test_questions')
            .insert(questionsToInsert)
            .select();

        if (error) {
            console.error('❌ Database error inserting questions:', {
                error: error.message,
                code: (error as any).code,
                details: (error as any).details
            });
            return { success: false, error: `Failed to create questions: ${error.message}` };
        }

        console.log(`✅ Questions inserted successfully:`, {
            inserted: data ? data.length : 0,
            testId
        });

        // Update question count in tests table
        const { error: countError } = await db
            .from('tests')
            .update({ question_count: questions.length })
            .eq('id', testId);

        if (countError) {
            console.warn('⚠️ Failed to update question count:', countError.message);
        } else {
            console.log('✅ Question count updated successfully');
        }

        revalidatePath('/instructor/tests');
        return { success: true, message: `${questions.length} questions created`, questionsCreated: data ? data.length : 0 };
    } catch (error: any) {
        console.error('❌ Bulk create questions error:', {
            error: error.message,
            stack: error.stack
        });
        return { success: false, error: error.message || 'Failed to create questions' };
    }
}

export async function updateTest(testId: string, testData: any) {
    try {
        const updateData: any = {};
        
        if (testData.title !== undefined) updateData.title = testData.title;
        if (testData.description !== undefined) updateData.description = testData.description;
        if (testData.duration !== undefined) updateData.duration = testData.duration;
        if (testData.instructorId !== undefined) updateData.instructor_id = testData.instructorId;
        if (testData.courseId !== undefined) {
            // Ensure course_id is null if not provided or if it's the "none" placeholder
            updateData.course_id = testData.courseId && testData.courseId !== 'none' ? testData.courseId : null;
        }
        if (testData.courseTitle !== undefined) updateData.course_title = testData.courseTitle;
        if (testData.type !== undefined) updateData.type = testData.type;
        if (testData.isTimeLimited !== undefined) updateData.is_time_limited = testData.isTimeLimited;
        if (testData.passingScore !== undefined) updateData.passing_score = testData.passingScore;
        if (testData.maxAttempts !== undefined) updateData.max_attempts = testData.maxAttempts;
        if (testData.showResults !== undefined) updateData.show_results = testData.showResults;
        if (testData.allowReview !== undefined) updateData.allow_review = testData.allowReview;
        // Series fields
        if (testData.seriesId !== undefined) updateData.series_id = testData.seriesId;
        if (testData.topic !== undefined) updateData.topic = testData.topic;
        if (testData.difficultyLevel !== undefined) updateData.difficulty_level = testData.difficultyLevel;
        if (testData.price !== undefined) updateData.price = testData.price;
        if (testData.isFree !== undefined) updateData.is_free = testData.isFree;

        const { error } = await db
            .from('tests')
            .update(updateData)
            .eq('id', testId);

        if (error) {
            console.error('Error updating test:', error);
            return { success: false, error: error.message };
        }

        // Handle series pricing if provided
        if (testData.seriesId && (testData.seriesPrice !== undefined || testData.discountPercentage !== undefined || testData.isPurchasableSeries !== undefined)) {
            try {
                const seriesUpdateData: any = {};
                
                if (testData.seriesPrice !== undefined) seriesUpdateData.price = testData.seriesPrice;
                if (testData.discountPercentage !== undefined) seriesUpdateData.discount_percentage = testData.discountPercentage;
                if (testData.isPurchasableSeries !== undefined) seriesUpdateData.is_purchasable = testData.isPurchasableSeries;
                
                console.log('💾 [updateTest] Updating series pricing:', {
                  seriesId: testData.seriesId,
                  seriesPrice: testData.seriesPrice,
                  discountPercentage: testData.discountPercentage,
                  isPurchasableSeries: testData.isPurchasableSeries
                });
                
                const { error: seriesError } = await db
                  .from('test_series')
                  .update(seriesUpdateData)
                  .eq('id', testData.seriesId);
                
                if (seriesError) {
                  console.error('⚠️ [updateTest] Warning: Failed to update series pricing:', seriesError);
                  // Don't fail the entire operation if series pricing update fails
                } else {
                  console.log('✅ [updateTest] Series pricing updated successfully');
                }
            } catch (seriesError) {
              console.error('⚠️ [updateTest] Warning: Error updating series pricing:', seriesError);
              // Don't fail the entire operation if series pricing update fails
            }
        }

        // Handle sections if provided
        if (testData.sections !== undefined) {
            try {
                // Delete existing sections for this test
                await db
                    .from('test_sections')
                    .delete()
                    .eq('test_id', testId);

                // Insert new sections if any
                if (testData.sections.length > 0) {
                    const sectionsToInsert = testData.sections.map((section: any, index: number) => ({
                        test_id: testId,
                        name: section.name,
                        description: section.description || null,
                        duration: section.duration || null,
                        order_number: index + 1
                    }));

                    const { error: sectionsError } = await db
                        .from('test_sections')
                        .insert(sectionsToInsert);

                    if (sectionsError) {
                        console.error('Warning: Failed to update test sections:', sectionsError);
                        // Don't fail the entire operation if sections fail to save
                    } else {
                        console.log('✅ Test sections updated successfully');
                    }
                }
            } catch (sectionError) {
                console.error('Warning: Error updating test sections:', sectionError);
                // Don't fail the entire operation if sections fail to save
            }
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

        // Map form type values to database enum values
        const typeMap: Record<string, string> = {
            'mcq': 'multiple_choice',
            'descriptive': 'essay'
        };

        const insertData = {
            test_id: cleanTestId,
            question_text: cleanQuestionData.text,
            options: cleanQuestionData.options,
            correct_answer: cleanQuestionData.correctOption,
            explanation: cleanQuestionData.solution || '',
            points: cleanQuestionData.marks || 1,
            negative_marks: cleanQuestionData.negativeMarks || 0,
            order_number: nextOrderNumber,
            question_type: typeMap[cleanQuestionData.type] || 'multiple_choice',
            section_id: (cleanQuestionData as any).sectionId || null,
            passage_id: (cleanQuestionData as any).passageId || null
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
        console.log('🔍 DEBUG updateTestQuestion: negativeMarks =', questionData.negativeMarks, 'Type:', typeof questionData.negativeMarks);
        const updateData: any = {};
        
        if (questionData.text) updateData.question_text = questionData.text;
        if (questionData.options) updateData.options = questionData.options;
        if (questionData.correctOption !== undefined) updateData.correct_answer = questionData.correctOption;
        if (questionData.solution !== undefined) updateData.explanation = questionData.solution;
        if (questionData.marks !== undefined) updateData.points = questionData.marks;
        if (questionData.negativeMarks !== undefined) {
            console.log('🔍 DEBUG: Setting negative_marks to:', questionData.negativeMarks);
            updateData.negative_marks = questionData.negativeMarks;
        } else {
            console.log('🔍 DEBUG: negativeMarks is UNDEFINED - NOT included in update');
        }
        if (questionData.order !== undefined) updateData.order_number = questionData.order;
        console.log('🔍 DEBUG: updateData =', updateData);
        if ((questionData as any).type !== undefined) {
            // Map form type values to database enum values
            const typeMap: Record<string, string> = {
                'mcq': 'multiple_choice',
                'descriptive': 'essay'
            };
            updateData.question_type = typeMap[(questionData as any).type] || (questionData as any).type;
        }
        if ((questionData as any).sectionId !== undefined) updateData.section_id = (questionData as any).sectionId;
        if ((questionData as any).passageId !== undefined) updateData.passage_id = (questionData as any).passageId;

        const { error } = await db
            .from('test_questions')
            .update(updateData)
            .eq('id', questionId);

        if (error) {
            console.error('❌ Update error:', error);
            return { success: false, error: error.message };
        }
        console.log('✅ Update successful, updated fields:', updateData);

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
            .select('id, test_id, order_number, question_text, question_type, options, correct_answer, explanation, points, negative_marks, section_id, passage_id')
            .eq('test_id', testId)
            .order('order_number', { ascending: true });

        if (error) {
            console.error('❌ Server: Error fetching questions:', error);
            return { success: false, error: error.message, questions: [] };
        }

        console.log('✅ Server: Questions fetched:', data?.length || 0);
        console.log('✅ Server: First question data:', data?.[0]);
        
        // Transform database column names to match TestQuestion interface
        const transformedQuestions = data?.map((q: any) => {
            return {
                id: q.id,
                testId: q.test_id,
                order: q.order_number,
                type: q.question_type === 'multiple_choice' ? 'mcq' : 'descriptive',
                text: q.question_text || '',
                options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
                correctOption: q.correct_answer !== null ? parseInt(q.correct_answer) : null,
                solution: q.explanation || '',
                marks: q.points,
                negativeMarks: q.negative_marks || 0,
                sectionId: q.section_id || undefined,
                passageId: q.passage_id || undefined,
            };
        }) || [];
        
        console.log('✅ Server: Transformed first question:', transformedQuestions?.[0]);
        return { success: true, questions: transformedQuestions };
    } catch (error: any) {
        console.error('❌ Server: Fetch questions error:', error);
        return { success: false, error: 'Failed to fetch questions', questions: [] };
    }
}

// ============================================================================
// PASSAGE MANAGEMENT ACTIONS
// ============================================================================

export async function addTestPassage(testId: string, passageData: Omit<TestPassage, 'id'>) {
    try {
        const { data, error } = await db
            .from('test_passages')
            .insert({
                test_id: testId,
                title: passageData.title,
                content: passageData.content,
                display_order: passageData.displayOrder
            })
            .select()
            .single();

        if (error) {
            console.error('❌ Error adding passage:', error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true, passageId: data.id };
    } catch (error: any) {
        console.error('❌ Add passage error:', error);
        return { success: false, error: 'Failed to add passage' };
    }
}

export async function updateTestPassage(passageId: string, passageData: Partial<TestPassage>) {
    try {
        const updateData: any = {};
        
        if (passageData.title) updateData.title = passageData.title;
        if (passageData.content) updateData.content = passageData.content;
        if (passageData.displayOrder !== undefined) updateData.display_order = passageData.displayOrder;

        const { error } = await db
            .from('test_passages')
            .update(updateData)
            .eq('id', passageId);

        if (error) {
            console.error('❌ Error updating passage:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Update passage error:', error);
        return { success: false, error: 'Failed to update passage' };
    }
}

export async function deleteTestPassage(passageId: string) {
    try {
        const { error } = await db
            .from('test_passages')
            .delete()
            .eq('id', passageId);

        if (error) {
            console.error('❌ Error deleting passage:', error);
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete passage error:', error);
        return { success: false, error: 'Failed to delete passage' };
    }
}

export async function getTestPassages(testId: string) {
    try {
        const { data, error } = await db
            .from('test_passages')
            .select('*')
            .eq('test_id', testId)
            .order('display_order', { ascending: true });

        if (error) {
            console.error('❌ Server: Error fetching passages:', error);
            return { success: false, error: error.message, passages: [] };
        }

        console.log('✅ Server: Passages fetched:', data?.length || 0);
        
        // Transform database column names to match TestPassage interface
        const transformedPassages = data?.map((p: any) => ({
            id: p.id,
            testId: p.test_id,
            title: p.title,
            content: p.content,
            displayOrder: p.display_order,
        })) || [];
        
        return { success: true, passages: transformedPassages };
    } catch (error: any) {
        console.error('❌ Server: Fetch passages error:', error);
        return { success: false, error: 'Failed to fetch passages', passages: [] };
    }
}

// ============================================================================
// SECTION MANAGEMENT ACTIONS
// ============================================================================

export async function createTestSection(testId: string, sectionData: { name: string; description?: string; duration?: number }) {
    try {
        const { data, error } = await db
            .from('test_sections')
            .insert({
                test_id: testId,
                name: sectionData.name,
                description: sectionData.description || null,
                duration: sectionData.duration || null,
                order_number: 0,
            })
            .select();

        if (error) {
            console.error('❌ Error creating section:', error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true, section: data?.[0] };
    } catch (error: any) {
        console.error('❌ Create section error:', error);
        return { success: false, error: 'Failed to create section' };
    }
}

export async function updateTestSection(sectionId: string, sectionData: { name: string; description?: string; duration?: number }) {
    try {
        const { data, error } = await db
            .from('test_sections')
            .update({
                name: sectionData.name,
                description: sectionData.description || null,
                duration: sectionData.duration || null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', sectionId)
            .select();

        if (error) {
            console.error('❌ Error updating section:', error);
            return { success: false, error: error.message };
        }

        return { success: true, section: data?.[0] };
    } catch (error: any) {
        console.error('❌ Update section error:', error);
        return { success: false, error: 'Failed to update section' };
    }
}

export async function deleteTestSection(sectionId: string) {
    try {
        // Get the section first to find its test_id
        const { data: sectionData, error: fetchError } = await db
            .from('test_sections')
            .select('test_id')
            .eq('id', sectionId)
            .single();

        if (fetchError || !sectionData) {
            return { success: false, error: 'Section not found' };
        }

        // Unassign all questions from this section
        await db
            .from('test_questions')
            .update({ section_id: null })
            .eq('section_id', sectionId);

        // Delete the section
        const { error } = await db
            .from('test_sections')
            .delete()
            .eq('id', sectionId);

        if (error) {
            console.error('❌ Error deleting section:', error);
            return { success: false, error: error.message };
        }

        revalidatePath(`/instructor/tests/edit/${sectionData.test_id}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Delete section error:', error);
        return { success: false, error: 'Failed to delete section' };
    }
}

export async function getTestSections(testId: string) {
    try {
        const { data, error } = await db
            .from('test_sections')
            .select('*')
            .eq('test_id', testId)
            .order('order_number', { ascending: true });

        if (error) {
            console.error('❌ Error fetching sections:', error);
            return { success: false, error: error.message, sections: [] };
        }

        console.log('✅ Sections fetched:', data?.length || 0);
        return { success: true, sections: data || [] };
    } catch (error: any) {
        console.error('❌ Fetch sections error:', error);
        return { success: false, error: 'Failed to fetch sections', sections: [] };
    }
}

export async function reorderTestSections(testId: string, sections: { id: string; order_number: number }[]) {
    try {
        const updatePromises = sections.map((section) =>
            db
                .from('test_sections')
                .update({ order_number: section.order_number })
                .eq('id', section.id)
        );

        const results = await Promise.all(updatePromises);

        const errors = results.filter((r) => r.error);
        if (errors.length > 0) {
            console.error('Errors reordering sections:', errors);
            return { success: false, error: 'Failed to reorder sections' };
        }

        revalidatePath(`/instructor/tests/edit/${testId}`);
        return { success: true };
    } catch (error: any) {
        console.error('❌ Reorder sections error:', error);
        return { success: false, error: 'Failed to reorder sections' };
    }
}