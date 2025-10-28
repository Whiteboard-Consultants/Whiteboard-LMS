# WhitedgeLMS - Production URL Mapping
## Domain: whiteboardconsultant.com

All URLs listed below will be accessible once deployed to production on Vercel.

---

## 🏠 PUBLIC PAGES (No Authentication Required)

### Homepage & Main Pages
| Page | URL |
|------|-----|
| Homepage | `https://whiteboardconsultant.com/` |
| About Us | `https://whiteboardconsultant.com/about` |
| Contact Us | `https://whiteboardconsultant.com/contact` |
| Courses Directory | `https://whiteboardconsultant.com/courses` |

### Courses
| Page | URL | Description |
|------|-----|-------------|
| Course Details | `https://whiteboardconsultant.com/courses/[courseId]` | View single course details |
| Course Lessons | `https://whiteboardconsultant.com/courses/[courseId]/lessons/[lessonId]` | View lesson content |
| Course Learning Path | `https://whiteboardconsultant.com/courses/[courseId]/learn` | Interactive course learning |

### Blog
| Page | URL |
|------|-----|
| Blog Home | `https://whiteboardconsultant.com/blog` |
| Blog Post | `https://whiteboardconsultant.com/blog/[slug]` |

### Study Abroad Programs
| Page | URL |
|------|-----|
| Study Abroad Hub | `https://whiteboardconsultant.com/study-abroad` |
| USA Program | `https://whiteboardconsultant.com/study-abroad/usa` |
| Canada Program | `https://whiteboardconsultant.com/study-abroad/canada` |
| UK Program | `https://whiteboardconsultant.com/study-abroad/uk` |
| Australia Program | `https://whiteboardconsultant.com/study-abroad/australia` |
| New Zealand Program | `https://whiteboardconsultant.com/study-abroad/new-zealand` |
| Germany Program | `https://whiteboardconsultant.com/study-abroad/germany` |
| Ireland Program | `https://whiteboardconsultant.com/study-abroad/ireland` |
| Dubai Program | `https://whiteboardconsultant.com/study-abroad/dubai` |

### Admissions
| Page | URL |
|------|-----|
| College Admissions Hub | `https://whiteboardconsultant.com/college-admissions` |
| UOW India Program | `https://whiteboardconsultant.com/admissions/uow-india` |
| UOW India Application | `https://whiteboardconsultant.com/admissions/uow-india/apply` |

### Other Public Pages
| Page | URL |
|------|-----|
| Shopping Cart | `https://whiteboardconsultant.com/cart` |
| Simple Registration | `https://whiteboardconsultant.com/simple-register` |
| Demo Lesson Viewer | `https://whiteboardconsultant.com/demo/lesson-viewer` |

---

## 🔐 AUTHENTICATION PAGES

| Page | URL | Purpose |
|------|-----|---------|
| Login | `https://whiteboardconsultant.com/auth/login` | User login |
| Register | `https://whiteboardconsultant.com/auth/register` | New user registration |
| Forgot Password | `https://whiteboardconsultant.com/auth/forgot-password` | Password reset |
| OAuth Callback | `https://whiteboardconsultant.com/auth/callback` | OAuth2 provider callback |

---

## 👨‍🎓 STUDENT DASHBOARD (Authenticated Students)

### Student Courses & Learning
| Page | URL | Description |
|------|-----|-------------|
| Student Dashboard | `https://whiteboardconsultant.com/student/dashboard` | Main student hub |
| My Course | `https://whiteboardconsultant.com/student/course/[courseId]` | View enrolled course |
| Complete Profile | `https://whiteboardconsultant.com/student/complete-profile` | Finish profile setup |

