'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface LearningAnalytics {
  averageQuizScore: number;
  completionRate: number;
  learningPace: 'slow' | 'normal' | 'fast';
  strongSkills: string[];
  weakSkills: string[];
  recommendedDifficulty: string;
}

interface ImprovementTrend {
  trend: 'improving' | 'declining' | 'stable';
  percentageChange: number;
}

interface InsightsData {
  profile: LearningAnalytics;
  improvementTrend: ImprovementTrend;
  insights: string[];
}

export function LearningInsights() {
  const { accessToken } = useAuth();
  const [data, setData] = useState<InsightsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/learning/insights', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const responseData = await response.json();
        setData(responseData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [accessToken]);

  const getPaceEmoji = (pace: string) => {
    switch (pace) {
      case 'fast':
        return '⚡';
      case 'slow':
        return '🐢';
      default:
        return '📚';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'declining':
        return '📉';
      default:
        return '➡️';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Learning Insights
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

  if (error || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Learning Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error || 'Unable to load insights at this time'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { profile, improvementTrend, insights } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Learning Insights
        </CardTitle>
        <CardDescription>Personalized analysis of your learning progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Quiz Average</p>
            <p className="text-3xl font-bold text-blue-600">{profile.averageQuizScore}%</p>
            <p className="text-xs text-gray-600 mt-1">Based on all attempts</p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Completion</p>
            <p className="text-3xl font-bold text-green-600">{profile.completionRate}%</p>
            <p className="text-xs text-gray-600 mt-1">Lessons completed</p>
          </div>
        </div>

        {/* Learning Pace */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Learning Pace</p>
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center justify-between">
            <span className="text-2xl">{getPaceEmoji(profile.learningPace)}</span>
            <div className="flex-1 ml-3">
              <p className="font-medium text-gray-900 capitalize">{profile.learningPace}</p>
              <p className="text-xs text-gray-600">
                {profile.learningPace === 'fast'
                  ? 'You\'re progressing quickly!'
                  : profile.learningPace === 'slow'
                  ? 'Take your time learning.'
                  : 'You\'re at a steady pace.'}
              </p>
            </div>
          </div>
        </div>

        {/* Improvement Trend */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Improvement Trend</p>
          <div className={`p-3 rounded-lg border flex items-center justify-between ${
            improvementTrend.trend === 'improving'
              ? 'bg-green-50 border-green-200'
              : improvementTrend.trend === 'declining'
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <span className="text-2xl">{getTrendIcon(improvementTrend.trend)}</span>
            <div className="flex-1 ml-3">
              <p className={`font-medium capitalize ${getTrendColor(improvementTrend.trend)}`}>
                {improvementTrend.trend}
              </p>
              <p className={`text-xs ${getTrendColor(improvementTrend.trend)}`}>
                {improvementTrend.percentageChange > 0 ? '+' : ''}{improvementTrend.percentageChange}% change
              </p>
            </div>
          </div>
        </div>

        {/* Strong Skills */}
        {profile.strongSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Your Strengths</p>
            <div className="flex flex-wrap gap-2">
              {profile.strongSkills.map(skill => (
                <Badge key={skill} className="bg-green-100 text-green-800 border-green-300 border">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Weak Skills */}
        {profile.weakSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Focus Areas</p>
            <div className="flex flex-wrap gap-2">
              {profile.weakSkills.map(skill => (
                <Badge key={skill} className="bg-orange-100 text-orange-800 border-orange-300 border">
                  🎯 {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Key Insights</p>
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-gray-700 flex gap-2">
                  <span className="flex-shrink-0">→</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended Difficulty */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Recommended Learning Level</p>
          <p className="text-lg font-bold text-purple-600 capitalize">
            {profile.recommendedDifficulty}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
