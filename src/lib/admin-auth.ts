import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { hasPermission, type PermissionKey } from '@/lib/permissions';
import type { User } from '@/types';

const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

function decodeJWT(token: string): { sub?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    return JSON.parse(Buffer.from(padded, 'base64').toString());
  } catch {
    return null;
  }
}

export async function getAppUserFromRequest(
  request: NextRequest
): Promise<Pick<User, 'id' | 'role' | 'permissions'> | null> {
  if (!supabaseAdmin) {
    console.error('[admin-auth] SUPABASE_SERVICE_ROLE_KEY is not configured');
    return null;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.error('[admin-auth] Missing Authorization Bearer header');
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = decodeJWT(token);

  let userId = decoded?.sub || null;
  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authData?.user?.id) {
      userId = authData.user.id;
    } else if (authError) {
      console.warn('[admin-auth] auth.getUser failed, using JWT payload:', authError.message);
    }
  } catch (err) {
    console.warn('[admin-auth] auth.getUser threw, using JWT payload:', err);
  }

  if (!userId) {
    console.error('[admin-auth] Could not resolve user id from token');
    return null;
  }

  // Only select columns that always exist — do not depend on manager migration
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[admin-auth] users lookup failed:', error.message, error.code);
    return null;
  }

  if (!data) {
    console.error('[admin-auth] No users row for id:', userId);
    return null;
  }

  // Optionally load permissions if the column exists
  let permissions: User['permissions'] = null;
  const { data: withPerms, error: permError } = await supabaseAdmin
    .from('users')
    .select('permissions')
    .eq('id', userId)
    .maybeSingle();

  if (!permError && withPerms) {
    permissions = withPerms.permissions ?? null;
  }

  return { id: data.id, role: data.role, permissions };
}

export async function requireAdmin(request: NextRequest) {
  const user = await getAppUserFromRequest(request);
  if (!user) {
    return { ok: false as const, user: null, error: 'Admin access required' };
  }
  if (String(user.role).trim().toLowerCase() !== 'admin') {
    console.error('[admin-auth] User is not admin:', { id: user.id, role: user.role });
    return { ok: false as const, user: null, error: 'Admin access required' };
  }
  return { ok: true as const, user };
}

export async function requirePermission(request: NextRequest, permission: PermissionKey) {
  const user = await getAppUserFromRequest(request);
  if (!user || !hasPermission(user, permission)) {
    return { ok: false as const, user: null, error: 'Permission denied' };
  }
  return { ok: true as const, user };
}
