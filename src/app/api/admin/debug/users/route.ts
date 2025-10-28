import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;

async function verifyAdmin(serverSupabase: any) {
  const { data: userData } = await serverSupabase.auth.getUser();
  const currentUser = userData?.user;
  if (!currentUser) return false;
  const { data: me } = await serverSupabase.from('users').select('role').eq('id', currentUser.id).single();
  return me && me.role === 'admin';
}

export async function GET(req: Request) {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const isAdmin = await verifyAdmin(serverSupabase);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false }
    });

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'count') {
      // Return an exact count of users
      const { data, error, count } = await serviceClient.from('users').select('id', { count: 'exact' });
      if (error) {
        console.error('Error counting users in debug endpoint', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ count: count ?? (data ? data.length : 0) });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Unexpected error in GET /api/admin/debug/users', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const serverSupabase = await createServerSupabaseClient();
    const isAdmin = await verifyAdmin(serverSupabase);
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    const serviceClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { persistSession: false, detectSessionInUrl: false }
    });

    const body = await req.json().catch(() => null) || {};
    const testUser = body.testUser || {
      id: crypto.randomUUID(),
      name: 'Debug Test User',
      email: `debug+${Date.now()}@example.com`,
      role: 'student',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await serviceClient.from('users').insert([testUser]).select().single();
    if (error) {
      console.error('Error inserting debug user', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, user: data });
  } catch (err) {
    console.error('Unexpected error in POST /api/admin/debug/users', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
