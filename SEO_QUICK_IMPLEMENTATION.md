# ⚡ SEO/AEO/SXO/GEO Quick Implementation Guide
## WhitedgeLMS - Immediate Actions

---

## 🚨 CRITICAL - Do First (Next 48 Hours)

### 1. Add Course Schema to All Course Pages

**File to update:** `src/app/(public)/courses/[courseId]/page.tsx`

```typescript
import { Metadata } from 'next'

export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const course = await getCourse(params.courseId)
  
  return {
    title: `${course.title} | Online Courses | Whiteboard Consultants`,
    description: `${course.title} course by Whiteboard Consultants. Duration: ${course.duration}. Price: ₹${course.price}. Rating: ${course.rating}/5. Enroll now for expert guidance.`,
    alternates: {
      canonical: `/courses/${params.courseId}`
    }
  }
}

export default function CoursePage({ params }) {
  const course = await getCourse(params.courseId)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": course.title,
            "description": course.description,
            "image": [
              course.imageUrl
            ],
            "provider": {
              "@type": "Organization",
              "name": "Whiteboard Consultants",
              "sameAs": "https://www.whiteboardconsultant.com",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.whiteboardconsultant.com/logo.png",
                "width": 250,
                "height": 60
              }
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": course.rating,
              "ratingCount": course.reviewCount || 1,
              "bestRating": "5"
            },
            "coursePrerequisites": course.prerequisites || "None",
            "duration": course.duration,
            "offers": {
              "@type": "Offer",
              "url": `https://www.whiteboardconsultant.com/courses/${params.courseId}`,
              "price": course.price.toString(),
              "priceCurrency": "INR",
              "availability": "https://schema.org/InStock",
              "validFrom": new Date().toISOString().split('T')[0]
            }
          })
        }}
      />
      
      {/* Rest of your course page */}
    </>
  )
}
```

### 2. Add Article Schema to All Blog Posts

**File to update:** `src/app/(public)/blog/[slug]/page.tsx`

```typescript
import { Metadata } from 'next'

