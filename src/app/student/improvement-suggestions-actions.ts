import { supabase } from '@/lib/supabase';

/**
 * Interface for section/topic performance
 */
export interface SectionPerformance {
  sectionId: string;
  sectionName: string;
  score: number; // percentage
  correct: number;
  total: number;
  questions: Array<{
    id: string;
    correct: boolean;
    userAnswer: number | null;
  }>;
}

/**
 * Interface for improvement suggestions
 */
export interface ImprovementSuggestion {
  area: string;
  performanceScore: number;
  severity: 'low' | 'medium' | 'high'; // low: 70-85, medium: 50-70, high: <50
  reason: string;
  suggestion: string;
  suggestedActions: string[];
}

/**
 * Calculate section-wise performance from test attempt
 */
export function calculateSectionPerformance(
  questions: any[],
  answers: any[],
  sections: any[]
): SectionPerformance[] {
  const sectionMap = new Map();

  // Group questions by section
  sections.forEach(section => {
    sectionMap.set(section.id, {
      sectionId: section.id,
      sectionName: section.name,
      correct: 0,
      total: 0,
      questions: []
    });
  });

  // Calculate performance for each section
  questions.forEach((question, index) => {
    if (!question.sectionId) return;

    const section = sectionMap.get(question.sectionId);
    if (!section) return;

    const userAnswer = answers[index]?.optionIndex;
    const isCorrect = userAnswer === question.correctOption;

    section.total += 1;
    section.questions.push({
      id: question.id,
      correct: isCorrect,
      userAnswer
    });

    if (isCorrect) {
      section.correct += 1;
    }
  });

  // Convert to array and calculate percentages
  return Array.from(sectionMap.values()).map(section => ({
    ...section,
    score: section.total > 0 ? Math.round((section.correct / section.total) * 100) : 0
  }));
}

/**
 * Generate personalized improvement suggestions based on performance
 */
export function generateImprovementSuggestions(
  sectionPerformance: SectionPerformance[],
  overallScore: number,
  certificateMinimumScore: number
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  sectionPerformance.forEach(section => {
    // Only suggest improvements for weak areas (below 70%)
    if (section.score < 70) {
      let severity: 'low' | 'medium' | 'high' = 'low';
      let suggestion = '';
      const suggestedActions: string[] = [];

      if (section.score < 50) {
        severity = 'high';
        suggestion = `Critical: You scored ${section.score}% in "${section.sectionName}". This area needs significant focus.`;
        suggestedActions.push(
          `Take our foundational course on ${section.sectionName}`,
          `Practice 5-10 sample questions daily on this topic`,
          `Review the basics and common mistakes`,
          `Schedule a doubt-clearing session with an instructor`
        );
      } else if (section.score < 70) {
        severity = 'medium';
        suggestion = `Focus Area: You scored ${section.score}% in "${section.sectionName}". There's room for improvement.`;
        suggestedActions.push(
          `Review concepts in ${section.sectionName}`,
          `Practice 3-5 sample questions on weak topics`,
          `Identify specific question types you struggled with`,
          `Try interactive tutorials on this topic`
        );
      }

      suggestions.push({
        area: section.sectionName,
        performanceScore: section.score,
        severity,
        reason: `Score: ${section.score}% (${section.correct}/${section.total} correct)`,
        suggestion,
        suggestedActions
      });
    }
  });

  // If overall score is below certificate minimum, add general suggestion
  if (overallScore < certificateMinimumScore) {
    suggestions.push({
      area: 'Overall Performance',
      performanceScore: overallScore,
      severity: overallScore < 60 ? 'high' : 'medium',
      reason: `Overall score: ${overallScore}% (minimum for certificate: ${certificateMinimumScore}%)`,
      suggestion: `You scored ${overallScore}% but need ${certificateMinimumScore}% for certification. Focus on the weak areas identified above.`,
      suggestedActions: [
        'Complete all recommended practice sessions',
        'Review the weak areas in priority order',
        'Attempt the test again when ready',
        'Track your progress before next attempt'
      ]
    });
  }

  return suggestions;
}

/**
 * Save improvement suggestions to database
 */
export async function saveImprovementSuggestions(
  testAttemptId: string,
  sectionPerformance: SectionPerformance[],
  suggestions: ImprovementSuggestion[]
) {
  try {
    const { error } = await supabase
      .from('test_attempts')
      .update({
        section_scores: sectionPerformance,
        weak_areas: suggestions
          .filter(s => s.severity !== 'low')
          .map(s => ({ area: s.area, score: s.performanceScore, severity: s.severity })),
        improvement_suggestions: suggestions
      })
      .eq('id', testAttemptId);

    if (error) {
      console.error('Error saving improvement suggestions:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in saveImprovementSuggestions:', error);
    return { success: false, error };
  }
}

/**
 * Get improvement suggestions for a specific test attempt
 */
export async function getImprovementSuggestions(testAttemptId: string) {
  try {
    const { data, error } = await supabase
      .from('test_attempts')
      .select(`
        id,
        section_scores,
        weak_areas,
        improvement_suggestions,
        score,
        total_score
      `)
      .eq('id', testAttemptId)
      .single();

    if (error) {
      console.error('Error fetching improvement suggestions:', error);
      return { success: false, data: null, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getImprovementSuggestions:', error);
    return { success: false, data: null, error };
  }
}

/**
 * Get all weak areas across user's test attempts for a course
 */
export async function getUserWeakAreas(userId: string, courseId: string) {
  try {
    const { data, error } = await supabase
      .from('test_attempts')
      .select('weak_areas, improvement_suggestions, created_at')
      .eq('user_id', userId)
      // Join with tests to filter by course
      .filter('test_id', 'in', `(
        SELECT id FROM tests WHERE course_id = '${courseId}'
      )`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user weak areas:', error);
      return { success: false, data: null, error };
    }

    // Aggregate weak areas across attempts
    const aggregatedWeakAreas = new Map();
    
    data?.forEach(attempt => {
      if (attempt.weak_areas) {
        attempt.weak_areas.forEach((area: any) => {
          if (!aggregatedWeakAreas.has(area.area)) {
            aggregatedWeakAreas.set(area.area, {
              area: area.area,
              scores: [],
              avgScore: 0,
              timesIdentified: 0,
              severity: area.severity
            });
          }
          
          const existing = aggregatedWeakAreas.get(area.area);
          existing.scores.push(area.score);
          existing.timesIdentified += 1;
          existing.avgScore = Math.round(
            existing.scores.reduce((a: number, b: number) => a + b, 0) / existing.scores.length
          );
        });
      }
    });

    return {
      success: true,
      data: Array.from(aggregatedWeakAreas.values())
    };
  } catch (error) {
    console.error('Error in getUserWeakAreas:', error);
    return { success: false, data: null, error };
  }
}
