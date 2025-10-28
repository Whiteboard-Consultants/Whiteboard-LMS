
'use server';

import { revalidatePath } from 'next/cache';
import { getDownloadURL, ref, uploadBytes, deleteObject } from 'firebase/storage';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc, runTransaction, query, where, getDocs } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// FIXME: Firebase imports are temporarily disabled to avoid compatibility warnings
// This file needs full migration to Supabase
import { supabase } from '@/lib/supabase';

// Temporary stub variables to avoid compilation errors
const db = supabase as any;
const storage = {} as any;
import type { Course, User, CourseCategory, Test } from '@/types';

async function uploadImage(file: File, folder: string): Promise<string> {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
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
      const instructorDoc = await getDoc(doc(db, "users", instructorId));
      if (!instructorDoc.exists()) {
        return { success: false, error: "Selected instructor not found." };
      }
      const instructorData = instructorDoc.data() as User;
      instructor = {
        id: instructorData.id,
        name: instructorData.name,
      };
    } else {
      // Instructor is creating their own course
       if (!userName) {
        // This case should ideally not be hit if FE logic is correct
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

    const docRef = await addDoc(collection(db, 'courses'), courseData);
    await updateDoc(docRef, { id: docRef.id });

    revalidatePath('/instructor/dashboard');
    revalidatePath('/instructor/courses');
    revalidatePath('/admin/courses');
    return { success: true, courseId: docRef.id };
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
                    const oldImageRef = ref(storage, existingImageUrl);
                    await deleteObject(oldImageRef);
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
            const instructorDoc = await getDoc(doc(db, 'users', instructorId));
            if (!instructorDoc.exists()) {
                return { success: false, error: "Selected instructor not found." };
            }
            const instructorData = instructorDoc.data() as User;
            dataToUpdate.instructor = {
                id: instructorData.id,
                name: instructorData.name,
            };
        }
        
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, dataToUpdate);

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
    // Use a transaction to ensure atomicity
    await runTransaction(db, async (transaction) => {
        const courseRef = doc(db, 'courses', courseId);
        
        // 1. Delete associated lessons
        const lessonsQuery = query(collection(db, 'lessons'), where('courseId', '==', courseId));
        const lessonsSnapshot = await getDocs(lessonsQuery);
        lessonsSnapshot.forEach(doc => transaction.delete(doc.ref));

        // 2. Delete associated tests and their questions
        const testsQuery = query(collection(db, 'tests'), where('courseId', '==', courseId));
        const testsSnapshot = await getDocs(testsQuery);
        for (const testDoc of testsSnapshot.docs) {
            const testData = testDoc.data() as Test;
            const questionsQuery = query(collection(db, 'questions'), where('testId', '==', testData.id));
            const questionsSnapshot = await getDocs(questionsQuery);
            questionsSnapshot.forEach(doc => transaction.delete(doc.ref));
            transaction.delete(testDoc.ref);
        }
        
        // 3. Delete the course document itself
        transaction.delete(courseRef);
    });
    
    // 4. Delete thumbnail from Firebase Storage (outside transaction)
    if (imageUrl) {
        try {
            const storageRef = ref(storage, imageUrl);
            await deleteObject(storageRef);
        } catch (storageError: unknown) {
            // Log the error but don't fail the whole operation if the image doesn't exist
            if (storageError instanceof Error && (storageError as { code?: string }).code !== 'storage/object-not-found') {
                console.warn(`Could not delete course thumbnail for ${courseId}:`, storageError);
            }
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
                await deleteObject(ref(storage, existingCertificateUrl));
            } catch (e: unknown) {
                console.warn("Could not delete old certificate, it may have already been removed:", e);
            }
        }

        // 3. Update Firestore with new URL
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            certificateUrl: newCertificateUrl,
            hasCertificate: true, // Ensure this is set to true
        });

        revalidatePath(`/instructor/courses/edit/${courseId}`);
        return { success: true, newUrl: newCertificateUrl };

    } catch (error: unknown) {
        console.error('Error updating certificate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update certificate.';
        return { success: false, error: errorMessage };
    }
}


export async function deleteCourseThumbnail(courseId: string, imageUrl: string) {
  if (!courseId || !imageUrl) {
    return { success: false, error: "Course ID and Image URL are required." };
  }
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);

    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, { imageUrl: '' });

    revalidatePath(`/instructor/courses/edit/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: "Failed to delete thumbnail." };
  }
}

export async function deleteCourseCertificate(courseId: string, certificateUrl: string) {
  if (!courseId || !certificateUrl) {
    return { success: false, error: "Course ID and Certificate URL are required." };
  }
  try {
    const certRef = ref(storage, certificateUrl);
    await deleteObject(certRef);

    const courseRef = doc(db, 'courses', courseId);
    await updateDoc(courseRef, { certificateUrl: '', hasCertificate: true });

    revalidatePath(`/instructor/courses/edit/${courseId}`);
    return { success: true };
  } catch (error: unknown) {
    console.error('Error deleting certificate:', error);
    return { success: false, error: 'Failed to delete certificate.' };
  }
}
