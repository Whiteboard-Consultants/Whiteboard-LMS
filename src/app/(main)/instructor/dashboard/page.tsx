
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlusCircle, Lightbulb, Edit, Users, BookOpen, StarIcon, DollarSign } from "lucide-react";
import { subDays } from 'date-fns';

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Course } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { Separator } from "@/components/ui/separator";
import { RevenueCard } from "@/components/revenue-card";
import { InstructorCommissionCard } from "./commission-card";
import { getInstructorCommissionInfo } from "./commission-actions";
import { fetchNewEnrollmentsForInstructor, fetchTotalRevenueForInstructor } from "./actions";


export default function InstructorDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEnrollments, setNewEnrollments] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [commissionInfo, setCommissionInfo] = useState<{
    commissionPercentage: number;
    totalEnrollments: number;
    totalOriginalPrice: number;
    totalEarned: number;
    description: string;
  } | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    // CRITICAL: Wait for userData to be available before checking role
    if (user && !userData) {
      console.log('⏳ User loaded but userData not ready yet, waiting for next update...');
      setLoading(true);
      return;
    }

    // Redirect if user is not an instructor
    if (user && userData?.role && userData.role !== 'instructor') {
        console.log('🔄 User role is', userData.role, ', redirecting to correct dashboard...');
        if (userData.role === 'student') {
            router.push('/student/dashboard');
        } else if (userData.role === 'admin') {
            router.push('/admin/dashboard');
        }
        return;
    }

    if (!user) {
      setLoading(false);
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      try {
        // Debug: Check what tables exist and their structure
        console.log('Testing database connection and structure...');
        
        // Test basic connection first
        const { data: testData, error: testError } = await supabase
          .from('courses')
          .select('*')
          .limit(1);
        
        if (testError) {
          if (testError.code === 'PGRST205') {
            console.warn('Courses table does not exist. Setting empty courses list.');
            setCourses([]);
            return;
          }
          console.error("Database connection test failed:", testError);
          console.error("Error details:", JSON.stringify(testError, null, 2));
          return;
        }
        
        console.log('Database connection successful. Sample course data:', testData?.[0]);
        
        // Try instructor_id first (new schema), then fall back to instructor JSON (old schema)
        let coursesData = [];
        let error = null;
        
        // First try the new schema with instructor_id
        const { data: newSchemaData, error: newSchemaError } = await supabase
          .from('courses')
          .select('*')
          .eq('instructor_id', user.id);
        
        if (!newSchemaError && newSchemaData && newSchemaData.length > 0) {
          coursesData = newSchemaData;
          console.log('Found courses using instructor_id:', coursesData.length);
        } else {
          // Fall back to old schema with instructor JSON
          const { data: oldSchemaData, error: oldSchemaError } = await supabase
            .from('courses')
            .select('*')
            .contains('instructor', { id: user.id });
          
          if (oldSchemaError) {
            error = oldSchemaError;
            console.error("Error fetching courses (both schemas failed):", {
              newSchemaError,
              oldSchemaError,
              userId: user.id
            });
          } else {
            coursesData = oldSchemaData || [];
            console.log('Found courses using instructor contains:', coursesData.length);
          }
        }
        
        if (error) {
          console.error("Error fetching courses:", error);
        } else {
          // Map snake_case database fields to camelCase for Course type
          const mappedCourses = (coursesData || []).map((course: any) => ({
            ...course,
            studentCount: course.student_count || 0,
            imageUrl: course.image_url,
            createdAt: course.created_at,
            ratingCount: course.rating_count || 0,
            totalRating: course.total_rating || 0,
            originalPrice: course.original_price,
            hasCertificate: course.has_certificate || false,
            certificateUrl: course.certificate_url,
            programOutcome: course.program_outcome,
            courseStructure: course.course_structure,
            lessonCount: course.lesson_count || 0,
            finalAssessmentId: course.final_assessment_id,
          }));
          setCourses(mappedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses([]); // Set empty array on any error
      } finally {
        setLoading(false);
      }
    };

    const fetchNewEnrollments = async () => {
      try {
        const result = await fetchNewEnrollmentsForInstructor(user.id);
        
        if (result.success) {
          setNewEnrollments(result.data);
          console.log('New enrollments count:', result.data);
        } else {
          console.error("Error fetching new enrollments:", result.error);
          setNewEnrollments(0); // Set to 0 on error
        }
      } catch (error) {
        console.error("Error fetching new enrollments:", error);
        setNewEnrollments(0); // Set to 0 on any error
      }
    };

    fetchCourses();
    fetchNewEnrollments();

    // Fetch total revenue
    const fetchRevenue = async () => {
      try {
        const result = await fetchTotalRevenueForInstructor(user.id);
        
        if (result.success) {
          setTotalRevenue(result.data);
          console.log('Total revenue:', result.data);
        } else {
          console.warn("Could not fetch total revenue, setting to 0:", result.error);
          setTotalRevenue(0);
        }
      } catch (error) {
        console.warn("Exception fetching total revenue, setting to 0:", error);
        setTotalRevenue(0);
      }
    };

    fetchRevenue();

    // Fetch commission info
    const fetchCommissionInfo = async () => {
      const result = await getInstructorCommissionInfo(user.id);
      if (result.success && result.data) {
        setCommissionInfo(result.data);
      }
    };

    fetchCommissionInfo();

    // Set up real-time subscriptions - simplified to avoid filter issues
    const coursesChannel = supabase
      .channel(`instructor_${user.id}_courses`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, () => {
        fetchCourses();
      })
      .subscribe();

    const enrollmentsChannel = supabase
      .channel(`instructor_${user.id}_enrollments`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'enrollments'
      }, () => {
        fetchNewEnrollments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(coursesChannel);
      supabase.removeChannel(enrollmentsChannel);
    };
  }, [user, authLoading]);

  const totalStudents = courses.reduce((sum, course) => sum + course.studentCount, 0);
  const averageRating = courses.length > 0
    ? (courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(2)
    : "N/A";
  
  // Calculate total revenue from all courses
  const revenue = courses.reduce((sum, course) => {
    const coursePrice = course.price || 0;
    const studentCount = course.studentCount || 0;
    return sum + (coursePrice * studentCount);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 dark:from-slate-900/50 to-background">
      <div className="space-y-8">
        <div className="rounded-xl bg-gradient-to-r from-purple-600/90 to-indigo-600/90 dark:from-purple-900/40 dark:to-indigo-900/40 p-8 mb-8">
          <PageHeader
            title={`Welcome back, ${userData?.name || 'Instructor'}!`}
            description="Manage your courses and view your performance."
            className="text-white dark:text-slate-100 [&>p]:text-purple-100"
          >
            <div className="flex items-center gap-2">
                <Button asChild className="bg-white text-purple-600 hover:bg-slate-100">
                    <Link href="/instructor/courses/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Course
                    </Link>
                </Button>
                <Button asChild className="bg-white/20 text-white hover:bg-white/30 border border-white/30">
                    <Link href="/instructor/ai-suggester">
                        <Lightbulb className="mr-2 h-4 w-4" />
                        AI Suggester
                    </Link>
                </Button>
            </div>
          </PageHeader>
        </div>
        
        <div className="px-4 md:px-0">
          <AnnouncementBanner />

      {/* Commission Info Card */}
      {commissionInfo && (
        <InstructorCommissionCard
          commissionPercentage={commissionInfo.commissionPercentage}
          totalEnrollments={commissionInfo.totalEnrollments}
          totalEarned={commissionInfo.totalEarned}
        />
      )}
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Action Center</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             <StatCard
                title="New Students (Last 7 Days)"
                value={loading ? '...' : newEnrollments.toString()}
                icon={<Users className="h-6 w-6 text-green-600 dark:text-green-400" />}
                gradient="green"
            >
                <p className="text-xs text-muted-foreground pt-1">A good time to engage with your new learners!</p>
             </StatCard>
        </div>
      </div>
      
       <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Overall Performance</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
            title="Total Students"
            value={loading ? "..." : totalStudents.toLocaleString()}
            icon={<Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
            gradient="blue"
            />
            <StatCard
            title="Total Courses"
            value={loading ? "..." : courses.length.toString()}
            icon={<BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />}
            gradient="green"
            />
            <StatCard
              title="Average Rating"
              value={loading ? "..." : averageRating}
              icon={<StarIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
              gradient="amber"
            >
              <p className="text-xs text-muted-foreground pt-1">Across all courses</p>
            </StatCard>
            <RevenueCard courses={courses} loading={loading} instructorId={user.id} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">My Courses</h2>
        
        {/* Mobile View */}
        <div className="md:hidden">
            {loading ? <p>Loading...</p> : courses.length > 0 ? (
                <div className="space-y-4">
                    {courses.map(course => (
                        <Card key={course.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{course.title}</CardTitle>
                                     <Button variant="ghost" size="icon" asChild>
                                        <Link href={`/instructor/courses/edit/${course.id}`}>
                                            <Edit className="h-4 w-4" />
                                            <span className="sr-only">Edit</span>
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center gap-4 text-sm">
                               <div className="flex items-center gap-1">
                                   <Users className="h-4 w-4" />
                                   <span>{course.studentCount} Students</span>
                               </div>
                               <div className="flex items-center gap-1">
                                   <StarIcon className="h-4 w-4" />
                                   <span>{course.rating} Rating</span>
                               </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ): <div className="text-center py-12"><p>You haven&apos;t created any courses yet.</p></div>}
        </div>

        {/* Desktop View */}
        <div className="hidden md:block rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        Loading...
                    </TableCell>
                </TableRow>
              ) : courses.length > 0 ? (
                courses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.studentCount}</TableCell>
                    <TableCell>{course.rating}</TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" asChild>
                          <Link href={`/instructor/courses/edit/${course.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    You haven&apos;t created any courses yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        </div>
        </div>
      </div>
    </div>
  );
}
