'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, AlertCircle } from 'lucide-react';

interface DifficultyInfo {
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  description: string;
}

interface DifficultySelectorProps {
  compact?: boolean;
}

export function DifficultySelector({ compact = false }: DifficultySelectorProps) {
  const { accessToken } = useAuth();
  const [difficulty, setDifficulty] = useState<DifficultyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDifficulty = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/learning/difficulty', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch difficulty');
        }

        const data = await response.json();
        setDifficulty(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDifficulty();
  }, [accessToken]);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediate':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'advanced':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'expert':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyIcon = (level: string) => {
    const iconMap: Record<string, string> = {
      beginner: '🌱',
      intermediate: '🚀',
      advanced: '⚡',
      expert: '🏆',
    };
    return iconMap[level] || '📚';
  };

  if (compact) {
    if (isLoading || !difficulty) {
      return (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-600">Recommended:</span>
        <Badge className={`${getDifficultyColor(difficulty.recommendedDifficulty)} border`}>
          <span className="mr-1">{getDifficultyIcon(difficulty.recommendedDifficulty)}</span>
          {difficulty.recommendedDifficulty.charAt(0).toUpperCase() + difficulty.recommendedDifficulty.slice(1)}
        </Badge>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Your Learning Level
        </CardTitle>
        <CardDescription>Personalized based on your performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        ) : difficulty ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-transparent border border-blue-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Level</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {getDifficultyIcon(difficulty.recommendedDifficulty)}{' '}
                  {difficulty.recommendedDifficulty.charAt(0).toUpperCase() + difficulty.recommendedDifficulty.slice(1)}
                </p>
              </div>
              <Badge className={`${getDifficultyColor(difficulty.recommendedDifficulty)} border px-3 py-1`}>
                Current
              </Badge>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-700">
                {difficulty.description}
              </p>
            </div>

            {/* Level Progression */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Learning Path</p>
              <div className="flex gap-1">
                {['beginner', 'intermediate', 'advanced', 'expert'].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-2 rounded-full transition-all ${
                      ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(level) <
                      ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(
                        difficulty.recommendedDifficulty
                      )
                        ? 'bg-blue-500'
                        : ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(level) ===
                          ['beginner', 'intermediate', 'advanced', 'expert'].indexOf(
                            difficulty.recommendedDifficulty
                          )
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
