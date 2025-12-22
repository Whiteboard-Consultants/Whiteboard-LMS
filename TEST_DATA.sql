-- WhitedgeLMS Test Data
-- Populate with sample data for testing
-- Execute in Supabase SQL Editor after migrations

-- ============================================
-- TEST DATA: Skills
-- ============================================

INSERT INTO skills (name, category, description) VALUES
  ('Reading Comprehension', 'English', 'Understand and analyze written text'),
  ('Listening', 'English', 'Comprehend and interpret spoken English'),
  ('Speaking', 'English', 'Communicate effectively in spoken English'),
  ('Writing', 'English', 'Compose clear, coherent written text'),
  ('Grammar', 'English', 'Master English grammar rules and usage'),
  ('Vocabulary', 'English', 'Build and apply expansive vocabulary')
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST DATA: Lessons
-- ============================================

INSERT INTO lessons (title, type, content, course_id, order_number, objectives) 
SELECT 
  lesson_title,
  'video',
  'Sample lesson content',
  (SELECT id FROM courses LIMIT 1),
  row_number() OVER (ORDER BY lesson_title),
  'Learn and master this skill'
FROM (
  VALUES
    ('Introduction to Reading Comprehension'),
    ('Basic Listening Skills'),
    ('Fundamentals of English Grammar'),
    ('Building Basic Vocabulary'),
    ('Introduction to Writing'),
    ('Advanced Comprehension Strategies'),
    ('Listening to Academic Content'),
    ('Complex Grammar Structures'),
    ('Expanding Vocabulary Range'),
    ('Paragraph Writing Techniques'),
    ('Critical Text Analysis'),
    ('Understanding Academic Lectures'),
    ('Advanced Grammar and Syntax'),
    ('Specialized Vocabulary in Context'),
    ('Essay Writing Mastery'),
    ('Analyzing Complex Texts'),
    ('Native-Level Listening Comprehension'),
    ('Advanced Stylistic Grammar'),
    ('Academic and Professional Vocabulary'),
    ('Advanced Academic Writing')
) AS lessons(lesson_title)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST DATA: Quizzes
-- ============================================

INSERT INTO tests (title, description, course_id, time_limit, total_marks, pass_marks, is_published)
SELECT 
  l.title || ' - Quiz',
  'Test your knowledge on ' || l.title,
  (SELECT id FROM courses LIMIT 1),
  20,
  100,
  70,
  true
FROM lessons l
WHERE NOT EXISTS (SELECT 1 FROM tests LIMIT 1)
LIMIT 20;

-- ============================================
-- TEST DATA: User Skills (Sample Student)
-- ============================================

-- Note: Replace '734137fc-18c8-4b29-8503-c1075f92d570' with actual student user_id
INSERT INTO user_skills (user_id, skill_id, proficiency_level, mastery_percentage, practice_count, acquired_at)
SELECT 
  '734137fc-18c8-4b29-8503-c1075f92d570',
  id,
  CASE 
    WHEN name = 'Reading Comprehension' THEN 'intermediate'
    WHEN name = 'Listening' THEN 'beginner'
    WHEN name = 'Speaking' THEN 'beginner'
    WHEN name = 'Writing' THEN 'intermediate'
    WHEN name = 'Grammar' THEN 'advanced'
    WHEN name = 'Vocabulary' THEN 'intermediate'
  END,
  CASE 
    WHEN name = 'Reading Comprehension' THEN 75
    WHEN name = 'Listening' THEN 45
    WHEN name = 'Speaking' THEN 35
    WHEN name = 'Writing' THEN 65
    WHEN name = 'Grammar' THEN 85
    WHEN name = 'Vocabulary' THEN 70
  END,
  CASE 
    WHEN name = 'Reading Comprehension' THEN 5
    WHEN name = 'Listening' THEN 2
    WHEN name = 'Speaking' THEN 1
    WHEN name = 'Writing' THEN 3
    WHEN name = 'Grammar' THEN 7
    WHEN name = 'Vocabulary' THEN 4
  END,
  NOW()
FROM skills
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST DATA: Quiz Attempts
-- ============================================