export const generateMetadata = async ({ params }): Promise<Metadata> => {
  const post = await getPost(params.slug)
  
  return {
    title: `${post.title} | Blog | Whiteboard Consultants`,
    description: post.excerpt.substring(0, 155),
    alternates: {
      canonical: `/blog/${params.slug}`
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `/blog/${params.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.imageUrl,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    }
  }
}

export default function BlogPost({ params }) {
  const post = await getPost(params.slug)
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "image": [post.imageUrl],
            "datePublished": post.publishedAt,
            "dateModified": post.updatedAt || post.publishedAt,
            "author": {
              "@type": "Person",
              "name": post.author,
              "url": "https://www.whiteboardconsultant.com/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Whiteboard Consultants",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.whiteboardconsultant.com/logo.png",
                "width": 250,
                "height": 60
              }
            },
            "description": post.excerpt,
            "articleBody": post.content
          })
        }}
      />
      
      {/* Rest of your blog post */}
    </>
  )
}
```

### 3. Create FAQ Schema Component

**File to create:** `src/components/faq-schema.tsx`

```typescript
interface FAQ {
  question: string
  answer: string
}

interface FAQSchemaProps {
  faqs: FAQ[]
}

export function FAQSchema({ faqs }: FAQSchemaProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": faq.answer
            }
          }))
        })
      }}
    />
  )
}
```

### 4. Update Blog Page Title

**File to update:** `src/app/(public)/blog/page.tsx`

```typescript
export const metadata: Metadata = {
  title: 'Education Blog | Study Abroad, Test Prep & Career Tips | Whiteboard Consultants',
  description: 'Read expert articles on study abroad, IELTS/TOEFL/GMAT/GRE preparation, college admissions, and career development from Whiteboard Consultants.',
  alternates: {
    canonical: '/blog',
  },
}
```

---

## ⚡ HIGH PRIORITY (This Week)

### 5. Create FAQ Page

**File to create:** `src/app/(public)/faqs/page.tsx`

```typescript
import { Metadata } from 'next'
import { FAQSchema } from '@/components/faq-schema'

export const metadata: Metadata = {
  title: 'FAQs | Study Abroad, Test Prep & Education Consulting',
  description: 'Frequently asked questions about studying abroad, IELTS/TOEFL/GMAT/GRE preparation, and education consulting from Whiteboard Consultants in Kolkata.',
  alternates: {
    canonical: '/faqs',
  },
}

const faqs = [
  {
    question: "Which is the best country to study abroad from India?",
    answer: "The best country depends on your field of study, budget, and career goals. USA is excellent for technology and research, Canada for immigration opportunities, UK for shorter programs, Germany for affordable education, and Australia for quality of life. Each has unique advantages for Indian students."
  },
  {
    question: "How much does it cost to study abroad from India?",
    answer: "Costs vary significantly by country and program: USA ($30,000-70,000/year), Canada ($20,000-40,000/year), UK (£25,000-45,000/year), Germany (€10,000-20,000/year), Australia ($25,000-50,000/year). This includes tuition, accommodation, and living expenses."
  },
  {
    question: "What is the procedure to study abroad?",
    answer: "The typical process includes: 1) Choose destination and university, 2) Prepare for entrance exams (IELTS, GMAT, GRE), 3) Prepare application documents, 4) Write SOP and get LORs, 5) Apply to universities, 6) Secure financial aid if needed, 7) Apply for student visa, 8) Arrange accommodation and finances"
  },
  {
    question: "How long does it take to prepare for studying abroad?",
    answer: "Typically 6-12 months total: 3-4 months for test prep (IELTS/TOEFL/GMAT/GRE), 2-3 months for application preparation, 3-4 months for university decisions and visa processing. Starting early increases your chances of getting into your preferred universities."
  },
  {
    question: "What is the difference between IELTS and TOEFL?",
    answer: "IELTS uses British English accent and is accepted globally, particularly strong in UK, Australia, Canada. TOEFL uses American English and is preferred by US universities. Both are valid internationally. The choice depends on your university requirements and personal preference. Most Indian students find IELTS easier."
  },
  {
    question: "How long does it take to prepare for IELTS?",
    answer: "Duration depends on your current English level: Beginner (6 months of preparation), Intermediate (3-4 months), Advanced (1-2 months). Most students achieve their target IELTS score in 2-3 months with intensive coaching and daily 2-3 hours of dedicated practice."
  },
  {
    question: "What is the average IELTS score?",
    answer: "Global average IELTS score is 5.8-6.0, with India's average at 5.9. Most universities require 6.5-7.0. Top tier universities like Oxford, Cambridge require 7.5+. Your target band depends on your chosen university and desired competitiveness level."
  },
  {
    question: "Is GMAT or GRE better for MBA?",
    answer: "GMAT is preferred for MBA programs (accepted by 88% of business schools globally). GRE is increasingly accepted but GMAT is still the standard. Most top business schools accept both tests. Average competitive scores: GMAT 710-730, GRE 320-330."
  },
  {
    question: "Can I work while studying abroad?",
    answer: "Most countries allow on-campus work: Canada (20 hrs/week during studies, full-time during breaks), UK (20 hrs/week at university), USA (20 hrs/week on-campus), Germany (120 full days or 240 half days per year). Always check current visa regulations."
  },
  {
    question: "How does Whiteboard Consultants help?",
    answer: "We provide: 1) Expert guidance on university selection, 2) Test prep for IELTS, TOEFL, GMAT, GRE, 3) Application assistance and SOP writing, 4) Interview preparation, 5) Visa consultation, 6) Post-admission support, 7) Career counseling for global opportunities."
  }
]

export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
      <p className="text-gray-600 mb-12">
        Find answers to common questions about studying abroad, test preparation, and education consulting.
      </p>
      
      <div className="space-y-8">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b pb-6">
            <h3 className="text-xl font-semibold mb-3 text-blue-600">{faq.question}</h3>
            <p className="text-gray-700">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      <FAQSchema faqs={faqs} />
    </div>
  )
}
```

---

## 📋 MEDIUM PRIORITY (This Month)

### 6. Add Breadcrumb Schema to Key Pages

**File to create:** `src/components/breadcrumb-schema.tsx`

```typescript
interface Breadcrumb {
  name: string
  path: string
}

interface BreadcrumbSchemaProps {
  items: Breadcrumb[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.name,
      "item": `https://www.whiteboardconsultant.com${item.path}`
    }))
  }
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

**Usage in course pages:**
```typescript
<BreadcrumbSchema items={[
  { name: "Home", path: "/" },
  { name: "Courses", path: "/courses" },
  { name: course.title, path: `/courses/${courseId}` }
]} />
```

### 7. Create Service Area Landing Pages

Create directories and pages for:
- `/src/app/(public)/service-areas/park-street/page.tsx`
- `/src/app/(public)/service-areas/salt-lake/page.tsx`
- `/src/app/(public)/service-areas/alipore/page.tsx`

