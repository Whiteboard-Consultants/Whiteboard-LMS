import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key for admin operations
const supabaseServiceRole = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(request: NextRequest) {
  try {
    // Get some sample courses to check their structure
    const { data: courses, error } = await supabaseServiceRole
      .from('courses')
      .select('id, title, image_url, instructor_id, category, type, price')
      .limit(5);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch courses',
        details: error
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: `Found ${courses?.length || 0} courses`,
      sampleData: courses?.map(course => ({
        id: course.id,
        title: course.title,
        hasImageUrl: Boolean(course.image_url && course.image_url.trim() !== ''),
        imageUrl: course.image_url || '[empty]',
        instructor_id: course.instructor_id,
        category: course.category,
        type: course.type,
        price: course.price
      })) || [],
      recommendation: courses?.length === 0 
        ? 'No courses found - you may need to create some sample courses'
        : 'Check the imageUrl field - some courses may have empty or missing images'
    });
    
  } catch (error: any) {
    console.error('Debug courses error:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: 'Check server logs for full error details'
      },
      { status: 500 }
    );
  }
}