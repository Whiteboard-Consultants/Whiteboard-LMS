/**
 * FAQ Database Queries & Cache Management
 * WhitedgeLMS | Supabase queries with 1-hour caching layer
 */

import { createClient } from '@supabase/supabase-js'
import type {
  FAQ,
  FAQWithCategory,
  CreateFAQInput,
  UpdateFAQInput,
  FAQHistory,
  FAQHistoryWithUser,
  FAQFeedback,
  CreateFAQFeedbackInput,
  FAQCategory,
  FAQStatistics,
  FAQsManagementData,
} from '@/types/faq'

// ============================================================================
// SUPABASE CLIENT
// ============================================================================

export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  return createClient(supabaseUrl, supabaseKey)
}

// ============================================================================
// SIMPLE MEMORY CACHE (for 1-hour TTL)
// ============================================================================

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const memoryCache = new Map<string, CacheEntry<unknown>>()

export function getCacheKey(...parts: string[]): string {
  return parts.join(':')
}

export function getFromCache<T>(key: string): T | null {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined

  if (!entry) {
    return null
  }

  if (entry.expiresAt < Date.now()) {
    memoryCache.delete(key)
    return null
  }

  return entry.data
}

export function setCache<T>(key: string, data: T, ttlMinutes = 60): void {
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000

  memoryCache.set(key, {
    data,
    expiresAt,
  })
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear()
    return
  }

  // Invalidate all keys matching pattern (e.g., "faqs:*")
  const keysToDelete: string[] = []
  memoryCache.forEach((_, key) => {
    if (key.startsWith(pattern)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => memoryCache.delete(key))
}

// ============================================================================
// FAQ QUERIES
// ============================================================================

/**
 * Get all published FAQs grouped by category
 */
export async function getPublishedFAQsByCategory(
  forceRefresh = false
): Promise<Record<string, FAQWithCategory[]>> {
  const cacheKey = getCacheKey('faqs:published:grouped')

  if (!forceRefresh) {
    const cached = getFromCache<Record<string, FAQWithCategory[]>>(cacheKey)
    if (cached) {
      return cached
    }
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('published_faqs_view')
    .select('*')
    .order('category_slug')
    .order('display_order')

  if (error) {
    throw new Error(`Failed to fetch published FAQs: ${error.message}`)
  }

  // Group by category
  const grouped = (data || []).reduce(
    (acc, faq) => {
      const slug = faq.category_slug
      if (!acc[slug]) {
        acc[slug] = []
      }
      acc[slug].push(faq as FAQWithCategory)
      return acc
    },
    {} as Record<string, FAQWithCategory[]>
  )

  setCache(cacheKey, grouped, 60) // 1-hour cache
  return grouped
}

/**
 * Get single published FAQ by ID
 */
export async function getPublishedFAQ(id: string): Promise<FAQWithCategory | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('published_faqs_view')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Not found
    }
    throw new Error(`Failed to fetch FAQ: ${error.message}`)
  }

  return data as FAQWithCategory
}

/**
 * Get FAQs by category (published only)
 */
