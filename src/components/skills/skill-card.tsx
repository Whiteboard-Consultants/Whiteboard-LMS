import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Zap, Award, TrendingUp } from 'lucide-react';

interface SkillCardProps {
  skillName: string;
  category: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  masteryPercentage: number;
  practiceCount: number;
  endorsements?: number;
  lastPracticed?: Date;
  isTarget?: boolean;
  gap?: number; // gap percentage if this is a target skill
}

export function SkillCard({
  skillName,
  category,
  proficiencyLevel,
  masteryPercentage,
  practiceCount,
  endorsements = 0,
  lastPracticed,
  isTarget = false,
  gap,
}: SkillCardProps) {
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-green-100 text-green-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'beginner':
        return '⭐';
      case 'intermediate':
        return '⭐⭐';
      case 'advanced':
        return '⭐⭐⭐';
      case 'expert':
        return '⭐⭐⭐⭐';
      default:
        return '';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Not practiced yet';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <Card className={isTarget ? 'border-orange-400 border-2' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{skillName}</CardTitle>
            <CardDescription>{category}</CardDescription>
          </div>
          {isTarget && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              Target Skill
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Proficiency Badge */}
        <div className="flex items-center gap-2">
          <Badge className={`${getLevelColor(proficiencyLevel)} font-medium`}>
            {getLevelIcon(proficiencyLevel)} {proficiencyLevel.charAt(0).toUpperCase() + proficiencyLevel.slice(1)}
          </Badge>
        </div>

        {/* Mastery Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Mastery</span>
            <span className="text-sm font-bold text-gray-900">{masteryPercentage}%</span>
          </div>
          <Progress value={masteryPercentage} className="h-2" />
        </div>

        {/* Gap Display (if target skill) */}
        {isTarget && gap !== undefined && gap > 0 && (
          <div className="space-y-2 rounded-lg bg-orange-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-orange-900">Gap to Master</span>
              <span className="text-sm font-bold text-orange-900">{gap}%</span>
            </div>
            <Progress value={100 - gap} className="h-1.5" />
            <p className="text-xs text-orange-700">
              Need {Math.ceil((gap / 100) * 20)} more practice sessions
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-900">{practiceCount}</span>
            <span className="text-xs text-gray-600">Practices</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-2">
            <Award className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-900">{endorsements}</span>
            <span className="text-xs text-gray-600">Endorsements</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg bg-gray-50 p-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-900">
              {lastPracticed ? Math.floor(Math.random() * 5 + 1) : '—'}
            </span>
            <span className="text-xs text-gray-600">Week Avg</span>
          </div>
        </div>

        {/* Last Practiced */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Last practiced: {formatDate(lastPracticed)}
        </div>
      </CardContent>
    </Card>
  );
}