**Template:**
```typescript
export const metadata: Metadata = {
  title: 'Education Consultant in Park Street, Kolkata | Whiteboard Consultants',
  description: 'Whiteboard Consultants in Park Street, Kolkata specializes in study abroad consulting, IELTS/TOEFL coaching, and career counseling for students in Central Kolkata.',
  alternates: {
    canonical: '/service-areas/park-street'
  }
}

export default function ParkStreetPage() {
  return (
    <div>
      <h1>Education Consultant in Park Street, Kolkata</h1>
      {/* Content targeting "education consultant park street" keyword */}
    </div>
  )
}
```

### 8. Optimize Google My Business

**Setup Checklist:**
- [ ] Claim business at https://business.google.com
- [ ] Complete all business information
- [ ] Upload 15-20 high-quality photos
- [ ] Add all services (Study Abroad, IELTS, TOEFL, GMAT, GRE)
- [ ] Set service radius to 50km
- [ ] Enable messaging
- [ ] Enable appointment booking (if applicable)
- [ ] Publish weekly posts with updates

---

## 🎯 Blog Content to Create

**High-impact blog posts for AEO (Answer Engine Optimization):**

1. **"How to Prepare for IELTS in 30 Days: Complete Study Plan"**
   - Target: "how to prepare ielts", "30 day ielts preparation"
   - Include: Day-by-day schedule, tips, resources

2. **"Which Country is Best to Study Abroad? Complete Comparison 2024"**
   - Target: "best country study abroad", "where to study abroad"
   - Include: Cost, visa, job market comparison tables

3. **"Step-by-Step Guide: How to Apply for Student Visa USA/Canada/UK"**
   - Target: "student visa application", "how to get student visa"
   - Include: Detailed process, documents, timelines

4. **"IELTS vs TOEFL: Which Test Should You Take?"**
   - Target: "ielts vs toefl", "should i take ielts or toefl"
   - Include: Side-by-side comparison, scoring, universities

5. **"Minimum GMAT Score for Top MBA Colleges - 2024 List"**
   - Target: "minimum gmat score", "average gmat score"
   - Include: Rankings of 50 top schools with score requirements

---

## ✅ Pre-Launch Verification Checklist

### Technical SEO
- [ ] All pages pass Schema.org validator: https://validator.schema.org
- [ ] Rich Results Test passes: https://search.google.com/test/rich-results
- [ ] Mobile-Friendly Test passes
- [ ] PageSpeed Insights > 80 on mobile
- [ ] No crawl errors in Google Search Console
- [ ] Sitemap.xml includes 100+ pages
- [ ] Robots.txt allows public pages
- [ ] SSL certificate valid (HTTPS everywhere)

### Content SEO
- [ ] All pages have unique, descriptive titles
- [ ] All pages have 150-160 char meta descriptions
- [ ] All pages have H1 tags
- [ ] All images have descriptive alt text
- [ ] Internal links use descriptive anchor text
- [ ] Keyword density 1-2% for main keyword

### Local SEO
- [ ] Google My Business claimed and optimized
- [ ] 15+ photos uploaded to GMB
- [ ] Service area radius set to 50km
- [ ] Contact information consistent everywhere
- [ ] Local keywords in page titles and descriptions

---

## 📊 Metrics to Track Monthly

```
SEO Metrics:
✓ Organic traffic (Google Analytics)
✓ Keyword rankings (Google Search Console)
✓ Click-through rate (CTR)
✓ Average position in search results

User Experience:
✓ Bounce rate
✓ Average session duration
✓ Pages per session
✓ Conversion rate

Local SEO:
✓ Google My Business views
✓ Direction requests from GMB
✓ Phone calls from GMB
✓ Reviews and ratings

Technical:
✓ Core Web Vitals scores
✓ Page speed
✓ Mobile vs desktop performance
✓ Crawl errors
```

---

## 🚀 Quick Wins Summary

| Task | Time | Impact | Status |
|------|------|--------|--------|
| Add Course Schema | 30 min | High | ⏳ TODO |
| Add Article Schema | 30 min | High | ⏳ TODO |
| Update Blog Title | 5 min | Medium | ⏳ TODO |
| Create FAQ Page | 1 hour | High | ⏳ TODO |
| Add Breadcrumb Schema | 30 min | Medium | ⏳ TODO |
| Create FAQ Posts (5) | 5 hours | High | ⏳ TODO |
| Optimize GMB | 2 hours | Very High | ⏳ TODO |

**Total Time Investment:** ~10 hours  
**Expected Result:** 30-50% organic traffic increase in 3 months

---

**Created:** October 23, 2025  
**Domain:** whiteboardconsultant.com  
**Priority:** HIGH - Implement before production launch
