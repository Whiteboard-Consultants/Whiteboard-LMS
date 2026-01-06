'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface LearningGoal {
  id: string;
  goal_title: string;
  goal_description?: string;
  role_title?: string;
  target_skills?: string[];
  priority: number;
  target_completion_date?: string;
  status: string;
}

interface LearningGoalListProps {
  goals: LearningGoal[];
  onGoalDeleted?: () => void;
}

export function LearningGoalList({ goals, onGoalDeleted }: LearningGoalListProps) {
  const { accessToken } = useAuth();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (goalId: string) => {
    setDeletingId(goalId);
    try {
      const response = await fetch(`/api/user/learning-goals/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      toast({
        title: 'Success',
        description: 'Learning goal deleted successfully',
      });

      onGoalDeleted?.();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete learning goal',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge variant="destructive">High</Badge>;
      case 2:
        return <Badge variant="secondary">Medium</Badge>;
      case 3:
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (goals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Target className="h-5 w-5" />
        Your Learning Goals
      </h3>

      <div className="grid gap-4">
        {goals.map(goal => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg">{goal.goal_title}</CardTitle>
                  {goal.role_title && (
                    <CardDescription className="text-sm mt-1">
                      Target Role: <span className="font-medium text-foreground">{goal.role_title}</span>
                    </CardDescription>
                  )}
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(goal.priority)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(goal.id)}
                    disabled={deletingId === goal.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {goal.goal_description && (
                <p className="text-sm text-gray-700 dark:text-gray-300">{goal.goal_description}</p>
              )}

              {goal.target_completion_date && (
                <div className="text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Target Completion: </span>
                  <span className="font-medium">
                    {new Date(goal.target_completion_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {goal.target_skills && goal.target_skills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Target Skills ({goal.target_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {goal.target_skills.map((skillId, index) => (
                      <Badge key={`${goal.id}-${index}`} variant="outline">
                        {skillId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
