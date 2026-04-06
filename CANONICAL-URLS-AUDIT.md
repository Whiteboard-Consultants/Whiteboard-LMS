# Canonical URLs Audit - Complete Report

**Total page.tsx files found:** 110
**Files WITH canonical URLs:** 19 (17.3%)
**Files WITHOUT canonical URLs:** 91 (82.7%)

Generated: April 6, 2026

---

## Files WITHOUT Canonical URLs (91 Total)

### PUBLIC PAGES (35 files) - PRIORITY: HIGH
These are publicly accessible pages that should have canonical URLs for SEO.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `(public)/about/page.tsx` | `/about` | HIGH | Public about page |
| `(public)/admissions/uow-india/apply/page.tsx` | `/admissions/uow-india/apply` | HIGH | Application form |
| `(public)/blog/[slug]/page.tsx` | `/blog/[slug]` | HIGH | Dynamic blog post (needs param handling) |
| `(public)/career-solutions/page.tsx` | `/career-solutions` | HIGH | Career solutions main page |
| `(public)/career-solutions/internship-programs/page.tsx` | `/career-solutions/internship-programs` | HIGH | Internship programs page |
| `(public)/career-solutions/skill-development/page.tsx` | `/career-solutions/skill-development` | HIGH | Skill development page |
| `(public)/courses/[courseId]/page.tsx` | `/courses/[courseId]` | HIGH | Dynamic course page (needs param handling) |
| `(public)/courses/[courseId]/learn/page.tsx` | `/courses/[courseId]/learn` | HIGH | Course learning page (needs param handling) |
| `(public)/courses/[courseId]/lessons/[lessonId]/page.tsx` | `/courses/[courseId]/lessons/[lessonId]` | HIGH | Lesson page (needs param handling) |
| `(public)/demo/lesson-viewer/page.tsx` | `/demo/lesson-viewer` | HIGH | Demo lesson viewer |
| `(public)/landing/resume-mastery/page.tsx` | `/landing/resume-mastery` | HIGH | Resume mastery landing page |
| `(public)/mock-tests/[seriesSlug]/page.tsx` | `/mock-tests/[seriesSlug]` | HIGH | Dynamic mock test series (needs param handling) |
| `(public)/privacy/page.tsx` | `/privacy` | HIGH | Privacy policy page |
| `(public)/refund-policy/page.tsx` | `/refund-policy` | HIGH | Refund policy page |
| `(public)/simple-register/page.tsx` | `/simple-register` | MEDIUM | Simplified registration page |

### AUTH PAGES (4 files) - PRIORITY: MEDIUM
Authentication pages may not need canonical URLs if they're session-specific, but are recommended.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `(auth)/forgot-password/page.tsx` | `/auth/forgot-password` | MEDIUM | Forgot password form |
| `(auth)/login/page.tsx` | `/auth/login` | MEDIUM | Login page |
| `(auth)/register/page.tsx` | `/auth/register` | MEDIUM | Registration page |
| `(auth)/reset-password/page.tsx` | `/auth/reset-password` | MEDIUM | Reset password form |

### AUTH STATUS PAGES (2 files) - PRIORITY: LOW
Special auth status pages.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `auth/account-suspended/page.tsx` | `/auth/account-suspended` | LOW | Account suspended page |
| `auth/pending-approval/page.tsx` | `/auth/pending-approval` | LOW | Pending approval page |

### ADMIN PAGES (14 files) - PRIORITY: LOW-MEDIUM
Internal admin pages. Low priority as they're behind authentication, but could help with internal linking.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `(main)/admin/announcements/page.tsx` | `/admin/announcements` | LOW | Announcements management |
| `(main)/admin/blog/edit/[id]/page.tsx` | `/admin/blog/edit/[id]` | LOW | Blog edit page (dynamic) |
| `(main)/admin/blog/new/page.tsx` | `/admin/blog/new` | LOW | New blog post page |
| `(main)/admin/blog/page.tsx` | `/admin/blog` | LOW | Blog management |
| `(main)/admin/certificates/page.tsx` | `/admin/certificates` | LOW | Certificates management |
| `(main)/admin/commissions/page.tsx` | `/admin/commissions` | LOW | Commissions management |
| `(main)/admin/contact-submissions/page.tsx` | `/admin/contact-submissions` | LOW | Contact submissions |
| `(main)/admin/courses/page.tsx` | `/admin/courses` | LOW | Courses management |
| `(main)/admin/coupons/page.tsx` | `/admin/coupons` | LOW | Coupons management |
| `(main)/admin/dashboard/page.tsx` | `/admin/dashboard` | LOW | Admin dashboard |
| `(main)/admin/enrollments/page.tsx` | `/admin/enrollments` | LOW | Enrollments management |
| `(main)/admin/performance/page.tsx` | `/admin/performance` | LOW | Performance page |
| `(main)/admin/programs/page.tsx` | `/admin/programs` | LOW | Programs management |
| `(main)/admin/reports/commission/page.tsx` | `/admin/reports/commission` | LOW | Commission reports |
| `(main)/admin/reports/instructors/page.tsx` | `/admin/reports/instructors` | LOW | Instructor reports |
| `(main)/admin/reports/page.tsx` | `/admin/reports` | LOW | Reports main page |
| `(main)/admin/reports/tests/page.tsx` | `/admin/reports/tests` | LOW | Test reports |
| `(main)/admin/resume-submissions/page.tsx` | `/admin/resume-submissions` | LOW | Resume submissions |
| `(main)/admin/tests/page.tsx` | `/admin/tests` | LOW | Tests management |
| `(main)/admin/users/page.tsx` | `/admin/users` | LOW | Users management |

