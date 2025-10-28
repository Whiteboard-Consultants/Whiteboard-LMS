

import type { IconName } from "@/components/counter-stat";

// Use string for dates instead of Firebase Timestamp
export type UserRole = 'admin' | 'instructor' | 'student';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  phone?: string;
  education?: string;
  passingYear?: number;
  improvementAreas?: CourseCategory[];
  careerPlan?: string;
  isProfileComplete?: boolean;
  needsInterviewSupport?: boolean;
  lastLogin?: string;
  ratingCount?: number;
  totalRating?: number;
  averageRating?: number;
};

export type CourseCategory = 'Test Prep' | 'Communication' | 'Career Development';

export interface CourseCategoryData {
    id: string;
    title: string;
    description: string;
    icon: string;
    items: string[];
    fullTitle: string;
    fullDescription: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: Pick<User, 'id' | 'name'>;
  imageUrl: string;
  studentCount: number;
  rating: number;
  ratingCount?: number;
  totalRating?: number;
  progress?: number;
  createdAt?: string;
  type: 'free' | 'paid';
  price?: number;
  originalPrice?: number;
  category: CourseCategory;
  hasCertificate: boolean;
  certificateUrl?: string;
  programOutcome?: string;
  courseStructure?: string;
  faqs?: string;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  tags?: string[];
  lessonCount?: number;
  completedLessons?: number;
  enrollmentId?: string;
  enrollment?: Enrollment;
  finalAssessmentId?: string | null;
}

export interface SubTopic {
  id: string;
  title: string;
  overview?: string;
  courseId: string;
  order: number;
  createdAt?: string;
}

export type LessonType = 'text' | 'video' | 'audio' | 'document' | 'embed' | 'quiz' | 'assignment';

export interface Question {
  id: string;
  type?: 'mcq' | 'descriptive';
  questionText: string;
  options: string[];
  correctAnswerIndex: number | null;
  explanation?: string;
}

export interface Lesson {
  id:string;
  title: string;
  type: LessonType;
  objectives?: string; // Rich text
  content: string; // URL for media/embed, JSON for text/quiz
  assetUrl?: string; // If a file was uploaded to storage
  courseId: string;
  parentId?: string | null;
  createdAt?: string;
  order: number;
  questions?: Question[];
}

export type RegistrationRequest = {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'student';
  date: string;
};

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  studentName?: string;
  courseTitle?: string;
  coursePrice?: number;
  instructorId: string;
  instructorName?: string;
  progress: number;
  completed: boolean;
  enrolledAt: string;
  status: 'pending' | 'approved';
  paymentId?: string;
  orderId?: string;
  amount?: number;
  purchaseDate?: string;
  completedLessons?: string[];
  certificateStatus?: 'eligible' | 'not_eligible' | 'requested' | 'approved';
  averageScore?: number;
  couponCode?: string;
}

export interface Review {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userAvatarUrl?: string;
    rating: number; // This can be deprecated or used as content rating
    contentRating: number;
    instructorRating: number;
    comment: string;
    createdAt: string;
}

export interface QuizAttempt {
    id: string;
    enrollmentId: string;
    courseId: string;
    lessonId: string;
    userId: string;
    submittedAt: string;
    score: number;
    totalQuestions: number;
    answers: (number | null)[];
    questions: Question[];
}


export interface StatProps {
  icon: IconName;
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
}

export type Announcement = {
    id: string;
    title: string;
    content: string;
    type: 'Info' | 'Success' | 'Warning' | 'Destructive';
    createdAt: string;
};

export type Notification = {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
};

// Types for CAT-style Test Engine
export interface TestQuestion {
    id: string;
    testId: string;
    order: number;
    text: string; // Rich text/JSON string
    options: string[];
    correctOption: number; // index of the correct option
    solution: string; // Rich text/JSON string
    marks: number;
    negativeMarks?: number;
}

export type TestType = 'practice' | 'final' | 'assessment' | 'quiz';

export interface Test {
    id: string;
    title: string;
    description: string;
    duration: number; // in seconds
    instructorId: string;
    questionCount: number;
    createdAt: string;
    courseId?: string | null;
    courseTitle?: string | null;
    type: TestType;
    isTimeLimited: boolean;
    passingScore?: number; // percentage required to pass
    maxAttempts?: number; // max attempts allowed per student
    showResults: boolean; // whether to show results immediately after completion
    allowReview: boolean; // whether to allow review of answers after completion
}

export type AnswerStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked' | 'answered-and-marked';

export interface Answer {
    optionIndex: number | null;
    status: AnswerStatus;
}

export interface TestAttempt {
    id: string;
    user_id: string;
    test_id: string;
    course_id: string | null;
    enrollment_id: string;
    status?: 'in-progress' | 'completed' | 'abandoned';
    created_at: string;
    submitted_at?: string;
    score?: number;
    total_questions?: number;
    percentage?: number;
    passed?: boolean;
    answers: number[];
    answer_details?: any[];
    time_taken?: number; // In seconds
    updated_at?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    expiresAt?: string;
    usageLimit?: number;
    usageCount: number;
    isActive: boolean;
    createdAt: string;
}

export type Post = {
    id: string;
    title: string;
    slug: string;
    author: {
        name: string;
        id: string;
    };
    category: string;
    excerpt: string;
    content: string;
    imageUrl: string;
    status: 'published' | 'draft';
    featured: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
};

export interface WhyChooseUs {
    title: string;
    description: string;
    features: { text: string; href?: string }[];
    image: {
        src: string;
        alt: string;
        ai_hint: string;
    };
}

export interface UowProgram {
    title: string;
    description: string;
    duration: string;
    intake: string;
    cost: string;
    eligibility: string[];
}

export interface UowFeature {
    icon: string;
    title: string;
    description: string;
}

export interface UowScholarship {
    icon: string;
    title: string;
    value: string;
    description: string;
}

export interface UowIndiaPageData {
    programs: UowProgram[];
    whyUowIndia: UowFeature[];
    scholarships: UowScholarship[];
    whyApplyWithUs: string[];
    industryPartners: string[];
    studentLife: UowFeature[];
}

export interface WhyChooseUsData {
    title: string;
    description: string;
    features: { text: string; href?: string }[];
    image: {
        src: string;
        alt: string;
        ai_hint: string;
    };
}

export interface CollegeAdmissionsData {
    admissionServices: {
        title: string;
        description: string;
        items: string[];
    }[];
    partnerColleges: {
        name: string;
        logo: string;
        description: string;
        href: string;
        image: string;
        dataAiHint: string;
        programs: {
            name: string;
            details: string;
        }[];
    }[];
    admissionProcessSteps: {
        step: string;
        title: string;
        description: string;
        icon: string;
    }[];
}
