'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Course } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CourseRevenue {
  id: string;
  title: string;
  price: number;
  studentCount: number;
  revenue: number;
  instructor: string;
}

export function AdminRevenueCard() {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const { data: coursesData, error } = await supabase
          .from('courses')
          .select('*');

        if (error) {
          console.error('Error fetching courses:', error);
          setCourses([]);
        } else {
          setCourses(coursesData || []);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  const courseRevenues: CourseRevenue[] = courses.map(course => ({
    id: course.id,
    title: course.title,
    price: course.price || 0,
    studentCount: course.studentCount || 0,
    revenue: (course.price || 0) * (course.studentCount || 0),
    instructor: typeof course.instructor === 'string' 
      ? course.instructor 
      : course.instructor?.name || 'Unknown',
  }));

  const totalRevenue = courseRevenues.reduce((sum, course) => sum + course.revenue, 0);
  const topCourses = [...courseRevenues]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const handleLastMonth = () => {
    setEndDate(new Date());
    setStartDate(subDays(new Date(), 30));
  };

  const handleLastQuarter = () => {
    setEndDate(new Date());
    setStartDate(subDays(new Date(), 90));
  };

  const handleYearToDate = () => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    setStartDate(yearStart);
    setEndDate(now);
  };

  const handleAllTime = () => {
    setStartDate(subDays(new Date(), 365 * 5));
    setEndDate(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Overall Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-bold">Platform Revenue Analytics</CardTitle>
          <DollarSign className="h-6 w-6 text-emerald-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            {loading ? (
              <div className="text-3xl font-bold">...</div>
            ) : (
              <div>
                <div className="text-3xl font-bold">
                  ₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <p className="text-sm text-muted-foreground pt-2">
                  Total platform revenue from {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
                </p>
              </div>
            )}
          </div>

          {/* Quick Filter Buttons */}
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLastMonth}
              className="text-xs"
            >
              Last Month
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLastQuarter}
              className="text-xs"
            >
              Last Quarter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleYearToDate}
              className="text-xs"
            >
              Year to Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAllTime}
              className="text-xs"
            >
              All Time
            </Button>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Custom Date Range</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">From</label>
                <input
                  type="date"
                  value={format(startDate, 'yyyy-MM-dd')}
                  onChange={(e) => setStartDate(new Date(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">To</label>
                <input
                  type="date"
                  value={format(endDate, 'yyyy-MM-dd')}
                  onChange={(e) => setEndDate(new Date(e.target.value))}
                  className="w-full px-2 py-1 text-sm border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-muted-foreground">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold">
                {courseRevenues.reduce((sum, c) => sum + c.studentCount, 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Revenue/Course</p>
              <p className="text-2xl font-bold">
                ₹{(totalRevenue / (courses.length || 1)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Revenue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course Title</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Enrollments</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : courseRevenues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No courses found
                    </TableCell>
                  </TableRow>
                ) : (
                  courseRevenues.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.instructor}</TableCell>
                      <TableCell className="text-right">
                        ₹{course.price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </TableCell>
                      <TableCell className="text-right">{course.studentCount}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{course.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top Courses */}
      {topCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Revenue-Generating Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      ₹{course.revenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {course.studentCount} enrollments @ ₹{course.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
