
'use client';

import { useEffect, useState, Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { CourseCard } from "@/components/course-card";
import type { Course, Enrollment, CourseCategory } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/stat-card";
import { BookOpen, CheckCircle, Award, Lightbulb } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseListSkeleton } from "@/components/course-list";
import { useRouter } from "next/navigation";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { StudentNotificationCenter } from "@/components/student-notification-center";
import { RecommendedCourses } from "@/components/recommended-courses";
import { CompactImprovementSuggestions } from "@/components/improvement-suggestions";
import { getInstructorData, getStudentEnrollments, getEnrolledCourses } from "./actions";

export default function StudentDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestTestAttempt, setLatestTestAttempt] = useState<any>(null);

  useEffect(() => {
    console.log('🎯 Student Dashboard - authLoading:', authLoading, 'user:', user?.email, 'userData:', userData);
    
    if (authLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    // CRITICAL: Wait for userData to be available before checking role
    if (user && !userData) {
      console.log('⏳ User loaded but userData not ready yet, waiting for next update...');
      return;
    }
    
    // Redirect if user is not a student
    if (user && userData?.role && userData.role !== 'student') {
        console.log('🔄 User role is', userData.role, ', redirecting to correct dashboard...');
        if (userData.role === 'instructor') {
            router.push('/instructor/dashboard');
        } else if (userData.role === 'admin') {
            router.push('/admin/dashboard');
        }
        return;
    }
    
    if (user && userData?.role === 'student' && !userData.isProfileComplete) {
        console.log('⚠️ Profile incomplete, redirecting to complete-profile');
        router.push('/student/complete-profile');
        return;
    }
    
    if (user && userData?.status === 'suspended') {
        console.log('⚠️ Account suspended, redirecting to login');
        router.push('/login');
        return;
    }
    
    if (!user) {
        console.log('❌ No user, clearing courses');
        setLoading(false);
        setEnrolledCourses([]);
        return;
    }

    const fetchEnrolledCourses = async () => {
      console.log('Current user id:', user?.id);
      try {
        setLoading(true);
        
        // Fetch enrollments using server action (bypasses RLS)
        const enrollmentsResult = await getStudentEnrollments(user.id);
        
        console.log('🔍 Dashboard: Fetching enrollments for user:', user.id);
        console.log('📊 Dashboard: Enrollments result:', enrollmentsResult);
        
        if (!enrollmentsResult.success) {
          console.error('❌ Dashboard: Enrollment fetch error:', enrollmentsResult.error);
          setEnrolledCourses([]);
          return;
        }

        const enrollments = enrollmentsResult.data;
        
        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([]);
          return;
        }

        // Get course IDs from enrollments
        const enrolledCourseIds = enrollments.map(e => e.course_id);

        // Fetch course details using server action (bypasses RLS)
        const coursesResult = await getEnrolledCourses(enrolledCourseIds);
        
        console.log('📚 Dashboard: Courses result:', coursesResult);
        
        if (!coursesResult.success) {
          console.error('Error fetching courses:', coursesResult.error);
          setEnrolledCourses([]);
          return;
        }

        const courses = coursesResult.data;

        // Get unique instructor IDs and fetch instructor data
        const instructorIds = [...new Set(courses?.map(c => c.instructor_id).filter(Boolean))];
        let instructorMap = new Map<string, any>();
        
        console.log('📚 Instructor IDs to fetch:', instructorIds);
        
        if (instructorIds.length > 0) {
          // Call server action to fetch instructor data
          const instructorData = await getInstructorData(instructorIds as string[]);
          
          console.log('👨‍🏫 Instructors fetched:', instructorData);
          
          Object.entries(instructorData).forEach(([id, instructor]) => {
            instructorMap.set(id, instructor);
          });
        }

        // Merge course data with enrollment data
        const coursesData = courses?.map(course => {
          const enrollmentData = enrollments.find(e => e.course_id === course.id);
          const instructorData = instructorMap.get(course.instructor_id);
          
          console.log(`Course ${course.id}: instructor_id=${course.instructor_id}, found in map=${!!instructorData}, name=${instructorData?.name}`);
          
          return {
            ...course,
            // Map database snake_case fields to camelCase for Course type
            imageUrl: course.image_url,
            createdAt: course.created_at,
            studentCount: course.student_count || 0,
            ratingCount: course.rating_count || 0,
            totalRating: course.total_rating || 0,
            originalPrice: course.original_price,
            hasCertificate: course.has_certificate || false,
            certificateUrl: course.certificate_url,
            programOutcome: course.program_outcome,
            courseStructure: course.course_structure,
            lessonCount: course.lesson_count || 0,
            finalAssessmentId: course.final_assessment_id,
            instructor: {
              id: course.instructor_id,
              name: instructorData?.name || 'Unknown Instructor'
            },
            // Enrollment-specific fields
            progress: enrollmentData?.progress || 0,
            completedLessons: enrollmentData?.completed_lessons?.length || 0,
            enrollmentId: enrollmentData?.id,
            enrollment: {
              ...enrollmentData,
              // Map snake_case to camelCase for compatibility
              userId: enrollmentData?.user_id,
              courseId: enrollmentData?.course_id,
              instructorId: enrollmentData?.instructor_id,
              enrolledAt: enrollmentData?.enrolled_at,
              completedLessons: enrollmentData?.completed_lessons,
              certificateStatus: enrollmentData?.certificate_status,
              averageScore: enrollmentData?.average_score,
              couponCode: enrollmentData?.coupon_code,
              purchaseDate: enrollmentData?.purchase_date,
              paymentId: enrollmentData?.payment_id,
              orderId: enrollmentData?.order_id
            }
          } as Course;
        }) || [];

        setEnrolledCourses(coursesData);
      } catch (error) {
        console.error('Error in fetchEnrolledCourses:', error);
        setEnrolledCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();

    // Fetch latest test attempt with improvement suggestions
    const fetchLatestTestAttempt = async () => {
      try {
        const { data: attempts, error } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('user_id', user.id)
          .order('submitted_at', { ascending: false })
          .limit(1)
          .single();

        if (!error && attempts) {
          setLatestTestAttempt(attempts);
        }
      } catch (err) {
        console.error('Error fetching latest test attempt:', err);
      }
    };

    fetchLatestTestAttempt();

    // Set up real-time subscription for enrollments
    const channel = supabase
      .channel(`user_${user.id}_enrollments`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enrollments',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchEnrolledCourses(); // Refetch when enrollments change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, userData, authLoading, router]);


  const completedCourses = enrolledCourses.filter(c => c.enrollment?.completed === true).length;
  const enrolledCourseIds = enrolledCourses.map(c => c.id);

  if (authLoading || (!userData && user)) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/2" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
            <Skeleton className="h-12 w-96" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  // Debug logging
  console.log('🔍 Dashboard Debug - userData:', userData);
  console.log('🔍 Dashboard Debug - improvementAreas:', userData?.improvementAreas);
  console.log('🔍 Dashboard Debug - isProfileComplete:', userData?.isProfileComplete);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 dark:from-slate-900/50 to-background">
      <div className="space-y-8">
        <div className="rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 dark:from-blue-900/40 dark:to-indigo-900/40 p-8 mb-8">
          <PageHeader
            title={`Welcome back, ${userData?.name || 'Student'}!`}
            description="Continue your learning journey and track your progress."
            className="text-white dark:text-slate-100 [&>p]:text-blue-100"
          />
        </div>

        <div className="px-4 md:px-0">
          <StudentNotificationCenter />
          <AnnouncementBanner />
          
          {/* Improvement Suggestions Widget */}
          {latestTestAttempt?.improvement_suggestions && latestTestAttempt.improvement_suggestions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">📚 Areas to Focus On</h3>
              <CompactImprovementSuggestions 
                suggestions={latestTestAttempt.improvement_suggestions}
          />
          <Link href={`/student/quiz-results/${latestTestAttempt.id}`} className="mt-3 inline-block">
            <Button variant="outline" size="sm">View Full Improvement Plan</Button>
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Courses Enrolled"
          value={loading ? '...' : enrolledCourses.length.toString()}
          icon={<BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          gradient="blue"
        />
        <StatCard
          title="Courses Completed"
          value={loading ? '...' : completedCourses.toString()}
          icon={<CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />}
          gradient="green"
        />
        <StatCard
          title="Certificates Earned"
          value={loading ? '...' : enrolledCourses.filter(c => c.enrollment?.certificateStatus === 'approved').length.toString()}
          icon={<Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
          gradient="amber"
        />
      </div>

      <Tabs defaultValue="my-learning">
        <TabsList className="mb-6 inline-flex h-auto w-full max-w-lg items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger value="my-learning" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">My Learning</TabsTrigger>
          <TabsTrigger value="recommended" className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md">
            Recommended for You {userData?.improvementAreas ? `(${userData.improvementAreas.length})` : '(0)'}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="my-learning">
           {loading ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-96 w-full" />
                </div>
            ) : enrolledCourses.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                    <CourseCard key={course.id} course={course} context="dashboard" />
                ))}
                </div>
            ) : (
                <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight">You are not enrolled in any courses yet.</h3>
                        <p className="text-sm text-muted-foreground">
                            Browse our courses to start your learning journey.
                        </p>
                        <Button asChild className="mt-4">
                            <Link href="/courses">Browse Courses</Link>
                        </Button>
                    </div>
                </div>
            )}
        </TabsContent>
         <TabsContent value="recommended">
            <div className="space-y-8">
                <div className="flex flex-col items-center justify-center space-y-2 text-center">
                    <Lightbulb className="h-8 w-8 text-amber-400" />
                    <h2 className="text-2xl font-bold tracking-tight font-headline">
                        Courses Picked For You
                    </h2>
                    <p className="max-w-2xl text-muted-foreground">
                        Based on your interests, here are some courses you might like.
                    </p>
                </div>
                 <Suspense fallback={<CourseListSkeleton />}>
                    <RecommendedCourses
                        categories={userData?.improvementAreas as CourseCategory[]}
                        excludeIds={enrolledCourseIds}
                    />
                </Suspense>
            </div>
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}

      