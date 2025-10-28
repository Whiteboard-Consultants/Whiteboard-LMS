# 🗄️ AEO Database-Driven Architecture
## WhitedgeLMS | FAQ Management System with Admin Panel

**Status:** Design Discussion  
**Database:** Supabase PostgreSQL  
**Admin Panel:** Built into existing admin routes  
**Goal:** Enable dynamic FAQ updates without code deployment

---

## Overview & Discussion Points

This document outlines how to implement a **database-driven FAQ system** that allows admins to update content in real-time through the admin panel.

### Key Questions to Discuss:

1. **FAQ Update Frequency?**
   - How often do FAQs need updates? (Weekly? Monthly? As needed?)
   - Who will manage updates? (Single admin? Team?)
   
2. **Admin User Roles?**
   - Should all admins edit FAQs, or specific FAQ managers?
   - Should we track who edited what and when?
   - Do we need approval workflows?

3. **Caching Strategy?**
   - Cache FAQ data to reduce database queries?
   - How long should cache persist? (1 hour? 1 day?)
   - Manual cache clear option?

4. **Version History?**
   - Track previous FAQ versions?
   - Ability to rollback to previous versions?
   - Audit trail of changes?

5. **Integration with Existing Setup?**
   - Add FAQ management to your current admin routes at `/admin`?
   - Does your admin system have role-based access control (RBAC)?
   - Current authentication system for admins?

---

## Proposed Architecture

### 1. Database Schema

```sql
-- Main FAQs table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,  -- 'study_abroad', 'test_prep', 'visa', 'financial', 'career', 'courses'
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  views INT DEFAULT 0,  -- Track popularity
  helpful_count INT DEFAULT 0,  -- Track usefulness
  UNIQUE(category, question)  -- Prevent duplicate Q&As
);

-- FAQ Version History (optional but recommended)
CREATE TABLE faq_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID REFERENCES faqs(id) ON DELETE CASCADE,
  question_before TEXT,
  answer_before TEXT,
  question_after TEXT,
  answer_after TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  change_type VARCHAR(20)  -- 'created', 'updated', 'deleted'
);

-- FAQ Categories (optional, for better organization)
CREATE TABLE faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  icon VARCHAR(10),  -- Emoji or icon name
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Backend Structure

```
src/
├── components/
│   ├── faq/
│   │   ├── faq-display.tsx          # Public FAQ page
│   │   ├── faq-accordion.tsx        # Reusable FAQ component
│   │   └── faq-schema.tsx           # Schema markup
│   └── admin/
│       └── faq-manager/
│           ├── faq-list.tsx         # List all FAQs
│           ├── faq-editor.tsx       # Edit/create FAQs
│           ├── faq-categories.tsx   # Manage categories
│           └── faq-history.tsx      # View change history
│
├── app/
│   ├── (public)/
│   │   └── faqs/
│   │       └── page.tsx             # Public FAQ page
│   │
│   ├── admin/
│   │   └── faqs/
│   │       ├── page.tsx             # FAQ management dashboard
│   │       ├── [id]/
│   │       │   └── edit/
│   │       │       └── page.tsx     # Edit specific FAQ
│   │       └── new/
│   │           └── page.tsx         # Create new FAQ
│   │
│   └── api/
│       └── faqs/
│           ├── route.ts             # GET/POST/DELETE FAQs
│           ├── [id]/route.ts        # GET/PUT/DELETE single FAQ
│           └── categories/route.ts  # Category management
│
└── lib/
    ├── supabase/
    │   ├── faq-queries.ts           # Database queries
    │   └── faq-cache.ts             # Caching logic
    └── types/
        └── faq.ts                   # TypeScript types
```

### 3. Key Features

#### A. Public FAQ Page (`/faqs`)
- Display all published FAQs
- Filter by category
- Search functionality
- FAQ schema markup for SEO
- "Was this helpful?" feedback
- View count tracking

#### B. Admin FAQ Manager (`/admin/faqs`)
- **List View:**
  - All FAQs with filters (category, published status)
  - Sort by date, views, helpfulness
  - Bulk actions (publish, unpublish, delete)

- **Create/Edit:**
  - Rich text editor for answers
  - Category selection
  - Display order management
  - Preview with schema markup
  - Auto-save drafts
  - Change tracking

- **Analytics:**
  - Views per FAQ
  - Helpful votes
  - Most viewed FAQs
  - Trending questions

#### C. Version History & Audit Trail
- Track all changes with timestamps
- Show who changed what and when
- Ability to revert to previous versions
- Change diff display

---

## Implementation Approach

### Phase 1: Database Setup (30 minutes)
- Create FAQ tables in Supabase
- Set up Row Level Security (RLS)
- Create indexes for performance

### Phase 2: Backend APIs (2 hours)
- CRUD endpoints for FAQs
- Query optimization
- Caching layer

### Phase 3: Admin Components (3 hours)
- FAQ list page
- Create/edit forms
- Category management
- History viewer

### Phase 4: Public Pages (2 hours)
- FAQ display page
- Search and filtering
- Schema markup integration

### Phase 5: Analytics & Polish (1 hour)
- View tracking
- Helpful votes
- Performance optimization

**Total Time: ~8-10 hours**

---

## Before We Build - Key Decisions Needed

### Decision 1: Approval Workflow?
```
Option A: Direct Publishing (Simple)
Admin edits → Saved to DB → Live immediately

Option B: Draft & Approve (Complex)
Admin edits → Saved as draft → Another admin approves → Published
```
**Recommendation:** Start with Option A, upgrade to B later if needed

### Decision 2: Caching Strategy?
```
Option A: No Cache (Simplest)
Every request queries database