### Tests & Quizzes
| Page | URL | Description |
|------|-----|-------------|
| All Tests | `https://whiteboardconsultant.com/student/tests` | List of available tests |
| View Test | `https://whiteboardconsultant.com/student/test/[testId]` | Test details/instructions |
| Take Test | `https://whiteboardconsultant.com/student/tests/[testId]/take` | Active test-taking interface |
| Test Results | `https://whiteboardconsultant.com/student/test-results/[attemptId]` | View test results |
| Quiz Results | `https://whiteboardconsultant.com/student/quiz-results/[attemptId]` | View quiz attempt results |
| My Results | `https://whiteboardconsultant.com/student/my-results` | All past test/quiz results |

### Certificates
| Page | URL | Description |
|------|-----|-------------|
| Certificates | `https://whiteboardconsultant.com/student/certificates` | List of earned certificates |
| View Certificate | `https://whiteboardconsultant.com/student/certificate/[enrollmentId]` | Download/view certificate |

---

## 👨‍🏫 INSTRUCTOR DASHBOARD (Authenticated Instructors)

### Instructor Courses
| Page | URL | Description |
|------|-----|-------------|
| Instructor Dashboard | `https://whiteboardconsultant.com/instructor/dashboard` | Instructor main hub |
| My Courses | `https://whiteboardconsultant.com/instructor/courses` | List of courses taught |
| Create Course | `https://whiteboardconsultant.com/instructor/courses/create` | Create new course |
| Edit Course | `https://whiteboardconsultant.com/instructor/courses/edit/[courseId]` | Edit course details |
| Edit Lesson | `https://whiteboardconsultant.com/instructor/courses/edit/[courseId]/lessons/[lessonId]` | Edit specific lesson |

### Instructor Tests & Quizzes
| Page | URL | Description |
|------|-----|-------------|
| My Tests | `https://whiteboardconsultant.com/instructor/tests` | Manage tests/quizzes |
| Create Test | `https://whiteboardconsultant.com/instructor/tests/create` | Create new test |
| Edit Test | `https://whiteboardconsultant.com/instructor/tests/edit/[testId]` | Modify test |

### Instructor Students & Reports
| Page | URL | Description |
|------|-----|-------------|
| Students | `https://whiteboardconsultant.com/instructor/students/[courseId]` | View enrolled students |
| Course Reports | `https://whiteboardconsultant.com/instructor/reports/[courseId]` | Course analytics & reports |
| Test Reports | `https://whiteboardconsultant.com/instructor/reports/tests` | Test/quiz analytics |

### Instructor Communication
| Page | URL | Description |
|------|-----|-------------|
| Announcements | `https://whiteboardconsultant.com/instructor/announcements` | Manage course announcements |
| AI Suggester | `https://whiteboardconsultant.com/instructor/ai-suggester` | AI-powered content suggestions |

---

## 🛠️ ADMIN DASHBOARD (Authenticated Admins)

### Admin Dashboard & Users
| Page | URL | Description |
|------|-----|-------------|
| Admin Dashboard | `https://whiteboardconsultant.com/admin/dashboard` | Admin main hub |
| User Management | `https://whiteboardconsultant.com/admin/users` | Manage all users |
| Manual User Creation | `https://whiteboardconsultant.com/admin/manual-users` | Create users manually |

### Admin Courses & Content
| Page | URL | Description |
|------|-----|-------------|
| Courses | `https://whiteboardconsultant.com/admin/courses` | Manage all courses |
| Blog | `https://whiteboardconsultant.com/admin/blog` | Manage blog posts |
| Create Blog Post | `https://whiteboardconsultant.com/admin/blog/new` | Write new blog post |
| Edit Blog Post | `https://whiteboardconsultant.com/admin/blog/edit/[id]` | Edit existing blog post |

### Admin Tests & Assessments
| Page | URL | Description |
|------|-----|-------------|
| Tests | `https://whiteboardconsultant.com/admin/tests` | Manage all tests/quizzes |
| Certificates | `https://whiteboardconsultant.com/admin/certificates` | Manage certificates |

