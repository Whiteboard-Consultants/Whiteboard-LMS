import { Metadata } from 'next';
import { LessonViewerDemo } from '@/components/lesson-viewer-demo';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Lesson Viewer Demo',
  description: 'Demonstration of the interactive lesson viewer with multi-content support.',
  path: '/demo/lesson-viewer',
  robots: { index: false, follow: false },
});

export default function LessonViewerDemoPage() {
  return <LessonViewerDemo />;
}