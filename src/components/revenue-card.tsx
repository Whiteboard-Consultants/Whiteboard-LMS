'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import type { Course } from '@/types';

interface RevenueCardProps {
  courses: Course[];
  loading: boolean;
}

export function RevenueCard({ courses, loading }: RevenueCardProps) {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [filteredRevenue, setFilteredRevenue] = useState(0);

  useEffect(() => {
    // Calculate revenue for the selected date range
    // Note: This is a client-side calculation based on course price * student count
    // For a more accurate revenue tracking, you'd want to query actual enrollment dates from the database
    const revenue = courses.reduce((sum, course) => {
      const coursePrice = course.price || 0;
      const studentCount = course.studentCount || 0;
      return sum + (coursePrice * studentCount);
    }, 0);
    
    setFilteredRevenue(revenue);
  }, [courses, startDate, endDate]);

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
    setStartDate(subDays(new Date(), 365 * 5)); // 5 years back as "all time"
    setEndDate(new Date());
  };

  return (
    <Card className="col-span-full md:col-span-1 lg:col-span-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        <DollarSign className="h-5 w-5 text-emerald-500" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          {loading ? (
            <div className="text-2xl font-bold">...</div>
          ) : (
            <div className="text-2xl font-bold">
              ₹{filteredRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-2">
            From {format(startDate, 'MMM dd, yyyy')} to {format(endDate, 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="grid grid-cols-2 gap-2">
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

        <p className="text-xs text-muted-foreground pt-2">
          💡 <strong>Note:</strong> Revenue is calculated based on course price × enrolled students. For detailed enrollment tracking by date, check your database records.
        </p>
      </CardContent>
    </Card>
  );
}
