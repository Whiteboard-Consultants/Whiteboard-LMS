'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Plus, Pencil, Trash2, Link as LinkIcon, Unlink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { getPrograms, updateProgram, deleteProgram, createProgram, getCoursesByProgram, linkCourseToProgram, unlinkCourseFromProgram, getAllCourses } from '@/app/admin/programs-actions';
import { getEnrolledCourses } from '@/app/(main)/student/dashboard/actions';
import type { Program } from '@/app/admin/programs-actions';
import type { Course } from '@/types';

export default function AdminProgramsPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<Program>>({});
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [showCoursesDialog, setShowCoursesDialog] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [programCourses, setProgramCourses] = useState<Course[]>([]);
  const [newProgram, setNewProgram] = useState<Partial<Program>>({
    name: '',
    description: '',
    start_date: '',
    last_enrollment_date: '',
    batch_time: ''
  });

  // Check if user is admin
  useEffect(() => {
    if (user && userData && userData.role !== 'admin') {
      router.push('/student/dashboard');
    }
  }, [user, userData, router]);

  // Fetch programs and all courses
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [programsResult, coursesResult] = await Promise.all([
        getPrograms(),
        getAllCourses()
      ]);

      if (programsResult.success) {
        setPrograms(programsResult.data);
      }

      // Fetch all courses for dropdown
      if (coursesResult.success) {
        setCourses(coursesResult.data as Course[]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load data'
      });
    }
    setLoading(false);
  };

  const handleEdit = (program: Program) => {
    setEditingId(program.id);
    setEditingData({
      name: program.name,
      description: program.description,
      start_date: program.start_date,
      last_enrollment_date: program.last_enrollment_date,
      batch_time: program.batch_time
    });
  };

  const handleSaveEdit = async (programId: string) => {
    const result = await updateProgram(programId, editingData);
    if (result.success) {
      toast({ title: 'Success', description: 'Program updated' });
      setEditingId(null);
      await fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error
      });
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!confirm('Delete this program?')) return;

    const result = await deleteProgram(programId);
    if (result.success) {
      toast({ title: 'Success', description: 'Program deleted' });
      await fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error
      });
    }
  };

  const handleCreateProgram = async () => {
    if (!newProgram.name?.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Program name is required'
      });
      return;
    }

    const result = await createProgram(newProgram as any);
    if (result.success) {
      toast({ title: 'Success', description: 'Program created' });
      setShowNewDialog(false);
      setNewProgram({ name: '', description: '', start_date: '', last_enrollment_date: '' });
      await fetchData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error
      });
    }
  };

  const handleOpenCoursesDialog = async (programId: string) => {
    setSelectedProgramId(programId);
    const result = await getCoursesByProgram(programId);
    if (result.success) {
      setProgramCourses(result.data as Course[]);
    }
    setShowCoursesDialog(true);
  };

  const handleLinkCourse = async (courseId: string) => {
    if (!selectedProgramId) return;

    const result = await linkCourseToProgram(courseId, selectedProgramId);
    if (result.success) {
      toast({ title: 'Success', description: 'Course linked' });
      const refreshResult = await getCoursesByProgram(selectedProgramId);
      if (refreshResult.success) {
        setProgramCourses(refreshResult.data as Course[]);
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const handleUnlinkCourse = async (courseId: string) => {
    const result = await unlinkCourseFromProgram(courseId);
    if (result.success) {
      toast({ title: 'Success', description: 'Course unlinked' });
      if (selectedProgramId) {
        const refreshResult = await getCoursesByProgram(selectedProgramId);
        if (refreshResult.success) {
          setProgramCourses(refreshResult.data as Course[]);
        }
      }
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const unlinkedCourses = courses.filter(
    course => !programCourses.some(pc => pc.id === course.id)
  );

  if (!user || !userData || userData.role !== 'admin') {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Programs Management</h1>
            <p className="text-muted-foreground">Manage online programs and link courses</p>
          </div>
        </div>
        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Program</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Course *</label>
                <Select value={newProgram.name || ''} onValueChange={(value) => setNewProgram({ ...newProgram, name: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.title}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  placeholder="Program description"
                  value={newProgram.description || ''}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={newProgram.start_date || ''}
                  onChange={(e) => setNewProgram({ ...newProgram, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Enrollment Date</label>
                <Input
                  type="date"
                  value={newProgram.last_enrollment_date || ''}
                  onChange={(e) => setNewProgram({ ...newProgram, last_enrollment_date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Batch Time</label>
                <Input
                  placeholder="e.g., 9:00 AM - 11:00 AM"
                  value={newProgram.batch_time || ''}
                  onChange={(e) => setNewProgram({ ...newProgram, batch_time: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateProgram} className="w-full">Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Programs</CardTitle>
          <CardDescription>Manage programs and their associated courses</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Program Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>Last Enrollment</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No programs created yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    programs.map((program) => (
                      <TableRow key={program.id}>
                        <TableCell>
                          {editingId === program.id ? (
                            <Input
                              value={editingData.name || ''}
                              onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                              className="max-w-xs"
                            />
                          ) : (
                            <div>
                              <p className="font-medium">{program.name}</p>
                              {program.description && (
                                <p className="text-sm text-muted-foreground">{program.description}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === program.id ? (
                            <Input
                              type="date"
                              value={editingData.start_date || ''}
                              onChange={(e) => setEditingData({ ...editingData, start_date: e.target.value })}
                              className="max-w-xs"
                            />
                          ) : (
                            formatDate(program.start_date)
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId === program.id ? (
                            <Input
                              type="date"
                              value={editingData.last_enrollment_date || ''}
                              onChange={(e) => setEditingData({ ...editingData, last_enrollment_date: e.target.value })}
                              className="max-w-xs"
                            />
                          ) : (
                            formatDate(program.last_enrollment_date)
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenCoursesDialog(program.id)}
                          >
                            {program.course_count || 0} courses
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          {editingId === program.id ? (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={() => handleSaveEdit(program.id)}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            </div>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              <Button size="sm" variant="outline" onClick={() => handleEdit(program)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleDeleteProgram(program.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manage Courses Dialog */}
      <Dialog open={showCoursesDialog} onOpenChange={setShowCoursesDialog}>
        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Program Courses</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Linked Courses */}
            <div>
              <h3 className="font-semibold mb-3">Linked Courses ({programCourses.length})</h3>
              {programCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No courses linked yet</p>
              ) : (
                <div className="space-y-2">
                  {programCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {course.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUnlinkCourse(course.id)}
                      >
                        <Unlink className="h-4 w-4 mr-1" />
                        Unlink
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Courses */}
            <div>
              <h3 className="font-semibold mb-3">Available Courses ({unlinkedCourses.length})</h3>
              {unlinkedCourses.length === 0 ? (
                <p className="text-sm text-muted-foreground">All courses are linked</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {unlinkedCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-xs text-muted-foreground">ID: {course.id}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLinkCourse(course.id)}
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
