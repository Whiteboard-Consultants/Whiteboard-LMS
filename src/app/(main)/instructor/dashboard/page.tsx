
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Lightbulb, Edit, Users, BookOpen, StarIcon } from "lucide-react";
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


export default function InstructorDashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEnrollments, setNewEnrollments] = useState(0);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
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
          setCourses(coursesData || []);
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
        console.log('Testing enrollments table...');
        
        // Test basic enrollments table access
        const { data: testEnrollments, error: testEnrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .limit(1);
        
        if (testEnrollmentsError) {
          if (testEnrollmentsError.code === 'PGRST205') {
            console.warn('Enrollments table does not exist. Setting enrollments to 0.');
            setNewEnrollments(0);
            return;
          }
          console.error("Enrollments table access failed:", testEnrollmentsError);
          console.error("Error details:", JSON.stringify(testEnrollmentsError, null, 2));
          return;
        }
        
        console.log('Enrollments table accessible. Sample data:', testEnrollments?.[0]);
        
        const sevenDaysAgo = subDays(new Date(), 7).toISOString();
        
        // Try both possible field names for enrolled date
        let data = null;
        let error = null;
        
        // First try enrolled_at (snake_case - correct database schema)
        const { data: enrolledAtData, error: enrolledAtError } = await supabase
          .from('enrollments')
          .select('id', { count: 'exact' })
          .eq('instructor_id', user.id)
          .eq('status', 'approved')
          .gte('enrolled_at', sevenDaysAgo);
        
        if (!enrolledAtError && enrolledAtData) {
          data = enrolledAtData;
          console.log('Found enrollments using enrolled_at/instructor_id:', data.length);
        } else {
          // Fallback: Try enrolledAt (camelCase version - if exists)
          const { data: enrolledAtSnakeData, error: enrolledAtSnakeError } = await supabase
            .from('enrollments')
            .select('id', { count: 'exact' })
            .eq('instructor_id', user.id)
            .eq('status', 'approved')
            .gte('enrolledAt', sevenDaysAgo);
          
          if (enrolledAtSnakeError) {
            error = enrolledAtSnakeError;
            console.error("Error fetching enrollments (both schemas failed):", {
              enrolledAtError,
              enrolledAtSnakeError,
              userId: user.id
            });
          } else {
            data = enrolledAtSnakeData;
            console.log('Found enrollments using enrolled_at/instructor_id:', data?.length || 0);
          }
        }
        
        if (error) {
          console.error("Error fetching enrollments:", error);
          setNewEnrollments(0); // Set to 0 on error
        } else {
          setNewEnrollments(data?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        setNewEnrollments(0); // Set to 0 on any error
      }
    };

    fetchCourses();
    fetchNewEnrollments();

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

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${userData?.name || 'Instructor'}!`}
        description="Manage your courses and view your performance."
      >
        <div className="flex items-center gap-2">
            <Button asChild>
                <Link href="/instructor/courses/create">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Course
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/instructor/ai-suggester">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    AI Suggester
                </Link>
            </Button>
        </div>
      </PageHeader>
      
      <AnnouncementBanner />
      
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Action Center</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
             <StatCard
                title="New Students (Last 7 Days)"
                value={loading ? '...' : newEnrollments.toString()}
                icon={<Users className="h-6 w-6 text-green-500" />}
            >
                <p className="text-xs text-muted-foreground pt-1">A good time to engage with your new learners!</p>
             </StatCard>
        </div>
      </div>
      
       <Separator />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Overall Performance</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <StatCard
            title="Total Students"
            value={loading ? "..." : totalStudents.toLocaleString()}
            icon={<Users className="h-6 w-6 text-blue-500" />}
            />
            <StatCard
            title="Total Courses"
            value={loading ? "..." : courses.length.toString()}
            icon={<BookOpen className="h-6 w-6 text-green-500" />}
            />
            <StatCard
              title="Average Rating"
              value={loading ? "..." : averageRating}
              icon={<StarIcon className="h-6 w-6 text-amber-500" />}
            >
              <p className="text-xs text-muted-foreground pt-1">Across all courses</p>
            </StatCard>
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
  );
}