### ADMIN SPECIAL PAGES (1 file) - PRIORITY: LOW
Special admin pages outside the route group.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `admin/manual-users/page.tsx` | `/admin/manual-users` | LOW | Manual user creation |
| `admin/faqs/page.tsx` | `/admin/faqs` | LOW | FAQs management |

### INSTRUCTOR PAGES (12 files) - PRIORITY: LOW
Internal instructor pages behind authentication.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `(main)/instructor/ai-suggester/page.tsx` | `/instructor/ai-suggester` | LOW | AI suggester tool |
| `(main)/instructor/announcements/page.tsx` | `/instructor/announcements` | LOW | Announcements management |
| `(main)/instructor/courses/create/page.tsx` | `/instructor/courses/create` | LOW | Create course |
| `(main)/instructor/courses/edit/[courseId]/page.tsx` | `/instructor/courses/edit/[courseId]` | LOW | Edit course (dynamic) |
| `(main)/instructor/courses/edit/[courseId]/lessons/[lessonId]/page.tsx` | `/instructor/courses/edit/[courseId]/lessons/[lessonId]` | LOW | Edit lesson (dynamic) |
| `(main)/instructor/courses/page.tsx` | `/instructor/courses` | LOW | Courses management |
| `(main)/instructor/dashboard/page.tsx` | `/instructor/dashboard` | LOW | Instructor dashboard |
| `(main)/instructor/grading/page.tsx` | `/instructor/grading` | LOW | Grading page |
| `(main)/instructor/grading/[attemptId]/page.tsx` | `/instructor/grading/[attemptId]` | LOW | Grade attempt (dynamic) |
| `(main)/instructor/help/page.tsx` | `/instructor/help` | LOW | Instructor help page |
| `(main)/instructor/messages/page.tsx` | `/instructor/messages` | LOW | Messages page |
| `(main)/instructor/messages/[threadId]/page.tsx` | `/instructor/messages/[threadId]` | LOW | Message thread (dynamic) |
| `(main)/instructor/reports/page.tsx` | `/instructor/reports` | LOW | Reports main |
| `(main)/instructor/reports/[courseId]/page.tsx` | `/instructor/reports/[courseId]` | LOW | Course reports (dynamic) |
| `(main)/instructor/reports/tests/page.tsx` | `/instructor/reports/tests` | LOW | Test reports |
| `(main)/instructor/students/[courseId]/page.tsx` | `/instructor/students/[courseId]` | LOW | Course students (dynamic) |
| `(main)/instructor/tests/create/page.tsx` | `/instructor/tests/create` | LOW | Create test |
| `(main)/instructor/tests/edit/[testId]/page.tsx` | `/instructor/tests/edit/[testId]` | LOW | Edit test (dynamic) |
| `(main)/instructor/tests/page.tsx` | `/instructor/tests` | LOW | Tests management |

