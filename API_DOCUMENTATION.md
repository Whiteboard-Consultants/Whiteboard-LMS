# WhitedgeLMS - API Documentation

## Overview

WhitedgeLMS provides a comprehensive set of server-side actions (Next.js App Router) for frontend integration. All API operations use TypeScript with Zod validation and return structured responses.

**Base URL**: `http://localhost:3000/api` (local) or `https://www.whiteboardconsultant.com/api` (production)

**Authentication**: All endpoints require a valid Supabase session token (automatically managed by Next.js middleware)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Courses](#courses)
4. [Tests](#tests)
5. [Questions](#questions)
6. [Test Attempts](#test-attempts)
7. [Blog Posts](#blog-posts)
8. [Certificates](#certificates)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## Authentication

### Login
- **Endpoint**: `POST /auth/login`
- **Method**: Server Action via Supabase Auth
- **Request**:
  ```typescript
  {
    email: string;
    password: string;
  }
  ```
- **Response**:
  ```typescript
  {
    user: {
      id: string;
      email: string;
      name: string;
      role: 'admin' | 'instructor' | 'student';
      status: 'pending' | 'approved' | 'rejected' | 'suspended';
    };
    session: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };
  }
  ```
- **Status Codes**: 200 (success), 401 (invalid credentials), 400 (validation error)

### Logout
- **Endpoint**: `POST /auth/logout`
- **Method**: Server Action
- **Response**: `{ success: true }`
- **Status Codes**: 200 (success)

### Get Current User
- **Endpoint**: `GET /auth/user`
- **Method**: API Route
- **Response**: User object (same as Login response)
- **Status Codes**: 200 (success), 401 (no session)

### Sign Up
- **Endpoint**: `POST /auth/signup`
- **Method**: Server Action via Supabase Auth
- **Request**:
  ```typescript
  {
    email: string;
    password: string;
    name: string;
    role: 'student' | 'instructor';
  }
  ```
- **Response**: User object
- **Status Codes**: 201 (created), 400 (validation error), 409 (email exists)

---

## Users

### Get User Profile
- **Endpoint**: `GET /api/users/:userId`
- **Method**: API Route
- **Parameters**:
  - `userId` (path): User UUID
- **Response**:
  ```typescript
  {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatar_url?: string;
    phone?: string;
    created_at: string;
    updated_at: string;
  }
  ```
- **Status Codes**: 200 (success), 404 (not found), 401 (unauthorized)

### Update User Profile
- **Endpoint**: `POST /api/users/update-profile`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    name?: string;
    phone?: string;
    avatar_url?: string;
  }
  ```
- **Response**: Updated user object
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized)

### Upload Avatar
- **Endpoint**: `POST /api/users/upload-avatar`
- **Method**: API Route (multipart/form-data)
- **Request**: FormData with `file` field (image file)
- **Response**:
  ```typescript
  {
    url: string;
    path: string;
  }
  ```
- **Status Codes**: 200 (success), 400 (validation error), 413 (file too large)

### List Users (Admin Only)
- **Endpoint**: `GET /api/admin/users?role=student&status=approved&page=1`
- **Method**: API Route
- **Query Parameters**:
  - `role`: Filter by role (optional)
  - `status`: Filter by status (optional)
  - `page`: Pagination (default: 1)
  - `limit`: Items per page (default: 20)
- **Response**:
  ```typescript
  {
    data: User[];
    total: number;
    page: number;
    limit: number;
  }
  ```
- **Status Codes**: 200 (success), 401 (unauthorized), 403 (forbidden)

### Approve User (Admin Only)
- **Endpoint**: `POST /api/admin/users/:userId/approve`
- **Method**: Server Action
- **Response**: Updated user object with status = 'approved'
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

### Suspend User (Admin Only)
- **Endpoint**: `POST /api/admin/users/:userId/suspend`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    reason?: string;
  }
  ```
- **Response**: Updated user object with status = 'suspended'
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

---

## Courses

### Get All Courses
- **Endpoint**: `GET /api/courses?category=Test%20Prep&page=1`
- **Method**: API Route
- **Query Parameters**:
  - `category`: Filter by category (optional)
  - `instructor_id`: Filter by instructor (optional)
  - `page`: Pagination (default: 1)
  - `limit`: Items per page (default: 10)
  - `search`: Search by title/description (optional)
- **Response**:
  ```typescript
  {
    data: Course[];
    total: number;
    page: number;
    limit: number;
  }
  ```

### Get Course Details
- **Endpoint**: `GET /api/courses/:courseId`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    id: string;
    title: string;
    description: string;
    instructor_id: string;
    instructor?: { name: string; avatar_url?: string };
    price: number;
    original_price?: number;
    category: string;
    image_url: string;
    rating: number;
    student_count: number;
    created_at: string;
    modules?: Module[];
    faq?: FAQ[];
    program_outcomes?: string[];
  }
  ```

### Create Course (Instructor Only)
- **Endpoint**: `POST /api/courses/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    title: string;
    description: string;
    category: string;
    price?: number;
    original_price?: number;
    image_url?: string;
  }
  ```
- **Response**: Created course object with id
- **Status Codes**: 201 (created), 400 (validation error), 401 (unauthorized)

### Update Course (Instructor Only)
- **Endpoint**: `POST /api/courses/:courseId/update`
- **Method**: Server Action
- **Request**: Same as Create Course (all fields optional)
- **Response**: Updated course object
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

### Enroll in Course (Student)
- **Endpoint**: `POST /api/courses/:courseId/enroll`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    coupon_code?: string;
  }
  ```
- **Response**:
  ```typescript
  {
    enrollment_id: string;
    course_id: string;
    user_id: string;
    enrolled_at: string;
    discount_applied?: number;
  }
  ```
- **Status Codes**: 201 (created), 400 (invalid coupon), 409 (already enrolled)

### Get Enrolled Courses (Student)
- **Endpoint**: `GET /api/courses/student/enrolled`
- **Method**: API Route
- **Response**: Course[] with enrollment_date and progress
- **Status Codes**: 200 (success), 401 (unauthorized)

---

## Tests

### Get All Tests (Paginated)
- **Endpoint**: `GET /api/tests?course_id=uuid&page=1`
- **Method**: API Route
- **Query Parameters**:
  - `course_id`: Filter by course (optional)
  - `instructor_id`: Filter by instructor (optional)
  - `page`: Pagination (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
  ```typescript
  {
    data: Test[];
    total: number;
    page: number;
  }
  ```

### Get Test Details
- **Endpoint**: `GET /api/tests/:testId`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    id: string;
    title: string;
    description?: string;
    course_id: string;
    instructor_id: string;
    total_marks: number;
    duration: number; // in minutes
    passing_percentage: number;
    attempts_allowed: number;
    is_published: boolean;
    sections?: Section[];
    created_at: string;
  }
  ```

### Create Test (Instructor Only)
- **Endpoint**: `POST /api/tests/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    title: string;
    description?: string;
    course_id: string;
    total_marks: number;
    duration: number;
    passing_percentage: number;
    attempts_allowed?: number;
  }
  ```
- **Response**: Created test object with id
- **Status Codes**: 201 (created), 400 (validation error), 403 (forbidden)

### Update Test (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/update`
- **Method**: Server Action
- **Request**: Same as Create Test (all fields optional)
- **Response**: Updated test object
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

### Publish Test (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/publish`
- **Method**: Server Action
- **Response**: Test object with is_published = true
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

### Delete Test (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/delete`
- **Method**: Server Action
- **Response**: `{ success: true }`
- **Status Codes**: 200 (success), 404 (not found), 403 (forbidden)

### Get Test Sections
- **Endpoint**: `GET /api/tests/:testId/sections`
- **Method**: API Route
- **Response**:
  ```typescript
  Section[] {
    id: string;
    test_id: string;
    name: string;
    description?: string;
    duration: number; // in minutes
    order_number: number;
  }
  ```

### Create Section (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/sections/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    name: string;
    description?: string;
    duration: number; // in minutes
    order_number: number;
  }
  ```
- **Response**: Created section object

### Update Section (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/sections/:sectionId/update`
- **Method**: Server Action
- **Request**: Same as Create Section (all fields optional)
- **Response**: Updated section object

---

## Questions

### Get Test Questions
- **Endpoint**: `GET /api/tests/:testId/questions?section_id=uuid`
- **Method**: API Route
- **Query Parameters**:
  - `section_id`: Filter by section (optional)
- **Response**:
  ```typescript
  TestQuestion[] {
    id: string;
    test_id: string;
    section_id?: string;
    question_text: string; // HTML formatted
    question_type: 'multiple_choice' | 'descriptive';
    options?: string[]; // for MCQ
    correct_answer?: number; // index for MCQ
    explanation: string; // HTML formatted solution
    points: number;
    negative_marks?: number;
    order_number: number;
    passage_id?: string;
  }
  ```

### Create Question (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/questions/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    question_text: string; // HTML
    question_type: 'multiple_choice' | 'descriptive';
    options?: string[]; // for MCQ
    correct_answer?: number; // for MCQ
    explanation: string; // HTML
    points: number;
    negative_marks?: number;
    section_id?: string;
    passage_id?: string;
    order_number: number;
  }
  ```
- **Response**: Created question object with id
- **Status Codes**: 201 (created), 400 (validation error), 403 (forbidden)

### Update Question (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/questions/:questionId/update`
- **Method**: Server Action
- **Request**: Same as Create Question (all fields optional)
- **Response**: Updated question object

