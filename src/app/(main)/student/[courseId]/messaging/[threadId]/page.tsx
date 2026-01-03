'use client';

import { ThreadView } from '@/app/(main)/student/messaging/components/thread-view';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface ThreadPageProps {
  params: Promise<{
    courseId: string;
    threadId: string;
  }>;
}

export default function ThreadPage({
  params,
}: ThreadPageProps) {
  const { courseId, threadId } = use(params);
  
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb */}
      <div className="border-b p-4 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/student/${courseId}/messaging`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Threads
          </Link>
        </Button>
      </div>

      {/* Thread View */}
      <div className="flex-1 overflow-hidden">
        <ThreadView threadId={threadId} courseId={courseId} />
      </div>
    </div>
  );
}
