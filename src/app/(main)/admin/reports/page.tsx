
'use client';

import { useEffect, useState } from "react";
import { Download, Users, Star, DollarSign, Loader2, User as UserIcon, ArrowLeft, BookOpen, TrendingUp, Calendar, Award, BarChart3 } from "lucide-react";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CourseData {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  student_count: number;
  rating: number;
  type: 'free' | 'paid';
  price?: number;
  created_at: string;
}

interface EnrolledStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentId: string;
  enrolledAt: string;
  progress: number;
  courseId: string;
  courseTitle: string;
  lastAccessedAt?: string;
  completed: boolean;
}

interface PlatformStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  averageRating: number;
  totalRevenue: number;
  completionRate: number;
}

interface RevenueData {
  totalRevenue: number;
  paidEnrollments: number;
  coursesSold: number;
  avgOrderValue: number;
}

interface TopCourse {
  id: string;
  title: string;
  enrollments: number;
  revenue: number;
  instructor_name: string;
}

type RevenueTimePeriod = 'current_month' | 'last_3_months' | 'last_6_months' | 'last_1_year' | 'last_2_years';

export default function AdminReportsPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [isExportingStudents, setIsExportingStudents] = useState(false);
  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalCourses: 0,
    totalStudents: 0,
    totalEnrollments: 0,
    averageRating: 0,
    totalRevenue: 0,
    completionRate: 0
  });
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    paidEnrollments: 0,
    coursesSold: 0,
    avgOrderValue: 0
  });
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<RevenueTimePeriod>('current_month');
  const [engagementRate, setEngagementRate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getDateFilter = (period: RevenueTimePeriod) => {
    const now = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'current_month':
        startDate.setDate(1);
        break;
      case 'last_3_months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'last_6_months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case 'last_1_year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'last_2_years':
        startDate.setFullYear(now.getFullYear() - 2);
        break;
    }
    
    return startDate.toISOString();
  };

  const calculateRevenueData = (enrollments: any[], courses: CourseData[], period: RevenueTimePeriod) => {
    const startDate = getDateFilter(period);
    
    // Filter enrollments by date and paid status
    const paidEnrollments = enrollments.filter(e => 
      e.payment_status === 'paid' && 
      new Date(e.enrolled_at || e.created_at) >= new Date(startDate)
    );

    // Calculate revenue
    let totalRevenue = 0;
    const courseRevenueMap = new Map<string, { revenue: number; enrollments: number; title: string; instructor_name: string }>();

    paidEnrollments.forEach(enrollment => {
      const course = courses.find(c => c.id === enrollment.course_id);
      if (course && course.price) {
        totalRevenue += course.price;
        
        const existing = courseRevenueMap.get(course.id) || { 
          revenue: 0, 
          enrollments: 0, 
          title: course.title,
          instructor_name: course.instructor_name || 'Unknown'
        };
        existing.revenue += course.price;
        existing.enrollments += 1;
        courseRevenueMap.set(course.id, existing);
      }
    });

    // Get top courses by revenue
    const topCoursesList = Array.from(courseRevenueMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        enrollments: data.enrollments,
        revenue: data.revenue,
        instructor_name: data.instructor_name
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    const avgOrderValue = paidEnrollments.length > 0 ? totalRevenue / paidEnrollments.length : 0;

    setRevenueData({
      totalRevenue,
      paidEnrollments: paidEnrollments.length,
      coursesSold: Array.from(courseRevenueMap.keys()).length,
      avgOrderValue
    });

    setTopCourses(topCoursesList);
  };

  const calculateEngagementRate = (students: EnrolledStudent[]) => {
    if (students.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeStudents = students.filter(student => {
      if (!student.lastAccessedAt) return false;
      return new Date(student.lastAccessedAt) >= thirtyDaysAgo;
    });
    
    const rate = (activeStudents.length / students.length) * 100;
    setEngagementRate(Math.round(rate));
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setLoadingStudents(true);
      setError(null);

      try {
        // Fetch courses with instructor information
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .order('created_at', { ascending: false });

        if (coursesError) {
          throw new Error(`Failed to fetch courses: ${coursesError.message}`);
        }

        // Fetch instructor names
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name')
          .eq('role', 'instructor');

        if (usersError) {
          console.warn('Failed to fetch instructor names:', usersError);
        }

        // Create instructor map for quick lookup
        const instructorMap = new Map(
          (usersData || []).map(user => [user.id, user.name])
        );

        // Process courses data
        const processedCourses: CourseData[] = (coursesData || []).map(course => ({
          id: course.id,
          title: course.title,
          description: course.description,
          instructor_id: course.instructor_id,
          instructor_name: instructorMap.get(course.instructor_id) || 'Unknown Instructor',
          student_count: course.student_count || 0,
          rating: course.rating || 0,
          type: course.type || 'free',
          price: course.price,
          created_at: course.created_at
        }));

        setCourses(processedCourses);

        // Fetch all enrollments with additional fields
        const { data: rawEnrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            *,
            users!enrollments_user_id_fkey(name, email, phone, updated_at)
          `);

        if (enrollmentsError) {
          throw new Error(`Failed to fetch enrollments: ${enrollmentsError.message}`);
        }

        if (!rawEnrollments || rawEnrollments.length === 0) {
          setEnrolledStudents([]);
        } else {
          // Fetch users and courses data for the enrollments
          const userIds = Array.from(new Set(rawEnrollments.map(e => e.user_id).filter(Boolean)));
          const courseIds = Array.from(new Set(rawEnrollments.map(e => e.course_id).filter(Boolean)));

          const [usersResult, coursesResult] = await Promise.all([
            supabase.from('users').select('id, name, email, phone').in('id', userIds),
            supabase.from('courses').select('id, title').in('id', courseIds)
          ]);

          if (usersResult.error || coursesResult.error) {
            console.error('Error fetching related data:', { usersResult, coursesResult });
            throw new Error('Failed to fetch related user or course data');
          }

          // Create maps for quick lookup
          const usersMap = new Map(usersResult.data?.map(u => [u.id, u]) || []);
          const coursesMap = new Map(coursesResult.data?.map(c => [c.id, c]) || []);

          // Process enrolled students data
          const processedStudents: EnrolledStudent[] = rawEnrollments.map(enrollment => {
            const user = usersMap.get(enrollment.user_id);
            const course = coursesMap.get(enrollment.course_id);
            
            if (!user || !course) {
              return null;
            }
            
            // Get the most recent activity time from user data or enrollment data
            const lastLogin = enrollment.users?.updated_at || 
                             enrollment.last_accessed_at || 
                             enrollment.updated_at;

            return {
              id: user.id,
              name: user.name || user.email,
              email: user.email,
              phone: user.phone,
              enrollmentId: enrollment.id,
              enrolledAt: enrollment.created_at || enrollment.enrolled_at,
              progress: enrollment.progress || 0,
              courseId: enrollment.course_id,
              courseTitle: course.title,
              lastAccessedAt: lastLogin,
              completed: enrollment.completed || false
            };
          }).filter(Boolean) as EnrolledStudent[];

          setEnrolledStudents(processedStudents);

          // Calculate platform statistics based on actual enrollment payment status
          const paidEnrollments = rawEnrollments.filter(e => e.payment_status === 'paid');
          const totalRevenue = paidEnrollments.reduce((sum, enrollment) => {
            const course = processedCourses.find(c => c.id === enrollment.course_id);
            if (course && course.price) {
              return sum + course.price;
            }
            return sum;
          }, 0);

          const completedEnrollments = processedStudents.filter(s => s.completed || s.progress >= 100);
          const completionRate = processedStudents.length > 0 
            ? Math.round((completedEnrollments.length / processedStudents.length) * 100)
            : 0;

          const coursesWithRatings = processedCourses.filter(c => c.rating > 0);
          const averageRating = coursesWithRatings.length > 0
            ? Math.round((coursesWithRatings.reduce((sum, c) => sum + c.rating, 0) / coursesWithRatings.length) * 10) / 10
            : 0;

          const uniqueStudents = new Set(processedStudents.map(s => s.id));

          setPlatformStats({
            totalCourses: processedCourses.length,
            totalStudents: uniqueStudents.size,
            totalEnrollments: processedStudents.length,
            averageRating,
            totalRevenue,
            completionRate
          });
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
        setLoadingStudents(false);
      }
    };

    fetchAllData();
  }, []);

  // Recalculate revenue data when time period changes
  useEffect(() => {
    if (courses.length > 0 && enrolledStudents.length > 0) {
      // Convert enrolledStudents to enrollment format for calculation
      const enrollmentsData = enrolledStudents.map(student => ({
        course_id: student.courseId,
        enrolled_at: student.enrolledAt,
        created_at: student.enrolledAt,
        payment_status: 'paid' // Assuming enrolled students have paid
      }));
      
      calculateRevenueData(enrollmentsData, courses, selectedTimePeriod);
      calculateEngagementRate(enrolledStudents);
    }
  }, [selectedTimePeriod, courses, enrolledStudents]);

  const triggerCsvDownload = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const handleExportCourses = () => {
    if (!courses.length) return;
    
    const headers = ["ID", "Title", "InstructorID", "InstructorName", "StudentCount", "Rating", "Type", "Price"];
    const csvContent = [
      headers.join(","),
      ...courses.map(course => 
        [course.id, `"${course.title}"`, course.instructor_id, `"${course.instructor_name}"`, course.student_count, course.rating, course.type, course.price || 0].join(",")
      )
    ].join("\n");

    triggerCsvDownload(csvContent, "courses.csv");
  };

  const handleExportStudents = async () => {
    if (!selectedCourseId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a course or "All Students".' });
        return;
    }
    setIsExportingStudents(true);
    
    try {
        let studentsToExport = enrolledStudents;
        
        if (selectedCourseId !== 'all') {
            studentsToExport = enrolledStudents.filter(student => student.courseId === selectedCourseId);
        }

        if (studentsToExport.length === 0) {
            toast({ title: 'No Data', description: 'No students found for the selected option.' });
            setIsExportingStudents(false);
            return;
        }

        const isAllStudents = selectedCourseId === 'all';
        const headers = ["UserID", "Name", "Email", "Phone", "EnrollmentDate", "Progress", "LastAccessed"];
        if (isAllStudents) {
            headers.push("CourseTitle");
        }

        const csvContent = [
            headers.join(","),
            ...studentsToExport.map(student => {
                const baseData = [
                    student.id,
                    `"${student.name}"`,
                    student.email,
                    student.phone || 'N/A',
                    new Date(student.enrolledAt).toISOString().split('T')[0],
                    student.progress,
                    student.lastAccessedAt ? new Date(student.lastAccessedAt).toISOString().split('T')[0] : 'N/A'
                ];
                if (isAllStudents) {
                    baseData.push(`"${student.courseTitle}"`);
                }
                return baseData.join(",");
            })
        ].join("\n");
        
        const fileName = isAllStudents
            ? 'all_students.csv'
            : `${courses.find(c => c.id === selectedCourseId)?.title.replace(/ /g, '_')}_students.csv`;

        triggerCsvDownload(csvContent, fileName);

    } catch (err) {
        console.error("Error exporting students: ", err);
        toast({ variant: 'destructive', title: 'Export Failed', description: 'Could not export student data.' });
    } finally {
        setIsExportingStudents(false);
    }
  };

  const filteredStudents = enrolledStudents.filter(student => 
    selectedCourseId === 'all' || student.courseId === selectedCourseId
  );


  return (
    <div>
        <div className="mb-4">
            <Button asChild variant="outline" size="sm">
                <Link href="/admin/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>
      <PageHeader
        title="General Reports & Analytics"
        description="Revenue analytics, course performance, and data exports."
      />
      
      <div className="space-y-8">
        {/* Revenue Analytics Section */}
        <div className="bg-muted p-6 rounded-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground">Track platform revenue and course sales performance.</p>
            </div>
            <Select onValueChange={(value: RevenueTimePeriod) => setSelectedTimePeriod(value)} value={selectedTimePeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_month">Current Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_1_year">Last 1 Year</SelectItem>
                <SelectItem value="last_2_years">Last 2 Years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Revenue Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{revenueData.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  From {revenueData.paidEnrollments} paid enrollments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Courses Sold</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{revenueData.coursesSold}</div>
                <p className="text-xs text-muted-foreground">
                  Unique courses with sales
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Math.round(revenueData.avgOrderValue).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Per enrollment
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Student Engagement</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{engagementRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Active in last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Courses */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold mb-4">Top Selling Courses</h4>
            <div className="rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCourses.length > 0 ? (
                    topCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{course.enrollments}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">₹{course.revenue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        No sales data for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
        <div className="bg-muted p-6 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Course Data Export</h3>
                    <p className="text-sm text-muted-foreground">Download a CSV file of all courses on the platform.</p>
                </div>
                <Button variant="outline" onClick={handleExportCourses} disabled={courses.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Courses CSV
                </Button>
            </div>
            
             <div className="mt-6">
                <h3 className="text-2xl font-bold tracking-tight mb-4">Course Overview</h3>
                {/* Mobile View */}
                <div className="md:hidden">
                    {loading ? (
                        <p>Loading...</p>
                    ) : courses.length > 0 ? (
                        <div className="space-y-4">
                            {courses.map((course) => (
                                <Card key={course.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{course.title}</CardTitle>
                                        <p className="text-sm text-muted-foreground">By {course.instructor_name}</p>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4" />
                                                <span>{course.student_count}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4" />
                                                <span>{course.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{course.price ? `₹${course.price.toFixed(2)}` : 'N/A'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <Badge variant={course.type === 'paid' ? 'default' : 'secondary'}>
                                                {course.type === 'paid' ? 'Paid' : 'Free'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p>No courses found.</p>
                        </div>
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-lg border bg-background">
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Price</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                            Loading...
                            </TableCell>
                        </TableRow>
                        ) : courses.length > 0 ? (
                        courses.map((course) => (
                            <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.instructor_name}</TableCell>
                            <TableCell>{course.student_count}</TableCell>
                            <TableCell>{course.rating}</TableCell>
                            <TableCell>{course.type}</TableCell>
                            <TableCell>{course.price ? `₹${course.price.toFixed(2)}` : 'N/A'}</TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                            No courses found.
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                    </Table>
                </div>
              </div>
        </div>

        <div className="bg-muted p-6 rounded-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h3 className="text-xl font-bold tracking-tight">Student Enrollment Data</h3>
                    <p className="text-sm text-muted-foreground">Filter student enrollments by course and export the data.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Students</SelectItem>
                            {courses.map(course => (
                                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button 
                    onClick={handleExportStudents} 
                    disabled={!selectedCourseId || isExportingStudents}
                    >
                        {isExportingStudents ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                        Export Students CSV
                    </Button>
                </div>
            </div>
            
            <div className="mt-6">
                <h3 className="text-2xl font-bold tracking-tight mb-4">Student Enrollment Overview</h3>
                {/* Mobile View */}
                <div className="md:hidden">
                    {loadingStudents ? (
                        <p>Loading...</p>
                    ) : filteredStudents.length > 0 ? (
                        <div className="space-y-4">
                            {filteredStudents.map(student => (
                                <Card key={student.enrollmentId}>
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4 mb-4">
                                        <Avatar>

                                            <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{student.name}</p>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground">Course</p>
                                                <p className="text-sm font-medium">{student.courseTitle}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Enrolled On</p>
                                                <p className="text-sm font-medium">{new Date(student.enrolledAt).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Last Login</p>
                                                <p className="text-sm font-medium">{student.lastAccessedAt ? new Date(student.lastAccessedAt).toLocaleDateString() : 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">Progress</p>
                                                <Progress value={student.progress} className="h-2 w-full" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-dashed border rounded-lg">
                            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-lg font-medium">No enrolled students found</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {selectedCourseId === 'all' ? "There are no students enrolled in any courses yet." : "There are no students enrolled in the selected course."}
                            </p>
                            <p className="mt-2 text-xs text-muted-foreground">
                                Students will appear here once they enroll in courses through the enrollment system.
                            </p>
                        </div>
                    )}
                </div>
                
                {/* Desktop View */}
                <div className="hidden md:block rounded-lg border bg-background">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Enrolled On</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Progress</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loadingStudents ? (
                        <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                            Loading...
                        </TableCell>
                        </TableRow>
                    ) : filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                        <TableRow key={student.enrollmentId}>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>

                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                            </div>
                            </TableCell>
                            <TableCell>{student.email}</TableCell>
                            <TableCell>{student.courseTitle}</TableCell>
                            <TableCell>{new Date(student.enrolledAt).toLocaleDateString()}</TableCell>
                            <TableCell>{student.lastAccessedAt ? new Date(student.lastAccessedAt).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-2">
                                <Progress value={student.progress} className="w-32 h-2" />
                                <span>{student.progress}%</span>
                            </div>
                            </TableCell>
                        </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                {selectedCourseId === 'all' ? "No enrolled students found." : "No students found for the selected course."}
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
