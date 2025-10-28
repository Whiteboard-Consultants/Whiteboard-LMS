
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Enrollment, User, Course } from '@/types';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, User as UserIcon, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentProfile } from '@/components/student-profile';

interface EnrolledStudent extends User {
  enrollmentId: string;
  enrolledAt: Date;
  progress: number;
}

export default function EnrolledStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData } = useAuth();
  const courseId = params.courseId as string;
  
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!courseId || !user || !userData) return;

    const fetchCourseInfo = async () => {
      try {
        const { data: courseData, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error || !courseData) {
          router.push('/instructor/courses');
          return;
        }

        // Security check: ensure the current user is the instructor of this course
        if (courseData.instructor_id === userData.id) {
          setCourse(courseData as Course);
        } else {
          router.push('/instructor/dashboard');
        }
      } catch (err) {
        console.error('Error fetching course:', err);
        router.push('/instructor/courses');
      }
    };

    fetchCourseInfo();
  }, [courseId, user, userData, router]);

  useEffect(() => {
    if (!course || !user) return;

    const fetchStudents = async () => {
      try {
        // Get all enrollments for this course
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId);

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

        // Get user details for each enrollment
        const studentPromises = enrollments.map(async (enrollment: any) => {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', enrollment.user_id)
            .single();

          if (userError || !userData) return null;

          return {
            ...userData,
            enrollmentId: enrollment.id,
            enrolledAt: new Date(enrollment.enrolled_at),
            progress: enrollment.progress || 0
          };
        });

        const studentData = (await Promise.all(studentPromises)).filter(Boolean) as EnrolledStudent[];
        setStudents(studentData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching students:', err);
        setLoading(false);
      }
    };

    fetchStudents();
  }, [course, courseId, user]);
  
  const handleViewProfile = (student: EnrolledStudent) => {
    setViewingProfileUser(student);
    setIsProfileModalOpen(true);
  };

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
        title={course ? `Enrolled Students: ${course.title}` : 'Loading...'}
        description="View and track the progress of students in this course."
      />

      {/* Mobile View */}
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

      {/* Desktop View */}
      <div className="hidden md:block rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enrolled On</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
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
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={student.progress} className="w-40 h-2" />
                      <span>{student.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(student)}>
                      <Eye className="mr-2 h-4 w-4" /> View Profile
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No students have enrolled in this course yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

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