export async function getFAQsByCategory(
  categorySlug: string
): Promise<FAQWithCategory[]> {
  const cacheKey = getCacheKey('faqs:category', categorySlug)

  const cached = getFromCache<FAQWithCategory[]>(cacheKey)
  if (cached) {
    return cached
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('published_faqs_view')
    .select('*')
    .eq('category_slug', categorySlug)
    .order('display_order')

  if (error) {
    throw new Error(`Failed to fetch FAQs for category: ${error.message}`)
  }

  setCache(cacheKey, data || [], 60)
  return (data || []) as FAQWithCategory[]
}

/**
 * Search published FAQs
 */
export async function searchFAQs(
  query: string,
  categorySlug?: string
): Promise<FAQWithCategory[]> {
  const supabase = getSupabaseClient()

  let q = supabase
    .from('published_faqs_view')
    .select('*')
    .or(
      `question.ilike.%${query}%,answer.ilike.%${query}%,excerpt.ilike.%${query}%`
    )

  if (categorySlug) {
    q = q.eq('category_slug', categorySlug)
  }

  const { data, error } = await q.order('display_order')

  if (error) {
    throw new Error(`Failed to search FAQs: ${error.message}`)
  }

  return (data || []) as FAQWithCategory[]
}

/**
 * Increment FAQ view count
 */
export async function incrementFAQViewCount(faqId: string): Promise<void> {
  const supabase = getSupabaseClient()

  await supabase.rpc('increment', {
    table_name: 'faqs',
    column_name: 'view_count',
    row_id: faqId,
  })

  // Invalidate related caches
  invalidateCache('faqs:published')
}

// ============================================================================
// ADMIN FAQ MANAGEMENT QUERIES
// ============================================================================

/**
 * Get all FAQs for admin (with management view)
 */
export async function getAdminFAQs(
  categoryId?: string
): Promise<FAQsManagementData[]> {
  const supabase = getSupabaseClient()

  let q = supabase.from('faq_management_view').select('*')

  if (categoryId) {
    q = q.eq('category_id', categoryId)
  }

  const { data, error } = await q.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch admin FAQs: ${error.message}`)
  }

  return (data || []) as FAQsManagementData[]
}

/**
 * Create new FAQ
 */
export async function createFAQ(
  input: CreateFAQInput,
  userId: string
): Promise<FAQ> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faqs')
    .insert({
      ...input,
      created_by: userId,
      updated_by: userId,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create FAQ: ${error.message}`)
  }

  // Invalidate caches
  invalidateCache('faqs:')

  return data as FAQ
}

/**
 * Update FAQ
 */
export async function updateFAQ(
  id: string,
  input: UpdateFAQInput,
  userId: string
): Promise<FAQ> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faqs')
    .update({
      ...input,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update FAQ: ${error.message}`)
  }

  // Invalidate caches
  invalidateCache('faqs:')

  return data as FAQ
}

/**
 * Delete FAQ
 */
export async function deleteFAQ(id: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.from('faqs').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete FAQ: ${error.message}`)
  }

  // Invalidate caches
  invalidateCache('faqs:')
}

/**
 * Publish/unpublish FAQ
 */
export async function publishFAQ(id: string, isPublished: boolean, userId: string): Promise<FAQ> {
  return updateFAQ(id, { is_published: isPublished }, userId)
}

// ============================================================================
// FAQ HISTORY / AUDIT TRAIL
// ============================================================================

/**
 * Get FAQ change history
 */
export async function getFAQHistory(faqId: string, limit = 50): Promise<FAQHistory[]> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faq_history')
    .select('*')
    .eq('faq_id', faqId)
    .order('changed_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch FAQ history: ${error.message}`)
  }

  return (data || []) as FAQHistory[]
}

/**
 * Get specific history version
 */
export async function getFAQHistoryVersion(historyId: string): Promise<FAQHistory | null> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faq_history')
    .select('*')
    .eq('id', historyId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch history version: ${error.message}`)
  }

  return data as FAQHistory
}

/**
 * Revert FAQ to previous version
 */
export async function revertFAQToVersion(
  historyId: string,
  userId: string
): Promise<FAQ> {
  const supabase = getSupabaseClient()

  // Get the history entry
  const history = await getFAQHistoryVersion(historyId)
  if (!history) {
    throw new Error('History version not found')
  }

  // Update the FAQ with the previous values
  return updateFAQ(
    history.faq_id,
    {
      question: history.question_before || undefined,
      answer: history.answer_before || undefined,
      is_published: history.is_published_before || undefined,
    },
    userId
  )
}

// ============================================================================
// FAQ FEEDBACK / HELPFULNESS
// ============================================================================

/**
 * Submit FAQ feedback (helpful/not helpful)
 */
export async function submitFAQFeedback(
  input: CreateFAQFeedbackInput,
  userId?: string
): Promise<FAQFeedback> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faq_feedback')
    .insert({
      ...input,
      user_id: userId || null,
      session_id: typeof window !== 'undefined' ? getOrCreateSessionId() : null,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to submit feedback: ${error.message}`)
  }

  // Invalidate FAQ cache to update stats
  invalidateCache('faqs:published')

  return data as FAQFeedback
}

