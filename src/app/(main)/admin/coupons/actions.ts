
'use server';

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import type { Coupon } from "@/types";

export async function createCoupon(data: Omit<Coupon, 'id' | 'createdAt' | 'usageCount' | 'isActive'> & { expiresAt?: string }) {
    if (!data.code || !data.type || !data.value) {
        return { success: false, error: 'All fields are required.' };
    }
    try {
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not available");
            return { success: false, error: 'Service configuration error.' };
        }

        const { error } = await supabaseAdmin
            .from('coupons')
            .insert({
                code: data.code.toUpperCase(),
                type: data.type,
                value: Number(data.value),
                usage_limit: data.usageLimit ? Number(data.usageLimit) : null,
                expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
                usage_count: 0,
                is_active: true,
                // Remove created_at to let the database handle it automatically
            });

        if (error) {
            console.error("Error creating coupon:", error);
            return { success: false, error: 'Failed to create coupon.' };
        }

        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error("Error creating coupon:", error);
        return { success: false, error: 'Failed to create coupon.' };
    }
}

export async function deleteCoupon(id: string) {
    if (!id) {
        return { success: false, error: 'Coupon ID is required.' };
    }
    try {
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not available");
            return { success: false, error: 'Service configuration error.' };
        }

        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Error deleting coupon:", error);
            return { success: false, error: 'Failed to delete coupon.' };
        }

        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error("Error deleting coupon:", error);
        return { success: false, error: 'Failed to delete coupon.' };
    }
}

export async function updateCouponStatus(id: string, isActive: boolean) {
    if(!id) {
        return { success: false, error: 'Coupon ID is required.' };
    }
    try {
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not available");
            return { success: false, error: 'Service configuration error.' };
        }

        const { error } = await supabaseAdmin
            .from('coupons')
            .update({ is_active: isActive })
            .eq('id', id);

        if (error) {
            console.error("Error updating coupon status:", error);
            return { success: false, error: 'Failed to update coupon status.' };
        }

        revalidatePath('/admin/coupons');
        return { success: true };
    } catch (error) {
        console.error("Error updating coupon status:", error);
        return { success: false, error: 'Failed to update coupon status.' };
    }
}