INSERT INTO test_attempts (user_id, test_id, course_id, enrollment_id, score, total_questions, percentage, passed)
SELECT 
  '734137fc-18c8-4b29-8503-c1075f92d570',
  t.id,
  (SELECT id FROM courses LIMIT 1),
  (SELECT id FROM enrollments WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570' LIMIT 1),
  CASE 
    WHEN t.title ILIKE '%Grammar%' THEN (85 + (random() * 10)::int)
    WHEN t.title ILIKE '%Reading%' THEN (75 + (random() * 15)::int)
    WHEN t.title ILIKE '%Vocabulary%' THEN (70 + (random() * 20)::int)
    WHEN t.title ILIKE '%Writing%' THEN (65 + (random() * 20)::int)
    ELSE (50 + (random() * 30)::int)
  END::int,
  100,
  CASE 
    WHEN t.title ILIKE '%Grammar%' THEN (85 + (random() * 10)::int)
    WHEN t.title ILIKE '%Reading%' THEN (75 + (random() * 15)::int)
    WHEN t.title ILIKE '%Vocabulary%' THEN (70 + (random() * 20)::int)
    WHEN t.title ILIKE '%Writing%' THEN (65 + (random() * 20)::int)
    ELSE (50 + (random() * 30)::int)
  END::int,
  true
FROM tests t
LIMIT 10;

-- ============================================
-- TEST DATA: Learning Goals
-- ============================================

INSERT INTO learning_goals (user_id, goal_name, description, target_skills, target_difficulty, timeline_weeks, priority, status)
VALUES
  (
    '734137fc-18c8-4b29-8503-c1075f92d570',
    'Master TOEFL Reading',
    'Achieve 95+ score on TOEFL Reading section',
    ARRAY['Reading Comprehension', 'Vocabulary'],
    'advanced',
    8,
    'high',
    'active'
  ),
  (
    '734137fc-18c8-4b29-8503-c1075f92d570',
    'Improve Listening Skills',
    'Move from beginner to intermediate listening',
    ARRAY['Listening'],
    'intermediate',
    6,
    'medium',
    'active'
  ),
  (
    '734137fc-18c8-4b29-8503-c1075f92d570',
    'Advanced Grammar Mastery',
    'Master complex grammar structures',
    ARRAY['Grammar'],
    'expert',
    10,
    'medium',
    'active'
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST DATA: Learning Paths
-- ============================================

INSERT INTO learning_paths (user_id, goal_id, path_name, sequenced_lessons, estimated_completion_days, success_rate, current_position, completed_lessons)
SELECT 
  '734137fc-18c8-4b29-8503-c1075f92d570',
  lg.id,
  'AI-Generated Path: ' || lg.goal_name,
  jsonb_build_array(
    jsonb_build_object(
      'lessonId', (SELECT id FROM lessons LIMIT 1),
      'sequenceNumber', 1,
      'title', 'Foundation Lesson',
      'estimatedDays', 3,
      'rationale', 'Start with fundamentals'
    ),
    jsonb_build_object(
      'lessonId', (SELECT id FROM lessons OFFSET 1 LIMIT 1),
      'sequenceNumber', 2,
      'title', 'Intermediate Lesson',
      'estimatedDays', 5,
      'rationale', 'Build on basics'
    ),
    jsonb_build_object(
      'lessonId', (SELECT id FROM lessons OFFSET 2 LIMIT 1),
      'sequenceNumber', 3,
      'title', 'Advanced Lesson',
      'estimatedDays', 7,
      'rationale', 'Advanced mastery'
    )
  ),
  45,
  85,
  1,
  0
FROM learning_goals lg
WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570'
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST DATA: Learning Adjustments
-- ============================================

INSERT INTO learning_adjustments (user_id, lesson_id, performance_score, recommended_difficulty, adjustment_made, adjustment_reason)
SELECT 
  '734137fc-18c8-4b29-8503-c1075f92d570',
  id,
  50 + (random() * 50)::int,
  CASE 
    WHEN (50 + (random() * 50)::int) >= 80 THEN 'advanced'
    WHEN (50 + (random() * 50)::int) >= 60 THEN 'intermediate'
    ELSE 'beginner'
  END,
  true,
  'Auto-adjusted based on performance'
FROM lessons
LIMIT 5
ON CONFLICT DO NOTHING;

-- ============================================
-- Verification Queries
-- ============================================

-- Count inserted records
SELECT 
  (SELECT COUNT(*) FROM user_skills) as user_skills,
  (SELECT COUNT(*) FROM learning_goals) as learning_goals,
  (SELECT COUNT(*) FROM learning_paths) as learning_paths,
  (SELECT COUNT(*) FROM test_attempts) as test_attempts,
  (SELECT COUNT(*) FROM learning_adjustments) as adjustments;

-- Verify student data
SELECT 
  'user_skills' as table_name,
  COUNT(*) as record_count
FROM user_skills
WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570'

UNION ALL

SELECT 
  'learning_goals',
  COUNT(*)
FROM learning_goals
WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570'

UNION ALL

SELECT 
  'learning_paths',
  COUNT(*)
FROM learning_paths
WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570';

-- All done! Test data ready
