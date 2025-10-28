/**
 * Admin FAQ Management API Routes
 * POST /api/admin/faqs - Create FAQ
 * PUT /api/admin/faqs/[id] - Update FAQ
 * DELETE /api/admin/faqs/[id] - Delete FAQ
 * GET /api/admin/faqs/history/[id] - Get FAQ history
 * POST /api/admin/faqs/[id]/publish - Publish FAQ
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import {
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getFAQHistory,
  revertFAQToVersion,
  getAdminFAQs,
} from '@/lib/supabase/faq-queries'
import type { CreateFAQInput, UpdateFAQInput } from '@/types/faq'

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

// ============================================================================
// GET /api/admin/faqs - List all FAQs
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { authorized, userId } = await checkAdminRole(request)

    if (!authorized || !userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const categoryId = request.nextUrl.searchParams.get('category_id')

    const faqs = await getAdminFAQs(categoryId || undefined)

    return NextResponse.json({
      success: true,
      data: faqs,
    })
  } catch (error) {
    console.error('Error fetching admin FAQs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch FAQs',
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/admin/faqs - Create FAQ
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { authorized, userId } = await checkAdminRole(request)

    if (!authorized || !userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const input: CreateFAQInput = {
      category_id: body.category_id,
      question: body.question,
      answer: body.answer,
      excerpt: body.excerpt,
      display_order: body.display_order || 0,
      is_published: body.is_published || false,
    }

    // Validate required fields
    if (!input.category_id || !input.question || !input.answer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: category_id, question, answer',
        },
        { status: 400 }
      )
    }

    const faq = await createFAQ(input, userId)

    return NextResponse.json(
      {
        success: true,
        data: faq,
        message: 'FAQ created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating FAQ:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create FAQ',
      },
      { status: 500 }
    )
  }
}
