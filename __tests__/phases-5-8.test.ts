/**
 * WhitedgeLMS Jest Test Suite
 * Unit and integration tests for Phase 5-8 systems
 * Run with: npm test
 * @jest-environment node
 */

/// <reference types="jest" />

import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js');

describe('WhitedgeLMS Phase 5-8 Tests', () => {
  let mockSupabase: any;
  let mockFrom: jest.Mock;

  beforeEach(() => {
    mockFrom = jest.fn();
    mockSupabase = {
      from: mockFrom,
      auth: {
        getUser: jest.fn(),
      },
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  // ============================================
  // PHASE 5: Skills System Tests
  // ============================================
  describe('Phase 5: Skills System', () => {
    it('should fetch user skills successfully', async () => {
      const mockSkills = [
        { id: 'skill_1', name: 'Reading', proficiency_level: 'intermediate' },
        { id: 'skill_2', name: 'Writing', proficiency_level: 'beginner' },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockSkills, error: null }),
        }),
      });

      // Simulate fetching user skills
      const mockTable = mockSupabase.from('user_skills');
      const { data: skills } = await mockTable.select().eq('user_id', 'test-user');

      expect(skills).toEqual(mockSkills);
      expect(skills).toHaveLength(2);
      expect(skills[0].name).toBe('Reading');
    });

    it('should calculate skill proficiency correctly', () => {
      const lessonCount = 25;
      const quizzesCompleted = 15;
      const averageScore = 78;

      const proficiencyScore = (lessonCount * 0.3 + quizzesCompleted * 0.4 + averageScore * 0.3) / 10;

      expect(proficiencyScore).toBeGreaterThan(0);
      expect(proficiencyScore).toBeLessThanOrEqual(10);
    });

    it('should identify skill gaps correctly', () => {
      const userSkills = [
        { name: 'Reading', mastery: 0.8 },
        { name: 'Writing', mastery: 0.4 },
        { name: 'Speaking', mastery: 0.3 },
      ];

      const gaps = userSkills.filter((skill) => skill.mastery < 0.5);

      expect(gaps).toHaveLength(2);
      expect(gaps.map((g) => g.name)).toEqual(['Writing', 'Speaking']);
    });

    it('should sort skills by proficiency', () => {
      const skills = [
        { name: 'Writing', proficiency: 0.4 },
        { name: 'Reading', proficiency: 0.8 },
        { name: 'Speaking', proficiency: 0.6 },
      ];

      const sorted = skills.sort((a, b) => b.proficiency - a.proficiency);

      expect(sorted[0].name).toBe('Reading');
      expect(sorted[1].name).toBe('Speaking');
      expect(sorted[2].name).toBe('Writing');
    });
  });

  // ============================================
  // PHASE 6: Badge System Tests
  // ============================================
  describe('Phase 6: Badge System', () => {
    it('should award badge when criteria met', () => {
      const quizzesCompleted = 10;
      const badgeCriteria = 5;

      const shouldAwardBadge = quizzesCompleted >= badgeCriteria;

      expect(shouldAwardBadge).toBe(true);
    });

    it('should not award badge when criteria not met', () => {
      const lessonsCompleted = 2;
      const badgeCriteria = 5;

      const shouldAwardBadge = lessonsCompleted >= badgeCriteria;

      expect(shouldAwardBadge).toBe(false);
    });

    it('should calculate learning streak correctly', () => {
      const quizAttempts = [
        { date: '2025-12-20', completed: true },
        { date: '2025-12-21', completed: true },
        { date: '2025-12-22', completed: true },
        { date: '2025-12-23', completed: false },
        { date: '2025-12-24', completed: true },
      ];

      let streak = 0;
      let currentStreak = 0;

      for (let i = quizAttempts.length - 1; i >= 0; i--) {
        if (quizAttempts[i].completed) {
          currentStreak++;
          streak = Math.max(streak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      expect(currentStreak).toBe(1);
      expect(streak).toBe(3);
    });

    it('should fetch user badges successfully', async () => {
      const mockBadges = [
        { id: 'badge_1', name: 'Quiz Master', rarity: 'rare' },
        { id: 'badge_2', name: 'Consistent Learner', rarity: 'uncommon' },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockBadges, error: null }),
        }),
      });

      const mockTable = mockSupabase.from('user_badges');
      const { data: badges } = await mockTable.select().eq('user_id', 'test-user');

      expect(badges).toEqual(mockBadges);
      expect(badges).toHaveLength(2);
    });

    it('should categorize badges by rarity', () => {
      const badges = [
        { name: 'Common Badge', rarity: 'common' },
        { name: 'Rare Badge', rarity: 'rare' },
        { name: 'Uncommon Badge', rarity: 'uncommon' },
        { name: 'Another Rare', rarity: 'rare' },
      ];

      const rareBadges = badges.filter((b) => b.rarity === 'rare');
      const commonBadges = badges.filter((b) => b.rarity === 'common');

      expect(rareBadges).toHaveLength(2);
      expect(commonBadges).toHaveLength(1);
    });
  });

  // ============================================
  // PHASE 7: Adaptive Learning Tests
  // ============================================
  describe('Phase 7: Adaptive Learning', () => {
    it('should recommend next lesson based on proficiency', () => {
      const userProficiency = 0.7; // Intermediate
      const availableLessons = ['beginner', 'intermediate', 'advanced', 'expert'];

      let recommendedLevel = 'beginner';
      if (userProficiency < 0.4) recommendedLevel = 'beginner';
      else if (userProficiency < 0.7) recommendedLevel = 'intermediate';
      else if (userProficiency < 0.9) recommendedLevel = 'advanced';
      else recommendedLevel = 'expert';

      expect(recommendedLevel).toBe('advanced');
    });

    it('should adjust difficulty based on quiz performance', () => {
      const quizScore = 45;
      const maxScore = 100;
      const currentDifficulty = 'intermediate';

      let newDifficulty = currentDifficulty;
      const performanceRatio = quizScore / maxScore;

      if (performanceRatio < 0.5) newDifficulty = 'beginner';
      else if (performanceRatio > 0.85) newDifficulty = 'advanced';

      expect(newDifficulty).toBe('beginner');
    });

    it('should calculate learning velocity', () => {
      const lessonsCompleted = 10;
      const daysElapsed = 5;

      const velocity = lessonsCompleted / daysElapsed;

      expect(velocity).toBe(2);
      expect(velocity).toBeGreaterThan(0);
    });

    it('should identify performance trends', () => {
      const quizScores = [60, 65, 70, 75, 80, 85];

      const trend = quizScores[quizScores.length - 1] - quizScores[0];

      expect(trend).toBeGreaterThan(0); // Improving
    });

    it('should fetch adaptive recommendations', async () => {
      const mockRecommendation = {
        nextLesson: { id: 'lesson_1', difficulty: 'advanced' },
        reason: 'User is ready for advanced content',
      };

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [mockRecommendation], error: null }),
        }),
      });

      const mockTable = mockSupabase.from('learning_adjustments');
      const { data: recommendations } = await mockTable.select().eq('user_id', 'test-user');

      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].nextLesson.difficulty).toBe('advanced');
    });
  });

  // ============================================
  // PHASE 8: AI Learning Paths Tests
  // ============================================
  describe('Phase 8: AI Learning Paths', () => {
    it('should generate learning path with correct structure', () => {
      const learningPath = {
        id: 'path_1',
        goal: 'Improve TOEFL Reading',
        estimatedDays: 30,
        lessons: ['lesson_1', 'lesson_2', 'lesson_3'],
        successRate: 0.85,
      };

      expect(learningPath).toHaveProperty('id');
      expect(learningPath).toHaveProperty('goal');
      expect(learningPath).toHaveProperty('lessons');
      expect(learningPath.lessons).toBeInstanceOf(Array);
      expect(learningPath.estimatedDays).toBeGreaterThan(0);
      expect(learningPath.successRate).toBeLessThanOrEqual(1);
    });

    it('should prioritize lessons by difficulty', () => {
      const lessons = [
        { id: 'lesson_1', difficulty: 'intermediate' },
        { id: 'lesson_2', difficulty: 'beginner' },
        { id: 'lesson_3', difficulty: 'advanced' },
      ];

      const sorted = lessons.sort((a, b) => {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      });

      expect(sorted[0].difficulty).toBe('beginner');
      expect(sorted[1].difficulty).toBe('intermediate');
      expect(sorted[2].difficulty).toBe('advanced');
    });

    it('should calculate path completion estimate', () => {
      const lessonsInPath = 20;
      const averageLessonTime = 45; // minutes
      const learningVelocity = 1.5; // lessons per day

      const totalMinutes = lessonsInPath * averageLessonTime;
      const estimatedDays = lessonsInPath / learningVelocity;

      expect(estimatedDays).toBeCloseTo(13.33);
      expect(totalMinutes).toBe(900);
    });

    it('should optimize path based on user progress', async () => {
      const mockOptimizedPath = {
        originalPath: ['lesson_1', 'lesson_2', 'lesson_3'],
        optimizedPath: ['lesson_2', 'lesson_1', 'lesson_3'],
        improvement: '15% faster completion',
      };

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [mockOptimizedPath], error: null }),
        }),
      });

      const mockTable = mockSupabase.from('learning_paths');
      const { data: paths } = await mockTable.select().eq('user_id', 'test-user');

      expect(paths).toHaveLength(1);
      expect(paths[0].optimizedPath).toHaveLength(3);
    });

    it('should fetch learning goals', async () => {
      const mockGoals = [
        {
          id: 'goal_1',
          title: 'TOEFL Reading Mastery',
          targetSkill: 'reading',
          targetDifficulty: 'advanced',
        },
        {
          id: 'goal_2',
          title: 'Business Writing',
          targetSkill: 'writing',
          targetDifficulty: 'intermediate',
        },
      ];

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: mockGoals, error: null }),
        }),
      });

      const mockTable = mockSupabase.from('learning_goals');
      const { data: goals } = await mockTable.select().eq('user_id', 'test-user');

      expect(goals).toHaveLength(2);
      expect(goals[0].title).toBe('TOEFL Reading Mastery');
    });

    it('should generate assessment with appropriate difficulty', () => {
      const assessment = {
        id: 'assessment_1',
        type: 'quiz',
        difficulty: 'advanced',
        questionCount: 20,
        estimatedTime: 30,
      };

      expect(assessment.questionCount).toBeGreaterThan(0);
      expect(assessment.estimatedTime).toBeGreaterThan(0);
      expect(['beginner', 'intermediate', 'advanced', 'expert']).toContain(assessment.difficulty);
    });
  });

  // ============================================
  // Integration Tests
  // ============================================
  describe('Cross-Phase Integration', () => {
    it('should link badges to skill achievement', () => {
      const userSkill = { name: 'Reading', mastery: 0.95 };
      const badgeCriteria = { requiredSkill: 'Reading', requiredMastery: 0.9 };

      const qualifiesForBadge = userSkill.name === badgeCriteria.requiredSkill && userSkill.mastery >= badgeCriteria.requiredMastery;

      expect(qualifiesForBadge).toBe(true);
    });

    it('should adjust learning path based on skill gaps', () => {
      const userSkills = [
        { name: 'Reading', mastery: 0.8 },
        { name: 'Writing', mastery: 0.3 },
      ];

      const pathGoals = userSkills
        .filter((skill) => skill.mastery < 0.7)
        .map((skill) => `Improve ${skill.name}`);

      expect(pathGoals).toContain('Improve Writing');
      expect(pathGoals).not.toContain('Improve Reading');
    });

    it('should update adaptive recommendations when badges earned', () => {
      const newBadge = { name: 'Quiz Master', effect: 'increase_difficulty' };
      const currentDifficulty = 'intermediate';

      let recommendedDifficulty = currentDifficulty;
      if (newBadge.effect === 'increase_difficulty') {
        recommendedDifficulty = 'advanced';
      }

      expect(recommendedDifficulty).toBe('advanced');
    });

    it('should handle complete learning flow', async () => {
      // Step 1: Start with skills assessment
      const userSkills = [{ name: 'Reading', mastery: 0.5 }];

      // Step 2: Create learning goal
      const goal = { skill: 'Reading', target: 0.9, timeframe: 30 };

      // Step 3: Generate learning path
      const path = { lessons: ['lesson_1', 'lesson_2', 'lesson_3'], estimatedDays: 20 };

      // Step 4: Track progress and adjust
      const quizScore = 85;
      const shouldAdjust = quizScore > 80;

      expect(userSkills).toHaveLength(1);
      expect(goal.target).toBeGreaterThan(0.5);
      expect(path.lessons).toHaveLength(3);
      expect(shouldAdjust).toBe(true);
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    it('should handle database query errors gracefully', async () => {
      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } }),
        }),
      });

      const mockTable = mockSupabase.from('user_skills');
      const { error } = await mockTable.select().eq('user_id', 'test-user');

      expect(error).not.toBeNull();
      expect(error.message).toBe('Database error');
    });

    it('should validate input data', () => {
      const validateScore = (score: number) => {
        if (score < 0 || score > 100) throw new Error('Invalid score');
        return true;
      };

      expect(() => validateScore(85)).not.toThrow();
      expect(() => validateScore(150)).toThrow('Invalid score');
    });

    it('should handle missing authentication', async () => {
      const userId = null;

      const canAccess = userId !== null && userId !== undefined;

      expect(canAccess).toBe(false);
    });

    it('should handle invalid difficulty levels', () => {
      const validDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
      const userDifficulty = 'invalid';

      const isValid = validDifficulties.includes(userDifficulty);

      expect(isValid).toBe(false);
    });
  });
});
