# WhitedgeLMS - Technical Architecture Deep-Dive

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Architecture](#database-architecture)
5. [Authentication & Security](#authentication--security)
6. [Performance Optimization](#performance-optimization)
7. [Scalability & Infrastructure](#scalability--infrastructure)
8. [Data Flow Diagrams](#data-flow-diagrams)
9. [Technology Decisions](#technology-decisions)
10. [DevOps & Deployment](#devops--deployment)

---

## System Architecture Overview

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT TIER                             │
│         (Browser - Next.js Frontend Application)            │
├─────────────────────────────────────────────────────────────┤
│  Components: React Components, TypeScript, TailwindCSS      │
│  State Management: React Hooks, Context API                 │
│  HTTP Client: Supabase JS Client (for auth & data)          │
│  Storage: LocalStorage, IndexedDB (for offline support)     │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION TIER                           │
│     (Next.js Server - API Routes & Server Actions)          │
├─────────────────────────────────────────────────────────────┤
│  Framework: Next.js 15.5.2 (App Router)                     │
│  Runtime: Node.js on Vercel                                 │
│  Execution: Serverless Functions (Vercel Functions)         │
│  Middleware: Auth verification, logging, rate limiting      │
│  Endpoints: REST API routes, Server Actions (RPC-style)     │
└─────────────────────────────────────────────────────────────┘
                             ↕
┌─────────────────────────────────────────────────────────────┐
│                    DATA TIER                                 │
│       (Supabase - PostgreSQL + Auth + Storage)              │
├─────────────────────────────────────────────────────────────┤
│  Database: PostgreSQL 14+                                   │
│  Auth Service: Supabase Auth (JWT-based)                    │
│  Storage: S3-compatible object storage                      │
│  Realtime: WebSocket subscriptions                          │
│  Security: Row-Level Security (RLS) policies                │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main layout group
│   │   ├── student/              # Student routes
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── tests/
│   │   │   └── certificates/
│   │   ├── instructor/           # Instructor routes
│   │   │   ├── dashboard/
│   │   │   ├── courses/
│   │   │   ├── tests/
│   │   │   └── analytics/
│   │   ├── admin/                # Admin routes
│   │   │   ├── users/
│   │   │   ├── courses/
│   │   │   └── analytics/
│   │   └── layout.tsx            # Main layout with navbar/sidebar
│   ├── auth/                     # Auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── tests/
│   │   └── ...
│   ├── middleware.ts             # Auth & request middleware
│   └── layout.tsx                # Root layout
│
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   ├── navbar.tsx               # Navigation bar
│   ├── sidebar.tsx              # Sidebar navigation
│   ├── test-taker.tsx           # Main test interface
│   ├── test-question-form.tsx   # Question creation form
│   ├── rich-text-editor.tsx     # TipTap editor
│   ├── rich-text-renderer.tsx   # HTML content display
│   ├── question-palette.tsx     # Question status panel
│   └── ...
│
├── lib/                         # Utility functions
│   ├── utils.ts                 # General utilities
│   ├── constants.ts             # App constants
│   ├── validators.ts            # Zod schemas
│   └── supabase.ts              # Supabase client config
│
├── types/                       # TypeScript types
│   └── index.ts                 # All type definitions
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts              # Authentication hook
│   ├── useDatabase.ts          # Database queries
│   └── ...
│
└── styles/                      # Global styles
    └── globals.css              # TailwindCSS + custom styles
```

### Component Architecture

#### Key Component Hierarchy

```
RootLayout
├── AuthProvider
│   ├── Navbar
│   │   ├── UserMenu
│   │   └── Logo
│   ├── Sidebar
│   │   └── NavItems
│   └── PageContent
│       ├── Student Pages
│       │   ├── Dashboard
│       │   ├── CoursePage
│       │   └── TestTaker
│       │       ├── SectionTabs
│       │       ├── TestQuestion
│       │       │   ├── MCQOptions
│       │       │   └── DescriptiveTextarea
│       │       ├── Passage Display (RichTextRenderer)
│       │       └── QuestionPalette
│       ├── Instructor Pages
│       │   ├── Dashboard
│       │   ├── CourseBuilder
│       │   ├── TestBuilder
│       │   │   ├── SectionManager
│       │   │   ├── QuestionManager
│       │   │   │   ├── TestQuestionForm
│       │   │   │   └── RichTextEditor
│       │   │   └── PassageManager
│       │   ├── BlogEditor
│       │   │   └── RichTextEditor
│       │   └── Analytics
│       └── Admin Pages
│           ├── UserManagement
│           ├── ContentModeration
│           └── Analytics
└── Footer
```

### State Management Strategy

**Approach**: React Hooks + Context API (No Redux)

**Rationale**:
- Simpler for small to medium data flow
- Less boilerplate than Redux
- Next.js Server Components reduce client-side state needs

**State Categories**:

1. **UI State** (Local Component)
   ```typescript
   const [isOpen, setIsOpen] = useState(false);
   const [selectedTab, setSelectedTab] = useState('overview');
   ```

2. **Authentication State** (Context)
   ```typescript
   const AuthContext = createContext({
     user: User | null;
     loading: boolean;
     login: (email, password) => Promise<void>;
     logout: () => Promise<void>;
   });
   ```

3. **Page State** (Server-side when possible)
   ```typescript
   // In Server Component
   const courses = await getCourses();
   // Pass down as props to Client Components
   ```

4. **Form State** (React Hook Form + Zod)
   ```typescript
   const form = useForm({
     resolver: zodResolver(courseSchema),
     defaultValues: {...}
   });
   ```

### Styling Architecture

**Stack**: TailwindCSS + Shadcn UI

**Key Principles**:
- Utility-first with Tailwind
- Component library with Shadcn for complex components
- Custom CSS only for unique styles
- Dark mode support built-in
- Responsive design mobile-first

**Example**:
```typescript
// Using Tailwind utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {courses.map(course => (
    <Card key={course.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{course.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  ))}
</div>
```

---

## Backend Architecture

### Next.js App Router Structure

#### Server Actions (RPC-Style)

**File Structure**:
```
src/app/instructor/tests/actions.ts

// Usage: Called from Client Components using "use server"
export async function createTest(formData: TestFormData) {
  // Validation with Zod
  // Supabase insert
  // Return result or throw error
}
```

**Benefits**:
- Type-safe RPC between client and server
- No need for manual API routes
- Built-in error handling
- Automatic serialization

**Example Implementation**:
```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { testSchema } from '@/lib/validators'

export async function createTest(data: unknown) {
  // 1. Authenticate
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')
  
  // 2. Validate
  const validated = testSchema.parse(data)
  
  // 3. Authorize (instructor check)
  // 4. Execute
  const { data: test, error } = await supabase
    .from('tests')
    .insert(validated)
    .select()
  
  // 5. Return
  if (error) throw new Error(error.message)
  return test[0]
}
```

#### API Routes (REST)

**Used for**:
- Webhooks (Supabase, payment providers)
- File uploads
- Public endpoints (health checks, metrics)

**Example**:
```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

### Middleware Architecture

**Authentication Middleware**:
```typescript
// src/app/middleware.ts
export async function middleware(request: NextRequest) {
  // 1. Check session token
  const sessionToken = request.cookies.get('sb-access-token')?.value
  
  // 2. If no token and protected route, redirect to login
  if (!sessionToken && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // 3. Verify token with Supabase
  // 4. Add user info to request headers
  // 5. Allow request to continue
  
  return NextResponse.next()
}
```

### Error Handling

**Standardized Error Response**:
```typescript
interface ErrorResponse {
  error: string
  code: string
  details?: Record<string, any>
}

class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message)
  }
}

// In API routes/actions
try {
  // business logic
} catch (error) {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }
  return Response.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  )
}
```

### Validation Layer

**Using Zod for Type-Safe Validation**:

```typescript
// lib/validators.ts
import { z } from 'zod'

export const testSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().optional(),
  duration: z.number().min(1).max(480),
  passing_percentage: z.number().min(0).max(100),
  total_marks: z.number().min(1),
})

// In Server Action
export async function createTest(data: unknown) {
  const validated = testSchema.parse(data) // Throws if invalid
  // Proceed with validated data
}
```

---

## Database Architecture

### PostgreSQL Schema

#### Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'instructor', 'student')),
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  avatar_url TEXT,
  phone TEXT,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
```

**courses**
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID NOT NULL REFERENCES users(id),
  price DECIMAL(10, 2),
  original_price DECIMAL(10, 2),
  category TEXT,
  image_url TEXT,
  rating DECIMAL(2, 1) DEFAULT 0,
  student_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_courses_instructor ON courses(instructor_id);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published);
```

**enrollments**
```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT now(),
  discount_applied DECIMAL(5, 2),
  
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
```

**tests**
```sql
CREATE TABLE tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID NOT NULL REFERENCES courses(id),
  instructor_id UUID NOT NULL REFERENCES users(id),
  total_marks INTEGER,
  duration INTEGER, -- in minutes
  passing_percentage INTEGER DEFAULT 50,
  attempts_allowed INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_tests_course ON tests(course_id);
CREATE INDEX idx_tests_instructor ON tests(instructor_id);
CREATE INDEX idx_tests_published ON tests(is_published);
```

**test_sections**
```sql
CREATE TABLE test_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration INTEGER, -- in minutes
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_sections_test ON test_sections(test_id);
```

**test_questions**
```sql
CREATE TABLE test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  section_id UUID REFERENCES test_sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple_choice', 'descriptive')),
  options JSONB, -- Array of strings for MCQ
  correct_answer INTEGER, -- Index of correct option for MCQ
  explanation TEXT,
  points INTEGER DEFAULT 1,
  negative_marks DECIMAL(3, 2),
  order_number INTEGER,
  passage_id UUID REFERENCES test_passages(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_questions_test ON test_questions(test_id);
CREATE INDEX idx_questions_section ON test_questions(section_id);
CREATE INDEX idx_questions_passage ON test_questions(passage_id);
```

**test_attempts**
```sql
CREATE TABLE test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  test_id UUID NOT NULL REFERENCES tests(id),
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  start_time TIMESTAMP DEFAULT now(),
  submitted_at TIMESTAMP,
  score DECIMAL(5, 2),
  total_marks INTEGER,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_attempts_user ON test_attempts(user_id);
CREATE INDEX idx_attempts_test ON test_attempts(test_id);
CREATE INDEX idx_attempts_status ON test_attempts(status);
```

**test_answers**
```sql
CREATE TABLE test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES test_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES test_questions(id),
  option_index INTEGER, -- for MCQ
  text_answer TEXT, -- for descriptive
  marked_for_review BOOLEAN DEFAULT false,
  answered_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_answers_attempt ON test_answers(attempt_id);
CREATE INDEX idx_answers_question ON test_answers(question_id);
```

### Row-Level Security (RLS) Policies

**Students can only see their own data**:
```sql
-- test_attempts: students see only their own
CREATE POLICY "Users can see their own attempts"
  ON test_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- test_answers: students see only their own
CREATE POLICY "Users can see their own answers"
  ON test_answers
  FOR SELECT
  USING (
    attempt_id IN (
      SELECT id FROM test_attempts 
      WHERE user_id = auth.uid()
    )
  );
```

**Instructors see student data only for their courses**:
```sql
CREATE POLICY "Instructors see attempts for their tests"
  ON test_attempts
  FOR SELECT
  USING (
    test_id IN (
      SELECT id FROM tests 
      WHERE instructor_id = auth.uid()
    )
  );
```

**Admins see all data**:
```sql
CREATE POLICY "Admins see all data"
  ON users
  FOR ALL
  USING (
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### Query Optimization

**Use Indexes**:
- Frequently queried columns: user_id, course_id, test_id
- Foreign keys: All FKs should have indexes
- Status/State columns: test.is_published, attempt.status

**Query Patterns**:
```typescript
// Good: Select only needed columns
const { data } = await supabase
  .from('courses')
  .select('id, title, rating, student_count')
  .eq('is_published', true)

// Avoid: Select * (wasteful)
const { data } = await supabase
  .from('courses')
  .select('*') // Unnecessary data transfer
```

---

## Authentication & Security

### Supabase Auth Flow

```
1. User clicks "Sign Up"
   ↓
2. Frontend calls supabase.auth.signUp(email, password)
   ↓
3. Supabase creates user in auth.users table
   ↓
4. Email verification sent to user
   ↓
5. User clicks email link
   ↓
6. Supabase verifies email
   ↓
7. Frontend redirects to /auth/callback?code=xyz
   ↓
8. Callback page exchanges code for session
   ↓
9. JWT tokens stored in httpOnly cookies
   ↓
10. User redirected to dashboard
```

### JWT Token Management

**Token Components**:
```typescript
// Access Token (short-lived, 1 hour)
{
  sub: user_id,
  aud: "authenticated",
  email: user_email,
  role: user_role,
  exp: timestamp,
  iat: timestamp
}

// Refresh Token (long-lived, 7 days)
// Stored securely in httpOnly cookie
```

**Token Refresh Logic**:
```typescript
// Automatic refresh via Supabase client
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
})

// Manual refresh if needed
const { data, error } = await supabase.auth.refreshSession()
```

### Security Best Practices

**1. Input Validation**
- Zod schemas validate all user inputs
- No direct SQL queries (always use parameterized)
- XSS prevention via sanitized HTML rendering

**2. Authentication**
- Passwords: bcrypt hashing (handled by Supabase)
- Session: Secure httpOnly cookies
- CSRF: Built into Next.js

**3. Authorization**
- RLS policies enforce data access
- Role-based checks on server
- Frontend optimistic UI only

**4. Communication**
- HTTPS everywhere (enforced by Vercel)
- Secure WebSocket for realtime
- No sensitive data in URLs

**5. Data Protection**
- PII encrypted at rest (if needed)
- GDPR compliance via Supabase
- Regular security audits

---

## Performance Optimization

### Frontend Optimization

**1. Code Splitting**
```typescript
// Dynamic imports for heavy components
const TestTaker = dynamic(() => import('@/components/test-taker'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Client-side only for interactive features
})
```

**2. Image Optimization**
```typescript
// Use Next.js Image component
import Image from 'next/image'

<Image
  src={course.image_url}
  alt={course.title}
  width={300}
  height={200}
  priority // for above-fold images
/>
```

**3. Memoization**
```typescript
const CourseCard = memo(({ course }: Props) => (
  // Component only re-renders if course prop changes
))
```

**4. Caching Strategy**
```typescript
// ISR (Incremental Static Regeneration)
export const revalidate = 3600 // Revalidate every hour
```

### Backend Optimization

**1. Query Optimization**
```typescript
// Batch queries instead of N+1
const { data: courses } = await supabase
  .from('courses')
  .select(`
    id, title, rating,
    instructor:instructor_id(id, name, avatar_url)
  `)
  .eq('is_published', true)
```

**2. Connection Pooling**
- Supabase handles automatically
- Reuse connections across requests

**3. Database Indexing**
- Indexed on frequently queried columns
- Foreign keys indexed for joins

### Monitoring & Metrics

**Performance Metrics**:
- Core Web Vitals (LCP, FID, CLS)
- API response times
- Database query times
- Error rates

**Tools**:
- Vercel Analytics
- Supabase Dashboard (query performance)
- Custom logging with Pino

---

## Scalability & Infrastructure

### Horizontal Scalability

**Stateless Application**:
- No in-memory state (except sessions via Supabase)
- Can run multiple instances
- Vercel auto-scales based on traffic

**Load Distribution**:
- Vercel automatically distributes across edge locations
- Global CDN caching
- Database connection pooling

### Vertical Scalability

**Database**:
- PostgreSQL with managed backups
- Can upgrade instance size if needed
- Replication for high availability (enterprise plan)

**Storage**:
- S3-compatible unlimited storage
- Automatic scaling
- CDN caching for frequent access

### Database Replication

**Current Setup** (Development):
- Single PostgreSQL instance
- Daily automated backups
- Point-in-time recovery available

**Recommended for Production**:
- Read replicas for analytics queries
- Automatic failover
- Multi-region replication

---

## Data Flow Diagrams

### Test Taking Flow

```
┌─ Student starts test
│
├─ Frontend loads test metadata
│  └─ GET /api/tests/:testId → Server → Supabase
│     Returns: Test, Sections, Questions, Passages
│
├─ Frontend initializes timers
│  └─ Section timers loaded from section durations
│     Overall timer from total test duration
│
├─ Student answers questions
│  └─ Client-side state update (no backend yet)
│     Answer object: { optionIndex?, textAnswer?, markedForReview }
│
├─ [AUTOSAVE TRIGGER]
│  └─ POST /api/test-attempts/:id/save-answer
│     Server validates answer
│     Supabase inserts into test_answers
│     Returns success/error
│
├─ Student submits section (or timer expires)
│  └─ POST /api/test-attempts/:id/submit
│     Server locks section (update status)
│     Moves to next section
│     Returns next section data
│
└─ Final submission
   └─ POST /api/test-attempts/:id/submit (all sections done)
      Server calculates score
      Generates result
      Creates certificate if passed
      Returns results page data
```

### Course Enrollment Flow

```
┌─ Student browses courses
│
├─ Frontend lists published courses
│  └─ GET /api/courses → Supabase (filtered by is_published)
│
├─ Student views course details
│  └─ GET /api/courses/:id → Supabase with instructor info
│
├─ Student enrolls (with/without coupon)
│  └─ POST /api/courses/:id/enroll
│     Server validates coupon if provided
│     Creates enrollment record
│     Returns success
│
└─ Enrollment confirmed
   ├─ Course now visible in "My Courses"
   ├─ Tests become accessible
   └─ Progress tracking starts
```

### Question Creation Flow

```
┌─ Instructor creates question
│
├─ Opens RichTextEditor for question text
│  └─ Editing in client-side (TipTap)
│
├─ For MCQ: adds options, selects correct answer
│  └─ Options stored as JSON array in form state
│
├─ Instructor adds explanation (RichTextEditor)
│  └─ HTML content generated by TipTap.getHTML()
│
├─ Form validation (Zod schema)
│  └─ Validates structure, marks, option count, etc.
│
└─ Submit question
   └─ POST /api/tests/:testId/questions/create
      Server receives:
      - question_text (HTML)
      - question_type (MCQ/descriptive)
      - options (JSON array)
      - correct_answer (index)
      - explanation (HTML)
      - other metadata
      
      Supabase inserts question
      Returns question with generated ID
```

---

## Technology Decisions

### Why Next.js over other frameworks?

| Aspect | Next.js | Why Better |
|--------|---------|-----------|
| Full-stack | Server + Client in one | Simpler deployment, unified types |
| SSR/Static | Built-in | Better SEO, faster initial load |
| API Routes | Built-in | No separate backend needed |
| Server Actions | Integrated | Type-safe RPC |
| Deployment | Vercel optimized | One-click deploy |
| Performance | Excellent optimization | Auto-splitting, image optimization |

### Why Supabase over Firebase?

| Feature | Supabase | Firebase |
|---------|----------|----------|
| Database | PostgreSQL (powerful) | Firestore (limited) |
| SQL Support | Full SQL | Limited query language |
| RLS | Fine-grained policies | Limited security |
| Cost | Pay for usage | Can get expensive |
| Customization | Fully customizable | Vendor lock-in |
| Migrations | Version control friendly | Hard to version |

### Why TipTap over alternatives?

| Editor | TipTap | Why Better |
|--------|--------|-----------|
| Slate | Headless only | TipTap has UI + headless option |
| Draft.js | Facebook maintained | TipTap more active |
| Prosemirror | Lower-level | TipTap built on Prosemirror (easier) |
| WYSIWYG editors | Heavy (20MB+) | TipTap lightweight (100KB) |

### Why React Hooks + Context over Redux?

| State | Hooks+Context | Redux |
|-------|---------------|-------|
| Complexity | Simple | Complex boilerplate |
| Bundle size | 5KB | 40KB+ |
| Learning curve | Easy | Steep |
| Scalability | Good for medium apps | Better for huge apps |
| DevTools | Good | Excellent |

---

## DevOps & Deployment

### Development Environment

**Setup**:
```bash
# Clone & install
git clone <repo>
cd WhitedgeLMS
npm install

# Environment variables
cp .env.example .env.local

# Start dev server
npm run dev

# Open localhost:3000
```

**Development Workflow**:
1. Create feature branch: `git checkout -b feature/name`
2. Make changes with hot reload
3. Test locally
4. Commit with conventional commits
5. Push to GitHub
6. Create Pull Request
7. Vercel auto-deploys preview
8. Merge after review → Auto-deploys to production

### Production Deployment

**Vercel Deployment**:
- Connected to GitHub main branch
- Automatic deployment on push
- Environment variables configured
- Domain SSL certificate managed
- Automatic rollback on failure
- Edge caching enabled

**Database Backup**:
- Supabase automated daily backups
- 14-day retention
- Point-in-time recovery available

**Monitoring**:
- Vercel Analytics (Web Vitals)
- Supabase Dashboard (database metrics)
- Sentry for error tracking
- Custom logging

### Environment Configuration

**Production Variables**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NODE_ENV=production
```

**Secrets Management**:
- Stored in Vercel Environment Variables
- Not committed to Git
- Rotated periodically

### CI/CD Pipeline

**GitHub Actions**:
```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - run: npm test

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
```

### Disaster Recovery

**Data Protection**:
- Supabase handles PostgreSQL backups
- Point-in-time recovery up to 14 days
- S3 storage with versioning

**Service Recovery**:
- Vercel auto-detects failures
- Rollback to previous deployment
- Alert notifications

**Business Continuity**:
- Document recovery procedures
- Test recovery quarterly
- Maintain runbooks

---

## Monitoring & Logging

### Application Monitoring

**Metrics Tracked**:
- API response times
- Database query times
- Error rates by endpoint
- User authentication flow
- Test submission success rate

**Tools**:
- Vercel Analytics (built-in)
- Supabase Dashboard
- Custom logging with Pino

### Error Tracking

**Implementation**:
```typescript
// Structured error logging
logger.error({
  message: 'Test submission failed',
  userId,
  testId,
  error: error.message,
  stack: error.stack,
  timestamp: new Date()
})
```

**Alert Conditions**:
- Error rate > 5%
- API response time > 2s
- Database down
- Authentication failures > 10

---

## Future Architecture Improvements

### Short Term
1. **Caching Layer**: Redis for frequently accessed data
2. **Message Queue**: Bull for async operations
3. **Search Engine**: Elasticsearch for course search

### Medium Term
1. **Microservices**: Separate services for tests, courses, analytics
2. **GraphQL**: More efficient data fetching
3. **Webhooks**: External integrations

### Long Term
1. **Event Sourcing**: Track all state changes
2. **CQRS**: Separate read/write models
3. **Machine Learning**: Adaptive testing, personalized recommendations

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Status**: Production Architecture
