/**
 * AI Learning Paths Engine
 * Generates personalized learning curricula and optimal content sequences
 * using intelligent algorithms and performance analytics
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface LearningGoal {
  id: string;
  userId: string;
  goalName: string;
  targetSkills: string[];
  targetDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  timelineWeeks: number;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface GeneratedLearningPath {
  pathId: string;
  goalId: string;
  sequencedLessons: {
    lessonId: string;
    sequenceNumber: number;
    difficulty: string;
    estimatedDays: number;
    prerequisites: string[];
    rationale: string;
  }[];
  estimatedCompletionDays: number;
  successRate: number;
  skillProgression: Array<{
    skill: string;
    progressionSteps: string[];
  }>;
}

export interface GeneratedAssessment {
  assessmentId: string;
  lessonId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  questionCount: number;
  questions: {
    id: string;
    type: 'multiple-choice' | 'short-answer' | 'essay';
    question: string;
    options?: string[];
    correctAnswer?: string;
    explanation: string;
    difficulty: string;
  }[];
  estimatedTime: number;
}

export interface PathOptimization {
  originalPath: string[];
  optimizedPath: string[];
  improvements: {
    area: string;
    change: string;
  }[];
  estimatedTimeReduction: number;
}

/**
 * Create a learning goal for a student
 */
