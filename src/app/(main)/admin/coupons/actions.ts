
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

export async function getCoupons() {
    try {
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not available");
            return { success: false, coupons: [], error: 'Service configuration error.' };
        }

        const { data, error } = await supabaseAdmin
            .from('coupons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching coupons:", error);
            return { success: false, coupons: [], error: 'Failed to load coupons.' };
        }

        // Map database fields to frontend format
        const mappedData = (data || []).map(item => ({
            ...item,
            usageLimit: item.usage_limit,
            usageCount: item.usage_count,
            isActive: item.is_active,
            expiresAt: item.expires_at,
            createdAt: item.created_at
        })) as Coupon[];

        return { success: true, coupons: mappedData, error: null };
    } catch (error) {
        console.error("Error fetching coupons:", error);
        return { success: false, coupons: [], error: 'Failed to load coupons.' };
    }
}

export async function bulkDeleteCoupons(ids: string[]) {
    if (!ids || ids.length === 0) {
        return { success: false, error: 'No coupons selected.' };
    }
    try {
        if (!supabaseAdmin) {
            console.error("Supabase Admin client not available");
            return { success: false, error: 'Service configuration error.' };
        }

        const { error } = await supabaseAdmin
            .from('coupons')
            .delete()
            .in('id', ids);

        if (error) {
            console.error("Error bulk deleting coupons:", error);
            return { success: false, error: 'Failed to delete coupons.' };
        }

        revalidatePath('/admin/coupons');
        return { success: true, deletedCount: ids.length };
    } catch (error) {
        console.error("Error bulk deleting coupons:", error);
        return { success: false, error: 'Failed to delete coupons.' };
    }
}
