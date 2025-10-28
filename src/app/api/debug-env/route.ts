import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ MISSING',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ MISSING',
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? `✅ SET (${process.env.SUPABASE_SERVICE_ROLE_KEY.length} chars)` : '❌ MISSING',
    'NODE_ENV': process.env.NODE_ENV,
  };

  const allEnvKeys = Object.keys(process.env)
    .filter(k => k.includes('SUPABASE') || k.includes('NEXT'))
    .sort();

  return NextResponse.json({
    status: 'Environment variables check',
    critical: envVars,
    allSupabaseEnvs: allEnvKeys.filter(k => k.includes('SUPABASE')),
    allNextEnvs: allEnvKeys.filter(k => k.includes('NEXT')),
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
