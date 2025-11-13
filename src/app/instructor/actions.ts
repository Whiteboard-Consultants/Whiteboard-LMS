
'use server';

import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import type { Course, User, CourseCategory, Test } from '@/types';

async function uploadImage(file: File, folder: string): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
}

export async function createCourse(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const thumbnailFile = formData.get('thumbnail') as File;
  const type = formData.get('type') as 'free' | 'paid';
  const price = formData.get('price') as string | null;
  const category = formData.get('category') as CourseCategory;
  const programOutcome = formData.get('programOutcome') as string | null;
  const courseStructure = formData.get('courseStructure') as string | null;
  const faqs = formData.get('faqs') as string | null;
  const duration = formData.get('duration') as string | null;
  const level = formData.get('level') as Course['level'] | null;
  const tags = formData.get('tags') as string | null;

  // Authenticated user info
  const userId = formData.get('userId') as string;
  const userName = formData.get('userName') as string | null;
  const userRole = formData.get('userRole') as string;

  // Instructor ID from form (if admin is creating)
  const instructorId = formData.get('instructorId') as string | null;

  if (!title || !description || !thumbnailFile || !type || !category) {
    return { success: false, error: 'Missing required fields.' };
  }

   if (!userId || !userRole) {
      return { success: false, error: 'User identity could not be verified.' };
   }

  try {
    const thumbnailUrl = await uploadImage(thumbnailFile, 'course_thumbnails');
    
    let instructor: { id: string; name: string; };

    if (userRole === 'admin' && instructorId) {
      // Admin is creating the course for a specific instructor
      const { data: instructorData, error: instructorError } = await supabase
        .from('users')
        .select('*')
        .eq('id', instructorId)
        .single();
      
      if (instructorError || !instructorData) {
        return { success: false, error: "Selected instructor not found." };
      }
      
      instructor = {
        id: instructorData.id,
        name: instructorData.name,
      };
    } else {
      // Instructor is creating their own course
      if (!userName) {
        return { success: false, error: 'Instructor name is missing.' };
      }
      instructor = {
        id: userId,
        name: userName,
      };
    }

    const courseData: Omit<Course, 'id'> = {
        title,
        description,
        imageUrl: thumbnailUrl,
        instructor,
        studentCount: 0,
        lessonCount: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        type,
        price: type === 'paid' && price ? parseFloat(price) : 0,
        category,
        hasCertificate: true,
        certificateUrl: '', // Certificate is uploaded separately
        programOutcome: programOutcome || '',
        courseStructure: courseStructure || '',
        faqs: faqs || '',
        duration: duration || '',
        level: level || 'Beginner',
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    };

    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single();
    
    if (insertError || !newCourse) {
      throw insertError || new Error('Failed to insert course');
    }

    revalidatePath('/instructor/dashboard');
    revalidatePath('/instructor/courses');
    revalidatePath('/admin/courses');
    return { success: true, courseId: newCourse.id };
  } catch (error: unknown) {
    console.error('Error creating course:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create course.';
    return { success: false, error: errorMessage };
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'free' | 'paid';
    const price = formData.get('price') as string | null;
    const category = formData.get('category') as CourseCategory;
    const newThumbnailFile = formData.get('thumbnail') as File | null;
    const existingImageUrl = formData.get('existingImageUrl') as string;
    const instructorId = formData.get('instructorId') as string | null;
    const programOutcome = formData.get('programOutcome') as string | null;
    const courseStructure = formData.get('courseStructure') as string | null;
    const faqs = formData.get('faqs') as string | null;
    const duration = formData.get('duration') as string | null;
    const level = formData.get('level') as Course['level'] | null;
    const tags = formData.get('tags') as string | null;

    if (!title || !description || !type || !category) {
        return { success: false, error: 'Missing required fields.' };
    }

    try {
        let finalImageUrl = existingImageUrl;
        
        // If a new thumbnail is provided, upload it and delete the old one
        if (newThumbnailFile && newThumbnailFile.size > 0) {
            finalImageUrl = await uploadImage(newThumbnailFile, 'course_thumbnails');
            
            if (existingImageUrl) {
                try {
                    // Extract the file path from the URL
                    const urlParts = existingImageUrl.split('/');
                    const filePath = `course_thumbnails/${urlParts[urlParts.length - 1]}`;
                    await supabase.storage
                      .from('course-images')
                      .remove([filePath]);
                } catch (e) {
                    console.warn("Could not delete old thumbnail, it might not exist:", e);
                }
            }
        }

        const dataToUpdate: { [key: string]: unknown } = {
          title,
          description,
          type,
          price: type === 'paid' && price ? parseFloat(price) : 0,
          category,
          hasCertificate: true,
          imageUrl: finalImageUrl,
          programOutcome: programOutcome || '',
          courseStructure: courseStructure || '',
          faqs: faqs || '',
          duration: duration || '',
          level: level || 'Beginner',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        };

        if (instructorId) {
            const { data: instructorData, error: instructorError } = await supabase
              .from('users')
              .select('*')
              .eq('id', instructorId)
              .single();
            
            if (instructorError || !instructorData) {
                return { success: false, error: "Selected instructor not found." };
            }
            
            dataToUpdate.instructor = {
                id: instructorData.id,
                name: instructorData.name,
            };
        }
        
        const { error: updateError } = await supabase
          .from('courses')
          .update(dataToUpdate)
          .eq('id', courseId);
        
        if (updateError) throw updateError;

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        revalidatePath('/instructor/courses');
        revalidatePath('/instructor/dashboard');
        revalidatePath('/admin/courses');
        revalidatePath('/courses');
        revalidatePath(`/courses/${courseId}`);

        return { success: true };

    } catch (error: unknown) {
        console.error('Error updating course:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update course.';
        return { success: false, error: errorMessage };
    }
}

export async function deleteCourse(courseId: string, imageUrl: string) {
  if (!courseId) {
    return { success: false, error: 'Course ID is required.' };
  }

  try {
    // 1. Delete associated lessons
    await supabase
      .from('lessons')
      .delete()
      .eq('courseId', courseId);

    // 2. Delete associated tests and their questions
    const { data: tests, error: testsError } = await supabase
      .from('tests')
      .select('id')
      .eq('courseId', courseId);
    
    if (!testsError && tests) {
      for (const test of tests) {
        await supabase
          .from('questions')
          .delete()
          .eq('testId', test.id);
      }
      
      await supabase
        .from('tests')
        .delete()
        .eq('courseId', courseId);
    }
    
    // 3. Delete the course itself
    const { error: deleteError } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);
    
    if (deleteError) throw deleteError;
    
    // 4. Delete thumbnail from Supabase Storage
    if (imageUrl) {
        try {
            const urlParts = imageUrl.split('/');
            const filePath = `course_thumbnails/${urlParts[urlParts.length - 1]}`;
            await supabase.storage
              .from('course-images')
              .remove([filePath]);
        } catch (storageError: unknown) {
            console.warn(`Could not delete course thumbnail for ${courseId}:`, storageError);
        }
    }
    
    revalidatePath('/instructor/courses');
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting course and its subcollections:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete course.';
    return { success: false, error: errorMessage };
  }
}

export async function updateCourseCertificate(courseId: string, formData: FormData) {
    const certificateFile = formData.get('certificate') as File;
    const existingCertificateUrl = formData.get('existingCertificateUrl') as string;

    if (!courseId || !certificateFile) {
        return { success: false, error: 'Course ID and certificate file are required.' };
    }

    try {
        // 1. Upload new certificate
        const newCertificateUrl = await uploadImage(certificateFile, 'course_certificates');

        // 2. Delete old certificate if it exists
        if (existingCertificateUrl) {
            try {
                const urlParts = existingCertificateUrl.split('/');
                const filePath = `course_certificates/${urlParts[urlParts.length - 1]}`;
                await supabase.storage
                  .from('course-images')
                  .remove([filePath]);
            } catch (e: unknown) {
                console.warn("Could not delete old certificate, it may have already been removed:", e);
            }
        }

        // 3. Update Supabase with new URL
        const { error: updateError } = await supabase
          .from('courses')
          .update({
            certificateUrl: newCertificateUrl,
            hasCertificate: true,
          })
          .eq('id', courseId);
        
        if (updateError) throw updateError;

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        return { success: true, newUrl: newCertificateUrl };

    } catch (error: unknown) {
        console.error('Error updating certificate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update certificate.';
        return { success: false, error: errorMessage };
    }
}}


export async function deleteCourseThumbnail(courseId: string, imageUrl: string) {
  if (!courseId || !imageUrl) {
    return { success: false, error: "Course ID and Image URL are required." };
  }
  try {
    const urlParts = imageUrl.split('/');
    const filePath = `course_thumbnails/${urlParts[urlParts.length - 1]}`;
    await supabase.storage
      .from('course-images')
      .remove([filePath]);

    const { error: updateError } = await supabase
      .from('courses')
      .update({ imageUrl: '' })
      .eq('id', courseId);
    
    if (updateError) throw updateError;

    revalidatePath(`/instructor/courses/edit/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete thumbnail." };
  }
}}

export async function deleteCourseCertificate(courseId: string, certificateUrl: string) {
  if (!courseId || !certificateUrl) {
    return { success: false, error: "Course ID and Certificate URL are required." };
  }
  try {
    const urlParts = certificateUrl.split('/');
    const filePath = `course_certificates/${urlParts[urlParts.length - 1]}`;
    await supabase.storage
      .from('course-images')
      .remove([filePath]);

    const { error: updateError } = await supabase
      .from('courses')
      .update({ certificateUrl: '', hasCertificate: true })
      .eq('id', courseId);
    
    if (updateError) throw updateError;

    revalidatePath(`/instructor/courses/edit/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting certificate:', error);
    return { success: false, error: 'Failed to delete certificate.' };
  }
}}
