/**
 * Skills System Service Layer
 * Core business logic for skill management and gap analysis
 */

import { createClient } from '@supabase/supabase-js';
import type {
  Skill,
  UserSkill,
  UserLearningGoal,
  SkillGap,
  SkillGapAnalysis,
  UserSkillStats,
  SkillFilter,
  CourseSkillMapping,
  SkillProgress,
  DifficultyLevel,
  SkillCategory,
} from '@/types/skills';

// Get Supabase client (server-safe)
const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(supabaseUrl, supabaseAnonKey);
};

// ============================================================================
// SKILL QUERIES
// ============================================================================

/**
 * Get all available skills (public)
 */
export async function getSkills(filter?: SkillFilter): Promise<Skill[]> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('skills')
      .select('*')
      .order('category')
      .order('name');

    // Apply filters
    if (filter?.categories && filter.categories.length > 0) {
      query = query.in('category', filter.categories);
    }

    if (filter?.difficulty_levels && filter.difficulty_levels.length > 0) {
      query = query.in('difficulty_level', filter.difficulty_levels);
    }

    if (filter?.exclude_ids && filter.exclude_ids.length > 0) {
      query = query.not('id', 'in', `(${filter.exclude_ids.join(',')})`);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Apply text search if provided
    if (filter?.search_query) {
      const searchTerm = filter.search_query.toLowerCase();
      return (data || []).filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm) ||
          (skill.description?.toLowerCase().includes(searchTerm) ?? false)
      );
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

/**
 * Get skill by ID
 */
export async function getSkillById(skillId: string): Promise<Skill | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching skill:', error);
    return null;
  }
}

/**
 * Get skills by category
 */
export async function getSkillsByCategory(category: SkillCategory): Promise<Skill[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('category', category)
      .order('difficulty_level')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching skills by category:', error);
    return [];
  }
}

/**
 * Get all skill categories with counts
 */
export async function getSkillCategoriesWithCounts(): Promise<
  { category: SkillCategory; count: number }[]
> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('skills')
      .select('category')
      .order('category');

    if (error) throw error;

    // Count by category
    const counts = new Map<string, number>();
    (data || []).forEach((skill: any) => {
      counts.set(skill.category, (counts.get(skill.category) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category: category as SkillCategory,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  } catch (error) {
    console.error('Error fetching skill categories:', error);
    return [];
  }
}

// ============================================================================
// USER SKILL OPERATIONS
// ============================================================================

/**
 * Get user's skills
 */
export async function getUserSkills(userId: string): Promise<UserSkill[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_skills')
      .select(
        `
        *,
        skills:skill_id (
          id,
          name,
          category,
          difficulty_level
        )
      `
      )
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user skills:', error);
    return [];
  }
}

/**
 * Get specific user skill
 */
export async function getUserSkill(userId: string, skillId: string): Promise<UserSkill | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching user skill:', error);
    return null;
  }
}

/**
 * Add or update user skill
 */
