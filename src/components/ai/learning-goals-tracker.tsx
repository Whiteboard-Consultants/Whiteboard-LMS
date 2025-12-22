'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle2, Clock, Loader2, AlertCircle, TrendingUp } from 'lucide-react';

interface GoalProgress {
  goalId: string;
  goalName: string;
  targetSkills: string[];
  completionPercent: number;
  estimatedRemainingDays: number;
  status: 'completed' | 'on-track' | 'in-progress' | 'started' | 'not-started';
}

interface LearningGoalsProps {
  compact?: boolean;
}

export function LearningGoalsTracker({ compact = false }: LearningGoalsProps) {
  const { accessToken } = useAuth();
  const [goals, setGoals] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoals = async () => {
      if (!accessToken) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/ai/learning-goals', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch learning goals');
        }

        const data = await response.json();
        setGoals(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [accessToken]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on-track':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'started':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'on-track':
        return '🎯';
      case 'in-progress':
        return '📚';
      case 'started':
        return '🚀';
      default:
        return '⏳';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Learning Goals
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

  if (error || !goals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error || 'Unable to load learning goals'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const { progress = [], totalGoals, completedGoals, activeGoals } = goals;

  if (!compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-500" />
            Learning Goals
          </CardTitle>
          <CardDescription>Track your personalized learning objectives</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">Total Goals</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{totalGoals}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{completedGoals}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">Active</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{activeGoals}</p>
            </div>
          </div>

          {/* Goals List */}
          {progress.length > 0 ? (
            <div className="space-y-3">
              {progress.map((goal: GoalProgress) => (
                <div
                  key={goal.goalId}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{goal.goalName}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {goal.estimatedRemainingDays > 0
                          ? `~${goal.estimatedRemainingDays} days remaining`
                          : 'On track to complete'}
                      </p>
                    </div>
                    <Badge className={`${getStatusColor(goal.status)} border`}>
                      <span className="mr-1">{getStatusIcon(goal.status)}</span>
                      {goal.status.charAt(0).toUpperCase() + goal.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{goal.completionPercent}%</span>
                    </div>
                    <Progress value={goal.completionPercent} className="h-2" />
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-2">
                    {goal.targetSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">No learning goals yet.</p>
              <p className="text-xs text-gray-500 mt-1">Create a goal to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact view for sidebars
  return (
    <div className="space-y-2">
      {progress.slice(0, 3).map((goal: GoalProgress) => (
        <div key={goal.goalId} className="p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-900 truncate">{goal.goalName}</p>
          <Progress value={goal.completionPercent} className="h-1 mt-1" />
          <p className="text-xs text-gray-600 mt-1">{goal.completionPercent}% complete</p>
        </div>
      ))}
      {totalGoals === 0 && (
        <p className="text-xs text-gray-600 text-center py-2">No active goals</p>
      )}
    </div>
  );
}
