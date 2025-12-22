# Learning Experience Enhancement - Database Schema

## Overview
This document outlines the database schema for implementing Category 1 (Personalized Learning) and Badges.

---

## 1. SKILLS SYSTEM

### Table: `skills`
```sql
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(100), -- 'Technical', 'Soft Skills', 'Language', etc.
  difficulty_level VARCHAR(20), -- 'Beginner', 'Intermediate', 'Advanced'
  parent_skill_id UUID REFERENCES skills(id), -- For skill hierarchies
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `course_skills`
Maps courses to the skills they teach/develop
```sql
CREATE TABLE course_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20), -- 'Basic', 'Intermediate', 'Advanced'
  weight INT DEFAULT 1, -- Importance weight (1-10)
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(course_id, skill_id)
);
```

### Table: `user_skills`
Tracks user skill mastery levels
```sql
CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level VARCHAR(20), -- 'Beginner', 'Intermediate', 'Advanced', 'Expert'
  mastery_percentage INT DEFAULT 0, -- 0-100
  practice_count INT DEFAULT 0, -- Number of times practiced
  last_practiced_at TIMESTAMP,
  acquired_at TIMESTAMP, -- When user first demonstrated this skill
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);
```

### Table: `user_learning_goals`
Career/learning goals for gap analysis
```sql
CREATE TABLE user_learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_title VARCHAR(255) NOT NULL,
  goal_description TEXT,
  role_title VARCHAR(255), -- Target role (e.g., "Senior Data Engineer")
  target_skills TEXT[], -- Array of skill IDs needed
  priority INT DEFAULT 1, -- 1 (low) to 5 (high)
  target_completion_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 2. MICROLEARNING SYSTEM

### Table: `lesson_segments`
Sub-lessons for microlearning (3-5 minute bites)
```sql
CREATE TABLE lesson_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  segment_number INT NOT NULL, -- Order within lesson
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content_type VARCHAR(50), -- 'video', 'text', 'quiz', 'interactive'
  content_url VARCHAR(500),
  duration_seconds INT, -- Expected duration
  learning_objectives TEXT[], -- What learner should know after
  key_concepts TEXT[], -- Main concepts covered
  estimated_effort VARCHAR(20), -- 'Easy', 'Medium', 'Hard'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, segment_number)
);
```

### Table: `user_segment_progress`
Tracks which segments user has completed
```sql
CREATE TABLE user_segment_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment_id UUID NOT NULL REFERENCES lesson_segments(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  progress_percentage INT DEFAULT 0, -- 0-100
  time_spent_seconds INT DEFAULT 0,
  attempts INT DEFAULT 0,
  quiz_score INT, -- For quiz segments (0-100)
  quiz_passed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, segment_id, enrollment_id)
);
```

---

## 3. ADAPTIVE LEARNING SYSTEM

### Table: `lesson_variants`
Different difficulty versions of lessons
```sql
CREATE TABLE lesson_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  difficulty_level VARCHAR(20) NOT NULL, -- 'Beginner', 'Intermediate', 'Advanced'
  content_url VARCHAR(500),
  description TEXT,
  estimated_duration_minutes INT,
  prerequisite_skills TEXT[], -- Skills needed for this variant
  supplementary_resources TEXT[], -- Links to extra materials
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(lesson_id, difficulty_level)
);
```

