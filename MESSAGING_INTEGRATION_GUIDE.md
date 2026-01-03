# Integration Guide: Adding Messaging to Course Pages

## Overview

This guide shows how to add "Message Instructor" buttons and messaging links to existing course pages.

## Option 1: Add to Course Header (Recommended)

### In Your Course Page Component

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface CourseHeaderProps {
  courseId: string;
  isStudent?: boolean;
}

export function CourseHeader({ courseId, isStudent = false }: CourseHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Course Title</h1>
      </div>
      
      {isStudent && (
        <Button asChild>
          <Link href={`/student/${courseId}/messaging`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Message Instructor
          </Link>
        </Button>
      )}
    </div>
  );
}
```

## Option 2: Add to Course Sidebar

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface CourseSidebarProps {
  courseId: string;
}

export function CourseSidebar({ courseId }: CourseSidebarProps) {
  return (
    <aside className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/student/${courseId}/messaging`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Instructor
            </Link>
          </Button>
          {/* Other quick action buttons */}
        </div>
      </Card>
    </aside>
  );
}
```

## Option 3: Add to Course Content Area

```tsx
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ChevronRight } from 'lucide-react';

interface CourseResourcesProps {
  courseId: string;
}

export function CourseResources({ courseId }: CourseResourcesProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Instructor Messaging
              </CardTitle>
              <CardDescription>
                Ask questions and get help from your instructor
              </CardDescription>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href={`/student/${courseId}/messaging`}>
              Open Messages
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Other resource cards */}
    </div>
  );
}
```

## Option 4: Add to Course Navigation Tabs

```tsx
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MessageSquare } from 'lucide-react';

interface CourseTabsProps {
  courseId: string;
}

export function CourseTabs({ courseId }: CourseTabsProps) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="lessons">Lessons</TabsTrigger>
        <TabsTrigger asChild value="messages">
          <Link href={`/student/${courseId}/messaging`}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </Link>
        </TabsTrigger>
        <TabsTrigger value="assessments">Assessments</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        {/* Overview content */}
      </TabsContent>
      
      {/* Other tab contents */}
    </Tabs>
  );
}
```

## Option 5: Add Badge with Notification Count

```tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { getUnreadNotifications } from '@/app/api/messages/message-actions';

interface MessageButtonWithBadgeProps {
  courseId: string;
}

export async function MessageButtonWithBadge({ courseId }: MessageButtonWithBadgeProps) {
  const notificationsResult = await getUnreadNotifications();
  const unreadCount = notificationsResult.success 
    ? notificationsResult.data?.length || 0 
    : 0;

  return (
    <Button asChild className="relative">
      <Link href={`/student/${courseId}/messaging`}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Messages
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2" variant="destructive">
            {unreadCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
```

## Option 6: Full Course Header with Messaging

```tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Share2, Star, Eye } from 'lucide-react';

interface FullCourseHeaderProps {
  courseId: string;
  courseTitle: string;
  instructorName: string;
  rating: number;
  enrollmentCount: number;
  isStudent?: boolean;
  isEnrolled?: boolean;
  unreadMessages?: number;
}

export function FullCourseHeader({
  courseId,
  courseTitle,
  instructorName,
  rating,
  enrollmentCount,
  isStudent = false,
  isEnrolled = false,
  unreadMessages = 0,
}: FullCourseHeaderProps) {
  return (
    <div className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{courseTitle}</h1>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>
                      {i < Math.floor(rating) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} / 5 ({enrollmentCount} students)
                </span>
              </div>
              <span className="text-sm">By {instructorName}</span>
            </div>

            <p className="text-muted-foreground mb-6">
              Master the fundamentals and advanced concepts
            </p>

            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {enrollmentCount} students enrolled
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {isStudent && isEnrolled && (
              <Button asChild size="lg" className="relative">
                <Link href={`/student/${courseId}/messaging`}>
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message Instructor
                  {unreadMessages > 0 && (
                    <Badge className="absolute -top-2 -right-2" variant="destructive">
                      {unreadMessages}
                    </Badge>
                  )}
                </Link>
              </Button>
            )}

            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>

            <Button variant="ghost">
              <Star className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Using in Existing Course Component

### Example Integration

```tsx
// In your existing course-page-client.tsx or similar

import { FullCourseHeader } from '@/components/course-header-with-messaging';

export function CoursePageClient({ course, isStudent, isEnrolled }: Props) {
  return (
    <>
      <FullCourseHeader
        courseId={course.id}
        courseTitle={course.title}
        instructorName={course.instructor?.name || 'Instructor'}
        rating={course.rating}
        enrollmentCount={course.enrollmentCount}
        isStudent={isStudent}
        isEnrolled={isEnrolled}
        unreadMessages={0} // Fetch this from your notification system
      />

      {/* Rest of course content */}
    </>
  );
}
```

## Conditional Display

### Show Only to Students

```tsx
import { useAuth } from '@/hooks/use-auth';

export function CourseActions({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const isStudent = user?.role === 'student'; // Adjust based on your auth

  if (!isStudent) return null;

  return (
    <Button asChild>
      <Link href={`/student/${courseId}/messaging`}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message Instructor
      </Link>
    </Button>
  );
}
```

### Show Only If Enrolled

```tsx
export async function CourseActionsServer({ 
  courseId, 
  userId 
}: { 
  courseId: string;
  userId: string;
}) {
  const supabase = await createClient();
  
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('course_id', courseId)
    .eq('user_id', userId)
    .single();

  if (!enrollment) return null;

  return (
    <Button asChild>
      <Link href={`/student/${courseId}/messaging`}>
        <MessageSquare className="h-4 w-4 mr-2" />
        Message Instructor
      </Link>
    </Button>
  );
}
```

## Styling Variations

### As a Card Component

```tsx
<Card className="p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="font-semibold">Need Help?</h3>
      <p className="text-sm text-muted-foreground mt-1">
        Reach out to your instructor anytime
      </p>
    </div>
    <Button asChild>
      <Link href={`/student/${courseId}/messaging`}>
        <MessageSquare className="h-4 w-4" />
      </Link>
    </Button>
  </div>
</Card>
```

### As a Floating Action Button

```tsx
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export function FloatingMessageButton({ courseId }: { courseId: string }) {
  return (
    <Button
      asChild
      size="lg"
      className="fixed bottom-8 right-8 rounded-full shadow-lg hover:shadow-xl"
    >
      <Link href={`/student/${courseId}/messaging`}>
        <MessageSquare className="h-6 w-6" />
      </Link>
    </Button>
  );
}
```

## Notes

- Always show messaging button only to students (not instructors or guests)
- Show unread notification badge if available
- Consider showing messaging in course sidebar or header
- Ensure responsive design on mobile
- Add proper hover states and transitions
- Use consistent colors with your design system