### Delete Question (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/questions/:questionId/delete`
- **Method**: Server Action
- **Response**: `{ success: true }`

### Get Test Passages
- **Endpoint**: `GET /api/tests/:testId/passages`
- **Method**: API Route
- **Response**:
  ```typescript
  TestPassage[] {
    id: string;
    test_id: string;
    title: string;
    content: string; // HTML formatted
    display_order: number;
  }
  ```

### Create Passage (Instructor Only)
- **Endpoint**: `POST /api/tests/:testId/passages/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    title: string;
    content: string; // HTML
    display_order: number;
  }
  ```
- **Response**: Created passage object

---

## Test Attempts

### Start Test
- **Endpoint**: `POST /api/test-attempts/start`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    test_id: string;
  }
  ```
- **Response**:
  ```typescript
  {
    attempt_id: string;
    test_id: string;
    user_id: string;
    start_time: string;
    status: 'in_progress';
  }
  ```
- **Status Codes**: 201 (created), 400 (validation error), 409 (attempt exists)

### Get Test Attempt
- **Endpoint**: `GET /api/test-attempts/:attemptId`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    id: string;
    user_id: string;
    test_id: string;
    status: 'in_progress' | 'completed' | 'abandoned';
    start_time: string;
    submitted_at?: string;
    score?: number;
    total_marks: number;
    answers?: Answer[];
  }
  ```