/**
 * Get FAQ feedback statistics
 */
export async function getFAQFeedbackStats(faqId: string): Promise<{
  total: number
  helpful: number
  unhelpful: number
  helpfulnessRate: number
}> {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faq_feedback')
    .select('is_helpful')
    .eq('faq_id', faqId)

  if (error) {
    throw new Error(`Failed to fetch feedback stats: ${error.message}`)
  }

  const feedback = data || []
  const helpful = feedback.filter(f => f.is_helpful).length
  const unhelpful = feedback.filter(f => !f.is_helpful).length
  const total = feedback.length

  return {
    total,
    helpful,
    unhelpful,
    helpfulnessRate: total > 0 ? (helpful / total) * 100 : 0,
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

/**
 * Get all FAQ categories
 */
export async function getFAQCategories(): Promise<FAQCategory[]> {
  const cacheKey = 'faq:categories'

  const cached = getFromCache<FAQCategory[]>(cacheKey)
  if (cached) {
    return cached
  }

  const supabase = getSupabaseClient()

  const { data, error } = await supabase
    .from('faq_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  setCache(cacheKey, data || [], 120) // 2-hour cache for categories
  return (data || []) as FAQCategory[]
}

/**
 * Get category by slug
 */
export async function getFAQCategoryBySlug(slug: string): Promise<FAQCategory | null> {
  const categories = await getFAQCategories()
  return categories.find(c => c.slug === slug) || null
}

// ============================================================================
// DASHBOARD STATISTICS
// ============================================================================

/**
 * Get FAQ dashboard statistics
 */
export async function getFAQStatistics(): Promise<FAQStatistics> {
  const supabase = getSupabaseClient()

  // Get counts
  const { count: totalCount } = await supabase
    .from('faqs')
    .select('*', { count: 'exact', head: true })

  const { count: publishedCount } = await supabase
    .from('faqs')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true)

  const draftCount = (totalCount || 0) - (publishedCount || 0)

  // Get stats
  const { data: stats } = await supabase
    .from('faqs')
    .select('view_count, helpful_count, unhelpful_count')

  const totalViews = stats?.reduce((sum, faq) => sum + (faq.view_count || 0), 0) || 0
  const totalFeedback = stats?.reduce(
    (sum, faq) => sum + (faq.helpful_count || 0) + (faq.unhelpful_count || 0),
    0
  ) || 0
  const totalHelpful = stats?.reduce((sum, faq) => sum + (faq.helpful_count || 0), 0) || 0
  const avgHelpfulness =
    totalFeedback > 0 ? (totalHelpful / totalFeedback) * 100 : 0

  // Category breakdown
  const { data: categoryStats } = await supabase
    .rpc('get_faq_stats_by_category')
    .select('*')

  return {
    total_faqs: totalCount || 0,
    published_faqs: publishedCount || 0,
    draft_faqs: draftCount,
    total_views: totalViews,
    average_helpfulness: avgHelpfulness,
    total_feedback: totalFeedback,
    categories: categoryStats || [],
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Get or create session ID for anonymous feedback
 */
function getOrCreateSessionId(): string {
  let sessionId = localStorage.getItem('faq_session_id')

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('faq_session_id', sessionId)
  }

  return sessionId
}

/**
 * Convert TipTap JSON to plain text
 */
export function tiptapToPlainText(json: string): string {
  try {
    const doc = JSON.parse(json)
    let text = ''

    const traverse = (node: Record<string, unknown>) => {
      if (node.text) {
        text += node.text
      }
      if (Array.isArray(node.content)) {
        node.content.forEach(traverse)
      }
    }

    if (Array.isArray(doc.content)) {
      doc.content.forEach(traverse)
    }

    return text
  } catch {
    return ''
  }
}

/**
 * Convert TipTap JSON to HTML
 */
export function tiptapToHTML(json: string): string {
  // This would use a library like prosemirror-to-html
  // For now, just return escaped JSON
  return JSON.stringify(json)
}
