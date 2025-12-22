/**
 * Badge Progress Component
 * Shows progress toward badges not yet earned
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, Lock, ChevronRight } from 'lucide-react';

interface BadgeProgressItem {
  badge: {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
  progress: number;
  description: string;
}

interface BadgeProgressProps {
  badgeProgress: BadgeProgressItem[];
  isLoading?: boolean;
}

export function BadgeProgress({ badgeProgress, isLoading }: BadgeProgressProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!badgeProgress || badgeProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Progress</CardTitle>
          <CardDescription>No badges in progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Complete more lessons and challenges to earn badges!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5" />
          Badge Progress
        </CardTitle>
        <CardDescription>
          {badgeProgress.length} badges in progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {badgeProgress.map((item, index) => (
          <div key={item.badge.id} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{item.badge.name}</h4>
                <p className="text-sm text-gray-600">{item.badge.description}</p>
              </div>
              <Badge variant="outline" className="ml-2">
                {item.badge.rarity.charAt(0).toUpperCase() + item.badge.rarity.slice(1)}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{item.description}</span>
                <span className="text-xs font-medium text-gray-700">
                  {Math.round(item.progress)}%
                </span>
              </div>
              <Progress value={item.progress} className="h-2" />
            </div>

            {/* Unlock tip */}
            {item.progress < 100 && (
              <p className="text-xs text-gray-500 italic">
                {getUnlockTip(item.badge.name, item.progress)}
              </p>
            )}

            {/* Divider */}
            {index < badgeProgress.length - 1 && <div className="border-t pt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

/**
 * Get helpful tip based on badge and progress
 */
function getUnlockTip(badgeName: string, progress: number): string {
  if (progress >= 75) {
    return '✨ Almost there! Keep going!';
  } else if (progress >= 50) {
    return '🚀 You\'re halfway there!';
  } else if (progress >= 25) {
    return '💪 Great start! Keep up the momentum!';
  }
  return '🎯 Start your journey to unlock this badge!';
}
