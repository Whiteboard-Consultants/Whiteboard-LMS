import { ThreadList } from '@/app/(main)/student/messaging/components/thread-list';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface MessagingPageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export async function generateMetadata() {
  return {
    title: 'Messages - Student Dashboard',
  };
}

export default async function MessagingPage({
  params,
}: MessagingPageProps) {
  const { courseId } = await params;
  
  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b bg-muted/50">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/student/dashboard" className="hover:text-foreground">
              Courses
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>Course Messages</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground mt-1">
                Communicate with your instructor
              </p>
            </div>
            <Button asChild>
              <Link href={`/student/${courseId}/messaging/new`}>
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <div className="max-w-6xl mx-auto">
        <ThreadList courseId={courseId} />
      </div>
    </div>
  );
}
