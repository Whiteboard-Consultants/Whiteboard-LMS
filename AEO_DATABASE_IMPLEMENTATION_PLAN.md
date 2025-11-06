# 🗄️ AEO Database Implementation Plan
## Converting Hardcoded FAQs to Database-Driven System

**Current State:** 25 FAQs hardcoded in `/src/app/(public)/faqs/page.tsx`  
**Target State:** FAQs stored in Supabase, managed via admin panel  
**Estimated Time:** 7-10 hours  
**Complexity:** Medium  

---

## 📋 Step-by-Step Implementation Roadmap

### Phase 1: Database Schema Setup (30 min)
**Goal:** Create tables in Supabase to store FAQs

#### Step 1.1: Create FAQ Tables
```sql
-- Main FAQs table
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  views INT DEFAULT 0,
  helpful_count INT DEFAULT 0,
  UNIQUE(category, question)
);

-- FAQ Version History
CREATE TABLE faq_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  faq_id UUID REFERENCES faqs(id) ON DELETE CASCADE,
  question_before TEXT,
  answer_before TEXT,
  question_after TEXT,
  answer_after TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP DEFAULT NOW(),
  change_type VARCHAR(20)
);

-- FAQ Categories
CREATE TABLE faq_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  icon VARCHAR(10),
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Step 1.2: Set Up Row Level Security (RLS)
```sql
-- Enable RLS on faqs table
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Allow public read published FAQs
CREATE POLICY "Public can read published FAQs"
  ON faqs
  FOR SELECT
  USING (is_published = true);

-- Allow authenticated admins to do anything
CREATE POLICY "Admins can manage FAQs"
  ON faqs
  USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- Similar policies for other tables
ALTER TABLE faq_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_categories ENABLE ROW LEVEL SECURITY;
```

#### Step 1.3: Create Indexes for Performance
```sql
CREATE INDEX idx_faqs_category ON faqs(category);
CREATE INDEX idx_faqs_published ON faqs(is_published);
CREATE INDEX idx_faqs_views ON faqs(views DESC);
CREATE INDEX idx_faq_history_faq_id ON faq_history(faq_id);
```

---

### Phase 2: Migrate Current FAQs to Database (30 min)
**Goal:** Insert the 25 existing FAQs into the database

#### Step 2.1: Insert Categories
```sql
INSERT INTO faq_categories (name, slug, icon, description) VALUES
('Study Abroad', 'study-abroad', '🌍', 'Questions about studying abroad destinations, procedures, and costs'),
('Test Preparation', 'test-prep', '📚', 'IELTS, TOEFL, GMAT, and GRE preparation questions'),
('Career & Benefits', 'career', '💼', 'Career growth, work permits, scholarships, and post-study options'),
('Application & Documents', 'application', '📋', 'Application process, documents, SOP, and LORs');
```

#### Step 2.2: Insert Existing FAQs
Create a migration script that reads the 25 FAQs from the current hardcoded page and inserts them:
```javascript
// migration-script.js
const faqsData = [
  {
    category: 'study-abroad',
    question: 'Which is the best country to study abroad from India?',
    answer: 'The best country depends on your goals...',
    display_order: 1
  },
  // ... 24 more FAQs
];

// Insert into DB
for (const faq of faqsData) {
  await supabase.from('faqs').insert(faq);
}
```

---

### Phase 3: Backend API Layer (1.5 hours)
**Goal:** Create API endpoints for FAQ CRUD operations

#### Step 3.1: Create Types
**File:** `src/lib/types/faq.ts`
```typescript
export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  views: number;
  helpful_count: number;
}

export interface FAQCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  display_order: number;
}

export interface CreateFAQInput {
  category: string;
  question: string;
  answer: string;
  display_order?: number;
  is_published?: boolean;
}
```

#### Step 3.2: Create Database Query Functions
**File:** `src/lib/supabase/faq-queries.ts`
```typescript
import { supabase } from '@/lib/supabase/client';
import type { FAQ, CreateFAQInput } from '@/lib/types/faq';

// Get all published FAQs
export async function getPublishedFAQs(category?: string) {
  let query = supabase
    .from('faqs')
    .select('*')
    .eq('is_published', true)
    .order('category')
    .order('display_order');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  return { data, error };
}

