'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LessonViewer } from '@/components/lesson-viewer';
import type { Lesson } from '@/types';

// Sample lesson data to demonstrate the multi-content lesson viewer
const sampleSimpleLesson: Lesson = {
  id: 'lesson-1',
  title: 'Introduction to Professional Branding',
  type: 'video',
  content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  objectives: 'Understand the fundamentals of professional branding and how it impacts your career.',
  courseId: 'sample-course',
  order: 1,
  createdAt: new Date().toISOString(),
};

const sampleMultiContentLesson: Lesson = {
  id: 'lesson-2',
  title: 'Comprehensive LinkedIn Profile Optimization',
  type: 'video', // Primary type
  content: JSON.stringify({
    primaryContent: {
      type: 'video',
      title: 'LinkedIn Profile Video Tutorial',
      content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    additionalContent: [
      {
        type: 'text',
        title: 'Profile Optimization Checklist',
        content: `
          <h3>Profile Optimization Checklist</h3>
          <ul>
            <li><strong>Professional Photo:</strong> Use a high-quality, professional headshot</li>
            <li><strong>Compelling Headline:</strong> Write a headline that showcases your value proposition</li>
            <li><strong>Summary Section:</strong> Craft a compelling summary that tells your professional story</li>
            <li><strong>Experience Details:</strong> Add detailed descriptions of your roles and achievements</li>
            <li><strong>Skills & Endorsements:</strong> List relevant skills and seek endorsements</li>
            <li><strong>Recommendations:</strong> Request recommendations from colleagues and clients</li>
          </ul>
        `,
      },
      {
        type: 'audio',
        title: 'Expert Interview: LinkedIn Success Stories',
        content: '/sample-audio.mp3', // This would be a real audio file
      },
      {
        type: 'document',
        title: 'LinkedIn Profile Template',
        content: '/sample-template.pdf', // This would be a real PDF
      },
      {
        type: 'embed',
        title: 'LinkedIn Profile Examples',
        content: 'https://www.linkedin.com',
      },
    ],
  }),
  objectives: `
    <ul>
      <li>Create a compelling LinkedIn profile that attracts recruiters</li>
      <li>Optimize your profile for search visibility</li>
      <li>Build a professional network effectively</li>
      <li>Showcase your achievements and skills</li>
    </ul>
  `,
  courseId: 'sample-course',
  order: 2,
  createdAt: new Date().toISOString(),
};

export function LessonViewerDemo() {
  const [currentLesson, setCurrentLesson] = useState<Lesson>(sampleMultiContentLesson);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleLessonComplete = () => {
    setIsCompleted(true);
    console.log('Lesson completed!');
  };

  const handleProgress = (progress: number) => {
    console.log('Progress:', progress + '%');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Lesson Viewer Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            This demo showcases the lesson viewer component with both simple and multi-content lessons.
          </p>
          
          <div className="flex gap-4 mb-6">
            <Button
              variant={currentLesson.id === sampleSimpleLesson.id ? 'default' : 'outline'}
              onClick={() => {
                setCurrentLesson(sampleSimpleLesson);
                setIsCompleted(false);
              }}
            >
              Simple Video Lesson
            </Button>
            <Button
              variant={currentLesson.id === sampleMultiContentLesson.id ? 'default' : 'outline'}
              onClick={() => {
                setCurrentLesson(sampleMultiContentLesson);
                setIsCompleted(false);
              }}
            >
              Multi-Content Lesson
            </Button>
          </div>
        </CardContent>
      </Card>

      <LessonViewer
        lesson={currentLesson}
        onComplete={handleLessonComplete}
        onProgress={handleProgress}
        isCompleted={isCompleted}
        estimatedDuration={15}
      />
    </div>
  );
}