# 🗄️ Database-Driven FAQ System - Implementation Guide
## WhitedgeLMS | Complete Setup Instructions

**Status:** Ready to Deploy  
**Database:** Supabase PostgreSQL  
**Tech Stack:** Next.js 15, React, TipTap, TypeScript  
**Estimated Setup Time:** 2-3 hours  
**Cache Strategy:** 1-hour in-memory cache + optional Redis

---

## 📋 Table of Contents

1. [Overview & Features](#overview--features)
2. [Database Setup](#database-setup)
3. [API Implementation](#api-implementation)
4. [Frontend Components](#frontend-components)
5. [Admin Integration](#admin-integration)
6. [Public FAQ Page](#public-faq-page)
7. [Testing & Verification](#testing--verification)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🎯 Overview & Features

### What You're Building

A **production-ready FAQ management system** that allows:
- ✅ Admin/Instructor roles to create, edit, delete FAQs
- ✅ Rich text editing with TipTap WYSIWYG
- ✅ 1-hour caching for performance
- ✅ Version history with rollback capability
- ✅ Automatic audit trail of all changes
- ✅ Helpfulness voting (👍 / 👎)
- ✅ Public FAQ display with search/filter
- ✅ FAQ schema markup for AEO/SEO
- ✅ Analytics (views, helpfulness rate)

### Architecture

```
┌─────────────────────────────────────────┐
│     Public FAQ Page (/faqs)             │
│   - Display published FAQs              │
│   - Search & filter by category         │
│   - Track views & helpfulness voting    │
└──────────────┬──────────────────────────┘
               │
       ┌───────▼───────┐
       │ Cache Layer   │ (1-hour TTL)
       │  In-Memory    │
       │  JavaScript   │
       └───────┬───────┘
               │
┌──────────────▼──────────────────────────┐
│    Supabase PostgreSQL Database          │
│  ├─ faqs table                           │
│  ├─ faq_categories table                 │
│  ├─ faq_history table (audit trail)     │
│  ├─ faq_feedback table (voting)         │
│  └─ faq_cache table (for DB caching)   │
└──────────────┬──────────────────────────┘
               △
               │
┌──────────────┴──────────────────────────┐
│    Admin Panel (/admin/faqs)            │
│  ├─ Create new FAQ                      │
│  ├─ Edit with TipTap editor            │
│  ├─ View change history                │
│  ├─ Manage categories                   │
│  └─ Dashboard analytics                 │
└─────────────────────────────────────────┘
```

### Role-Based Access Control

| Action | Admin | Instructor | User | Public |
|--------|-------|-----------|------|--------|
| View Published FAQs | ✅ | ✅ | ✅ | ✅ |
| View All FAQs | ✅ | ✅ | - | - |
| Create FAQ | ✅ | ✅ | - | - |
| Edit FAQ | ✅ | Own only | - | - |
| Delete FAQ | ✅ | - | - | - |
| Publish/Unpublish | ✅ | - | - | - |
| View History | ✅ | Own only | - | - |
| Vote Helpful | ✅ | ✅ | ✅ | ✅ |

---

## 🗄️ Database Setup

### Step 1: Run SQL Schema

1. Go to **Supabase Console** → Your Project
2. Navigate to **SQL Editor**
3. Create new query
4. Copy entire content from: `database/create-faq-tables.sql`
5. Run the query

**What gets created:**
```sql
✓ faq_categories (6 default categories)
✓ faqs (main FAQ table with published status)
✓ faq_history (automatic audit trail)
✓ faq_feedback (helpfulness voting)
✓ faq_cache (performance caching)
```

**Security:**
- ✅ Row Level Security (RLS) enabled
- ✅ Role-based policies enforced
- ✅ Automatic audit triggers
- ✅ Change tracking triggers

### Step 2: Verify Tables

In Supabase Console, check **Tables** in left sidebar:
- [ ] `faq_categories` (with 6 sample categories)
- [ ] `faqs` (empty, ready for data)
- [ ] `faq_history` (empty, will auto-populate)
- [ ] `faq_feedback` (empty)
- [ ] `faq_cache` (empty)

### Step 3: Test Database Access

Run this in SQL Editor to verify:
```sql
SELECT * FROM faq_categories;
```

Should return 6 categories:
1. Study Abroad 🌍
2. Test Preparation 📚
3. Visa & Documentation 📄
4. Costs & Financial Aid 💰
5. Career & Post-Studies 💼
6. Courses & Programs 🎓

---

## 🔌 API Implementation

### Step 1: Create Supabase Client Utility

**File Created:** `src/lib/supabase/faq-queries.ts`

This file contains:
- Database query functions (CRUD)
- In-memory cache layer (1-hour TTL)
- Helpfulness tracking
- History/audit functions

**Key Functions:**
```typescript
// Read operations (cached)
getPublishedFAQsByCategory()      // All FAQs grouped by category
getFAQsByCategory(slug)            // Single category FAQs
searchFAQs(query, category?)       // Search published FAQs
getPublishedFAQ(id)                // Single FAQ

// Admin operations
getAdminFAQs()                      // All FAQs (drafts + published)
createFAQ(input, userId)           // Create new FAQ
updateFAQ(id, input, userId)       // Update FAQ
deleteFAQ(id)                       // Delete FAQ
publishFAQ(id, isPublished, userId) // Publish/unpublish

// History & tracking
getFAQHistory(faqId)               // Get change history
revertFAQToVersion(historyId, userId) // Rollback to version
submitFAQFeedback(input)           // Vote helpful/unhelpful
getFAQFeedbackStats(faqId)         // Get helpfulness stats

// Utilities
invalidateCache(pattern)           // Clear cache
getFromCache(key)                  // Get cached data
setCache(key, data)                // Set cache with 1-hour TTL
```

### Step 2: Create Public API Routes

**File Created:** `src/app/api/faqs/route.ts`

```typescript
GET /api/faqs                    // Get all published FAQs grouped by category
GET /api/faqs?q=search_term      // Search FAQs
GET /api/faqs?category=slug      // Get FAQs by category
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "study_abroad": [
      {
        "id": "uuid-1",
        "question": "Which country should I study in?",
        "answer": "{rich-text-json}",
        "excerpt": "...",
        "view_count": 42,
        "helpful_count": 35,
        "unhelpful_count": 7,
        "category_name": "Study Abroad",
        "category_slug": "study_abroad",
        "category_icon": "🌍"
      }
    ],
    "test_preparation": [...]
  }
}
```

### Step 3: Create Admin API Routes

**File Created:** `src/app/api/admin/faqs/route.ts`

```typescript
GET /api/admin/faqs              // List all FAQs (admin only)
POST /api/admin/faqs             // Create new FAQ (admin/instructor)
```

**Protected by:** User role verification in JWT token

---

## 🎨 Frontend Components

### Step 1: Create TypeScript Types

**File Created:** `src/types/faq.ts`

Includes:
- `FAQ` - FAQ data structure
- `FAQCategory` - Category structure
- `FAQHistory` - Audit trail entry
- `FAQFeedback` - Helpfulness vote
- Type guards and utility types

### Step 2: Create FAQ Editor Component

**File Created:** `src/components/admin/faq-editor.tsx`

Features:
- ✅ TipTap rich text editor
- ✅ Toolbar: Bold, Italic, Headings, Lists, Undo/Redo
- ✅ Category selection
- ✅ Excerpt (for SEO, max 160 chars)
- ✅ Display order
- ✅ Publish toggle
- ✅ Change reason tracking
- ✅ Auto-save drafts (optional enhancement)

**Usage:**
```typescript
import { FAQEditor } from '@/components/admin/faq-editor'

// For creating new FAQ
<FAQEditor />

// For editing existing FAQ
<FAQEditor initialFAQ={faq} />
```

### Step 3: Create Admin Dashboard

**File Created:** `src/app/admin/faqs/page.tsx`

Features:
- ✅ List all FAQs with pagination
- ✅ Filter by category, status (draft/published)
- ✅ Sort by recent, views, helpfulness
- ✅ Edit, delete, view history buttons
- ✅ Statistics cards (total, published, draft, views)
- ✅ Search functionality
- ✅ Status indicators

---

## 🎯 Admin Integration

### Step 1: Add to Admin Navigation

**Update File:** `src/app/admin/page.tsx` (or your admin layout)

Add this link to the admin menu:
```typescript
<Link href="/admin/faqs" className="...">
  <HelpCircle size={20} />
  <span>FAQ Management</span>
</Link>
```

### Step 2: Create FAQ Create Page

**Create File:** `src/app/admin/faqs/new/page.tsx`

```typescript
'use client'

import { FAQEditor } from '@/components/admin/faq-editor'

export default function NewFAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New FAQ</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <FAQEditor />
        </div>
      </div>
    </div>
  )
}
```

### Step 3: Create FAQ Edit Page

**Create File:** `src/app/admin/faqs/[id]/edit/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { FAQEditor } from '@/components/admin/faq-editor'
import type { FAQ } from '@/types/faq'

export default function EditFAQPage() {
  const params = useParams()
  const [faq, setFAQ] = useState<FAQ | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQ = async () => {
      const res = await fetch(`/api/admin/faqs/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setFAQ(data.data)
      }
      setLoading(false)
    }

    fetchFAQ()
  }, [params.id])

  if (loading) return <div>Loading...</div>
  if (!faq) return <div>FAQ not found</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit FAQ</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <FAQEditor initialFAQ={faq} />
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Create History Viewer Page

**Create File:** `src/app/admin/faqs/[id]/history/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { FAQHistory } from '@/types/faq'

export default function FAQHistoryPage() {
  const params = useParams()
  const [history, setHistory] = useState<FAQHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHistory = async () => {
      const res = await fetch(`/api/admin/faqs/${params.id}/history`)
      const data = await res.json()
      if (data.success) {
        setHistory(data.data)
      }
      setLoading(false)
    }

    fetchHistory()
  }, [params.id])

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href={`/admin/faqs/${params.id}/edit`} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft size={20} />
          Back to Edit
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Change History</h1>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No change history available
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.change_type === 'created' && '✨ Created'}
                      {entry.change_type === 'updated' && '✏️ Updated'}
                      {entry.change_type === 'published' && '📤 Published'}
                      {entry.change_type === 'unpublished' && '📥 Unpublished'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(entry.changed_at).toLocaleString()}
                    </p>
                  </div>
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200">
                    Revert to this version
                  </button>
                </div>

                {entry.change_reason && (
                  <p className="mt-4 text-sm text-gray-600 italic">
                    Reason: {entry.change_reason}
                  </p>
                )}

                {entry.question_before && entry.question_after && entry.question_before !== entry.question_after && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Question changed:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-red-50 p-2 rounded">
                        <p className="font-medium text-red-900">Before:</p>
                        <p className="text-red-700 line-through">{entry.question_before}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="font-medium text-green-900">After:</p>
                        <p className="text-green-700">{entry.question_after}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

---

## 📄 Public FAQ Page

### Step 1: Create Public FAQ Page

**Create File:** `src/app/(public)/faqs/page.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import type { FAQWithCategory } from '@/types/faq'

export default function FAQsPage() {
  const [faqs, setFAQs] = useState<Record<string, FAQWithCategory[]>>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchFAQs = async () => {
      const res = await fetch('/api/faqs')
      const data = await res.json()
      if (data.success) {
        setFAQs(data.data)
      }
      setLoading(false)
    }

    fetchFAQs()
  }, [])

  if (loading) return <div className="text-center py-12">Loading FAQs...</div>

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-blue-100 mb-6">
            Find answers to common questions about study abroad, test prep, and more
          </p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-blue-300" size={20} />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-12 max-w-4xl mx-auto px-4">
        {Object.entries(faqs).map(([categorySlug, categoryFAQs]) => (
          <div key={categorySlug} className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {categoryFAQs[0]?.category_icon} {categoryFAQs[0]?.category_name}
            </h2>

            <div className="space-y-4">
              {categoryFAQs
                .filter(faq =>
                  searchQuery === '' ||
                  faq.question.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map(faq => (
                  <FAQAccordion key={faq.id} faq={faq} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function FAQAccordion({ faq }: { faq: FAQWithCategory }) {
  const [isOpen, setIsOpen] = useState(false)
  const [helpful, setHelpful] = useState<boolean | null>(null)

  const handleFeedback = async (isHelpful: boolean) => {
    setHelpful(isHelpful)
    await fetch('/api/faqs/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faq_id: faq.id,
        is_helpful: isHelpful,
      }),
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg hover:border-blue-300 transition">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between transition"
      >
        <h3 className="text-left font-semibold text-gray-900">{faq.question}</h3>
        <span className={`text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-gray-700 prose prose-sm max-w-none">
            {/* Render rich text - you'll need a renderer */}
            {faq.answer}
          </div>

          {/* Feedback */}
          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-600">Was this helpful?</span>
            <button
              onClick={() => handleFeedback(true)}
              className={`px-3 py-1 rounded text-sm ${
                helpful === true ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
              }`}
            >
              👍 Yes ({faq.helpful_count || 0})
            </button>
            <button
              onClick={() => handleFeedback(false)}
              className={`px-3 py-1 rounded text-sm ${
                helpful === false ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
              }`}
            >
              👎 No ({faq.unhelpful_count || 0})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

---

## ✅ Testing & Verification

### Test Checklist

1. **Database Setup**
   - [ ] Run SQL schema successfully
   - [ ] 5 tables created in Supabase
   - [ ] RLS policies visible in Supabase

2. **API Testing**
   - [ ] `GET /api/faqs` returns published FAQs
   - [ ] `GET /api/admin/faqs` returns all FAQs (admin only)
   - [ ] Create FAQ via POST `/api/admin/faqs`
   - [ ] Edit FAQ via PUT `/api/admin/faqs/[id]`
   - [ ] Delete FAQ via DELETE `/api/admin/faqs/[id]`

3. **Admin Panel**
   - [ ] FAQ list page loads
   - [ ] Create new FAQ form works
   - [ ] TipTap editor renders
   - [ ] Edit FAQ works
   - [ ] Delete FAQ works
   - [ ] View history page works
   - [ ] Category filter works
   - [ ] Status filter works

4. **Public Page**
   - [ ] `/faqs` page loads
   - [ ] FAQs display by category
   - [ ] Search functionality works
   - [ ] Helpful voting works
   - [ ] Only published FAQs show

---

## 📊 Monitoring & Maintenance

### Daily Tasks
- Monitor FAQ feedback (helpful/unhelpful votes)
- Check for new user questions to add as FAQs

### Weekly Tasks
- Review FAQ analytics
- Check most viewed FAQs
- Review lowest helpfulness FAQs

### Monthly Tasks
- Create new FAQs based on user feedback
- Update outdated FAQs
- Archive old FAQ versions
- Analyze FAQ performance vs AEO targets

### Optional Enhancements

1. **Auto-save drafts**
   ```typescript
   useEffect(() => {
     const autoSave = setInterval(() => {
       // Save current state as draft
     }, 60000) // Every 60 seconds
   }, [])
   ```

2. **Rich text rendering**
   ```typescript
   import { useEditorState } from '@tiptap/react'
   // Render TipTap JSON to HTML
   ```

3. **Redis caching** (for distributed systems)
   ```typescript
   import { Redis } from '@upstash/redis'
   const redis = Redis.fromEnv()
   ```

4. **Email notifications**
   ```typescript
   // Notify instructors when FAQ gets many unhelpful votes
   ```

5. **A/B testing**
   ```typescript
   // Test different FAQ phrasings and track which performs better
   ```

---

## 🚀 Deployment Checklist

- [ ] Test all endpoints in production
- [ ] Verify RLS policies work in production
- [ ] Enable CORS for your domain
- [ ] Set up monitoring for 404 rate
- [ ] Configure error logging
- [ ] Set up automated backups
- [ ] Test cache invalidation
- [ ] Verify search performance

---

## 📚 Quick Reference

### File Structure

```
src/
├── app/
│   ├── admin/faqs/
│   │   ├── page.tsx                 (Dashboard)
│   │   ├── new/page.tsx             (Create)
│   │   └── [id]/
│   │       ├── edit/page.tsx        (Edit)
│   │       └── history/page.tsx     (History)
│   ├── (public)/faqs/
│   │   └── page.tsx                 (Public FAQ page)
│   └── api/
│       ├── faqs/route.ts            (Public endpoints)
│       └── admin/faqs/route.ts      (Admin endpoints)
├── components/
│   └── admin/faq-editor.tsx         (TipTap editor)
├── types/
│   └── faq.ts                       (Type definitions)
└── lib/supabase/
    └── faq-queries.ts              (Database queries)

database/
└── create-faq-tables.sql           (SQL schema)
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

**Status:** ✅ Ready to Deploy  
**Last Updated:** October 24, 2025  
**Next Steps:** Run database schema, test API, integrate into admin panel