### Save Answer
- **Endpoint**: `POST /api/test-attempts/:attemptId/save-answer`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    question_id: string;
    option_index?: number; // for MCQ
    text_answer?: string; // for descriptive
    marked_for_review?: boolean;
  }
  ```
- **Response**:
  ```typescript
  {
    question_id: string;
    option_index?: number;
    text_answer?: string;
    marked_for_review: boolean;
    saved_at: string;
  }
  ```
- **Status Codes**: 200 (success), 400 (validation error)

### Submit Test
- **Endpoint**: `POST /api/test-attempts/:attemptId/submit`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    section_id?: string; // for sectional submission
  }
  ```
- **Response**:
  ```typescript
  {
    attempt_id: string;
    status: 'completed';
    submitted_at: string;
    score: number;
    total_marks: number;
    percentile?: number;
    result_id?: string;
  }
  ```
- **Status Codes**: 200 (success), 400 (already submitted)

### Get Test Result
- **Endpoint**: `GET /api/test-attempts/:attemptId/result`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    result_id: string;
    attempt_id: string;
    score: number;
    total_marks: number;
    percentage: number;
    percentile: number;
    passed: boolean;
    question_analysis: QuestionResult[];
    submitted_at: string;
  }
  ```

### Get User Attempts (Student)
- **Endpoint**: `GET /api/test-attempts/user/:userId?test_id=uuid`
- **Method**: API Route
- **Query Parameters**:
  - `test_id`: Filter by test (optional)
- **Response**: TestAttempt[]

### Get Test Statistics (Instructor)
- **Endpoint**: `GET /api/tests/:testId/statistics`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    total_attempts: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    pass_count: number;
    fail_count: number;
    average_time: number; // in seconds
    question_analysis: {
      question_id: string;
      correct_count: number;
      incorrect_count: number;
      skipped_count: number;
      difficulty_index: number;
    }[];
  }
  ```

---

## Blog Posts

### Get All Blog Posts
- **Endpoint**: `GET /api/blog/posts?category=Test%20Prep&status=published&page=1`
- **Method**: API Route
- **Query Parameters**:
  - `category`: Filter by category (optional)
  - `status`: published/draft (default: published)
  - `author_id`: Filter by author (optional)
  - `page`: Pagination
  - `limit`: Items per page (default: 10)
