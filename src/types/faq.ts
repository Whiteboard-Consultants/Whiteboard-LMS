/**
 * FAQ System Types
 * WhitedgeLMS | Type definitions for all FAQ-related data structures
 */

// ============================================================================
// FAQ CATEGORY TYPES
// ============================================================================

export interface FAQCategory {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateFAQCategoryInput {
  name: string
  slug: string
  icon?: string
  description?: string
  display_order?: number
}

export interface UpdateFAQCategoryInput {
  name?: string
  slug?: string
  icon?: string
  description?: string
  display_order?: number
  is_active?: boolean
}

// ============================================================================
// FAQ TYPES
// ============================================================================

export interface FAQ {
  id: string
  category_id: string
  question: string
  answer: string // Stored as JSON rich text from TipTap
  excerpt?: string
  display_order: number
  is_published: boolean
  view_count: number
  helpful_count: number
  unhelpful_count: number
  created_by: string
  updated_by?: string
  created_at: string
  updated_at: string
  last_cached_at?: string
}

// With category info populated
export interface FAQWithCategory extends FAQ {
  category_name: string
  category_slug: string
  category_icon?: string
  created_by_email?: string
  updated_by_email?: string
}

export interface CreateFAQInput {
  category_id: string
  question: string
  answer: string // JSON from TipTap editor
  excerpt?: string
  display_order?: number
  is_published?: boolean
}

export interface UpdateFAQInput {
  question?: string
  answer?: string
  excerpt?: string
  display_order?: number
  is_published?: boolean
  category_id?: string
}

// ============================================================================
// FAQ HISTORY / AUDIT TRAIL TYPES
// ============================================================================

export type FAQChangeType = 'created' | 'updated' | 'published' | 'unpublished' | 'deleted'

export interface FAQHistory {
  id: string
  faq_id: string
  question_before?: string
  answer_before?: string
  is_published_before?: boolean
  question_after?: string
  answer_after?: string
  is_published_after?: boolean
  change_type: FAQChangeType
  change_reason?: string
  changed_by: string
  changed_at: string
  ip_address?: string
  user_agent?: string
}

export interface FAQHistoryWithUser extends FAQHistory {
  changed_by_email?: string
  changed_by_name?: string
}

// ============================================================================
// FAQ FEEDBACK TYPES
// ============================================================================

export interface FAQFeedback {
  id: string
  faq_id: string
  user_id?: string
  session_id?: string
  is_helpful: boolean
  feedback_text?: string
  created_at: string
}

export interface CreateFAQFeedbackInput {
  faq_id: string
  is_helpful: boolean
  feedback_text?: string
}

// ============================================================================
// FAQ CACHE TYPES
// ============================================================================

export interface FAQCache {
  id: string
  cache_key: string
  cache_data: Record<string, unknown>
  created_at: string
  expires_at: string
  tag?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface FAQResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedFAQResponse<T> {
  success: boolean
  data?: T[]
  total?: number
  page?: number
  limit?: number
  hasMore?: boolean
  error?: string
}

// ============================================================================
// ADMIN DASHBOARD TYPES
// ============================================================================

export interface FAQStatistics {
  total_faqs: number
  published_faqs: number
  draft_faqs: number
  total_views: number
  average_helpfulness: number // percentage
  total_feedback: number
  categories: {
    name: string
    count: number
    published_count: number
  }[]
}

export interface FAQsManagementData {
  id: string
  question: string
  category_name: string
  is_published: boolean
  view_count: number
  helpful_count: number
  unhelpful_count: number
  created_by_email: string
  updated_by_email?: string
  created_at: string
  updated_at: string
  version_count: number
}

// ============================================================================
// SEARCH & FILTER TYPES
// ============================================================================

export interface FAQSearchParams {
  query?: string
  category_id?: string
  category_slug?: string
  is_published?: boolean
  sort_by?: 'recent' | 'views' | 'helpful' | 'order'
  page?: number
  limit?: number
}

export interface FAQFilterOptions {
  category?: string
  published_status?: 'all' | 'published' | 'draft'
  sort?: 'recent' | 'views' | 'helpful' | 'order'
  search?: string
}

// ============================================================================
// FORM & UI TYPES
// ============================================================================

export interface FAQFormData {
  question: string
  answer: string // JSON from TipTap
  excerpt?: string
  category_id: string
  display_order?: number
  is_published?: boolean
  change_reason?: string
}

export interface FAQEditorState {
  isLoading: boolean
  isSaving: boolean
  isDraft: boolean
  lastSavedAt?: string
  error?: string
  success?: string
}

// ============================================================================
// ROLE & PERMISSION TYPES
// ============================================================================

export type UserRole = 'admin' | 'instructor' | 'user' | 'guest'

export interface FAQPermissions {
  canRead: boolean
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  canPublish: boolean
  canViewHistory: boolean
}

// ============================================================================
// TIPTAP EDITOR TYPES
// ============================================================================

export interface TiptapEditorContent {
  type: 'doc'
  content: TiptapNode[]
}

export interface TiptapNode {
  type: string
  attrs?: Record<string, unknown>
  content?: TiptapNode[]
  text?: string
  marks?: TiptapMark[]
}

export interface TiptapMark {
  type: string
  attrs?: Record<string, unknown>
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface FAQAnalytics {
  faq_id: string
  question: string
  view_count: number
  helpful_count: number
  unhelpful_count: number
  helpfulness_rate: number // percentage
  created_at: string
  updated_at: string
}

export interface FAQCategoryAnalytics {
  category_name: string
  category_slug: string
  faq_count: number
  total_views: number
  average_helpfulness: number
  most_viewed_faq: string
}

// ============================================================================
// EXPORT TYPE GUARDS
// ============================================================================

export function isFAQ(obj: unknown): obj is FAQ {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'question' in obj &&
    'answer' in obj &&
    'is_published' in obj
  )
}

export function isFAQCategory(obj: unknown): obj is FAQCategory {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'slug' in obj
  )
}