### Table: `user_learning_profile`
Adaptive learning preferences and performance
```sql
CREATE TABLE user_learning_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learning_style VARCHAR(50), -- 'Visual', 'Auditory', 'Reading', 'Kinesthetic'
  preferred_difficulty VARCHAR(20) DEFAULT 'Intermediate',
  average_quiz_score DECIMAL(5,2),
  retention_rate DECIMAL(5,2), -- Percentage of content retained
  learning_pace VARCHAR(20), -- 'Slow', 'Moderate', 'Fast'
  preferred_content_types TEXT[], -- e.g., ['video', 'interactive', 'text']
  needs_extra_support BOOLEAN DEFAULT FALSE,
  last_assessment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Table: `user_lesson_variant`
Tracks which variant each user is assigned
```sql
CREATE TABLE user_lesson_variant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES lesson_variants(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  assigned_reason VARCHAR(100), -- 'auto_adaptive', 'manual', 'prerequisite_check'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, enrollment_id)
);
```

---

## 4. GAMIFICATION SYSTEM - BADGES

### Table: `badges`
Badge definitions
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon_url VARCHAR(500),
  badge_type VARCHAR(50), -- 'achievement', 'milestone', 'skill_master', 'social'
  criteria_type VARCHAR(50), -- 'lesson_completion', 'quiz_score', 'skill_level', 'streak', 'course_completion'
  criteria_value INT, -- Threshold (e.g., score >= 90)
  criteria_metadata JSONB, -- Additional criteria details
  rarity VARCHAR(20), -- 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'
  points_reward INT DEFAULT 10, -- Points awarded for earning badge
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `user_badges`
Tracks user's earned badges
```sql
CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
  earned_from_id UUID, -- lesson_id, quiz_id, course_id, etc.
  earned_from_type VARCHAR(50), -- 'lesson', 'quiz', 'course', 'skill'
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);
```

### Table: `user_points`
Gamification points tracking
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_points INT DEFAULT 0,
  points_this_month INT DEFAULT 0,
  points_this_week INT DEFAULT 0,
  lesson_completion_points INT DEFAULT 0,
  quiz_points INT DEFAULT 0,
  badge_points INT DEFAULT 0,
  community_points INT DEFAULT 0, -- From forum posts, helping others
  last_points_update TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Table: `point_transactions`
Audit trail for point awards
```sql
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INT NOT NULL, -- Can be negative for point deductions
  transaction_type VARCHAR(50), -- 'lesson_complete', 'quiz_pass', 'badge_earn', etc.
  reference_id UUID, -- lesson_id, badge_id, etc.
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. AI LEARNING PATHS

### Table: `ai_learning_paths`
Personalized learning paths generated by AI
```sql
CREATE TABLE ai_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_learning_goals(id) ON DELETE SET NULL,
  path_name VARCHAR(255),
  description TEXT,
  recommended_courses UUID[], -- Array of course IDs
  reasoning TEXT, -- Why these courses recommended
  estimated_duration_hours INT,
  success_probability DECIMAL(3,2), -- 0.0 - 1.0
  is_active BOOLEAN DEFAULT TRUE,
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `ai_course_recommendations`
Individual course recommendations with reasoning
```sql
CREATE TABLE ai_course_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  recommendation_score DECIMAL(3,2), -- 0.0 - 1.0
  reason_codes TEXT[], -- e.g., ['skill_gap', 'career_match', 'peer_success']
  skill_relevance DECIMAL(3,2),
  difficulty_match DECIMAL(3,2),
  generated_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  enrolled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. SKILL GAP ANALYSIS

### Table: `skill_gap_analysis`
Pre-computed skill gap analysis (refreshed daily)
```sql
CREATE TABLE skill_gap_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES user_learning_goals(id),
  total_skills_needed INT,
  skills_mastered INT,
  completion_percentage INT,
  priority_gaps TEXT[], -- Top 3 missing skills
  recommended_courses UUID[], -- Courses to close gaps
  analysis_generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, goal_id)
);
```

---

## MIGRATION STRATEGY

All tables use UUID primary keys and include:
- `created_at` / `updated_at` timestamps
- Foreign key constraints with CASCADE delete where appropriate
- Unique constraints to prevent duplicates
- JSONB/Arrays for flexible metadata

**Deployment:**
1. Create all tables
2. Add indexes on frequently queried fields (user_id, course_id, skill_id)
3. Seed initial badges and skills
4. Deploy features incrementally

---

## INDEXES (Performance Optimization)

```sql
CREATE INDEX idx_user_skills ON user_skills(user_id, skill_id);
CREATE INDEX idx_course_skills ON course_skills(course_id);
CREATE INDEX idx_user_segment_progress ON user_segment_progress(user_id, enrollment_id);
CREATE INDEX idx_user_badges ON user_badges(user_id, earned_at);
CREATE INDEX idx_user_points ON user_points(user_id);
CREATE INDEX idx_ai_recommendations ON ai_course_recommendations(user_id);
CREATE INDEX idx_skill_gap_analysis ON skill_gap_analysis(user_id);
```

