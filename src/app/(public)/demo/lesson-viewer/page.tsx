import { Metadata } from 'next';
import { LessonViewerDemo } from '@/components/lesson-viewer-demo';

export const metadata: Metadata = {
  title: 'Lesson Viewer Demo - WhitedgeLMS',
  description: 'Demonstration of the multi-content lesson viewer component.',
};

export default function LessonViewerDemoPage() {
  return <LessonViewerDemo />;
}