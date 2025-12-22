import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, TrendingDown } from 'lucide-react';

interface SkillGap {
  skillName: string;
  category: string;
  currentLevel: number; // 0-100
  targetLevel: number; // 0-100
  gap: number; // target - current
  importance: 'high' | 'medium' | 'low';
  relatedCourses: { id: string; title: string }[];
}

interface GapAnalysisProps {
  gaps: SkillGap[];
  totalGaps: number;
  averageGap: number;
  recommendedFocusAreas: string[];
}

export function GapAnalysis({
  gaps,
  totalGaps,
  averageGap,
  recommendedFocusAreas,
}: GapAnalysisProps) {
  const criticalGaps = gaps.filter(g => g.gap >= 40);
  const moderateGaps = gaps.filter(g => g.gap >= 20 && g.gap < 40);
  const minorGaps = gaps.filter(g => g.gap < 20);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-gray-900">{totalGaps}</div>
              <span className="text-xs text-gray-600 pb-1">skills to improve</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Average Gap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-orange-600">{Math.round(averageGap)}%</div>
              <span className="text-xs text-gray-600 pb-1">improvement needed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Critical Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <div className="text-3xl font-bold text-red-600">{criticalGaps.length}</div>
              <span className="text-xs text-gray-600 pb-1">high priority</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Gaps */}
      {criticalGaps.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <CardTitle className="text-red-900">Critical Gaps</CardTitle>
            </div>
            <CardDescription className="text-red-800">
              {criticalGaps.length} skill{criticalGaps.length !== 1 ? 's' : ''} need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalGaps.map(gap => (
                <GapItem key={gap.skillName} gap={gap} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moderate Gaps */}
      {moderateGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-yellow-900">Moderate Gaps</CardTitle>
            <CardDescription>
              {moderateGaps.length} skill{moderateGaps.length !== 1 ? 's' : ''} with room for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moderateGaps.map(gap => (
                <GapItem key={gap.skillName} gap={gap} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Minor Gaps */}
      {minorGaps.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-900">Minor Gaps</CardTitle>
            </div>
            <CardDescription className="text-green-800">
              {minorGaps.length} skill{minorGaps.length !== 1 ? 's' : ''} almost mastered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {minorGaps.map(gap => (
                <GapItem key={gap.skillName} gap={gap} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Focus Areas */}
      {recommendedFocusAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Learning Path</CardTitle>
            <CardDescription>Suggested order based on gaps and dependencies</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {recommendedFocusAreas.map((area, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700 pt-0.5">{area}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      {/* No Gaps Message */}
      {totalGaps === 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-green-900">All Skills Mastered!</h3>
              <p className="text-sm text-green-700 mt-1">
                You're meeting all target proficiency levels. Keep practicing to stay sharp!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function GapItem({ gap }: { gap: SkillGap }) {
  return (
    <div className="space-y-2 p-3 rounded-lg bg-white/50">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{gap.skillName}</h4>
          <p className="text-xs text-gray-600">{gap.category}</p>
        </div>
        <Badge className={getImportanceColor(gap.importance)}>
          {getImportanceIcon(gap.importance)} {gap.importance.charAt(0).toUpperCase() + gap.importance.slice(1)}
        </Badge>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Current: {gap.currentLevel}% → Target: {gap.targetLevel}%</span>
          <span className="font-bold text-gray-900">{gap.gap}% gap</span>
        </div>
        <Progress value={gap.currentLevel} className="h-1.5" />
      </div>

      {gap.relatedCourses.length > 0 && (
        <div className="pt-2 flex flex-wrap gap-1">
          {gap.relatedCourses.slice(0, 2).map(course => (
            <Badge key={course.id} variant="outline" className="text-xs">
              {course.title}
            </Badge>
          ))}
          {gap.relatedCourses.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{gap.relatedCourses.length - 2} more
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