// Get all FAQs (admin only)
export async function getAllFAQs(category?: string) {
  let query = supabase
    .from('faqs')
    .select('*')
    .order('category')
    .order('display_order');
  
  if (category) {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  return { data, error };
}

// Get single FAQ
export async function getFAQ(id: string) {
  const { data, error } = await supabase
    .from('faqs')
    .select('*')
    .eq('id', id)
    .single();
  
  return { data, error };
}

// Create FAQ
export async function createFAQ(faq: CreateFAQInput, userId: string) {
  const { data, error } = await supabase
    .from('faqs')
    .insert({
      ...faq,
      created_by: userId,
      updated_by: userId
    })
    .select()
    .single();
  
  return { data, error };
}

// Update FAQ
export async function updateFAQ(id: string, updates: Partial<FAQ>, userId: string) {
  const { data: faq } = await getFAQ(id);
  
  // Save to history before updating
  if (faq) {
    await supabase.from('faq_history').insert({
      faq_id: id,
      question_before: faq.question,
      answer_before: faq.answer,
      question_after: updates.question || faq.question,
      answer_after: updates.answer || faq.answer,
      changed_by: userId,
      change_type: 'updated'
    });
  }
  
  const { data, error } = await supabase
    .from('faqs')
    .update({
      ...updates,
      updated_by: userId,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  return { data, error };
}

// Delete FAQ
export async function deleteFAQ(id: string, userId: string) {
  // Save to history
  const { data: faq } = await getFAQ(id);
  if (faq) {
    await supabase.from('faq_history').insert({
      faq_id: id,
      question_before: faq.question,
      answer_before: faq.answer,
      changed_by: userId,
      change_type: 'deleted'
    });
  }
  
  const { error } = await supabase
    .from('faqs')
    .delete()
    .eq('id', id);
  
  return { error };
}

// Get FAQ history
export async function getFAQHistory(faqId: string) {
  const { data, error } = await supabase
    .from('faq_history')
    .select('*')
    .eq('faq_id', faqId)
    .order('changed_at', { ascending: false });
  
  return { data, error };
}

// Increment view count
export async function incrementFAQViews(id: string) {
  const { error } = await supabase.rpc('increment_faq_views', { faq_id: id });
  return { error };
}

// Increment helpful count
export async function incrementFAQHelpful(id: string) {
  const { error } = await supabase.rpc('increment_faq_helpful', { faq_id: id });
  return { error };
}
```

#### Step 3.3: Create Caching Layer
**File:** `src/lib/supabase/faq-cache.ts`
```typescript
import type { FAQ, FAQCategory } from '@/lib/types/faq';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const cache = new Map<string, CacheEntry<any>>();

export function getCachedFAQs(): FAQ[] | null {
  const cached = cache.get('all_faqs');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCachedFAQs(faqs: FAQ[]) {
  cache.set('all_faqs', {
    data: faqs,
    timestamp: Date.now()
  });
}

export function getCachedCategories(): FAQCategory[] | null {
  const cached = cache.get('categories');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

export function setCachedCategories(categories: FAQCategory[]) {
  cache.set('categories', {
    data: categories,
    timestamp: Date.now()
  });
}

export function clearFAQCache() {
  cache.delete('all_faqs');
  cache.delete('categories');
}
```

#### Step 3.4: Create API Routes
**File:** `src/app/api/faqs/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getPublishedFAQs, getAllFAQs, createFAQ } from '@/lib/supabase/faq-queries';
import { getCachedFAQs, setCachedFAQs, clearFAQCache } from '@/lib/supabase/faq-cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Check for admin query param
    const isAdmin = request.nextUrl.searchParams.get('admin') === 'true';
    
    if (isAdmin) {
      // Admin: get all FAQs including unpublished
      const supabase = createServerComponentClient({ cookies });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      const { data, error } = await getAllFAQs();
      return NextResponse.json({ data, error });
    } else {
      // Public: get cached or fresh published FAQs
      let cached = getCachedFAQs();
      if (cached) {
        return NextResponse.json({ data: cached, fromCache: true });
      }
      
      const { data, error } = await getPublishedFAQs();
      if (data) {
        setCachedFAQs(data);
      }
      return NextResponse.json({ data, error });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { data, error } = await createFAQ(body, user.id);
    
    if (!error) {
      clearFAQCache();
    }
    
    return NextResponse.json({ data, error });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**File:** `src/app/api/faqs/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getFAQ, updateFAQ, deleteFAQ } from '@/lib/supabase/faq-queries';
import { clearFAQCache } from '@/lib/supabase/faq-cache';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await getFAQ(params.id);
    return NextResponse.json({ data, error });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { data, error } = await updateFAQ(params.id, body, user.id);
    
    if (!error) {
      clearFAQCache();
    }
    
    return NextResponse.json({ data, error });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { error } = await deleteFAQ(params.id, user.id);
    
    if (!error) {
      clearFAQCache();
    }
    
    return NextResponse.json({ error });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### Phase 4: Admin Components (2.5 hours)
**Goal:** Create admin dashboard for FAQ management

#### Step 4.1: FAQ List Component
**File:** `src/components/admin/faq-manager/faq-list.tsx`
- Display all FAQs in table format
- Filter by category, published status
- Sort by date, views, helpfulness
- Bulk actions (publish, unpublish, delete)
- Edit/delete buttons

#### Step 4.2: FAQ Editor Component
**File:** `src/components/admin/faq-manager/faq-editor.tsx`
- Form for creating/editing FAQs
- Category dropdown
- Rich text editor for answers
- Display order input
- Published toggle
- Auto-save drafts
- Preview with schema markup

#### Step 4.3: Category Manager
**File:** `src/components/admin/faq-manager/faq-categories.tsx`
- Create/edit/delete categories
- Reorder categories

#### Step 4.4: History Viewer
**File:** `src/components/admin/faq-manager/faq-history.tsx`
- View change history
- Compare versions
- Rollback to previous version

#### Step 4.5: Admin Pages
**File:** `src/app/(main)/admin/faqs/page.tsx` - FAQ list dashboard  
**File:** `src/app/(main)/admin/faqs/new/page.tsx` - Create new FAQ  
**File:** `src/app/(main)/admin/faqs/[id]/edit/page.tsx` - Edit FAQ  

---

### Phase 5: Update Public FAQ Page (1.5 hours)
**Goal:** Modify public FAQ page to fetch from database

**File:** `src/app/(public)/faqs/page.tsx` (Updated)
```typescript
import { getPublishedFAQs } from '@/lib/supabase/faq-queries';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const revalidate = 3600; // Revalidate every 1 hour

export default async function FAQPage() {
  const { data: faqs } = await getPublishedFAQs();
  
  // Group FAQs by category
  const categorizedFAQs = faqs?.reduce((acc, faq) => {
    if (!acc[faq.category]) acc[faq.category] = [];
    acc[faq.category].push(faq);
    return acc;
  }, {});
  
  // Generate FAQ schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs?.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer.split('\n').map(line => line.trim()).join(' ')
      }
    }))
  };
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      
      <div className="bg-background dark:bg-black py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-12">Find answers to common questions about studying abroad, test prep, and careers.</p>
          
          {Object.entries(categorizedFAQs || {}).map(([category, categoryFAQs]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6">{category}</h2>
              <Accordion type="single" collapsible>
                {(categoryFAQs as any[]).map(faq => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      <div className="whitespace-pre-wrap space-y-2">
                        {faq.answer.split('\n').map((line, i) => (
                          <div key={i} className={line.startsWith('•') || /^\d+\./.test(line) ? 'ml-2' : ''}>
                            {line}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
```

---

### Phase 6: Admin Panel Integration (1 hour)
**Goal:** Add FAQ management to admin menu

**File:** `src/components/admin/admin-sidebar.tsx` (Update)
```typescript
// Add FAQ Management link to sidebar
<NavLink href="/admin/faqs" icon={HelpCircle}>
  FAQ Management
</NavLink>
```

---

## 🎯 Decision Questions to Answer

Before implementation, clarify these:

| Question | Options | Impact |
|----------|---------|--------|
| **Update Frequency?** | Weekly / Monthly / As-needed | Determines caching strategy |
| **Who updates FAQs?** | Single admin / Team | Determines audit trail needs |
| **Version History?** | Yes / No | Adds 30 min implementation |
| **Approval Workflow?** | Direct / Draft+Approve | Adds complexity |
| **Rich Text Editor?** | Markdown / WYSIWYG / Plain | UI component choice |
| **Timeline?** | Immediate / Later | Priority level |

---

## 📈 Implementation Timeline

```
Phase 1: Database Setup         → 30 min
Phase 2: Migrate FAQs           → 30 min
Phase 3: Backend APIs           → 1.5 hours
Phase 4: Admin Components       → 2.5 hours
Phase 5: Update Public Page     → 1.5 hours
Phase 6: Integration            → 1 hour
Testing & Bug Fixes             → 1 hour
─────────────────────────────────────────
TOTAL                           → ~8-9 hours
```

---

## ✅ Success Criteria

After implementation:

✅ All 25 FAQs stored in Supabase database  
✅ Admin dashboard to create/edit/delete FAQs  
✅ Public FAQ page pulls from database (cached)  
✅ Change history tracking  
✅ No hardcoded FAQ data in code  
✅ Zero downtime migration  
✅ Same SEO performance (schema markup intact)  
✅ Admin users can update FAQs without code deployment  

---

## 🚀 Recommended Starting Point

**Start with:** Phases 1-2 (Database + Migration) = 1 hour  
**Then:** Phase 3 (Backend APIs) = 1.5 hours  
**Result:** Can already fetch FAQs from database  

This gives you a working foundation to build admin UI on top of.

---

## ❓ Questions for You

1. **Should we implement this now or later?**
2. **Which rich text option do you prefer?** (Markdown/WYSIWYG/Plain)
3. **Do you need version history/audit trail?**
4. **Who will be updating FAQs?** (You/Team/Admins)
5. **Do you need approval workflow or direct publishing?**

**Ready to start?** Let me know and we can begin with Phase 1!