### Admin Enrollments & Analytics
| Page | URL | Description |
|------|-----|-------------|
| Enrollments | `https://whiteboardconsultant.com/admin/enrollments` | Manage course enrollments |
| Reports | `https://whiteboardconsultant.com/admin/reports` | Overall analytics |
| Instructor Reports | `https://whiteboardconsultant.com/admin/reports/instructors` | Instructor performance |
| Test Reports | `https://whiteboardconsultant.com/admin/reports/tests` | Test/quiz analytics |

### Admin Engagement & Communications
| Page | URL | Description |
|------|-----|-------------|
| Announcements | `https://whiteboardconsultant.com/admin/announcements` | Manage system-wide announcements |
| Contact Submissions | `https://whiteboardconsultant.com/admin/contact-submissions` | View contact form submissions |
| Resume Submissions | `https://whiteboardconsultant.com/admin/resume-submissions` | View resume submissions |
| Coupons | `https://whiteboardconsultant.com/admin/coupons` | Manage discount coupons |

---

## ⚙️ USER SETTINGS

| Page | URL | Description |
|------|-----|-------------|
| Settings | `https://whiteboardconsultant.com/settings` | User profile/account settings |

---

## 🧪 DEVELOPMENT/TEST PAGES (Consider Removing in Production)

These pages are useful for development but should be removed or protected before production:

| Page | URL | Purpose |
|------|-----|---------|
| Test Upload | `https://whiteboardconsultant.com/test-upload` | File upload testing |
| Simple Upload Test | `https://whiteboardconsultant.com/test-simple-upload` | Basic upload functionality |
| Debug Upload | `https://whiteboardconsultant.com/debug-upload` | Upload debugging |
| Category Demo | `https://whiteboardconsultant.com/category-demo` | Category display demo |
| Environment Test | `https://whiteboardconsultant.com/test-env` | Environment variables check |
| Auth Diagnostic | `https://whiteboardconsultant.com/auth-diagnostic` | Auth debugging |
| Direct Test | `https://whiteboardconsultant.com/direct-test` | Direct functionality test |
| Logout Test | `https://whiteboardconsultant.com/logout-test` | Logout testing |

---

## 📡 API ROUTES (Backend Services)

### Authentication APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/forgot-password` | POST | Password reset request |
| `/api/auth/reset-password` | POST | Reset password with token |
| `/api/auth/refresh` | POST | Refresh authentication token |

### Payment APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/create-order` | POST | Create Razorpay payment order |
| `/api/verify-payment` | POST | Verify payment completion |
| `/api/apply-coupon` | POST | Apply discount coupon |

### Course APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/courses` | GET, POST | Get all courses / Create course |
| `/api/courses/[id]` | GET, PUT, DELETE | Course operations |
| `/api/courses/[id]/enroll` | POST | Enroll in course |
| `/api/courses/[id]/lessons` | GET | Get course lessons |

### User APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/users/profile` | GET, PUT | User profile operations |
| `/api/users/me` | GET | Get current user info |
| `/api/users/[id]` | GET, PUT, DELETE | User management |

### Test/Quiz APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tests` | GET, POST | Manage tests |
| `/api/tests/[id]` | GET, PUT, DELETE | Test operations |
| `/api/tests/[id]/submit` | POST | Submit test answers |
| `/api/quizzes/[id]/submit` | POST | Submit quiz |

### Email APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/send-email` | POST | Send email (internal) |
| `/api/contact` | POST | Contact form submission |

### Upload APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/upload` | POST | Upload files |
| `/api/upload/video` | POST | Upload videos |

### Chat/AI APIs
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI chatbot endpoint |
| `/api/ai-suggestions` | POST | Get AI content suggestions |

---

## 📋 DYNAMIC URL EXAMPLES

Here are examples of what dynamic URLs will look like with real data:

### Course Examples
```
https://whiteboardconsultant.com/courses/abc123
https://whiteboardconsultant.com/courses/xyz789/lessons/lesson-001
https://whiteboardconsultant.com/courses/abc123/learn
```

