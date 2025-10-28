
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

export default function StudentDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    
    if (user && userData?.role === 'student' && !userData.isProfileComplete) {
        router.push('/student/complete-profile');
        return;
    }
    
    if (user && userData?.status === 'suspended') {
        router.push('/login');
        return;
    }
    
    if (!user) {
        setLoading(false);
        setEnrolledCourses([]);
        return;
    }

    const fetchEnrolledCourses = async () => {
      console.log('Current user id:', user?.id);
      try {
        setLoading(true);
        
        // Fetch enrollments for the current user (include approved and active statuses)
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['approved', 'active', 'completed']);
        console.log('🔍 Dashboard: Fetching enrollments for user:', user.id);
        console.log('📊 Dashboard: Enrollments found:', enrollments?.length || 0);
        console.log('📋 Dashboard: Enrollments data:', enrollments);
        if (enrollmentsError) {
          console.error('❌ Dashboard: Enrollment fetch error:', enrollmentsError);
        }

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          setEnrolledCourses([]);
          return;
        }

        if (!enrollments || enrollments.length === 0) {
          setEnrolledCourses([]);
          return;
        }

        // Get course IDs from enrollments
        const enrolledCourseIds = enrollments.map(e => e.course_id);

        // Fetch course details for enrolled courses
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .in('id', enrolledCourseIds);
        console.log('Supabase courses:', courses, coursesError);

        if (coursesError) {
          console.error('Error fetching courses:', coursesError);
          setEnrolledCourses([]);
          return;
        }

        // Merge course data with enrollment data
        const coursesData = courses?.map(course => {
          const enrollmentData = enrollments.find(e => e.course_id === course.id);
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
              name: course.instructor_name || 'Unknown Instructor'
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
    <div>
      <PageHeader
        title={`Welcome back, ${userData?.name || 'Student'}!`}
        description="Continue your learning journey and track your progress."
      />

      <StudentNotificationCenter />
      <AnnouncementBanner />
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <StatCard
          title="Courses Enrolled"
          value={loading ? '...' : enrolledCourses.length.toString()}
          icon={<BookOpen className="h-6 w-6 text-blue-500" />}
        />
        <StatCard
          title="Courses Completed"
          value={loading ? '...' : completedCourses.toString()}
          icon={<CheckCircle className="h-6 w-6 text-green-500" />}
        />
        <StatCard
          title="Certificates Earned"
          value={loading ? '...' : enrolledCourses.filter(c => c.enrollment?.certificateStatus === 'approved').length.toString()}
          icon={<Award className="h-6 w-6 text-amber-500" />}
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
  );
}

      