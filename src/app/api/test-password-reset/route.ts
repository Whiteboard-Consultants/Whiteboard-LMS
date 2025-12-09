import { supabaseAdmin } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test if we can generate a recovery link
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' });
    }

    // Get all users to see the structure
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json({ error: 'Failed to list users', details: listError });
    }

    return NextResponse.json({
      status: 'Supabase admin client is working',
      userCount: users?.length || 0,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
