/**
 * GET /api/admin/faqs/[id]
 * PUT /api/admin/faqs/[id]
 * DELETE /api/admin/faqs/[id]
 */

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateFAQ, deleteFAQ, getPublishedFAQ } from '@/lib/supabase/faq-queries'
import type { UpdateFAQInput } from '@/types/faq'

interface RouteParams {
  params: {
    id: string
  }
}

// ============================================================================
// HELPER: Check Admin Role
// ============================================================================

async function checkAdminRole(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1]

  if (!token) {
    return { authorized: false, userId: null }
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !user) {
      return { authorized: false, userId: null }
    }

    // Check if user is admin or instructor
    const isAdmin =
      user.user_metadata?.role === 'admin' ||
      user.user_metadata?.role === 'instructor' ||
      user.role === 'admin'

    return { authorized: isAdmin, userId: user.id }
  } catch {
    return { authorized: false, userId: null }
  }
}

// GET single FAQ
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized } = await checkAdminRole(req)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('faqs')
      .select('*, faq_categories(id, name, slug)')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ success: false, error: 'FAQ not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching FAQ:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch FAQ' },
      { status: 500 }
    )
  }
}

// PUT update FAQ
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized, userId } = await checkAdminRole(req)
    if (!authorized || !userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { category_id, question, answer, excerpt, display_order, is_published } = body

    // Validation
    if (!category_id || !question || !answer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: category_id, question, answer' },
        { status: 400 }
      )
    }

    const input: UpdateFAQInput = {
      category_id,
      question,
      answer,
      excerpt: excerpt || '',
      display_order: display_order || 0,
      is_published: is_published !== undefined ? is_published : true,
    }

    const updatedFAQ = await updateFAQ(params.id, input, userId)

    return NextResponse.json({ success: true, data: updatedFAQ })
  } catch (error) {
    console.error('Error updating FAQ:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update FAQ' },
      { status: 500 }
    )
  }
}

// DELETE FAQ
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized } = await checkAdminRole(req)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    await deleteFAQ(params.id)

    return NextResponse.json({ success: true, message: 'FAQ deleted successfully' })
  } catch (error) {
    console.error('Error deleting FAQ:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete FAQ' },
      { status: 500 }
    )
  }
}