Option B: In-Memory Cache (Recommended)
- Cache FAQ list for 1 hour
- Clear manually or on update
- Redis optional

Option C: CDN Cache (Advanced)
- Cached at edge
- Longer TTL (1 day)
```
**Recommendation:** Option B for balance of speed and freshness

### Decision 3: Rich Text or Markdown?
```
Option A: Plain Text (Simplest)
No formatting, stores as-is

Option B: Markdown (Recommended)
Write markdown, display as HTML
Edit in code-like interface

Option C: Rich Text Editor (Complex)
WYSIWYG editor (TipTap available in your project)
Full formatting support
```
**Recommendation:** Option B (markdown) for simplicity + flexibility

### Decision 4: Change History?
```
Option A: No History (Simplest)
Just track updated_at timestamp

Option B: Version History (Recommended)
Store previous versions in faq_history table
Ability to revert/compare

Option C: Full Audit Trail (Complex)
Every keystroke logged
Full diff on changes
```
**Recommendation:** Option B - useful for compliance & mistakes

### Decision 5: Multi-Admin Collaboration?
```
Option A: Single Admin
One person manages all FAQs

Option B: Multiple Admins (Recommended)
Track who made changes
Prevents accidental overwrites
```
**Recommendation:** Option B - better for team management

---

## Security & Performance Considerations

### Security
- ✅ Row Level Security (RLS) - Only admins can edit
- ✅ Created_by / Updated_by tracking - Audit trail
- ✅ Published status - Control visibility
- ✅ API auth check - Verify admin role before allowing edits

### Performance
- ✅ Indexed on category & published status
- ✅ Pagination for list views (20 per page)
- ✅ Caching FAQ list at application level
- ✅ Lazy load history only when requested

### SEO (AEO)
- ✅ FAQ schema markup for featured snippets
- ✅ Indexed by search engines
- ✅ Track which FAQs get citations
- ✅ Update based on performance metrics

---

## Proposed Tech Stack

| Component | Technology | Why? |
|-----------|-----------|------|
| **Database** | Supabase (PostgreSQL) | Already in use |
| **API** | Next.js API Routes | Integrated, serverless |
| **Admin Form** | React Hook Form + Zod | Type-safe, already in use |
| **Rich Text** | Markdown (optional TipTap) | Simple + powerful |
| **Caching** | In-Memory JS Map/Redis | Simple + scalable |
| **Auth** | Supabase Auth | Already integrated |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Public FAQ Page                         │
│                       `/faqs`                               │
│                                                              │
│  - Display FAQs from cache/DB                              │
│  - Filter by category                                      │
│  - Search functionality                                    │
│  - FAQ Schema markup                                       │
│  - Track views & helpfulness                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │     Caching Layer (1 hour)   │
        │  - In-memory FAQ list cache  │
        │  - Cache invalidate on edit  │
        └──────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │    Supabase PostgreSQL DB    │
        │  - faqs table                │
        │  - faq_history table         │
        │  - faq_categories table      │
        └──────────────────────────────┘
                       ▲
                       │
┌──────────────────────────────────────────────────────────────┐
│                  Admin FAQ Manager                           │
│                    `/admin/faqs`                             │
│                                                              │
│  - Create/Edit/Delete FAQs                                 │
│  - View change history                                     │
│  - Bulk actions                                            │
│  - Category management                                     │
│  - Analytics dashboard                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Next Steps - What We'll Build

### If you approve:

1. **Database Schema Creation**
   - Run SQL to create tables
   - Set up RLS policies
   - Create indexes

2. **API Layer**
   - `GET /api/faqs` - Fetch all published FAQs
   - `POST /api/faqs` - Create new FAQ (admin only)
   - `PUT /api/faqs/[id]` - Update FAQ (admin only)
   - `DELETE /api/faqs/[id]` - Delete FAQ (admin only)
   - `GET /api/faqs/categories` - Get all categories

3. **Admin Components**
   - FAQ list dashboard
   - Create/edit form with preview
   - Category manager
   - Change history viewer

4. **Public Components**
   - FAQ display page
   - Search/filter interface
   - Schema markup generation

5. **Integration Points**
   - Add to admin navigation menu
   - Permissions check on admin routes
   - Cache invalidation on updates

---

## File Size & Effort Estimate

| Component | Lines of Code | Time |
|-----------|---------------|------|
| Database schema | 150 | 0.5h |
| API endpoints | 300 | 1.5h |
| Admin components | 500 | 2.5h |
| Public FAQ page | 250 | 1.5h |
| Types & utilities | 200 | 1h |
| **Total** | **~1,400** | **~7.5h** |

---

## Questions for You

Before we proceed, please clarify:

1. **Who will update FAQs?** (Single admin? Team?)
2. **Update frequency?** (Manually as needed? Regular schedule?)
3. **Need version history?** (Yes/No?)
4. **Approval workflow?** (Direct publish or draft+approve?)
5. **Cache duration?** (1 hour? 1 day? Real-time?)
6. **Text format preference?** (Markdown? Rich text? Plain?)
7. **Multi-admin support?** (Track who changed what?)
8. **Timeline?** (Build immediately? Later?)

---

## Expected Outcome

After implementation:

✅ FAQs stored in database (not hardcoded)  
✅ Admin panel to create/edit/delete FAQs  
✅ Public FAQ page pulling from database  
✅ Change tracking & version history  
✅ Cached for performance  
✅ SEO-optimized with schema markup  
✅ Analytics tracking (views, helpfulness)  
✅ Team-ready for multiple admins

**Result:** FAQs can be updated in real-time without code deployment!

---

**Created:** October 24, 2025  
**Status:** Awaiting your discussion & approval  
**Next:** Once approved, we'll build the full implementation