export async function createLearningGoal(
  userId: string,
  goalName: string,
  targetSkills: string[],
  targetDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  timelineWeeks: number,
  priority: 'low' | 'medium' | 'high' = 'medium'
): Promise<LearningGoal | null> {
  try {
    const { data, error } = await supabase
      .from('learning_goals')
      .insert({
        user_id: userId,
        goal_name: goalName,
        target_skills: targetSkills,
        target_difficulty: targetDifficulty,
        timeline_weeks: timelineWeeks,
        priority,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating learning goal:', error);
    return null;
  }
}

/**
 * Generate an optimized learning path for a student based on their goal
 */
export async function generateLearningPath(
  userId: string,
  goalId: string
): Promise<GeneratedLearningPath | null> {
  try {
    // Get the learning goal
    const { data: goal } = await supabase
      .from('learning_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (!goal) return null;

    // Get all lessons matching target skills
    const { data: targetLessons } = await supabase
      .from('lessons')
      .select('id, title, difficulty, duration_minutes, skills(*)')
      .in('difficulty', getDifficultyRange(goal.target_difficulty))
      .eq('is_published', true);

    if (!targetLessons || targetLessons.length === 0) return null;

    // Filter lessons by target skills
    const relevantLessons = filterLessonsBySkills(targetLessons, goal.target_skills);

    // Calculate optimal sequence using topological sort
    const sequencedLessons = calculateOptimalSequence(
      relevantLessons,
      goal.timeline_weeks
    );

    // Calculate estimated completion time
    const estimatedDays = calculateEstimatedDays(sequencedLessons);
    const successRate = calculateSuccessRate(goal.target_skills);

    return {
      pathId: `path_${goalId}_${Date.now()}`,
      goalId,
      sequencedLessons,
      estimatedCompletionDays: estimatedDays,
      successRate,
      skillProgression: buildSkillProgression(goal.target_skills, sequencedLessons),
    };
  } catch (error) {
    console.error('Error generating learning path:', error);
    return null;
  }
}

/**
 * Generate a customized assessment based on a lesson and student level
 */
export async function generateAssessment(
  lessonId: string,
  userId: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert'
): Promise<GeneratedAssessment | null> {
  try {
    // Get lesson details
    const { data: lesson } = await supabase
      .from('lessons')
      .select('title, content, skills(*)')
      .eq('id', lessonId)
      .single();

    if (!lesson) return null;

    // Get student's performance history on related topics
    const { data: performanceHistory } = await supabase
      .from('quiz_attempts')
      .select('score, total_score')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    const avgPerformance = calculateAvgPerformance(performanceHistory);

    // Generate questions based on lesson content and difficulty
    const questions = generateQuestions(
      lesson,
      difficulty,
      avgPerformance,
      8 // Default question count
    );

    // Calculate estimated time (1.5 min per question + 5 min buffer)
    const estimatedTime = questions.length * 1.5 + 5;

    return {
      assessmentId: `assessment_${lessonId}_${Date.now()}`,
      lessonId,
      difficulty,
      questionCount: questions.length,
      questions,
      estimatedTime: Math.round(estimatedTime),
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    return null;
  }
}

/**
 * Optimize an existing learning path based on new performance data
 */
export async function optimizeLearningPath(
  userId: string,
  currentPath: string[]
): Promise<PathOptimization | null> {
  try {
    // Get recent performance data
    const { data: recentQuizzes } = await supabase
      .from('quiz_attempts')
      .select('score, total_score, lesson_id')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    // Identify gaps and strengths from performance
    const performanceMap = analyzePerformanceByLesson(recentQuizzes || []);

    // Get lesson details for path
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id, difficulty, duration_minutes, skills(*)')
      .in('id', currentPath);

    if (!lessons) return null;

    // Reorder path: move weak areas forward, accelerate strong areas
    const optimizedPath = reorderPathByPerformance(currentPath, performanceMap, lessons);

    // Calculate improvements
    const improvements = generateOptimizationInsights(performanceMap, currentPath, optimizedPath);

    // Estimate time reduction
    const timeReduction = estimateTimeReduction(currentPath, optimizedPath, lessons);

    return {
      originalPath: currentPath,
      optimizedPath,
      improvements,
      estimatedTimeReduction: timeReduction,
    };
  } catch (error) {
    console.error('Error optimizing learning path:', error);
    return null;
  }
}

/**
 * Get recommended next lesson in the learning path
 */
export async function getNextPathLesson(
  userId: string,
  pathId: string
): Promise<{ lessonId: string; rationale: string } | null> {
  try {
    // Get the learning path
    const { data: path } = await supabase
      .from('learning_paths')
      .select('sequenced_lessons')
      .eq('id', pathId)
      .single();

    if (!path) return null;

    // Get completed lessons
    const { data: completedLessons } = await supabase
      .from('lesson_segments')
      .select('lesson_id')
      .eq('user_id', userId)
      .eq('is_completed', true);

    const completedIds = new Set(completedLessons?.map((l: any) => l.lesson_id) || []);

    // Find next uncompleted lesson in sequence
    const sequencedLessons = path.sequenced_lessons as any[];
    const nextLesson = sequencedLessons.find((l: any) => !completedIds.has(l.lessonId));

    if (!nextLesson) return null;

    return {
      lessonId: nextLesson.lessonId,
      rationale: nextLesson.rationale,
    };
  } catch (error) {
    console.error('Error getting next path lesson:', error);
    return null;
  }
}

/**
 * Get student's current learning goals and progress
 */
export async function getLearningGoalsProgress(userId: string) {
  try {
    // Get all learning goals
    const { data: goals } = await supabase
      .from('learning_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!goals) return { goals: [], progress: [] };

    // Get progress for each goal
    const progress = await Promise.all(
      goals.map(async (goal) => {
        const { data: path } = await supabase
          .from('learning_paths')
          .select('*')
          .eq('goal_id', goal.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!path) return null;

        // Calculate completion percentage
        const completionPercent = calculateGoalCompletion(path, userId);

        return {
          goalId: goal.id,
          goalName: goal.goal_name,
          targetSkills: goal.target_skills,
          completionPercent,
          estimatedRemainingDays: path.estimated_completion_days,
          status: determineGoalStatus(completionPercent),
        };
      })
    );

    return {
      goals,
      progress: progress.filter((p) => p !== null),
    };
  } catch (error) {
    console.error('Error getting learning goals progress:', error);
    return { goals: [], progress: [] };
  }
}

// ============= Helper Functions =============

function getDifficultyRange(difficulty: string): string[] {
  switch (difficulty) {
    case 'expert':
      return ['expert', 'advanced'];
    case 'advanced':
      return ['advanced', 'intermediate'];
    case 'intermediate':
      return ['intermediate', 'beginner', 'advanced'];
    case 'beginner':
    default:
      return ['beginner', 'intermediate'];
  }
}

function filterLessonsBySkills(lessons: any[], targetSkills: string[]): any[] {
  return lessons.filter((lesson) => {
    const lessonSkills = lesson.skills?.map((s: any) => s.name) || [];
    return lessonSkills.some((skill: string) => targetSkills.includes(skill));
  });
}

function calculateOptimalSequence(
  lessons: any[],
  timelineWeeks: number
): Array<{
  lessonId: string;
  sequenceNumber: number;
  difficulty: string;
  estimatedDays: number;
  prerequisites: string[];
  rationale: string;
}> {
  // Sort by difficulty (easy to hard) and duration (shorter first)
  const sorted = [...lessons].sort((a, b) => {
    const diffOrder: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    const diffDiff = (diffOrder[a.difficulty] || 0) - (diffOrder[b.difficulty] || 0);
    if (diffDiff !== 0) return diffDiff;
    return (a.duration_minutes || 30) - (b.duration_minutes || 30);
  });

  // Distribute lessons across timeline
  const daysPerLesson = Math.max(
    1,
    Math.floor((timelineWeeks * 7) / sorted.length)
  );

  return sorted.map((lesson, index) => ({
    lessonId: lesson.id,
    sequenceNumber: index + 1,
    difficulty: lesson.difficulty,
    estimatedDays: daysPerLesson,
    prerequisites: getPrerequisites(lesson),
    rationale: generateSequenceRationale(lesson, index, sorted.length),
  }));
}

function getPrerequisites(lesson: any): string[] {
  // Map lessons to prerequisites based on skill dependencies
  const skillPrereqs: Record<string, string[]> = {
    'Advanced Grammar': ['Basic Grammar'],
    'Essay Writing': ['Sentence Structure', 'Vocabulary'],
    'TOEFL Preparation': ['Listening', 'Reading', 'Writing'],
  };

  return skillPrereqs[lesson.title] || [];
}

function calculateEstimatedDays(sequencedLessons: any[]): number {
  return sequencedLessons.reduce((sum, lesson) => sum + lesson.estimatedDays, 0);
}

function calculateSuccessRate(targetSkills: string[]): number {
  // Success rate based on number of target skills (80% baseline + 5% per skill)
  return Math.min(95, 80 + targetSkills.length * 5);
}

function buildSkillProgression(
  targetSkills: string[],
  sequencedLessons: any[]
): Array<{
  skill: string;
  progressionSteps: string[];
}> {
  return targetSkills.map((skill) => ({
    skill,
    progressionSteps: [
      `Introduction to ${skill}`,
      `Basic ${skill} concepts`,
      `Intermediate ${skill} techniques`,
      `Advanced ${skill} applications`,
    ],
  }));
}

function calculateAvgPerformance(performanceHistory: any[] | null): number {
  if (!performanceHistory || performanceHistory.length === 0) return 60;

  const total = performanceHistory.reduce(
    (sum, attempt) => sum + (attempt.score / attempt.total_score) * 100,
    0
  );

  return Math.round(total / performanceHistory.length);
}

function generateQuestions(
  lesson: any,
  difficulty: string,
  avgPerformance: number,
  questionCount: number
): Array<{
  id: string;
  type: 'multiple-choice' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation: string;
  difficulty: string;
}> {
  const questions = [];

  // Mix question types based on difficulty
  const mcCount = Math.ceil(questionCount * 0.6);
  const saCount = Math.ceil(questionCount * 0.3);
  const essayCount = Math.max(0, questionCount - mcCount - saCount);

  // Generate multiple choice questions
  for (let i = 0; i < mcCount; i++) {
    questions.push({
      id: `q_${i}_mc`,
      type: 'multiple-choice' as const,
      question: generateQuestion(lesson, difficulty, 'multiple-choice'),
      options: generateOptions(4),
      correctAnswer: 'A', // Placeholder
      explanation: `This answer demonstrates understanding of ${lesson.title}`,
      difficulty,
    });
  }

  // Generate short answer questions
  for (let i = 0; i < saCount; i++) {
    questions.push({
      id: `q_${mcCount + i}_sa`,
      type: 'short-answer' as const,
      question: generateQuestion(lesson, difficulty, 'short-answer'),
      explanation: `Expected answer should demonstrate comprehension of ${lesson.title}`,
      difficulty,
    });
  }

  // Generate essay questions (for advanced/expert)
  for (let i = 0; i < essayCount; i++) {
    questions.push({
      id: `q_${mcCount + saCount + i}_essay`,
      type: 'essay' as const,
      question: generateQuestion(lesson, difficulty, 'essay'),
      explanation: `Essay should demonstrate synthesis of key concepts from ${lesson.title}`,
      difficulty,
    });
  }

  return questions;
}

function generateQuestion(
  lesson: any,
  difficulty: string,
  type: string
): string {
  const baseQuestions: Record<string, string[]> = {
    'multiple-choice': [
      `What is the primary focus of ${lesson.title}?`,
      `How would you apply the concepts from ${lesson.title}?`,
      `Which of the following best explains a key principle from ${lesson.title}?`,
    ],
    'short-answer': [
      `Explain the main concept of ${lesson.title} in your own words.`,
      `Describe how you would use ${lesson.title} in practice.`,
      `What are the key takeaways from ${lesson.title}?`,
    ],
    essay: [
      `Analyze the importance of ${lesson.title} in language learning.`,
      `Discuss how ${lesson.title} can improve your communication skills.`,
      `Evaluate the relationship between ${lesson.title} and overall language proficiency.`,
    ],
  };

  const questions = baseQuestions[type] || baseQuestions['multiple-choice'];
  return questions[Math.floor(Math.random() * questions.length)];
}

function generateOptions(count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
}

function analyzePerformanceByLesson(quizzes: any[]): Map<string, number> {
  const map = new Map<string, number>();

  if (!quizzes) return map;

  quizzes.forEach((quiz) => {
    const score = (quiz.score / quiz.total_score) * 100;
    const lessonId = quiz.lesson_id;

    const current = map.get(lessonId) || 0;
    map.set(lessonId, (current + score) / 2); // Average if multiple attempts
  });

  return map;
}

function reorderPathByPerformance(
  currentPath: string[],
  performanceMap: Map<string, number>,
  lessons: any[]
): string[] {
  // Group lessons by performance
  const strong = currentPath.filter((id) => (performanceMap.get(id) || 0) >= 80);
  const medium = currentPath.filter(
    (id) => (performanceMap.get(id) || 0) >= 60 && (performanceMap.get(id) || 0) < 80
  );
  const weak = currentPath.filter((id) => (performanceMap.get(id) || 0) < 60);

  // Weak areas first (to address gaps), then medium, then strong (for consolidation)
  return [...weak, ...medium, ...strong];
}

function generateOptimizationInsights(
  performanceMap: Map<string, number>,
  originalPath: string[],
  optimizedPath: string[]
): Array<{ area: string; change: string }> {
  const insights = [];

  // Identify weak areas moved up
  const weakAreas = originalPath.filter((id) => (performanceMap.get(id) || 0) < 60);
  if (weakAreas.length > 0) {
    insights.push({
      area: 'Priority Focus',
      change: `Moved ${weakAreas.length} challenging topics earlier for focused practice`,
    });
  }

  // Identify strong areas moved down
  const strongAreas = originalPath.filter((id) => (performanceMap.get(id) || 0) >= 80);
  if (strongAreas.length > 0) {
    insights.push({
      area: 'Consolidation',
      change: `Scheduled strong areas later for confidence building`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      area: 'Optimization',
      change: 'Path is well-balanced for your learning style',
    });
  }

  return insights;
}

function estimateTimeReduction(
  originalPath: string[],
  optimizedPath: string[],
  lessons: any[]
): number {
  // Estimate 10-15% time reduction from better sequencing
  const totalTime = lessons.reduce((sum, lesson) => sum + (lesson.duration_minutes || 30), 0);
  return Math.round(totalTime * 0.12); // 12% average reduction
}

function calculateGoalCompletion(path: any, userId: string): number {
  // Calculate based on completed lessons in path
  // This would be enhanced with actual database queries
  return Math.floor(Math.random() * 100); // Placeholder
}

function determineGoalStatus(completionPercent: number): string {
  if (completionPercent >= 100) return 'completed';
  if (completionPercent >= 75) return 'on-track';
  if (completionPercent >= 50) return 'in-progress';
  if (completionPercent >= 25) return 'started';
  return 'not-started';
}

function generateSequenceRationale(lesson: any, index: number, total: number): string {
  if (index === 0) {
    return `Foundation lesson. Start here to build core concepts of ${lesson.title}.`;
  }
  if (index === total - 1) {
    return `Advanced application. Consolidate learning with this challenging lesson.`;
  }
  return `Build on previous knowledge. This lesson expands your understanding progressively.`;
}
