'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Clock, BookOpen, ChevronRight, Loader2 } from 'lucide-react';

interface AdaptiveRecommendation {
  nextLessonId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  reason: string;
  estimatedTime: number;
  relatedSkills: string[];
}

interface AdaptiveRecommendationProps {
  onLessonSelect?: (lessonId: string) => void;
}

export function AdaptiveRecommendation({ onLessonSelect }: AdaptiveRecommendationProps) {
  const { accessToken } = useAuth();
  const [recommendation, setRecommendation] = useState<AdaptiveRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendation = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/learning/next-lesson', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendation');
        }

        const data = await response.json();
        setRecommendation(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendation();
  }, [accessToken]);

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Next Recommended Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !recommendation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Next Recommended Lesson
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">
            {error || 'No lesson recommendations available at this time. Complete some quizzes to get personalized recommendations!'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-500" />
            Next Recommended Lesson
          </span>
          <Badge className={getDifficultyColor(recommendation.difficulty)}>
            {recommendation.difficulty.charAt(0).toUpperCase() + recommendation.difficulty.slice(1)}
          </Badge>
        </CardTitle>
        <CardDescription>{recommendation.reason}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Estimated time: {recommendation.estimatedTime} minutes</span>
        </div>

        {/* Related Skills */}
        {recommendation.relatedSkills.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Skills you'll develop:</p>
            <div className="flex flex-wrap gap-2">
              {recommendation.relatedSkills.map(skill => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          className="w-full mt-4"
          onClick={() => onLessonSelect?.(recommendation.nextLessonId)}
        >
          <span>Start Lesson</span>
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
