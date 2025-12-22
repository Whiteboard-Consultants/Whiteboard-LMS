/**
 * Streak Tracker Component
 * Displays user's current learning streak
 */

'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, AlertCircle } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  isLoading?: boolean;
  lastActivityDate?: string;
}

export function StreakTracker({ currentStreak, isLoading, lastActivityDate }: StreakTrackerProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const getStreakLevel = () => {
    if (currentStreak === 0) return 'No Active Streak';
    if (currentStreak < 7) return 'Getting Started';
    if (currentStreak < 30) return 'On Fire! 🔥';
    if (currentStreak < 100) return 'Unstoppable! 🚀';
    return 'Legendary! 👑';
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return 'text-gray-400';
    if (currentStreak < 7) return 'text-orange-500';
    if (currentStreak < 30) return 'text-red-500';
    if (currentStreak < 100) return 'text-orange-600';
    return 'text-yellow-500';
  };

  const getStreakBgColor = () => {
    if (currentStreak === 0) return 'bg-gray-100';
    if (currentStreak < 7) return 'bg-orange-50';
    if (currentStreak < 30) return 'bg-red-50';
    if (currentStreak < 100) return 'bg-orange-50';
    return 'bg-yellow-50';
  };

  return (
    <Card className={getStreakBgColor()}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${getStreakColor()}`} />
            <CardTitle>Learning Streak</CardTitle>
          </div>
          {currentStreak > 0 && (
            <Badge variant="secondary" className="text-lg py-1 px-3">
              {currentStreak} 🔥
            </Badge>
          )}
        </div>
        <CardDescription>{getStreakLevel()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Number */}
        <div className="text-center">
          <div className={`text-4xl font-bold ${getStreakColor()}`}>
            {currentStreak}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {currentStreak === 1 ? 'day' : 'days'} of consecutive learning
          </p>
        </div>

        {/* Streak Status */}
        {currentStreak === 0 ? (
          <div className="bg-white rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">No active streak</p>
              <p className="text-xs text-gray-600">
                Complete a lesson today to start your streak!
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Streak Status</span>
              <span className="text-sm font-semibold text-green-600">
                {currentStreak >= 7 ? '✅ Active' : '⏳ Building'}
              </span>
            </div>
            
            {/* Milestone Progress */}
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Next milestone:</p>
              {currentStreak < 7 && (
                <p className="text-sm font-medium">
                  🎯 {7 - currentStreak} more days to reach 7-day streak!
                </p>
              )}
              {currentStreak >= 7 && currentStreak < 30 && (
                <p className="text-sm font-medium">
                  🎯 {30 - currentStreak} more days to reach 30-day streak!
                </p>
              )}
              {currentStreak >= 30 && currentStreak < 100 && (
                <p className="text-sm font-medium">
                  🎯 {100 - currentStreak} more days to reach 100-day streak!
                </p>
              )}
              {currentStreak >= 100 && (
                <p className="text-sm font-medium text-purple-600">
                  👑 You've reached legendary status!
                </p>
              )}
            </div>

            {/* Last Activity */}
            {lastActivityDate && (
              <p className="text-xs text-gray-500 pt-1">
                Last activity: {formatDate(lastActivityDate)}
              </p>
            )}
          </div>
        )}

        {/* Streak Tips */}
        <div className="bg-blue-50 rounded-lg p-3 space-y-1">
          <p className="text-xs font-semibold text-blue-900">Streak Tips:</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>✓ Complete at least one lesson daily</li>
            <li>✓ Practice consistently to maintain your streak</li>
            <li>✓ Earn streak badges at 7, 30, and 100 days</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
