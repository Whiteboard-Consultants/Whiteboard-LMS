'use client';

import React from 'react';
import { AlertCircle, TrendingUp, BookOpen, CheckCircle2 } from 'lucide-react';
import { ImprovementSuggestion } from '@/app/student/improvement-suggestions-actions';

interface ImprovementSuggestionsProps {
  suggestions: ImprovementSuggestion[];
  certificateEligible: boolean;
}

export function ImprovementSuggestions({
  suggestions,
  certificateEligible
}: ImprovementSuggestionsProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Excellent Performance!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-200">
              You performed well across all areas. Keep up the good work!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Separate high-priority suggestions
  const highPriority = suggestions.filter(s => s.severity === 'high');
  const mediumPriority = suggestions.filter(s => s.severity === 'medium');

  return (
    <div className="space-y-4">
      {/* Certificate Status Banner */}
      {!certificateEligible && (
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Not Eligible for Certificate Yet
              </h4>
              <p className="text-sm text-orange-700 dark:text-orange-200 mt-1">
                Focus on the improvement areas below to achieve the required score.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* High Priority Suggestions */}
      {highPriority.length > 0 && (
        <div>
          <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Critical Focus Areas
          </h3>
          <div className="space-y-3">
            {highPriority.map((suggestion, idx) => (
              <SuggestionCard key={idx} suggestion={suggestion} priority="high" />
            ))}
          </div>
        </div>
      )}

      {/* Medium Priority Suggestions */}
      {mediumPriority.length > 0 && (
        <div>
          <h3 className="font-semibold text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Areas for Improvement
          </h3>
          <div className="space-y-3">
            {mediumPriority.map((suggestion, idx) => (
              <SuggestionCard key={idx} suggestion={suggestion} priority="medium" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SuggestionCardProps {
  suggestion: ImprovementSuggestion;
  priority: 'high' | 'medium';
}

function SuggestionCard({ suggestion, priority }: SuggestionCardProps) {
  const borderColor =
    priority === 'high'
      ? 'border-l-red-500 dark:border-l-red-400'
      : 'border-l-amber-500 dark:border-l-amber-400';

  const bgColor =
    priority === 'high'
      ? 'bg-red-50 dark:bg-red-950'
      : 'bg-amber-50 dark:bg-amber-950';

  const textColor =
    priority === 'high'
      ? 'text-red-900 dark:text-red-100'
      : 'text-amber-900 dark:text-amber-100';

  const secondaryTextColor =
    priority === 'high'
      ? 'text-red-700 dark:text-red-200'
      : 'text-amber-700 dark:text-amber-200';

  return (
    <div className={`rounded-lg border-l-4 ${borderColor} ${bgColor} p-4`}>
      <div className="mb-3">
        <h4 className={`font-semibold ${textColor}`}>{suggestion.area}</h4>
        <p className={`text-sm ${secondaryTextColor} mt-1`}>{suggestion.reason}</p>
      </div>

      <div className={`mb-3 p-3 rounded bg-white dark:bg-slate-900 ${textColor}`}>
        <p className="text-sm">{suggestion.suggestion}</p>
      </div>

      <div>
        <h5 className={`text-sm font-semibold ${textColor} mb-2`}>
          Suggested Actions:
        </h5>
        <ul className="space-y-2">
          {suggestion.suggestedActions.map((action, idx) => (
            <li key={idx} className={`flex items-start gap-2 text-sm ${secondaryTextColor}`}>
              <span className="mt-1.5">
                <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Compact version for dashboard display
 */
export function CompactImprovementSuggestions({
  suggestions
}: {
  suggestions: ImprovementSuggestion[];
}) {
  const highPriority = suggestions.filter(s => s.severity === 'high');

  if (highPriority.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
        Areas to Focus On
      </h4>
      <ul className="space-y-1">
        {highPriority.slice(0, 3).map((suggestion, idx) => (
          <li
            key={idx}
            className="text-sm text-red-700 dark:text-red-200 flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-600 dark:bg-red-400" />
            {suggestion.area} ({suggestion.performanceScore}%)
          </li>
        ))}
      </ul>
      {highPriority.length > 3 && (
        <p className="text-xs text-red-600 dark:text-red-300 mt-2">
          +{highPriority.length - 3} more areas
        </p>
      )}
    </div>
  );
}