### STUDENT PAGES (20 files) - PRIORITY: LOW
Internal student pages behind authentication.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `(main)/settings/page.tsx` | `/settings` | LOW | Settings page |
| `(main)/student/certificates/page.tsx` | `/student/certificates` | LOW | Certificates page |
| `(main)/student/certificate/[enrollmentId]/page.tsx` | `/student/certificate/[enrollmentId]` | LOW | Certificate detail (dynamic) |
| `(main)/student/complete-profile/page.tsx` | `/student/complete-profile` | LOW | Complete profile form |
| `(main)/student/course/[courseId]/page.tsx` | `/student/course/[courseId]` | LOW | Course page (dynamic) |
| `(main)/student/dashboard/page.tsx` | `/student/dashboard` | LOW | Student dashboard |
| `(main)/student/help/page.tsx` | `/student/help` | LOW | Help page |
| `(main)/student/messages/page.tsx` | `/student/messages` | LOW | Messages page |
| `(main)/student/my-results/page.tsx` | `/student/my-results` | LOW | My results page |
| `(main)/student/notifications/page.tsx` | `/student/notifications` | LOW | Notifications page |
| `(main)/student/quiz-results/[attemptId]/page.tsx` | `/student/quiz-results/[attemptId]` | LOW | Quiz results (dynamic) |
| `(main)/student/skills/page.tsx` | `/student/skills` | LOW | Skills page |
| `(main)/student/test/[testId]/page.tsx` | `/student/test/[testId]` | LOW | Test page (dynamic) |
| `(main)/student/test-results/[attemptId]/page.tsx` | `/student/test-results/[attemptId]` | LOW | Test results (dynamic) |
| `(main)/student/tests/page.tsx` | `/student/tests` | LOW | Tests list |
| `(main)/student/tests/[testId]/take/page.tsx` | `/student/tests/[testId]/take` | LOW | Take test (dynamic) |
| `(main)/student/[courseId]/messaging/page.tsx` | `/student/[courseId]/messaging` | LOW | Course messaging (dynamic) |
| `(main)/student/[courseId]/messaging/new/page.tsx` | `/student/[courseId]/messaging/new` | LOW | New message (dynamic) |
| `(main)/student/[courseId]/messaging/[threadId]/page.tsx` | `/student/[courseId]/messaging/[threadId]` | LOW | Message thread (dynamic) |

### TEST/DEBUG PAGES (3 files) - PRIORITY: NONE
Temporary test/debug pages - do not add canonical URLs.

| Path | Suggested Canonical URL | Priority | Notes |
|------|------------------------|----------|-------|
| `test-env/page.tsx` | N/A | NONE | Test environment page |
| `test-upload/page.tsx` | N/A | NONE | Upload test page |
| `test-simple-upload/page.tsx` | N/A | NONE | Simple upload test |
| `test/[testId]/page.tsx` | N/A | NONE | Direct test page |
| `direct-test/page.tsx` | N/A | NONE | Direct test page |
| `debug-upload/page.tsx` | N/A | NONE | Debug upload page |
| `category-demo/page.tsx` | N/A | NONE | Category demo page |
| `auth-diagnostic/page.tsx` | N/A | NONE | Auth diagnostic page |
| `cart/page.tsx` | N/A | NONE | Cart test page |
| `student/test-cart/page.tsx` | N/A | NONE | Student test cart |
| `logout-test/page.tsx` | N/A | NONE | Logout test page |

---

## Summary by Priority

| Priority | Count | Description | Action |
|----------|-------|-------------|--------|
| **HIGH** | 15 | Public SEO pages | ✅ ADD CANONICAL URLs |
| **MEDIUM** | 6 | Auth pages + simple register | ⚠️ CONSIDER adding |
| **LOW** | 55 | Internal admin/instructor/student pages | ⏸️ OPTIONAL - for internal linking |
| **NONE** | 15 | Test/debug pages | ❌ DO NOT ADD |
| **WITH** | 19 | Already have canonicals | ✅ NO ACTION NEEDED |

---

## Action Items

### Immediate (High Priority - 15 files)
- [ ] Add canonical URLs to all PUBLIC pages marked as HIGH priority
- [ ] These are the most important for SEO

### Secondary (Medium Priority - 6 files)
- [ ] Consider adding canonical URLs to auth pages
- [ ] May help with internal consistency

### Optional (Low Priority - 55 files)
- [ ] Add canonical URLs to internal authenticated pages if desired
- [ ] Not critical for SEO but can help with internal linking

### Not Needed (15 files)
- [ ] Test and debug pages should NOT have canonical URLs
- [ ] Remove if accidentally added

---

## Implementation Notes

1. **Dynamic Routes**: For pages with parameters like `[courseId]`, the canonical URL should include the parameter marker (e.g., `/courses/[courseId]`). However, you may need custom logic in the metadata export to construct actual URLs for each instance.

2. **Consistency**: All canonical URLs should:
   - Start with `/` (relative to domain root)
   - Use lowercase
   - Avoid trailing slashes (unless the page specifically requires them)
   - Match the exact URL structure in Next.js routing

3. **Metadata Export Pattern** (for reference - already found in existing files):
   ```typescript
   export const metadata: Metadata = {
     title: 'Page Title',
     alternates: {
       canonical: '/path/to/page'
     }
   }
   ```

4. **Dynamic Pages**: For dynamic routes, consider using URL construction:
   ```typescript
   export async function generateMetadata({ params }: Props): Promise<Metadata> {
     return {
       alternates: {
         canonical: `https://yourdomain.com/path/${params.id}`
       }
     }
   }
   ```
