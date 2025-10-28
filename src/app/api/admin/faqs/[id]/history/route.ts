/**
 * GET /api/admin/faqs/[id]/history
 * Get FAQ change history
 */

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFAQHistory } from '@/lib/supabase/faq-queries'

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

// GET FAQ history
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { authorized } = await checkAdminRole(req)
    if (!authorized) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10)

    const history = await getFAQHistory(params.id, limit)

    return NextResponse.json({ success: true, data: history })
  } catch (error) {
    console.error('Error fetching FAQ history:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch FAQ history' },
      { status: 500 }
    )
  }
}