### Student Examples
```
https://whiteboardconsultant.com/student/course/abc123
https://whiteboardconsultant.com/student/tests/test-456/take
https://whiteboardconsultant.com/student/certificate/enrollment-789
```

### Blog Examples
```
https://whiteboardconsultant.com/blog/how-to-prepare-for-gmat
https://whiteboardconsultant.com/blog/study-tips-for-ielts
```

---

## 🔒 AUTHENTICATION REQUIREMENTS

### Public Access (No Login Required)
- `/` - Homepage
- `/about` - About page
- `/contact` - Contact page
- `/courses` - Course catalog
- `/blog` - Blog listings
- `/study-abroad/*` - All study abroad pages
- `/college-admissions` - College admissions hub
- `/admissions/uow-india/*` - UOW admissions
- `/auth/*` - Authentication pages
- `/cart` - Shopping cart

### Student Access (Login Required + Student Role)
- `/student/*` - All student dashboard pages
- `/courses/[courseId]/lessons/[lessonId]` - Individual lessons

### Instructor Access (Login Required + Instructor Role)
- `/instructor/*` - All instructor dashboard pages

### Admin Access (Login Required + Admin Role)
- `/admin/*` - All admin dashboard pages

---

## 🌐 SEO & CANONICAL URLS

All pages include canonical URLs to avoid duplicate content issues. When deployed, ensure:

1. SSL certificate is valid (HTTPS)
2. Redirect HTTP → HTTPS
3. Redirect www → non-www (or vice versa - consistently)
4. All internal links use absolute URLs for SEO

Recommended configuration:
- **Primary domain:** `https://whiteboardconsultant.com`
- **Redirect from:** `https://www.whiteboardconsultant.com` → `https://whiteboardconsultant.com`
- **Redirect from:** `http://whiteboardconsultant.com` → `https://whiteboardconsultant.com`

---

## 📊 QUICK STATISTICS

- **Total Public Pages:** 16
- **Total Authenticated Pages:** 63+
- **Total Student Pages:** 15
- **Total Instructor Pages:** 11
- **Total Admin Pages:** 18
- **Dynamic Routes:** 20+
- **API Endpoints:** 25+
- **Blog Posts:** Dynamic (unlimited)
- **Study Abroad Destinations:** 9 destinations

---

## ⚡ PERFORMANCE NOTES

### Vercel Deployment Benefits
- Automatic HTTPS
- Global CDN distribution
- Automatic image optimization
- Built-in analytics

### Recommended URL Structure Best Practices
1. ✅ Use lowercase URLs (already done)
2. ✅ Use hyphens instead of underscores (already done)
3. ✅ Keep URLs short and descriptive (mostly done)
4. ✅ Avoid query parameters for main navigation (already done)

---

## 🚀 PRE-DEPLOYMENT CHECKLIST

Before going live with `whiteboardconsultant.com`:

- [ ] Verify all routes compile without errors
- [ ] Test all public pages load correctly
- [ ] Test authentication flow (login/register)
- [ ] Test student enrollment workflow
- [ ] Test payment integration (Razorpay)
- [ ] Test email delivery (SMTP2GO)
- [ ] Verify SEO meta tags on all pages
- [ ] Test responsive design on mobile
- [ ] Verify SSL certificate is valid
- [ ] Set up domain DNS records pointing to Vercel
- [ ] Configure custom domain in Vercel project settings
- [ ] Add environment variables to Vercel
- [ ] Test all integrations (Analytics, reCAPTCHA, etc.)
- [ ] Set up monitoring & error tracking
- [ ] Backup database
- [ ] Create maintenance plan

---

## 📞 SUPPORT RESOURCES

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Documentation:** https://nextjs.org/docs
- **Supabase Documentation:** https://supabase.com/docs
- **Razorpay Integration:** https://razorpay.com/docs/
- **SMTP2GO Documentation:** https://www.smtp2go.com/docs/

---

**Last Updated:** October 23, 2025  
**Domain:** whiteboardconsultant.com  
**Status:** Ready for Production Deployment ✅
