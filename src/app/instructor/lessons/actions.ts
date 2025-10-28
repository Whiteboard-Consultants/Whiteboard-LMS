

'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';

import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { Lesson } from '@/types';

export async function createLesson(lessonData: Partial<Omit<Lesson, 'id' | 'createdAt' | 'order'>>, currentLessonCount: number) {
    console.log('🚀 CREATE LESSON ACTION CALLED');
    console.log('Lesson data:', lessonData);
    console.log('Current lesson count:', currentLessonCount);
    
    if (!lessonData.title || !lessonData.courseId || !lessonData.type) {
        console.error('Missing required fields:', { title: lessonData.title, courseId: lessonData.courseId, type: lessonData.type });
        return { success: false, error: "Missing required fields." };
    }

    try {
        // Get Supabase client
        const supabase = await createServerSupabaseClient();
        console.log('✅ Supabase client created for lesson creation');
        
        // Generate lesson ID
        const lessonId = uuidv4();
        console.log('Generated lesson ID:', lessonId);
        
        // Prepare lesson data for Supabase (using snake_case field names)
        const dataToCreate: any = {
            id: lessonId,
            title: lessonData.title,
            course_id: lessonData.courseId,
            type: lessonData.type,
            objectives: lessonData.objectives || null,
            content: '',
            asset_url: lessonData.assetUrl || null,
            parent_id: lessonData.parentId || null,
            order_number: currentLessonCount, // Using 'order_number' based on actual database schema
            created_at: new Date().toISOString(),
        };
        
        // Set type-specific defaults
        if (lessonData.type === 'quiz' || lessonData.type === 'assignment') {
            dataToCreate.questions = [];
        } else if (!lessonData.parentId) { 
            dataToCreate.content = '';
        }
        
        console.log('Lesson data to insert:', dataToCreate);
        
        // Insert lesson into Supabase
        const { data: lessonResponse, error: lessonError } = await supabase
            .from('lessons')
            .insert([dataToCreate])
            .select()
            .single();
            
        if (lessonError) {
            console.error('Failed to create lesson:', lessonError);
            return { success: false, error: `Failed to create lesson: ${lessonError.message}` };
        }
        
        console.log('✅ Lesson created successfully:', lessonResponse.id);
        
        // Update course lesson count
        const { error: courseUpdateError } = await supabase
            .from('courses')
            .update({ 
                lesson_count: currentLessonCount + 1
            })
            .eq('id', lessonData.courseId);
            
        if (courseUpdateError) {
            console.error('Failed to update course lesson count:', courseUpdateError);
            // Don't fail the entire operation for this
        } else {
            console.log('✅ Course lesson count updated');
        }
        
        // Revalidate paths
        revalidatePath(`/instructor/courses/edit/${lessonData.courseId}`);
        revalidatePath(`/admin/courses`);
        
        return { success: true, lessonId: lessonResponse.id };
        
    } catch (error: unknown) {
        console.error("Error creating lesson:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create lesson.";
        return { success: false, error: errorMessage };
    }
}

export async function updateLesson(lessonId: string, courseId: string, data: Partial<Lesson>) {
    console.log('🔄 UPDATE LESSON ACTION CALLED');
    console.log('Lesson ID:', lessonId, 'Course ID:', courseId);
    
    if (!lessonId || !courseId) {
        return { success: false, error: "Lesson ID and Course ID are required." };
    }

    try {
        const supabase = await createServerSupabaseClient();
        
        // Prepare update data for Supabase schema
        const updateData: any = {};
        
        // Map fields to snake_case - only include fields that exist in the schema
        if (data.title !== undefined) updateData.title = data.title;
        if (data.content !== undefined) updateData.content = data.content;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.objectives !== undefined) updateData.objectives = data.objectives;
        if (data.assetUrl !== undefined) updateData.asset_url = data.assetUrl;
        
        // Handle quiz/assignment questions
        if ((data.type === 'quiz' || data.type === 'assignment') && typeof data.content === 'string') {
            updateData.questions = JSON.parse(data.content);
            delete updateData.content; 
        }
        
        // Only proceed if we have data to update
        if (Object.keys(updateData).length === 0) {
            console.log('No valid fields to update');
            return { success: true };
        }

        const { error } = await supabase
            .from('lessons')
            .update(updateData)
            .eq('id', lessonId);

        if (error) {
            console.error('Failed to update lesson:', error);
            return { success: false, error: `Failed to update lesson: ${error.message}` };
        }

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        revalidatePath(`/admin/courses`);
        revalidatePath(`/courses/${courseId}`);

        return { success: true };

    } catch (error: unknown) {
        console.error('Error updating lesson:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update lesson.';
        return { success: false, error: errorMessage };
    }
}

export async function deleteLesson(lessonId: string, courseId: string, assetUrl?: string) {
    console.log('🗑️ DELETE LESSON ACTION CALLED');
    console.log('Lesson ID:', lessonId, 'Course ID:', courseId);
    
    if (!lessonId || !courseId) {
        return { success: false, error: 'Invalid lesson data provided.' };
    }

    try {
        const supabase = await createServerSupabaseClient();
        
        // Check if lesson exists
        const { data: lesson, error: lessonError } = await supabase
            .from('lessons')
            .select('id')
            .eq('id', lessonId)
            .single();

        if (lessonError && lessonError.code !== 'PGRST116') {
            console.error('Error checking lesson:', lessonError);
            return { success: false, error: 'Failed to verify lesson.' };
        }

        if (!lesson) {
            console.log('Lesson not found, updating course count anyway');
            // Update course lesson count based on actual lessons
            const { data: lessons } = await supabase
                .from('lessons')
                .select('id')
                .eq('course_id', courseId);
            
            await supabase
                .from('courses')
                .update({ lesson_count: lessons?.length || 0 })
                .eq('id', courseId);
            
            return { success: true };
        }

        // Delete sub-lessons first
        const { data: subLessons, error: subLessonsError } = await supabase
            .from('lessons')
            .select('id')
            .eq('parent_id', lessonId);

        if (!subLessonsError && subLessons && subLessons.length > 0) {
            const { error: deleteSubLessonsError } = await supabase
                .from('lessons')
                .delete()
                .eq('parent_id', lessonId);

            if (deleteSubLessonsError) {
                console.error('Failed to delete sub-lessons:', deleteSubLessonsError);
                return { success: false, error: 'Failed to delete sub-lessons.' };
            }
        }

        // Delete the main lesson
        const { error: deleteLessonError } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (deleteLessonError) {
            console.error('Failed to delete lesson:', deleteLessonError);
            return { success: false, error: 'Failed to delete lesson.' };
        }

        // Update course lesson count
        const deletedCount = 1 + (subLessons?.length || 0);
        const { data: course, error: courseError } = await supabase
            .from('courses')
            .select('lesson_count')
            .eq('id', courseId)
            .single();

        if (!courseError && course) {
            const newCount = Math.max(0, (course.lesson_count || 0) - deletedCount);
            await supabase
                .from('courses')
                .update({ lesson_count: newCount })
                .eq('id', courseId);
        }

        // TODO: Handle asset deletion from storage if needed
        if (assetUrl) {
            console.log('Asset deletion not implemented yet:', assetUrl);
        }

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        revalidatePath(`/admin/courses`);
        return { success: true };
        
    } catch (error: unknown) {
        console.error('Error deleting lesson:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete lesson.';
        return { success: false, error: errorMessage };
    }
}

export async function updateLessonOrder(items: { id: string; order: number }[], courseId: string) {
    console.log('🔄 UPDATE LESSON ORDER ACTION CALLED');
    console.log('Items to update:', items.length, 'Course ID:', courseId);
    
    try {
        const supabase = await createServerSupabaseClient();
        
        // Update each lesson's order - Supabase doesn't have batch operations like Firebase
        // but we can use Promise.all for concurrent updates
        const updatePromises = items.map(item => 
            supabase
                .from('lessons')
                .update({ order_number: item.order }) // Using 'order_number' based on actual database schema
                .eq('id', item.id)
        );

        const results = await Promise.all(updatePromises);
        
        // Check for any errors
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
            console.error('Some lesson order updates failed:', errors);
            return { success: false, error: "Failed to update some lesson orders." };
        }

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        revalidatePath(`/admin/courses`);
        return { success: true };
        
    } catch (error: unknown) {
        console.error("Error updating lesson order:", error);
        return { success: false, error: "Failed to update lesson order." };
    }
}

    