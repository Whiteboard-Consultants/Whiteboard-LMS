import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('id');
    
    if (!courseId) {
      return Response.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient()
    
    // Query the specific course
    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single()

    if (error) {
      return Response.json({ error: 'Course not found', details: error.message }, { status: 404 });
    }

    // Test image URL accessibility
    let imageStatus = 'unknown';
    if (course.image_url) {
      try {
        const imageResponse = await fetch(course.image_url, { method: 'HEAD' });
        imageStatus = `${imageResponse.status} ${imageResponse.statusText}`;
      } catch (error) {
        imageStatus = `Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }
    }

    return Response.json({
      course: {
        id: course.id,
        title: course.title,
        image_url: course.image_url,
        image_url_length: course.image_url?.length || 0,
        image_url_trimmed: course.image_url?.trim(),
        image_url_is_empty: !course.image_url || course.image_url.trim() === '',
        imageStatus
      },
      debug: {
        original_field_name: 'image_url',
        mapped_to_frontend: 'imageUrl',
        validation_check: course.image_url && course.image_url.trim() !== '' ? 'PASS' : 'FAIL',
        url_accessible: imageStatus.startsWith('200') ? 'YES' : 'NO'
      }
    })
  } catch (error) {
    console.error('Debug course error:', error)
    return Response.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}