'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface LessonInPath {
  lessonId: string;
  sequenceNumber: number;
  difficulty: string;
  estimatedDays: number;
  prerequisites: string[];
  rationale: string;
}

interface GeneratedLearningPathProps {
  goalId: string;
  goalName: string;
  onPathGenerated?: (path: any) => void;
}

export function GeneratedLearningPathViewer({
  goalId,
  goalName,
  onPathGenerated,
}: GeneratedLearningPathProps) {
  const { accessToken } = useAuth();
  const [path, setPath] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePath = async () => {
    if (!accessToken) return;

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/ai/learning-path/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ goalId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate learning path');
      }

      const data = await response.json();
      setPath(data.data);
      onPathGenerated?.(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!path && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI-Generated Learning Path
          </CardTitle>
          <CardDescription>Goal: {goalName}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Generate an optimized learning path tailored to your goal using AI sequencing.
          </p>
          <Button onClick={handleGeneratePath} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Path
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI-Generated Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Analyzing your profile and generating optimal path...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !path) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            AI-Generated Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            {error || 'Failed to generate path'}
          </div>
          <Button onClick={handleGeneratePath} variant="outline" className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          AI-Generated Learning Path
        </CardTitle>
        <CardDescription>
          {path.estimatedCompletionDays} days • {path.successRate}% success rate
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Path Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Lessons</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{path.sequencedLessons.length}</p>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Duration</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{path.estimatedCompletionDays}d</p>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{path.successRate}%</p>
          </div>
        </div>

        {/* Lessons Sequence */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-700">Lesson Sequence</p>
          {path.sequencedLessons.map((lesson: LessonInPath, index: number) => (
            <div key={lesson.lessonId} className="relative">
              {index < path.sequencedLessons.length - 1 && (
                <div className="absolute left-4 top-10 w-0.5 h-8 bg-gray-300" />
              )}
              <div className="flex gap-3 relative z-10">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-500">
                    <span className="text-sm font-bold text-blue-600">{lesson.sequenceNumber}</span>
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getDifficultyColor(lesson.difficulty)} border text-xs`}>
                      {lesson.difficulty}
                    </Badge>
                    <span className="text-xs text-gray-600">~{lesson.estimatedDays}d</span>
                  </div>
                  <p className="text-sm text-gray-700">{lesson.rationale}</p>
                  {lesson.prerequisites.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Prerequisites: {lesson.prerequisites.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skill Progression */}
        {path.skillProgression && path.skillProgression.length > 0 && (
          <div className="pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-3">Skill Progression</p>
            <div className="space-y-2">
              {path.skillProgression.map((skillProg: any) => (
                <div key={skillProg.skill} className="p-2 bg-gray-50 rounded">
                  <p className="text-sm font-medium text-gray-900">{skillProg.skill}</p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {skillProg.progressionSteps.map((step: string, i: number) => (
                      <div key={step} className="flex items-center">
                        <span className="text-xs px-2 py-1 bg-white border rounded text-gray-700">
                          {step}
                        </span>
                        {i < skillProg.progressionSteps.length - 1 && (
                          <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Start Button */}
        <Button className="w-full mt-4">
          <BookOpen className="w-4 h-4 mr-2" />
          Start Learning Path
        </Button>
      </CardContent>
    </Card>
  );
}
