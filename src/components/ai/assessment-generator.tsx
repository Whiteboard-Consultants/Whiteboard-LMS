'use client';

import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Zap, Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface GeneratedQuestion {
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  explanation: string;
  difficulty: string;
}

interface AssessmentGeneratorProps {
  lessonId: string;
  lessonName: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export function AssessmentGenerator({
  lessonId,
  lessonName,
  difficulty,
}: AssessmentGeneratorProps) {
  const { accessToken } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAssessment = async () => {
    if (!accessToken) return;

    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch('/api/ai/assessment/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonId, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate assessment');
      }

      const data = await response.json();
      setAssessment(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return '✓';
      case 'short-answer':
        return '📝';
      case 'essay':
        return '📄';
      default:
        return '?';
    }
  };

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case 'multiple-choice':
        return 'bg-blue-100 text-blue-800';
      case 'short-answer':
        return 'bg-yellow-100 text-yellow-800';
      case 'essay':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!assessment && !isGenerating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI-Generated Assessment
          </CardTitle>
          <CardDescription>
            For: {lessonName} ({difficulty})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Generate a customized assessment adapted to your skill level.
          </p>
          <Button onClick={handleGenerateAssessment} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            Generate Assessment
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
            <Zap className="w-5 h-5 text-yellow-500" />
            AI-Generated Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Creating personalized questions...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !assessment) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            AI-Generated Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-red-600 mb-4">
            <AlertCircle className="w-4 h-4" />
            {error || 'Failed to generate assessment'}
          </div>
          <Button onClick={handleGenerateAssessment} variant="outline" className="w-full">
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
          <Zap className="w-5 h-5 text-yellow-500" />
          AI-Generated Assessment
        </CardTitle>
        <CardDescription>
          {assessment.questionCount} questions • {assessment.estimatedTime} minutes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Assessment Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Questions</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">{assessment.questionCount}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded border border-orange-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Time</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{assessment.estimatedTime}m</p>
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <p className="text-xs font-semibold text-gray-600 uppercase">Level</p>
            <p className="text-lg font-bold text-purple-600 mt-1 capitalize">{assessment.difficulty}</p>
          </div>
        </div>

        {/* Questions Preview */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">Question Types</p>
          {assessment.questions.slice(0, 5).map((question: GeneratedQuestion, index: number) => (
            <div key={question.id} className="p-3 bg-gray-50 rounded border border-gray-200">
              <div className="flex items-start gap-2 mb-2">
                <Badge className={`${getQuestionTypeColor(question.type)} border text-xs flex-shrink-0`}>
                  {getQuestionTypeIcon(question.type)}
                </Badge>
                <p className="text-xs text-gray-600 flex-shrink-0">Q{index + 1}</p>
              </div>
              <p className="text-sm text-gray-800 mb-2">{question.question}</p>

              {question.options && question.options.length > 0 && (
                <div className="space-y-1 mb-2">
                  {question.options.map((option: string) => (
                    <p key={option} className="text-xs text-gray-700 pl-4">
                      • {option}
                    </p>
                  ))}
                </div>
              )}

              <div className="p-2 bg-blue-50 rounded border border-blue-200 mt-2">
                <p className="text-xs font-medium text-gray-700 mb-1">Explanation:</p>
                <p className="text-xs text-gray-700">{question.explanation}</p>
              </div>
            </div>
          ))}

          {assessment.questionCount > 5 && (
            <div className="p-3 bg-gray-100 rounded border border-gray-300 text-center">
              <p className="text-sm text-gray-700 font-medium">
                +{assessment.questionCount - 5} more questions
              </p>
            </div>
          )}
        </div>

        {/* Start Button */}
        <Button className="w-full mt-4">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Start Assessment
        </Button>
      </CardContent>
    </Card>
  );
}
