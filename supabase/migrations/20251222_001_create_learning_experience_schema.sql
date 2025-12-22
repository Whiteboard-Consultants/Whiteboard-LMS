-- Learning Experience Enhancement Schema Migration
-- Created: 2025-12-22
-- Description: Creates tables for Skills, Microlearning, Adaptive Learning, Gamification, AI Paths, and Skill Gap Analysis

-- ============================================================================
-- 1. SKILLS SYSTEM
-- ============================================================================

-- Skills master table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100),
  difficulty_level VARCHAR(20),
  parent_skill_id UUID REFERENCES skills(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Maps courses to skills they teach
CREATE TABLE IF NOT EXISTS course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20),
  weight INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, skill_id)
);

-- Tracks user's skill proficiency
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20),
  mastery_percentage INT DEFAULT 0,
  practice_count INT DEFAULT 0,
  last_practiced_at TIMESTAMP,
  acquired_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Career/learning goals for gap analysis
CREATE TABLE IF NOT EXISTS user_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_title VARCHAR(255) NOT NULL,
  goal_description TEXT,
  role_title VARCHAR(255),
  target_skills TEXT[],
  priority INT DEFAULT 1,
  target_completion_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 2. MICROLEARNING SYSTEM
-- ============================================================================

-- Lesson segments for 3-5 minute microlearning
CREATE TABLE IF NOT EXISTS lesson_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  segment_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50),
  content_url VARCHAR(500),
  duration_seconds INT,
  learning_objectives TEXT[],
  key_concepts TEXT[],
  estimated_effort VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, segment_number)
);

-- Tracks user progress through segments
CREATE TABLE IF NOT EXISTS user_segment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES lesson_segments(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started',
  progress_percentage INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  attempts INT DEFAULT 0,
  quiz_score INT,
  quiz_passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, segment_id, enrollment_id)
);

-- ============================================================================
-- 3. ADAPTIVE LEARNING SYSTEM
-- ============================================================================

-- Different difficulty versions of lessons
CREATE TABLE IF NOT EXISTS lesson_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  difficulty_level VARCHAR(20) NOT NULL,
  content_url VARCHAR(500),
  description TEXT,
  estimated_duration_minutes INT,
  prerequisite_skills TEXT[],
  supplementary_resources TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, difficulty_level)
);

-- User's learning profile and preferences
CREATE TABLE IF NOT EXISTS user_learning_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_style VARCHAR(50),
  preferred_difficulty VARCHAR(20) DEFAULT 'Intermediate',
  average_quiz_score DECIMAL(5,2),
  retention_rate DECIMAL(5,2),
  learning_pace VARCHAR(20),
  preferred_content_types TEXT[],
  needs_extra_support BOOLEAN DEFAULT FALSE,
  last_assessment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tracks which variant user is assigned to
CREATE TABLE IF NOT EXISTS user_lesson_variant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES lesson_variants(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  assigned_reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, enrollment_id)
);

-- ============================================================================
-- 4. GAMIFICATION SYSTEM - BADGES
-- ============================================================================

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  badge_type VARCHAR(50),
  criteria_type VARCHAR(50),
  criteria_value INT,
  criteria_metadata JSONB,
  rarity VARCHAR(20),
  points_reward INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User's earned badges
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  earned_from_id UUID,
  earned_from_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Points tracking
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  points_this_month INT DEFAULT 0,
  points_this_week INT DEFAULT 0,
  lesson_completion_points INT DEFAULT 0,
  quiz_points INT DEFAULT 0,
  badge_points INT DEFAULT 0,
  community_points INT DEFAULT 0,
  last_points_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Audit trail for point awards
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL,
  transaction_type VARCHAR(50),
  reference_id UUID,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 5. AI LEARNING PATHS
-- ============================================================================

-- Personalized learning paths
CREATE TABLE IF NOT EXISTS ai_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_learning_goals(id) ON DELETE SET NULL,
  path_name VARCHAR(255),
  description TEXT,
  recommended_courses UUID[],
  reasoning TEXT,
  estimated_duration_hours INT,
  success_probability DECIMAL(3,2),
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual course recommendations
CREATE TABLE IF NOT EXISTS ai_course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(3,2),
  reason_codes TEXT[],
  skill_relevance DECIMAL(3,2),
  difficulty_match DECIMAL(3,2),
  generated_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  enrolled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 6. SKILL GAP ANALYSIS