- **Response**:
  ```typescript
  {
    data: BlogPost[];
    total: number;
    page: number;
  }
  ```

### Get Blog Post
- **Endpoint**: `GET /api/blog/posts/:slug`
- **Method**: API Route
- **Response**:
  ```typescript
  {
    id: string;
    title: string;
    content: string; // HTML
    excerpt: string;
    author_id: string;
    author?: { name: string; avatar_url?: string };
    category: string;
    slug: string;
    featured_image_url?: string;
    status: string;
    created_at: string;
    updated_at: string;
  }
  ```

### Create Blog Post (Instructor)
- **Endpoint**: `POST /api/blog/posts/create`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    title: string;
    content: string; // HTML
    excerpt?: string;
    category: string;
    featured_image_url?: string;
    status?: 'draft' | 'published';
  }
  ```
- **Response**: Created blog post with generated slug

### Update Blog Post (Author)
- **Endpoint**: `POST /api/blog/posts/:postId/update`
- **Method**: Server Action
- **Request**: Same as Create Blog Post (all optional)
- **Response**: Updated blog post

### Publish Blog Post (Author)
- **Endpoint**: `POST /api/blog/posts/:postId/publish`
- **Method**: Server Action
- **Response**: Blog post with status = 'published'

### Delete Blog Post (Author)
- **Endpoint**: `POST /api/blog/posts/:postId/delete`
- **Method**: Server Action
- **Response**: `{ success: true }`

---

## Certificates

### Generate Certificate (After Test Pass)
- **Endpoint**: `POST /api/certificates/generate`
- **Method**: Server Action
- **Request**:
  ```typescript
  {
    attempt_id: string;
    test_id: string;
  }
  ```
- **Response**:
  ```typescript
  {
    certificate_id: string;
    user_id: string;
    test_id: string;
    attempt_id: string;
    certificate_url: string;
    issued_at: string;
  }
  ```
- **Status Codes**: 201 (created), 400 (test not passed)

### Download Certificate
- **Endpoint**: `GET /api/certificates/:certificateId/download`
- **Method**: API Route (returns PDF)
- **Response**: PDF file
- **Status Codes**: 200 (success), 404 (not found)

### Get User Certificates
- **Endpoint**: `GET /api/certificates/user/:userId`
- **Method**: API Route
- **Response**: Certificate[]

---

## Error Handling

### Standard Error Response
```typescript
{
  error: string; // Error message
  code: string; // Error code
  details?: Record<string, any>; // Additional details
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | No valid session or authentication required |
| `FORBIDDEN` | 403 | User lacks permission for this action |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `CONFLICT` | 409 | Resource already exists or action conflicts |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `RATE_LIMITED` | 429 | Too many requests |

### Error Response Examples

**Validation Error**:
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "String must be at least 3 characters"
  }
}
```

**Authorization Error**:
```json
{
  "error": "Insufficient permissions",
  "code": "FORBIDDEN"
}
```

---

## Rate Limiting

All API endpoints are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Create Resources | 30 requests | 1 hour |
| Read Resources | 100 requests | 1 hour |
| Update Resources | 30 requests | 1 hour |
| Delete Resources | 10 requests | 1 hour |

**Rate Limit Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1700000000
```

---

## Authentication Headers

All authenticated requests require:
```
Authorization: Bearer <access_token>
Cookie: sb-access-token=<access_token>
```

Tokens are automatically managed by Next.js middleware and Supabase client.

---

## Pagination

List endpoints support pagination via query parameters:

```typescript
// Request
GET /api/courses?page=2&limit=20

// Response
{
  data: Course[],
  total: number,      // Total items across all pages
  page: number,       // Current page (1-indexed)
  limit: number,      // Items per page
  totalPages: number  // Total number of pages
}
```

---

## Data Types

### User
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}
```

### Course
```typescript
{
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  price?: number;
  original_price?: number;
  category: string;
  image_url?: string;
  rating: number;
  student_count: number;
  created_at: string;
  updated_at: string;
}
```

### Test
```typescript
{
  id: string;
  title: string;
  description?: string;
  course_id: string;
  instructor_id: string;
  total_marks: number;
  duration: number;
  passing_percentage: number;
  attempts_allowed: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}
```

---

## Version

**API Version**: 1.0  
**Last Updated**: November 14, 2025  
**Status**: Production Ready
