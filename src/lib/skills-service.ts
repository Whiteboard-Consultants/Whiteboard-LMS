import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Get all skills for a user with their proficiency data
 */
export async function getUserSkills(userId: string) {
  try {
    console.log('🔍 getUserSkills called for user:', userId?.substring(0, 8));
    
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        id,
        user_id,
        skill_id,
        proficiency_level,
        mastery_percentage,
        practice_count,
        acquired_at,
        last_practiced_at,
        skills (
          id,
          name,
          category,
          difficulty_level
        )
      `)
      .eq('user_id', userId)
      .order('mastery_percentage', { ascending: false });

    console.log('📊 Query result:', { 
      error: error?.message, 
      dataLength: data?.length,
      sample: data?.[0]
    });

    if (error) throw error;

    const mapped = data?.map(item => ({
      ...item.skills,
      proficiency_level: item.proficiency_level,
      mastery_percentage: item.mastery_percentage,
      practice_count: item.practice_count,
      acquired_at: item.acquired_at,
      last_practiced_at: item.last_practiced_at,
    })) || [];

    console.log('✅ Mapped skills:', mapped.length, mapped);

    return {
      success: true,
      data: mapped,
    };
  } catch (error) {
    console.error('❌ Error fetching user skills:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
}

/**
 * Get skills by category for a user
 */
export async function getUserSkillsByCategory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        mastery_percentage,
        skills (
          category
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;

    const grouped: { [key: string]: any[] } = {};

    data?.forEach((item: any) => {
      const category = item.skills?.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return {
      success: true,
      data: grouped,
    };
  } catch (error) {
    console.error('Error fetching skills by category:', error);
    return {
      success: false,
      data: {},
      error,
    };
  }
}

/**
 * Calculate skill gaps based on learning goals
 */
export async function calculateSkillGaps(userId: string) {
  try {
    // Fetch active learning goals
    const { data: goals, error: goalsError } = await supabase
      .from('user_learning_goals')
      .select(`
        id,
        skill_id,
        target_proficiency_level,
        deadline
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (goalsError) throw goalsError;

    // Fetch user skills
    const { data: userSkills, error: skillsError } = await supabase
      .from('user_skills')
      .select(`
        skill_id,
        proficiency_level,
        mastery_percentage,
        skills (
          id,
          name,
          category
        )
      `)
      .eq('user_id', userId);

    if (skillsError) throw skillsError;

    // Calculate gaps
    const gaps = goals
      ?.map(goal => {
        const userSkill = userSkills?.find(s => s.skill_id === goal.skill_id);
        if (!userSkill) return null;

        const proficiencyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
        const currentLevelIndex = proficiencyLevels.indexOf(userSkill.proficiency_level);
        const targetLevelIndex = proficiencyLevels.indexOf(goal.target_proficiency_level);

        const currentLevel = currentLevelIndex !== -1 ? currentLevelIndex * 25 + 25 : 0;
        const targetLevel = targetLevelIndex !== -1 ? targetLevelIndex * 25 + 25 : 75;

        return {
          skillId: goal.skill_id,
          skillName: (userSkill.skills as any)?.name || 'Unknown Skill',
          category: (userSkill.skills as any)?.category || 'Uncategorized',
          currentLevel: userSkill.mastery_percentage,
          targetLevel: targetLevel,
          gap: Math.max(0, targetLevel - userSkill.mastery_percentage),
          deadline: goal.deadline,
        };
      })
      .filter((g: any): g is any => g !== null) || [];

    const totalGaps = gaps.length;
    const averageGap = totalGaps > 0 ? gaps.reduce((acc, g) => acc + g.gap, 0) / totalGaps : 0;

    return {
      success: true,
      data: {
        gaps,
        totalGaps,
        averageGap,
      },
    };
  } catch (error) {
    console.error('Error calculating skill gaps:', error);
    return {
      success: false,
      data: {
        gaps: [],
        totalGaps: 0,
        averageGap: 0,
      },
      error,
    };
  }
}

/**
 * Update user skill proficiency
 */
export async function updateSkillProficiency(
  userId: string,
  skillId: string,
  updates: {
    proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    masteryPercentage?: number;
    practiceCount?: number;
  }
) {
  try {
    const { data, error } = await supabase
      .from('user_skills')
      .update({
        proficiency_level: updates.proficiencyLevel,
        mastery_percentage: updates.masteryPercentage,
        practice_count: updates.practiceCount,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .select();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error updating skill proficiency:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Record a skill practice session
 */
export async function recordSkillPractice(
  userId: string,
  skillId: string,
  durationMinutes: number,
  progressMade: number // 0-100 improvement percentage
) {
  try {
    // Record the practice session
    const { error: practiceError } = await supabase
      .from('skill_practice_sessions')
      .insert({
        user_id: userId,
        skill_id: skillId,
        duration_minutes: durationMinutes,
        progress_made: progressMade,
        session_date: new Date().toISOString(),
      });

    if (practiceError) throw practiceError;

    // Update skill statistics
    const { data: userSkill } = await supabase
      .from('user_skills')
      .select('practice_count, mastery_percentage')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .single();

    if (userSkill) {
      const newPracticeCount = (userSkill.practice_count || 0) + 1;
      const newMastery = Math.min(100, (userSkill.mastery_percentage || 0) + progressMade);

      await updateSkillProficiency(userId, skillId, {
        practiceCount: newPracticeCount,
        masteryPercentage: Math.round(newMastery),
      });
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error recording skill practice:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Get skill endorsements for a user
 */
export async function getUserSkillEndorsements(userId: string) {
  try {
    const { data, error } = await supabase
      .from('skill_endorsements')
      .select(`
        id,
        skill_id,
        endorsed_by,
        created_at,
        skills (
          name
        )
      `)
      .eq('endorsed_by_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching skill endorsements:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
}

/**
 * Create a learning goal
 */
export async function createLearningGoal(
  userId: string,
  skillId: string,
  targetProficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert',
  deadline: string
) {
  try {
    const { data, error } = await supabase
      .from('user_learning_goals')
      .insert({
        user_id: userId,
        skill_id: skillId,
        target_proficiency_level: targetProficiencyLevel,
        deadline,
        is_active: true,
      })
      .select();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Error creating learning goal:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Get learning goals for a user
 */
export async function getUserLearningGoals(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_learning_goals')
      .select(`
        id,
        skill_id,
        target_proficiency_level,
        deadline,
        is_active,
        skills (
          name,
          category
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('deadline', { ascending: true });

    if (error) throw error;

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    return {
      success: false,
      data: [],
      error,
    };
  }
}