export async function upsertUserSkill(
  userId: string,
  skillId: string,
  proficiencyLevel: DifficultyLevel,
  masteryPercentage: number = 0
): Promise<UserSkill | null> {
  try {
    const supabase = getSupabaseClient();

    // Check if skill exists first
    const existingSkill = await getUserSkill(userId, skillId);

    if (existingSkill) {
      // Update existing
      const { data, error } = await supabase
        .from('user_skills')
        .update({
          proficiency_level: proficiencyLevel,
          mastery_percentage: masteryPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .select()
        .single();

      if (error) throw error;
      return data || null;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('user_skills')
        .insert({
          user_id: userId,
          skill_id: skillId,
          proficiency_level: proficiencyLevel,
          mastery_percentage: masteryPercentage,
          practice_count: 0,
          acquired_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data || null;
    }
  } catch (error) {
    console.error('Error upserting user skill:', error);
    return null;
  }
}

/**
 * Increment practice count for a skill
 */
export async function incrementSkillPractice(userId: string, skillId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    const userSkill = await getUserSkill(userId, skillId);

    if (!userSkill) {
      console.warn('Skill not found for user');
      return false;
    }

    const { error } = await supabase
      .from('user_skills')
      .update({
        practice_count: (userSkill.practice_count || 0) + 1,
        last_practiced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('skill_id', skillId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing skill practice:', error);
    return false;
  }
}

// ============================================================================
// LEARNING GOALS
// ============================================================================

/**
 * Get user's learning goals
 */
export async function getUserLearningGoals(userId: string): Promise<UserLearningGoal[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_learning_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('priority', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    return [];
  }
}

/**
 * Get specific learning goal
 */
export async function getLearningGoal(goalId: string): Promise<UserLearningGoal | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_learning_goals')
      .select('*')
      .eq('id', goalId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error fetching learning goal:', error);
    return null;
  }
}

/**
 * Create learning goal
 */
export async function createLearningGoal(
  userId: string,
  goal: Omit<UserLearningGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<UserLearningGoal | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('user_learning_goals')
      .insert({
        user_id: userId,
        ...goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating learning goal:', error);
    return null;
  }
}

// ============================================================================
// SKILL GAP ANALYSIS
// ============================================================================

/**
 * Analyze skill gaps for user based on a learning goal
 * Returns the skills the user needs vs. what they already have
 */
export async function analyzeSkillGaps(
  userId: string,
  goalId?: string
): Promise<SkillGap[]> {
  try {
    // Get user's current skills
    const userSkills = await getUserSkills(userId);
    const userSkillMap = new Map(
      userSkills.map((skill) => [skill.skill_id, skill])
    );

    // Get target goal skills
    let targetSkillIds: string[] = [];

    if (goalId) {
      const goal = await getLearningGoal(goalId);
      if (goal) {
        targetSkillIds = goal.target_skills;
      }
    }

    // Get skill details
    const skillDetails = await Promise.all(
      targetSkillIds.map((skillId) => getSkillById(skillId))
    );

    // Get courses that teach each skill
    const skillGaps: SkillGap[] = [];

    for (const skill of skillDetails) {
      if (!skill) continue;

      const userSkill = userSkillMap.get(skill.id);
      const userLevel = userSkill?.proficiency_level || 'Beginner';

      // Calculate gap
      const requiredLevel = skill.difficulty_level;
      const gap = calculateProficiencyGap(userLevel, requiredLevel);

      // Get courses that teach this skill
      const courses = await getCoursesTeachingSkill(skill.id);

      skillGaps.push({
        skill_id: skill.id,
        skill_name: skill.name,
        category: skill.category,
        user_proficiency: userLevel,
        required_level: requiredLevel,
        proficiency_gap: gap.percentage,
        priority: gap.percentage > 60 ? 'critical' : gap.percentage > 40 ? 'high' : 'medium',
        courses_that_teach: courses,
      });
    }

    // Sort by priority
    return skillGaps.sort(
      (a, b) =>
        (['critical', 'high', 'medium', 'low'].indexOf(b.priority) -
          ['critical', 'high', 'medium', 'low'].indexOf(a.priority)) ||
        (b.proficiency_gap - a.proficiency_gap)
    );
  } catch (error) {
    console.error('Error analyzing skill gaps:', error);
    return [];
  }
}

/**
 * Get courses that teach a specific skill
 */
export async function getCoursesTeachingSkill(skillId: string): Promise<CourseSkillMapping[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('course_skills')
      .select(
        `
        course_id,
        proficiency_level,
        weight,
        courses:course_id (
          id,
          title
        )
      `
      )
      .eq('skill_id', skillId)
      .order('weight', { ascending: false });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      course_id: item.course_id,
      course_title: item.courses?.title || 'Unknown Course',
      skill_proficiency_level: item.proficiency_level,
      weight: item.weight,
    }));
  } catch (error) {
    console.error('Error fetching courses for skill:', error);
    return [];
  }
}

// ============================================================================
// USER SKILL STATISTICS
// ============================================================================

/**
 * Get comprehensive skill statistics for a user
 */
export async function getUserSkillStats(userId: string): Promise<UserSkillStats> {
  try {
    const userSkills = await getUserSkills(userId);

    const stats: UserSkillStats = {
      total_skills: userSkills.length,
      beginner_count: userSkills.filter((s) => s.proficiency_level === 'Beginner').length,
      intermediate_count: userSkills.filter((s) => s.proficiency_level === 'Intermediate').length,
      advanced_count: userSkills.filter((s) => s.proficiency_level === 'Advanced').length,
      expert_count: userSkills.filter((s) => s.proficiency_level === 'Expert').length,
      average_mastery:
        userSkills.length > 0
          ? Math.round(
              userSkills.reduce((sum, s) => sum + (s.mastery_percentage || 0), 0) /
                userSkills.length
            )
          : 0,
      skills_by_category: [],
    };

    // Calculate by category
    const categoryMap = new Map<SkillCategory, typeof stats.skills_by_category[0]>();

    userSkills.forEach((skill: any) => {
      const category = skill.skills?.category;
      if (!category) return;

      if (!categoryMap.has(category)) {
        categoryMap.set(category, {
          category,
          skill_count: 0,
          average_mastery: 0,
          mastered_count: 0,
          in_progress_count: 0,
          not_started_count: 0,
        });
      }

      const cat = categoryMap.get(category)!;
      cat.skill_count++;
      cat.average_mastery +=
        (skill.mastery_percentage || 0) + Math.round(cat.average_mastery / cat.skill_count);

      if (['Advanced', 'Expert'].includes(skill.proficiency_level)) {
        cat.mastered_count++;
      } else if (['Basic', 'Intermediate'].includes(skill.proficiency_level)) {
        cat.in_progress_count++;
      } else {
        cat.not_started_count++;
      }
    });

    stats.skills_by_category = Array.from(categoryMap.values()).sort(
      (a, b) => b.skill_count - a.skill_count
    );

    // Find highest and lowest
    const sorted = [...userSkills].sort((a, b) => b.mastery_percentage - a.mastery_percentage);
    if (sorted.length > 0) {
      stats.highest_proficiency_skill = sorted[0].skills;
      stats.lowest_proficiency_skill = sorted[sorted.length - 1].skills;
    }

    return stats;
  } catch (error) {
    console.error('Error calculating skill stats:', error);
    return {
      total_skills: 0,
      beginner_count: 0,
      intermediate_count: 0,
      advanced_count: 0,
      expert_count: 0,
      average_mastery: 0,
      skills_by_category: [],
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate proficiency gap between user's current level and required level
 */
function calculateProficiencyGap(
  currentLevel: DifficultyLevel,
  requiredLevel: DifficultyLevel
): { percentage: number; gap_levels: number } {
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const currentIndex = levels.indexOf(currentLevel);
  const requiredIndex = levels.indexOf(requiredLevel);

  const gapLevels = Math.max(0, requiredIndex - currentIndex);
  const percentage = (gapLevels / 3) * 100; // 3 possible gaps (beginner -> expert)

  return {
    percentage: Math.round(percentage),
    gap_levels: gapLevels,
  };
}

/**
 * Get skill progress for user
 */
export async function getUserSkillProgress(
  userId: string,
  skillId: string
): Promise<SkillProgress | null> {
  try {
    const skill = await getSkillById(skillId);
    const userSkill = await getUserSkill(userId, skillId);
    const courses = await getCoursesTeachingSkill(skillId);

    if (!skill || !userSkill) {
      return null;
    }

    // Calculate next milestone
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const currentIndex = levels.indexOf(userSkill.proficiency_level);
    const nextLevel = currentIndex < 3 ? (levels[currentIndex + 1] as DifficultyLevel) : null;

    return {
      skill_id: skillId,
      skill_name: skill.name,
      current_level: userSkill.proficiency_level,
      mastery_percentage: userSkill.mastery_percentage,
      practice_count: userSkill.practice_count,
      last_practiced_at: userSkill.last_practiced_at,
      courses_that_teach: courses,
      next_milestone: nextLevel
        ? {
            level: nextLevel,
            required_mastery: 100,
            estimated_days_to_reach: Math.ceil((100 - userSkill.mastery_percentage) / 5), // Assume 5% per day
          }
        : undefined,
    };
  } catch (error) {
    console.error('Error getting skill progress:', error);
    return null;
  }
}

/**
 * Search skills by name or description
 */
export async function searchSkills(
  query: string,
  limit: number = 10
): Promise<Skill[]> {
  try {
    const allSkills = await getSkills();
    const searchTerm = query.toLowerCase();

    return allSkills
      .filter(
        (skill) =>
          skill.name.toLowerCase().includes(searchTerm) ||
          (skill.description?.toLowerCase().includes(searchTerm) ?? false)
      )
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching skills:', error);
    return [];
  }
}
