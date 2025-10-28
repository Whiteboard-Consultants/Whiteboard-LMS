/**
 * GET /api/faqs/categories
 * Fetch all FAQ categories
 */

import { NextResponse } from 'next/server'
import { getFAQCategories } from '@/lib/supabase/faq-queries'

export async function GET() {
  try {
    const categories = await getFAQCategories()

    return NextResponse.json({
      success: true,
      data: categories,
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      },
      { status: 500 }
    )
  }
}
