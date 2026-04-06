import { Metadata } from 'next';
import { LessonViewerDemo } from '@/components/lesson-viewer-demo';

export const metadata: Metadata = {
  title: 'Lesson Viewer Demo - Whiteboard Consultants',
  description: 'Demonstration of the interactive lesson viewer with multi-content support.',
  alternates: {
    canonical: '/demo/lesson-viewer',
  },
};

export default function LessonViewerDemoPage() {
  return <LessonViewerDemo />;
}