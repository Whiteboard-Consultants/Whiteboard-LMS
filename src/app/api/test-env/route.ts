import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const results = {
      success: true,
      supabaseUrl: !!supabaseUrl,
      anonKey: !!supabaseAnonKey,
      serviceKey: !!supabaseServiceKey,
      storageAccess: false
    };

    // Test storage access with service key if available
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
        const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
        
        if (!error && buckets) {
          results.storageAccess = buckets.some(bucket => bucket.name === 'course-assets');
        }
      } catch (storageError) {
        console.error('Storage test failed:', storageError);
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}