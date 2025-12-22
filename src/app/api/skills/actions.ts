'use server';

/**
 * Skills System Server Actions
 * Server-side operations for skill management (uses service_role client for RLS bypass)
 */

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import type {
  Skill,
  UserSkill,
  UserLearningGoal,
  SkillGapAnalysis,
  CreateUserSkillRequest,
  CreateLearningGoalRequest,
  DifficultyLevel,
} from '@/types/skills';

// Get admin client (service_role - bypasses RLS)
const getAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return createClient(supabaseUrl, supabaseServiceKey);
};

/**
 * Link a skill to a course
 * Only accessible by authenticated users
 */
export async function linkSkillToCourse(
  courseId: string,
  skillId: string,
  proficiencyLevel: 'Basic' | 'Intermediate' | 'Advanced',
  weight: number = 1
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is course instructor (optional - implement based on your logic)
    const admin = getAdminClient();

    const { error } = await admin.from('course_skills').upsert(
      {
        course_id: courseId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
        weight,
      },
      {
        onConflict: 'course_id,skill_id',
      }
    );

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error linking skill to course:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Award user a skill (update user_skills)
 */
export async function awardUserSkill(
  userId: string,
  skillId: string,
  proficiencyLevel: DifficultyLevel,
  masteryPercentage: number = 0
): Promise<{ success: boolean; data?: UserSkill; error?: string }> {
  try {
    const admin = getAdminClient();

    // Check if user already has this skill
    const { data: existing } = await admin
      .from('user_skills')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    let result;

    if (existing) {
      // Update if better proficiency
      const levels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
      const newLevel = levels.indexOf(proficiencyLevel);
      const oldLevel = levels.indexOf(existing.proficiency_level);

      if (newLevel >= oldLevel) {
        const { data, error } = await admin
          .from('user_skills')
          .update({
            proficiency_level: proficiencyLevel,
            mastery_percentage: Math.max(existing.mastery_percentage, masteryPercentage),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('skill_id', skillId)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        result = existing;
      }
    } else {
      // Insert new skill
      const { data, error } = await admin
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
      result = data;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Error awarding user skill:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a learning goal for user
 */
export async function createUserLearningGoal(
  userId: string,
  goal: CreateLearningGoalRequest
): Promise<{ success: boolean; data?: UserLearningGoal; error?: string }> {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { data, error } = await admin
      .from('user_learning_goals')
      .insert({
        user_id: userId,
        ...goal,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error creating learning goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update a learning goal
 */
export async function updateUserLearningGoal(
  userId: string,
  goalId: string,
  updates: Partial<UserLearningGoal>
): Promise<{ success: boolean; data?: UserLearningGoal; error?: string }> {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { data, error } = await admin
      .from('user_learning_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error updating learning goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a learning goal
 */
export async function deleteUserLearningGoal(
  userId: string,
  goalId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId: authUserId } = await auth();
    if (!authUserId || authUserId !== userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const admin = getAdminClient();

    const { error } = await admin
      .from('user_learning_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting learning goal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Compute skill gap analysis for user and goal
 */
export async function computeSkillGapAnalysis(
  userId: string,
  goalId?: string
): Promise<{ success: boolean; data?: SkillGapAnalysis; error?: string }> {
  try {
    const admin = getAdminClient();

    // Get goal and user skills
    let targetSkillIds: string[] = [];
    if (goalId) {
      const { data: goal } = await admin
        .from('user_learning_goals')
        .select('target_skills')
        .eq('id', goalId)
        .eq('user_id', userId)
        .single();

      if (goal) {
        targetSkillIds = goal.target_skills;
      }
    }

    // Get user's current skills
    const { data: userSkills } = await admin
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);

    const userSkillMap = new Map(
      (userSkills || []).map((s: any) => [s.skill_id, s])
    );

    // Calculate gaps
    let totalSkills = targetSkillIds.length;
    let masteredSkills = 0;
    let priorityGaps: string[] = [];

    for (const skillId of targetSkillIds) {
      const userSkill = userSkillMap.get(skillId);
      if (['Advanced', 'Expert'].includes(userSkill?.proficiency_level)) {
        masteredSkills++;
      } else if (!userSkill) {
        priorityGaps.push(skillId);
      }
    }

    const completionPercentage = totalSkills > 0 ? Math.round((masteredSkills / totalSkills) * 100) : 0;

    // Store analysis
    const { data, error } = await admin
      .from('skill_gap_analysis')
      .upsert({
        user_id: userId,
        goal_id: goalId,
        total_skills_needed: totalSkills,
        skills_mastered: masteredSkills,
        completion_percentage: completionPercentage,
        priority_gaps: priorityGaps.slice(0, 5),
        analysis_generated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error) {
    console.error('Error computing skill gap analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get skill gap analysis
 */
export async function getUserSkillGapAnalysis(
  userId: string,
  goalId?: string
): Promise<{ success: boolean; data?: SkillGapAnalysis; error?: string }> {
  try {
    const admin = getAdminClient();

    let query = admin
      .from('skill_gap_analysis')
      .select('*')
      .eq('user_id', userId);

    if (goalId) {
      query = query.eq('goal_id', goalId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return { success: true, data: data || undefined };
  } catch (error) {
    console.error('Error fetching skill gap analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Bulk award skills to user (typically after course completion)
 */
export async function awardSkillsForCourseCompletion(
  userId: string,
  courseId: string
): Promise<{ success: boolean; awarded_count?: number; error?: string }> {
  try {
    const admin = getAdminClient();

    // Get skills for this course
    const { data: courseSkills, error: queryError } = await admin
      .from('course_skills')
      .select('skill_id, proficiency_level')
      .eq('course_id', courseId);

    if (queryError) throw queryError;

    if (!courseSkills || courseSkills.length === 0) {
      return { success: true, awarded_count: 0 };
    }

    // Award each skill
    let awardedCount = 0;
    for (const cs of courseSkills) {
      const { success } = await awardUserSkill(
        userId,
        cs.skill_id,
        cs.proficiency_level as DifficultyLevel,
        80 // Course completion gives 80% mastery
      );

      if (success) awardedCount++;
    }

    return { success: true, awarded_count: awardedCount };
  } catch (error) {
    console.error('Error awarding skills for course completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
