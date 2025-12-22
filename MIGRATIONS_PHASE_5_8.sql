-- WhitedgeLMS Database Migrations
-- Phase 5-8 Tables for Skills, Goals, Paths, and Learning Data
-- Execute these in Supabase SQL Editor

-- ============================================
-- PHASE 5: User Skills Table
-- ============================================

CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  mastery_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  lessons_completed INTEGER DEFAULT 0,
  quizzes_passed INTEGER DEFAULT 0,
  last_assessed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX idx_user_skills_proficiency ON user_skills(proficiency_level);

-- RLS Policy for user_skills
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_skills_select ON user_skills
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY user_skills_insert ON user_skills
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY user_skills_update ON user_skills
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY user_skills_delete ON user_skills
  FOR DELETE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PHASE 5: Learning Goals Table
-- ============================================

CREATE TABLE IF NOT EXISTS learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  description TEXT,
  target_skills TEXT[] DEFAULT '{}',
  target_difficulty TEXT NOT NULL DEFAULT 'intermediate' CHECK (target_difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  timeline_weeks INTEGER NOT NULL DEFAULT 4 CHECK (timeline_weeks > 0),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_goals_user_id ON learning_goals(user_id);
CREATE INDEX idx_learning_goals_status ON learning_goals(status);

-- RLS Policy for learning_goals
ALTER TABLE learning_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_goals_select ON learning_goals
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_goals_insert ON learning_goals
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_goals_update ON learning_goals
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_goals_delete ON learning_goals
  FOR DELETE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PHASE 8: Learning Paths Table
-- ============================================

CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES learning_goals(id) ON DELETE CASCADE,
  path_name TEXT NOT NULL,
  sequenced_lessons JSONB NOT NULL DEFAULT '[]',
  estimated_completion_days INTEGER NOT NULL DEFAULT 30,
  success_rate NUMERIC NOT NULL DEFAULT 80 CHECK (success_rate >= 0 AND success_rate <= 100),
  current_position INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX idx_learning_paths_goal_id ON learning_paths(goal_id);

-- RLS Policy for learning_paths
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_paths_select ON learning_paths
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_paths_insert ON learning_paths
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_paths_update ON learning_paths
  FOR UPDATE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_paths_delete ON learning_paths
  FOR DELETE USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- PHASE 5-8: Learning Adjustments Log Table
-- ============================================

CREATE TABLE IF NOT EXISTS learning_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  performance_score NUMERIC NOT NULL,
  recommended_difficulty TEXT NOT NULL,
  adjustment_made BOOLEAN DEFAULT FALSE,
  adjustment_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_adjustments_user_id ON learning_adjustments(user_id);
CREATE INDEX idx_adjustments_lesson_id ON learning_adjustments(lesson_id);
CREATE INDEX idx_adjustments_created_at ON learning_adjustments(created_at);

-- RLS Policy for learning_adjustments
ALTER TABLE learning_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY learning_adjustments_select ON learning_adjustments
  FOR SELECT USING (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY learning_adjustments_insert ON learning_adjustments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- Verification Queries
-- ============================================

-- Verify all tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_skills', 'learning_goals', 'learning_paths', 'learning_adjustments')
ORDER BY table_name;

-- All done! Execute above migrations in Supabase SQL Editor
