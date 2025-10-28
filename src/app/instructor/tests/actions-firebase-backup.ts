

'use server';

import { revalidatePath } from 'next/cache';
import { collection, doc, updateDoc, serverTimestamp, getDocs, writeBatch, query, where, runTransaction, getDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Test, TestQuestion } from '@/types';

export async function createTest(testData: Omit<Test, 'id' | 'createdAt' | 'questionCount'>) {
    if (!testData.title || !testData.duration || !testData.instructorId) {
        return { success: false, error: "Missing required fields." };
    }

    try {
        const newTestRef = doc(collection(db, 'tests'));
        
        await runTransaction(db, async (transaction) => {
            transaction.set(newTestRef, {
                ...testData,
                id: newTestRef.id,
                questionCount: 0,
                createdAt: serverTimestamp(),
            });

            // If a course is linked, update the course document
            if (testData.courseId) {
                const courseRef = doc(db, 'courses', testData.courseId);
                transaction.update(courseRef, { finalAssessmentId: newTestRef.id });
            }
        });
        
        revalidatePath('/instructor/tests');
        if (testData.courseId) {
            revalidatePath(`/instructor/courses/edit/${testData.courseId}`);
        }

        return { success: true, testId: newTestRef.id };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create test.";
        return { success: false, error: errorMessage };
    }
}

export async function updateTest(testId: string, testData: Partial<Omit<Test, 'id' | 'createdAt'>>, oldCourseId?: string | null) {
    if (!testId) {
        return { success: false, error: "Test ID is missing." };
    }
    try {
        const testRef = doc(db, 'tests', testId);

        await runTransaction(db, async (transaction) => {
            const testDoc = await transaction.get(testRef);
            if (!testDoc.exists()) {
                throw new Error("Test not found!");
            }
            
            // If the course link is being changed
            if (oldCourseId !== testData.courseId) {
                // Remove the link from the old course, if it exists
                if (oldCourseId) {
                    const oldCourseRef = doc(db, 'courses', oldCourseId);
                    transaction.update(oldCourseRef, { finalAssessmentId: null });
                }
                // Add the link to the new course, if it exists
                if (testData.courseId) {
                    const newCourseRef = doc(db, 'courses', testData.courseId);
                    transaction.update(newCourseRef, { finalAssessmentId: testId });
                }
            }
            
            transaction.update(testRef, testData);
        });

        revalidatePath(`/instructor/tests/edit/${testId}`);
        revalidatePath('/instructor/tests');
        if (testData.courseId) revalidatePath(`/instructor/courses/edit/${testData.courseId}`);
        if (oldCourseId) revalidatePath(`/instructor/courses/edit/${oldCourseId}`);

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update test.";
        return { success: false, error: errorMessage };
    }
}

export async function deleteTest(testId: string) {
    if (!testId) {
        return { success: false, error: 'Test ID is required.' };
    }
    try {
        const testRef = doc(db, 'tests', testId);
        
        await runTransaction(db, async (transaction) => {
            const testDoc = await transaction.get(testRef);
            if (!testDoc.exists()) {
                // Already deleted
                return;
            }
            const testData = testDoc.data() as Test;

            // If linked to a course, remove the link
            if (testData.courseId) {
                const courseRef = doc(db, 'courses', testData.courseId);
                transaction.update(courseRef, { finalAssessmentId: null });
            }

            // Delete all associated questions
            const questionsQuery = query(collection(db, 'questions'), where('testId', '==', testId));
            const questionsSnapshot = await getDocs(questionsQuery); // Must be outside transaction
            questionsSnapshot.forEach(doc => transaction.delete(doc.ref));

            // Delete the test itself
            transaction.delete(testRef);
        });

        revalidatePath('/instructor/tests');
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete test.';
        return { success: false, error: errorMessage };
    }
}


// --- Test Question Actions ---

export async function addTestQuestion(questionData: Omit<TestQuestion, 'id'>) {
     if (!questionData.testId || !questionData.text) {
        return { success: false, error: "Missing required fields." };
    }
    
    try {
        const testRef = doc(db, 'tests', questionData.testId);
        const newQuestionRef = doc(collection(db, 'questions'));
        
        await runTransaction(db, async (transaction) => {
            const testDoc = await transaction.get(testRef);
            if (!testDoc.exists()) {
                throw new Error("Test not found!");
            }

            transaction.set(newQuestionRef, { ...questionData, id: newQuestionRef.id });

            const currentCount = testDoc.data().questionCount || 0;
            transaction.update(testRef, { questionCount: currentCount + 1 });
        });

        revalidatePath(`/instructor/tests/edit/${questionData.testId}`);
        return { success: true, questionId: newQuestionRef.id };

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to add question.";
         return { success: false, error: errorMessage };
    }
}

export async function updateTestQuestion(questionId: string, questionData: Partial<Omit<TestQuestion, 'id'>>) {
    if (!questionId) {
        return { success: false, error: "Question ID is missing." };
    }
     try {
        const questionRef = doc(db, 'questions', questionId);
        await updateDoc(questionRef, questionData);
        if (questionData.testId) {
           revalidatePath(`/instructor/tests/edit/${questionData.testId}`);
        }
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update question.";
        return { success: false, error: errorMessage };
    }
}

export async function deleteTestQuestion(questionId: string) {
    if (!questionId) {
        return { success: false, error: "Question ID is missing." };
    }
     try {
        const questionRef = doc(db, 'questions', questionId);
        const questionSnap = await getDoc(questionRef);
        if (!questionSnap.exists()) return { success: true }; // Already deleted
        
        const testId = questionSnap.data()?.testId;

        await runTransaction(db, async (transaction) => {
            transaction.delete(questionRef);
            if(testId) {
                const testRef = doc(db, 'tests', testId);
                const testDoc = await transaction.get(testRef);
                if (testDoc.exists()) {
                    const currentCount = testDoc.data().questionCount || 0;
                    transaction.update(testRef, { questionCount: Math.max(0, currentCount - 1) });
                }
            }
        });
        
        if (testId) revalidatePath(`/instructor/tests/edit/${testId}`);
        
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete question.";
        return { success: false, error: errorMessage };
    }
}

export async function updateTestQuestionOrder(items: { id: string; order: number }[]) {
    try {
        const batch = writeBatch(db);
        items.forEach(item => {
            const docRef = doc(db, 'questions', item.id);
            batch.update(docRef, { order: item.order });
        });
        await batch.commit();
        // Revalidation should be handled by the calling page component
        // as testId is not directly available here.
        return { success: true };
    } catch (_error: unknown) {
        return { success: false, error: "Failed to update question order." };
    }
}

    