-- ============================================================================

-- Pre-computed skill gaps (refreshed daily)
CREATE TABLE IF NOT EXISTS skill_gap_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_learning_goals(id) ON DELETE CASCADE,
  total_skills_needed INT,
  skills_mastered INT,
  completion_percentage INT,
  priority_gaps TEXT[],
  recommended_courses UUID[],
  analysis_generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_parent ON skills(parent_skill_id);

CREATE INDEX IF NOT EXISTS idx_course_skills_course ON course_skills(course_id);
CREATE INDEX IF NOT EXISTS idx_course_skills_skill ON course_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_user_skills_user ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill ON user_skills(skill_id);

CREATE INDEX IF NOT EXISTS idx_user_learning_goals_user ON user_learning_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_goals_status ON user_learning_goals(status);

CREATE INDEX IF NOT EXISTS idx_lesson_segments_lesson ON lesson_segments(lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_segment_progress_user ON user_segment_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_progress_enrollment ON user_segment_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_user_segment_progress_status ON user_segment_progress(status);

CREATE INDEX IF NOT EXISTS idx_lesson_variants_lesson ON lesson_variants(lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_learning_profile_user ON user_learning_profile(user_id);

CREATE INDEX IF NOT EXISTS idx_user_lesson_variant_user ON user_lesson_variant(user_id);
CREATE INDEX IF NOT EXISTS idx_user_lesson_variant_lesson ON user_lesson_variant(lesson_id);

CREATE INDEX IF NOT EXISTS idx_badges_type ON badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_badges_criteria ON badges(criteria_type);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned ON user_badges(earned_at);

CREATE INDEX IF NOT EXISTS idx_user_points_user ON user_points(user_id);

CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_date ON point_transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_user ON ai_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_learning_paths_active ON ai_learning_paths(is_active);

CREATE INDEX IF NOT EXISTS idx_ai_course_recommendations_user ON ai_course_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_course_recommendations_course ON ai_course_recommendations(course_id);

CREATE INDEX IF NOT EXISTS idx_skill_gap_analysis_user ON skill_gap_analysis(user_id);

-- ============================================================================
-- ENABLE RLS (Row Level Security)
-- ============================================================================

-- User can only see their own data
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_segment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_course_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gap_analysis ENABLE ROW LEVEL SECURITY;

-- Public read access to skills and badges
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_skills
CREATE POLICY "Users can view own skills"
  ON user_skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own skills"
  ON user_skills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage skills"
  ON user_skills FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_learning_goals
CREATE POLICY "Users can view own goals"
  ON user_learning_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own goals"
  ON user_learning_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON user_learning_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage goals"
  ON user_learning_goals FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_segment_progress
CREATE POLICY "Users can view own progress"
  ON user_segment_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_segment_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage progress"
  ON user_segment_progress FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_learning_profile
CREATE POLICY "Users can view own profile"
  ON user_learning_profile FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_learning_profile FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage profiles"
  ON user_learning_profile FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_lesson_variant
CREATE POLICY "Users can view own variants"
  ON user_lesson_variant FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage variants"
  ON user_lesson_variant FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_badges
CREATE POLICY "Users can view own badges"
  ON user_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage badges"
  ON user_badges FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for user_points
CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage points"
  ON user_points FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for point_transactions
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage transactions"
  ON point_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for ai_learning_paths
CREATE POLICY "Users can view own paths"
  ON ai_learning_paths FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage paths"
  ON ai_learning_paths FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for ai_course_recommendations
CREATE POLICY "Users can view own recommendations"
  ON ai_course_recommendations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON ai_course_recommendations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage recommendations"
  ON ai_course_recommendations FOR ALL
  USING (auth.role() = 'service_role');

-- RLS Policies for skill_gap_analysis
CREATE POLICY "Users can view own gap analysis"
  ON skill_gap_analysis FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage gap analysis"
  ON skill_gap_analysis FOR ALL
  USING (auth.role() = 'service_role');

-- Public access to skills
CREATE POLICY "Public can view skills"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage skills"
  ON skills FOR ALL
  USING (auth.role() = 'service_role');

-- Public access to badges
CREATE POLICY "Public can view badges"
  ON badges FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage badges"
  ON badges FOR ALL
  USING (auth.role() = 'service_role');
