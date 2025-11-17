# WhitedgeLMS - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Core Features](#core-features)
4. [Architecture](#architecture)
5. [Benefits & Advantages](#benefits--advantages)
6. [Key Components](#key-components)
7. [Database Schema](#database-schema)
8. [Deployment](#deployment)
9. [Future Enhancements](#future-enhancements)

---

## Project Overview

### What is WhitedgeLMS?

**WhitedgeLMS** is a comprehensive Learning Management System (LMS) built with modern web technologies. It's designed to facilitate online education through:

- **Course Management**: Create, manage, and organize courses
- **Test Engine**: CAT-style (Computer Adaptive Testing) mock test platform
- **Blog System**: Publish educational content
- **Student Management**: Track student progress and performance
- **Instructor Dashboard**: Manage courses, tests, and student feedback
- **Admin Panel**: System-wide management and oversight

### Target Users

- **Students**: Access courses, take tests, view results, and get certifications
- **Instructors**: Create and manage courses, design tests, review student performance
- **Administrators**: Oversee system, manage users, generate reports

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Next.js** | 15.5.2 | React framework with App Router for full-stack development |
| **React** | 18.3.1 | UI component library |
| **TypeScript** | Latest | Type-safe development |
| **TailwindCSS** | Latest | Utility-first CSS framework |
| **Shadcn UI** | Latest | High-quality React components |
| **TipTap** | Latest | Rich Text Editor for content creation |
| **React Hook Form** | Latest | Efficient form state management |
| **Zod** | Latest | TypeScript-first schema validation |

### Backend & Database
| Technology | Purpose |
|-----------|---------|
| **Supabase** | PostgreSQL database with built-in auth, RLS, and storage |
| **PostgreSQL** | Relational database engine |
| **Row-Level Security (RLS)** | Fine-grained access control |
| **Supabase Auth** | Email/password authentication |

### Deployment & Infrastructure
| Technology | Purpose |
|-----------|---------|
| **Vercel** | Production deployment and hosting |
| **GitHub** | Version control and CI/CD |
| **Node.js** | Runtime environment |
| **npm** | Package management |

### Additional Libraries
| Library | Purpose |
|---------|---------|
| **Lucide Icons** | Beautiful, consistent icons |
| **React Beforeunload** | Prevent accidental test abandonment |
| **Katex** | Mathematical equation rendering |
| **SortableJS** | Drag-and-drop functionality |

---

## Core Features

### 1. **Course Management**
- ✅ Create, edit, and delete courses
- ✅ Organize courses by category (Test Prep, Career Development, Language Skills)
- ✅ Assign courses to instructors
- ✅ Course pricing and discounts via coupons
- ✅ Course structure documentation
- ✅ Program outcomes and FAQs

### 2. **Advanced Test Engine**
#### MCQ Questions
- Multiple-choice questions with configurable options
- Negative marking support (-1 for wrong answers)
- Single correct answer per question
- Rich text formatting for question stems and options

#### Descriptive Questions (TITA - Type in the Answer)
- Free-text answer fields for essay-style questions
- No negative marking on descriptive questions
- Full HTML support for complex questions

#### Sectional Timers (Exam-Realistic)
- **Flexible Submission**: Students can submit sections early
- **Hard Section Locking**: Once submitted, sections cannot be revisited
- **Auto-Submission**: Section auto-submits when timer expires
- **Progressive Navigation**: Can only move forward to next sections
- **Sectional Durations**: Configure unique time for each section
  - Example: 20 mins for Verbal, 20 mins for Quantitative, 20 mins for Logical Reasoning

#### Rich Question Formatting
- HTML-based content with **bold**, *italics*, lists, headings
- Support for passages (reading comprehension)
- Configurable question marks and negative marks
- Question ordering and section assignment

### 3. **Passage & Reading Comprehension**
- Create passages for reading comprehension sections
- Link multiple questions to a single passage
- HTML formatting support for passages
- Optimal spacing for readability
- Section-based organization

### 4. **Question Palette**
- Visual question status indicator:
  - 🟢 **Green**: Answered
  - 🔴 **Red**: Not Answered
  - 🟣 **Purple**: Marked for Review
  - 🟣✓ **Purple with checkmark**: Answered & Marked
- Quick navigation between questions
- Section-filtered view (only shows current section questions)
- One-click question selection

### 5. **Blog/Content Management**
- Create and publish educational blog posts
- Rich text editor for content creation
- Featured image upload and management
- Category-based organization
- Author attribution
- SEO-friendly slug generation
- Blog post scheduling and status management

### 6. **Student Features**
#### Dashboard
- View enrolled courses
- Track progress per course
- Quick access to ongoing tests
- Certificate viewing and download
- Performance analytics

#### Test Taking
- Real-time timer (overall + sectional)
- Answer tracking and status indicators
- Mark for review functionality
- Clear response option
- Submission confirmation
- Test result summary with percentile

#### Test Results
- Detailed score breakdown
- Question-wise analysis
- Correct/incorrect status per question
- Solution explanation viewing
- Performance metrics

### 7. **Instructor Features**
#### Course Management
- Create and organize courses
- Manage course structure
- Upload course materials
- Track student enrollments
- View student progress

#### Test Management
- Create tests with multiple sections
- Define section-specific timers
- Add questions (MCQ and Descriptive)
- Configure passage-based questions
- Set marking scheme (marks, negative marks)
- Publish/unpublish tests
- View test analytics

#### Question Bank
- Reusable question repository
- Organize by topics and sections
- Import/export questions
- Question difficulty levels
- Solution management

### 8. **Admin Features**
- User management (create, approve, suspend)
- Role management (Admin, Instructor, Student)
- System-wide analytics
- Course approval workflow
- Content moderation
- User activity tracking
- Generate reports

### 9. **Authentication & Authorization**
- Email/password authentication via Supabase
- Role-based access control (RBAC)
- User status tracking (pending, approved, rejected, suspended)
- Secure token management
- Session management with auto-refresh

### 10. **Data Persistence & Caching**
- Full PostgreSQL integration
- Real-time data synchronization
- Supabase storage for media
- Efficient query optimization

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│         (Next.js 15.5.2 - React 18.3.1)                │
├─────────────────────────────────────────────────────────┤
│  ├─ Student Pages (Courses, Tests, Dashboard)           │
│  ├─ Instructor Pages (Test Creation, Analytics)         │
│  ├─ Admin Pages (User Management, Reports)              │
│  └─ Shared Components (Navbar, Sidebar, Forms)          │
├─────────────────────────────────────────────────────────┤
│                    API Layer                             │
│    (Next.js App Router - API Routes & Actions)          │
├─────────────────────────────────────────────────────────┤
│  ├─ Authentication (Supabase Auth)                       │
│  ├─ Data Fetching (Supabase Client)                      │
│  ├─ File Storage (Supabase Storage)                      │
│  └─ Real-time Updates (Supabase RLS)                     │
├─────────────────────────────────────────────────────────┤
│                  Database Layer                          │
│        (Supabase PostgreSQL + RLS Policies)             │
├─────────────────────────────────────────────────────────┤
│  ├─ Users & Authentication                              │
│  ├─ Courses & Enrollments                               │
│  ├─ Tests & Questions                                    │
│  ├─ Test Attempts & Answers                             │
│  ├─ Blog Posts                                           │
│  ├─ Certificates & Reviews                              │
│  └─ Analytics & Metrics                                 │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

#### Test Taking Flow
```
Student Starts Test
    ↓
Load Test Metadata, Sections, Questions, Passages
    ↓
Display Section 1 with Timer
    ↓
Student Answers Questions (MCQ or Descriptive)
    ↓
Student Submits Section (Early or Auto-submit on Timer Expiry)
    ↓
Section Locked, Move to Next Section
    ↓
Repeat Until All Sections Completed
    ↓
Final Test Submission
    ↓
Calculate Score & Percentile
    ↓
Display Results Page
```

### Component Architecture

#### Key Components
- `TestTaker`: Main test interface with sectional timers
- `RichTextEditor`: TipTap-based editor for question creation
- `RichTextRenderer`: HTML content display for questions/passages
- `TestQuestionForm`: Question creation and editing
- `TestQuestionManager`: Manage questions per section
- `StudentDashboard`: Student's main interface
- `InstructorDashboard`: Instructor test management
- `BlogEditor`: Content creation with rich text support

---

## Benefits & Advantages

### For Students
| Benefit | Advantage |
|---------|-----------|
| **Realistic Mock Tests** | Experience actual exam conditions with sectional timers |
| **Flexible Learning** | Access courses and tests anytime, anywhere |
| **Detailed Analytics** | Understand strengths and weaknesses with score breakdown |
| **Multiple Attempts** | Practice repeatedly to improve performance |
| **Instant Feedback** | View solutions immediately after test submission |
| **Progress Tracking** | Monitor improvement over time |
| **Certifications** | Earn recognized certificates upon completion |
| **Rich Content** | Enhanced learning with formatted text, passages, images |

### For Instructors
| Benefit | Advantage |
|---------|-----------|
| **Easy Test Creation** | Intuitive interface for building tests in minutes |
| **Flexible Question Types** | Support for MCQ and Descriptive questions |
| **Sectional Control** | Create sections with custom timers (realistic exam simulation) |
| **Rich Content Support** | Format questions with HTML, add passages, embed images |
| **Student Analytics** | Track performance, identify struggling students |
| **Reusable Content** | Build question bank for future tests |
| **No Revision Limits** | Edit and update tests anytime |
| **Bulk Operations** | Manage multiple tests and students efficiently |

### For Organizations
| Benefit | Advantage |
|---------|-----------|
| **Scalable Platform** | Supports thousands of concurrent users |
| **Cloud-Based** | No infrastructure maintenance required |
| **Secure** | Enterprise-grade security with RLS and encryption |
| **Cost-Effective** | Lower operational costs vs traditional testing |
| **Automated Grading** | Instant results without manual correction |
| **Data Analytics** | Insights into course effectiveness |
| **Compliance** | GDPR-ready, audit trails, data retention policies |
| **Integration Ready** | APIs for third-party integrations |

### Technical Advantages

#### Performance
- ⚡ **Server-Side Rendering**: Faster initial page loads
- ⚡ **Incremental Static Generation**: Optimized caching strategy
- ⚡ **Code Splitting**: Smaller bundle sizes
- ⚡ **Database Indexing**: Optimized queries
- ⚡ **Supabase Edge Functions**: Low-latency data operations

#### Security
- 🔒 **Row-Level Security**: Fine-grained access control
- 🔒 **Authentication Tokens**: Secure session management
- 🔒 **HTTPS Everywhere**: End-to-end encryption
- 🔒 **Input Validation**: Zod schema validation
- 🔒 **SQL Injection Prevention**: Parameterized queries

#### Maintainability
- 📝 **TypeScript**: Catch errors at compile time
- 📝 **Component Reusability**: DRY principle
- 📝 **Clear Architecture**: Organized folder structure
- 📝 **Version Control**: Git-based change tracking
- 📝 **Code Comments**: Well-documented codebase

#### Scalability
- 📈 **Serverless**: Auto-scales with Vercel
- 📈 **Database Pooling**: Efficient connection management
- 📈 **CDN Delivery**: Global content distribution
- 📈 **Load Balancing**: Automatic traffic distribution
- 📈 **Horizontal Scaling**: Easy to add more resources

---

## Key Components

### 1. Test-Taker Component
**File**: `src/components/test-taker.tsx`

**Features**:
- Real-time timer management (overall + sectional)
- MCQ and Descriptive question handling
- Section navigation with locking mechanism
- Passage display for reading comprehension
- Answer tracking and status management
- Auto-submission on timer expiry
- Test submission handling

**Key States**:
- `questions`: Array of test questions
- `answers`: Track student answers (option index or text)
- `currentSectionId`: Track current section
- `sectionTimeLeft`: Sectional timer countdown
- `submittedSections`: Track submitted sections (locked)

### 2. Rich Text Editor Component
**File**: `src/components/rich-text-editor.tsx`

**Features**:
- TipTap-based rich text editing
- Formatting toolbar (bold, italic, strikethrough, headings, lists)
- Image upload support
- Mathematical equation support (KaTeX)
- HTML export for database storage

### 3. Rich Text Renderer Component
**File**: `src/components/rich-text-renderer.tsx`

**Features**:
- Display HTML content with proper styling
- Paragraph spacing optimization
- Prose typography with Tailwind
- Dark mode support
- Responsive design

### 4. Test Question Form
**File**: `src/components/test-question-form.tsx`

**Features**:
- Create/edit MCQ questions
- Create/edit Descriptive questions
- Add answer options
- Set correct answers
- Assign marks and negative marks
- Link to passages and sections
- Form validation with Zod

### 5. Student Dashboard
**File**: `src/app/(main)/student/dashboard/page.tsx`

**Features**:
- Course list with progress
- Ongoing tests and quizzes
- Certificate viewing
- Performance analytics
- Quick test access

### 6. Instructor Dashboard
**File**: `src/app/(main)/instructor/dashboard/page.tsx`

**Features**:
- Course management
- Test creation and editing
- Student performance analytics
- Course performance metrics
- Quick actions (edit, delete, publish)

---

## Database Schema

### Core Tables

#### users
```sql
- id (UUID, Primary Key)
- email (String, Unique)
- name (String)
- role (Enum: admin, instructor, student)
- status (Enum: pending, approved, rejected, suspended)
- avatar_url (String, Optional)
- phone (String, Optional)
- last_login (Timestamp)
- created_at (Timestamp)
- updated_at (Timestamp)
```

#### courses
```sql
- id (UUID, Primary Key)
- title (String)
- description (Text)
- instructor_id (UUID, Foreign Key → users)
- price (Decimal, Optional)
- original_price (Decimal, Optional)
- category (String)
- image_url (String)
- student_count (Integer)
- rating (Decimal)
- created_at (Timestamp)
```

#### test_sections
```sql
- id (UUID, Primary Key)
- test_id (UUID, Foreign Key → tests)
- name (String)
- description (String, Optional)
- duration (Integer) -- in minutes
- order_number (Integer)
- created_at (Timestamp)
```

#### test_questions
```sql
- id (UUID, Primary Key)
- test_id (UUID, Foreign Key → tests)
- section_id (UUID, Foreign Key → test_sections, Optional)
- question_text (Text) -- HTML formatted
- question_type (Enum: multiple_choice, essay)
- options (JSON Array) -- for MCQ
- correct_answer (Integer) -- index of correct option
- explanation (Text) -- HTML formatted solution
- points (Integer) -- marks for question
- order_number (Integer)
- passage_id (UUID, Foreign Key → test_passages, Optional)
- created_at (Timestamp)
```

#### test_passages
```sql
- id (UUID, Primary Key)
- test_id (UUID, Foreign Key → tests)
- title (String)
- content (Text) -- HTML formatted
- display_order (Integer)
- created_at (Timestamp)
```

#### test_attempts
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → users)
- test_id (UUID, Foreign Key → tests)
- status (Enum: in-progress, completed, abandoned)
- start_time (Timestamp)
- submitted_at (Timestamp, Optional)
- score (Decimal, Optional)
- total_marks (Integer)
- created_at (Timestamp)
```

#### posts (Blog)
```sql
- id (UUID, Primary Key)
- title (String)
- content (Text) -- HTML formatted
- excerpt (String, Optional)
- author_id (UUID, Foreign Key → users)
- category (String)
- slug (String, Unique)
- featured_image_url (String, Optional)
- status (Enum: draft, published)
- created_at (Timestamp)
- updated_at (Timestamp)
```

---

## Deployment

### Current Deployment
- **URL**: https://whiteboard-lms.vercel.app/
- **Platform**: Vercel (Serverless Functions + CDN)
- **Region**: Global with edge caching

### Environment Configuration
```env
NEXT_PUBLIC_SUPABASE_URL=<supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
```

### Deployment Checklist
- ✅ Environment variables configured
- ✅ Supabase redirect URLs updated for production
- ✅ Database migrations completed
- ✅ RLS policies enabled
- ✅ Email authentication configured
- ✅ Storage buckets created
- ✅ Domain configured with HTTPS

### Vercel Configuration
- Auto-deploy on push to main branch
- Environment variables secured
- Serverless function timeouts configured
- Image optimization enabled

---

## Future Enhancements

### Short Term (Next Sprint)
1. **Video Lectures**: Integrate video hosting (YouTube/Vimeo)
2. **Progress Tracking**: Enhanced student progress visualization
3. **Email Notifications**: Automated alerts for test results
4. **Bulk Question Import**: CSV/Excel upload for questions
5. **Advanced Analytics**: Detailed performance reports per student

### Medium Term (Next Quarter)
1. **Adaptive Testing**: AI-based difficulty adjustment
2. **Mobile App**: Native iOS/Android applications
3. **Live Classes**: Video conferencing integration
4. **Peer Review**: Student-to-student feedback system
5. **Gamification**: Leaderboards, badges, achievements

### Long Term (6+ Months)
1. **AI Proctoring**: Automated test surveillance
2. **Machine Learning**: Personalized learning paths
3. **API Marketplace**: Third-party integrations
4. **White-Label Solution**: Branded instances for partners
5. **Blockchain Certificates**: Verifiable digital credentials

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Local Development
```bash
# Clone repository
git clone https://github.com/Whiteboard-Consultants/Whiteboard-LMS.git
cd WhitedgeLMS

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Update with your Supabase credentials

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build
```bash
npm run build
npm start
```

---

## Support & Contact

**Organization**: Whiteboard Consultants  
**Website**: https://whiteboard-lms.vercel.app/  
**Repository**: https://github.com/Whiteboard-Consultants/Whiteboard-LMS  

---

## License

This project is proprietary software developed by Whiteboard Consultants.

---

**Document Version**: 1.0  
**Last Updated**: November 14, 2025  
**Status**: Production Ready
