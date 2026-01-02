'use client';

import { useState, useEffect } from 'react';
import { saveCommissionRate, getAllInstructors, getAllCourses, CommissionRate } from './commission-actions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface InstructorOption {
  id: string;
  name: string;
  email: string;
}

interface CourseOption {
  id: string;
  title: string;
  instructor_id: string | null;
}

interface CommissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingRate?: CommissionRate | null;
  onRateSaved: () => void;
}

export function CommissionFormDialog({
  open,
  onOpenChange,
  editingRate,
  onRateSaved,
}: CommissionFormDialogProps) {
  const [level, setLevel] = useState<'platform' | 'instructor' | 'course'>('instructor');
  const [commission, setCommission] = useState('20');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instructors, setInstructors] = useState<InstructorOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [loadingInstructors, setLoadingInstructors] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // Fetch instructors and courses when dialog opens
  useEffect(() => {
    if (open) {
      if (instructors.length === 0) {
        fetchInstructors();
      }
      if (courses.length === 0) {
        fetchCourses();
      }
    }
  }, [open]);

  const fetchInstructors = async () => {
    setLoadingInstructors(true);
    try {
      const result = await getAllInstructors();
      if (result.success && result.data) {
        setInstructors(result.data);
      } else {
        setError(result.error || 'Failed to fetch instructors');
      }
    } finally {
      setLoadingInstructors(false);
    }
  };

  const fetchCourses = async () => {
    setLoadingCourses(true);
    try {
      const result = await getAllCourses();
      if (result.success && result.data) {
        setCourses(result.data);
      } else {
        setError(result.error || 'Failed to fetch courses');
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    if (editingRate) {
      setLevel(editingRate.level as 'platform' | 'instructor' | 'course');
      setCommission(editingRate.commission_percentage.toString());
      setDescription(editingRate.description || '');
      if (editingRate.level === 'instructor' && editingRate.instructor_id) {
        setSelectedInstructor(editingRate.instructor_id);
      }
      if (editingRate.level === 'course' && editingRate.course_id) {
        setSelectedCourse(editingRate.course_id);
      }
    } else {
      setLevel('instructor');
      setCommission('20');
      setDescription('');
      setSelectedInstructor('');
      setSelectedCourse('');
    }
    setError(null);
  }, [editingRate, open]);

  const handleSave = async () => {
    setError(null);

    // Validation
    const commissionNum = parseFloat(commission);
    if (isNaN(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      setError('Commission must be a number between 0 and 100');
      return;
    }

    if (level === 'instructor' && !selectedInstructor) {
      setError('Please select an instructor');
      return;
    }

    if (level === 'course' && !selectedCourse) {
      setError('Please select a course');
      return;
    }

    setSaving(true);

    const result = await saveCommissionRate(
      level,
      commissionNum,
      level === 'instructor' ? selectedInstructor : undefined,
      level === 'course' ? selectedCourse : undefined,
      description
    );

    setSaving(false);

    if (result.success) {
      onRateSaved();
      onOpenChange(false);
    } else {
      setError(result.error || 'Failed to save commission rate');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingRate ? 'Edit Commission Rate' : 'New Commission Rate'}
          </DialogTitle>
          <DialogDescription>
            {editingRate
              ? 'Update the commission rate'
              : 'Create a new commission rate for instructors'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="level">Rate Level</Label>
            <Select
              value={level}
              onValueChange={v => setLevel(v as 'platform' | 'instructor' | 'course')}
              disabled={!!editingRate}
            >
              <SelectTrigger id="level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform">Platform Default</SelectItem>
                <SelectItem value="instructor">Instructor-Specific</SelectItem>
                <SelectItem value="course">Course-Specific</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {level === 'platform' && 'Applies to all instructors by default'}
              {level === 'instructor' && 'Applies to a specific instructor'}
              {level === 'course' && 'Applies to a specific course'}
            </p>
          </div>

          {/* Instructor Selection */}
          {level === 'instructor' && (
            <div className="space-y-2">
              <Label htmlFor="instructor">Select Instructor</Label>
              <Select
                value={selectedInstructor}
                onValueChange={setSelectedInstructor}
                disabled={loadingInstructors}
              >
                <SelectTrigger id="instructor">
                  <SelectValue placeholder={loadingInstructors ? 'Loading instructors...' : 'Choose an instructor'} />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map(instructor => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name} ({instructor.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {instructors.length === 0 && !loadingInstructors && (
                <p className="text-xs text-muted-foreground text-red-600">No instructors found</p>
              )}
            </div>
          )}

          {/* Course Selection */}
          {level === 'course' && (
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <Select
                value={selectedCourse}
                onValueChange={setSelectedCourse}
                disabled={loadingCourses}
              >
                <SelectTrigger id="course">
                  <SelectValue placeholder={loadingCourses ? 'Loading courses...' : 'Choose a course'} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {courses.length === 0 && !loadingCourses && (
                <p className="text-xs text-muted-foreground text-red-600">No courses found</p>
              )}
            </div>
          )}

          {/* Commission Percentage */}
          <div className="space-y-2">
            <Label htmlFor="commission">Commission Percentage (%)</Label>
            <Input
              id="commission"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commission}
              onChange={e => setCommission(e.target.value)}
              placeholder="20"
            />
            <p className="text-xs text-muted-foreground">
              Instructors earn this % of the original course price
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g., Standard rate for top performers"
              rows={3}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
