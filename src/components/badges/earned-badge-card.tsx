/**
 * Earned Badge Card Component
 * Displays a badge that a user has earned
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Star, Trophy, Zap, Target, Flame } from 'lucide-react';
import { format } from 'date-fns';

interface EarnedBadgeCardProps {
  badge: {
    id: string;
    badge_id: string;
    earned_at: string;
    reason: string;
    badges?: {
      id: string;
      name: string;
      description: string;
      icon?: string;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    };
  };
}

export function EarnedBadgeCard({ badge }: EarnedBadgeCardProps) {
  const badgeInfo = badge.badges;
  
  if (!badgeInfo) {
    return null;
  }

  // Get icon based on badge type
  const getIcon = () => {
    const iconType = badgeInfo.icon;
    switch (iconType) {
      case 'trophy':
        return <Trophy className="w-8 h-8 text-yellow-500" />;
      case 'star':
        return <Star className="w-8 h-8 text-yellow-400" />;
      case 'zap':
        return <Zap className="w-8 h-8 text-orange-400" />;
      case 'target':
        return <Target className="w-8 h-8 text-blue-500" />;
      case 'flame':
        return <Flame className="w-8 h-8 text-red-500" />;
      default:
        return <Award className="w-8 h-8 text-purple-500" />;
    }
  };

  // Color scheme based on rarity
  const getRarityColor = () => {
    switch (badgeInfo.rarity) {
      case 'legendary':
        return 'bg-gradient-to-br from-orange-400 to-red-600 text-white';
      case 'epic':
        return 'bg-gradient-to-br from-purple-500 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white';
      case 'common':
      default:
        return 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900';
    }
  };

  const getRarityBadgeColor = () => {
    switch (badgeInfo.rarity) {
      case 'legendary':
        return 'bg-orange-100 text-orange-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'common':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Badge Icon */}
          <div className={`p-4 rounded-full ${getRarityColor()} flex items-center justify-center`}>
            {getIcon()}
          </div>

          {/* Badge Name */}
          <h3 className="font-bold text-lg text-gray-900">{badgeInfo.name}</h3>

          {/* Badge Description */}
          <p className="text-sm text-gray-600">{badgeInfo.description}</p>

          {/* Rarity Badge */}
          <Badge className={getRarityBadgeColor()}>
            {badgeInfo.rarity.charAt(0).toUpperCase() + badgeInfo.rarity.slice(1)}
          </Badge>

          {/* Earned Date */}
          <p className="text-xs text-gray-500 pt-2">
            Earned {format(new Date(badge.earned_at), 'MMM d, yyyy')}
          </p>

          {/* Reason */}
          {badge.reason && (
            <p className="text-xs bg-blue-50 text-blue-700 rounded p-2 w-full">
              {badge.reason}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
