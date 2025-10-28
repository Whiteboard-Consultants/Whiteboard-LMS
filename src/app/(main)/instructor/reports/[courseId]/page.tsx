
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { supabase } from '@/lib/supabase';
import { mapDatabaseCourseToCourse } from '@/lib/course-mapper';
import type { Enrollment, User, Course, Lesson, TestAttempt } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User as UserIcon, Eye, Users, Activity, Award, FileQuestion } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentProfile } from '@/components/student-profile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/stat-card';
import { subDays, format } from 'date-fns';
import { ActivityHeatmap } from '@/components/charts/activity-heatmap';
import { ContentEfficacyReport } from '@/components/charts/content-efficacy-report';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


interface EnrolledStudent extends Omit<User, 'lastLogin'> {
  enrollmentId: string;
  enrolledAt: Date;
  progress: number;
  lastLogin?: Date | null;
}

function TestResultsTable({ attempts, students, loading }: { attempts: TestAttempt[], students: EnrolledStudent[], loading: boolean }) {
    const getStudentForAttempt = (userId: string) => {
        return students.find(s => s.id === userId);
    };

    return (
        <Card>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                         <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading test results...</TableCell></TableRow>
                    ) : attempts.length > 0 ? (
                        attempts.map(attempt => {
                            const student = getStudentForAttempt(attempt.userId);
                            const percentage = (attempt.totalMarks || 0) > 0 ? Math.round(((attempt.score || 0) / (attempt.totalMarks || 1)) * 100) : 0;
                            return (
                                <TableRow key={attempt.id}>
                                    <TableCell>{student?.name || 'Unknown Student'}</TableCell>
                                    <TableCell>{attempt.score || 0} / {attempt.totalMarks || 0}</TableCell>
                                    <TableCell>{percentage}%</TableCell>
                                    <TableCell>{attempt.submittedAt ? format(new Date(attempt.submittedAt as string), 'PPP p') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/student/test-results/${attempt.id}`}>View Attempt</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow><TableCell colSpan={5} className="h-24 text-center">No test attempts recorded yet.</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </Card>
    )
}


export default function InstructorReportPage() {
  const params = useParams();
  const router = useRouter();
  const { userData, user } = useAuth();
  const courseId = params.courseId as string;
  
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>([]);
  const [loadingTestAttempts, setLoadingTestAttempts] = useState(true);

  useEffect(() => {
    if (!courseId || !user) return;

    const fetchCourseInfo = async () => {
        try {
            const { data: courseData, error } = await supabase
                .from('courses')
                .select('*')
                .eq('id', courseId)
                .single();

            if (error) {
                console.error('Error fetching course:', error);
                router.push('/instructor/courses');
                return;
            }

            const mappedCourse = mapDatabaseCourseToCourse(courseData);
            
            // Security check: ensure the current user is the instructor of this course
            if (userData && mappedCourse.instructor.id === userData.id) {
                setCourse(mappedCourse);
            } else {
                router.push('/instructor/dashboard');
            }
        } catch (error) {
            console.error('Error fetching course:', error);
            router.push('/instructor/courses');
        }
    }
    
    if(userData) {
      fetchCourseInfo();
    }

  }, [courseId, userData, user, router]);

  useEffect(() => {
    if (!course || !user) return;

    const fetchStudentsAndLessons = async () => {
      try {
        // Fetch enrollments
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('status', 'approved');

        if (enrollmentsError) {
          console.error('Error fetching enrollments:', enrollmentsError);
          setLoading(false);
          return;
        }

        if (!enrollments || enrollments.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }

        // Fetch user details for each enrollment
        const userIds = enrollments.map(e => e.user_id);
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .in('id', userIds);

        if (usersError) {
          console.error('Error fetching users:', usersError);
          setLoading(false);
          return;
        }

        // Merge enrollment and user data
        const studentsData = enrollments.map(enrollment => {
          const userData = users?.find(u => u.id === enrollment.user_id);
          if (!userData) return null;

          return {
            ...userData,
            enrollmentId: enrollment.id,
            enrolledAt: new Date(enrollment.enrolled_at),
            progress: enrollment.progress || 0,
            // Override lastLogin to ensure it's a Date or null
            lastLogin: userData.last_login ? new Date(userData.last_login) : null,
          } as EnrolledStudent;
        }).filter(Boolean) as EnrolledStudent[];

        setStudents(studentsData);
        setLoading(false);

        // Fetch lessons
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('*')
          .eq('course_id', courseId);

        if (lessonsError) {
          console.error('Error fetching lessons:', lessonsError);
        } else {
          setLessons(lessonsData || []);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchStudentsAndLessons();
  }, [course, courseId, user]);

  useEffect(() => {
    if (!course || !course.finalAssessmentId || !user) {
        setLoadingTestAttempts(false);
        return;
    }

    const fetchTestAttempts = async () => {
      try {
        const { data: attemptsData, error } = await supabase
          .from('test_attempts')
          .select('*')
          .eq('test_id', course.finalAssessmentId);

        if (error) {
          console.error('Error fetching test attempts:', error);
        } else {
          setTestAttempts(attemptsData || []);
        }
        setLoadingTestAttempts(false);
      } catch (error) {
        console.error('Error fetching test attempts:', error);
        setLoadingTestAttempts(false);
      }
    };

    fetchTestAttempts();
  }, [course, user]);
  
  const handleViewProfile = (student: EnrolledStudent) => {
    // Convert EnrolledStudent back to User format for the profile modal
    const userForProfile: User = {
      ...student,
      lastLogin: student.lastLogin ? student.lastLogin.toISOString() : undefined,
    };
    setViewingProfileUser(userForProfile);
    setIsProfileModalOpen(true);
  };
  
  const thirtyDaysAgo = subDays(new Date(), 30);
  const activeStudentsLast30Days = students.filter(s => s.lastLogin && s.lastLogin > thirtyDaysAgo).length;

  return (
    <div>
      <div className="mb-4">
        <Button asChild variant="outline" size="sm" onClick={() => router.back()}>
          <span>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </span>
        </Button>
      </div>

      <PageHeader
        title={course ? `Reports: ${course.title}` : 'Loading...'}
        description="Monitor student performance and engagement for this course."
      />
      
      <Tabs defaultValue="progress">
        <TabsList className="mb-4">
          <TabsTrigger value="progress">Student Progress</TabsTrigger>
          {course?.finalAssessmentId && <TabsTrigger value="test-results">Test Results</TabsTrigger>}
          <TabsTrigger value="engagement">Course Engagement</TabsTrigger>
          <TabsTrigger value="efficacy">Content Efficacy</TabsTrigger>
        </TabsList>
        <TabsContent value="progress">
            <h3 className="text-xl font-semibold mb-4">Gradebook Summary</h3>
            <div className="md:hidden">
            {loading ? (
                <p>Loading...</p>
            ) : students.length > 0 ? (
                <div className="space-y-4">
                    {students.map(student => (
                        <Card key={student.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4 mb-4">
                                <Avatar>
                                    <AvatarImage src={student.avatarUrl} alt={student.name} />
                                    <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{student.name}</p>
                                    <p className="text-sm text-muted-foreground">{student.email}</p>
                                </div>
                                <Button variant="outline" size="icon" onClick={() => handleViewProfile(student)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View Profile</span>
                                </Button>
                                </div>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Progress</p>
                                        <div className="flex items-center gap-2">
                                            <Progress value={student.progress} className="h-2 w-full" />
                                            <span className="text-sm font-medium">{student.progress}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Enrolled On</p>
                                        <p className="text-sm font-medium">{student.enrolledAt.toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Last Login</p>
                                        <p className="text-sm font-medium">{student.lastLogin ? student.lastLogin.toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    {student.progress === 100 && course?.hasCertificate && (
                                        <Button asChild size="sm" variant="secondary" className="w-full mt-2">
                                            <Link href={`/student/certificate/${student.enrollmentId}`}>
                                                <Award className="mr-2 h-4 w-4" />
                                                View Certificate
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 border-dashed border rounded-lg">
                    <UserIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No students enrolled yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Share your course to get your first student!</p>
                </div>
            )}
            </div>

            <div className="hidden md:block rounded-lg border">
              <TooltipProvider>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Enrolled On</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        Loading...
                        </TableCell>
                    </TableRow>
                    ) : students.length > 0 ? (
                    students.map((student) => (
                        <TableRow key={student.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={student.avatarUrl} alt={student.name} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                            </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.enrolledAt.toLocaleDateString()}</TableCell>
                        <TableCell>{student.lastLogin ? student.lastLogin.toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <Progress value={student.progress} className="w-40 h-2" />
                            <span>{student.progress}%</span>
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={() => handleViewProfile(student)}>
                                            <Eye className="h-4 w-4" />
                                            <span className="sr-only">View Profile</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent><p>View Profile</p></TooltipContent>
                                </Tooltip>
                                {student.progress === 100 && course?.hasCertificate && (
                                     <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button asChild size="icon">
                                                <Link href={`/student/certificate/${student.enrollmentId}`}>
                                                    <Award className="h-4 w-4" />
                                                    <span className="sr-only">View Certificate</span>
                                                </Link>
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent><p>View Certificate</p></TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </TableCell>
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                        No students have enrolled in this course yet.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
              </TooltipProvider>
            </div>
        </TabsContent>
         <TabsContent value="test-results">
            {loadingTestAttempts ? (
                <p>Loading test results...</p>
            ) : course?.finalAssessmentId ? (
                <TestResultsTable attempts={testAttempts} students={students} loading={loadingTestAttempts} />
            ) : (
                <div className="text-center py-12 border-dashed border rounded-lg">
                    <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-lg font-medium">No Final Assessment</h3>
                    <p className="mt-1 text-sm text-muted-foreground">This course does not have a final test linked to it.</p>
                </div>
            )}
        </TabsContent>
        <TabsContent value="engagement">
             <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatCard
                        title="Total Enrollments"
                        value={loading ? '...' : students.length.toString()}
                        icon={<Users className="h-6 w-6 text-blue-500" />}
                    />
                    <StatCard
                        title="Active Students (30 Days)"
                        value={loading ? '...' : activeStudentsLast30Days.toString()}
                        icon={<Activity className="h-6 w-6 text-green-500" />}
                    />
                 </div>
                 <ActivityHeatmap students={students} />
             </div>
        </TabsContent>
        <TabsContent value="efficacy">
             <ContentEfficacyReport courseId={courseId} lessons={lessons} />
        </TabsContent>
      </Tabs>

       <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-lg">
            <DialogHeader>
                <DialogTitle>Student Profile: {viewingProfileUser?.name}</DialogTitle>
            </DialogHeader>
             {viewingProfileUser && <StudentProfile user={viewingProfileUser} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
