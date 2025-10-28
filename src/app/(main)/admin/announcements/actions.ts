
'use server';

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import type { Announcement } from "@/types";

export async function createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt'>) {
    if (!data.title || !data.content || !data.type) {
        return { success: false, error: 'All fields are required.' };
    }
    
    // Map frontend types to database types
    const typeMapping: Record<string, string> = {
        'Info': 'info',
        'Success': 'success',
        'Warning': 'warning',
        'Destructive': 'error'
    };
    
    try {
        const { error } = await supabase
            .from('announcements')
            .insert({
                title: data.title,
                content: data.content,
                type: typeMapping[data.type] || 'info',
                created_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Error creating announcement:", error);
            return { success: false, error: 'Failed to create announcement.' };
        }

        revalidatePath('/admin/announcements');
        revalidatePath('/admin/dashboard');
        revalidatePath('/instructor/dashboard');
        revalidatePath('/student/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error creating announcement:", error);
        return { success: false, error: 'Failed to create announcement.' };
    }
}

export async function deleteAnnouncement(id: string) {
    if (!id) {
        return { success: false, error: 'Announcement ID is required.' };
    }
    try {
        const { error } = await supabase
            .from('announcements')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting announcement:", error);
            return { success: false, error: 'Failed to delete announcement.' };
        }

        revalidatePath('/admin/announcements');
        revalidatePath('/admin/dashboard');
        revalidatePath('/instructor/dashboard');
        revalidatePath('/student/dashboard');
        return { success: true };
    } catch (error) {
        console.error("Error deleting announcement:", error);
        return { success: false, error: 'Failed to delete announcement.' };
    }
}
