/**
 * GET /api/faqs
 * Fetch published FAQs (public endpoint)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getPublishedFAQsByCategory, searchFAQs, getFAQsByCategory } from '@/lib/supabase/faq-queries'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    // If search query provided
    if (query) {
      const results = await searchFAQs(query, category || undefined)
      return NextResponse.json({
        success: true,
        data: results,
      })
    }

    // If specific category requested
    if (category) {
      const faqs = await getFAQsByCategory(category)
      return NextResponse.json({
        success: true,
        data: faqs,
      })
    }

    // Default: return all published FAQs grouped by category
    const faqs = await getPublishedFAQsByCategory()
    return NextResponse.json({
      success: true,
      data: faqs,
    })
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch FAQs',
      },
      { status: 500 }
    )
  }
}
