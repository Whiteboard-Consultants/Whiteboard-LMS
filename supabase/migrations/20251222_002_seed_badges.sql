-- Seed initial badge definitions
-- Run this after the main migration

BEGIN;

-- Achievement Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Getting Started', 'Completed your first lesson', 'achievement', 'lesson_completion', 1, 'Common', 10, true),
  ('Course Master', 'Completed an entire course', 'achievement', 'course_completion', 1, 'Uncommon', 100, true),
  ('Perfect Score', 'Achieved 100% on a quiz', 'achievement', 'quiz_score', 100, 'Rare', 25, true);

-- Milestone Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('5 Lessons Complete', 'Completed 5 lessons', 'milestone', 'lesson_completion', 5, 'Uncommon', 25, true),
  ('10 Lessons Complete', 'Completed 10 lessons', 'milestone', 'lesson_completion', 10, 'Uncommon', 50, true),
  ('25 Lessons Complete', 'Completed 25 lessons', 'milestone', 'lesson_completion', 25, 'Rare', 100, true),
  ('100 Lessons Complete', 'Completed 100 lessons', 'milestone', 'lesson_completion', 100, 'Epic', 250, true);

-- Skill Master Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Skill Novice', 'Achieved Beginner level in a skill', 'skill_master', 'skill_level', 1, 'Common', 15, true),
  ('Skill Practitioner', 'Achieved Intermediate level in a skill', 'skill_master', 'skill_level', 2, 'Uncommon', 50, true),
  ('Skill Expert', 'Achieved Advanced level in a skill', 'skill_master', 'skill_level', 3, 'Rare', 100, true),
  ('Skill Wizard', 'Achieved Expert level in a skill', 'skill_master', 'skill_level', 4, 'Epic', 150, true);

-- Quiz Mastery Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Quiz Master', 'Achieved 90%+ on 5 quizzes', 'achievement', 'quiz_score', 90, 'Uncommon', 30, true),
  ('Quiz Perfection', 'Achieved 100% on 3 quizzes', 'achievement', 'quiz_score', 100, 'Rare', 50, true);

-- Streak Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('3 Day Streak', 'Completed lessons for 3 consecutive days', 'milestone', 'streak', 3, 'Uncommon', 20, true),
  ('7 Day Streak', 'Completed lessons for 7 consecutive days', 'milestone', 'streak', 7, 'Uncommon', 35, true),
  ('30 Day Streak', 'Completed lessons for 30 consecutive days', 'milestone', 'streak', 30, 'Epic', 100, true),
  ('100 Day Streak', 'Completed lessons for 100 consecutive days', 'milestone', 'streak', 100, 'Legendary', 250, true);

-- Social & Community Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Helpful Community Member', 'Received 10 helpful votes on forum posts', 'social', 'community_votes', 10, 'Uncommon', 25, true),
  ('Mentor', 'Helped 5 other students complete a course', 'social', 'community_help', 5, 'Rare', 75, true);

-- Speed Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Quick Learner', 'Completed a course in under 5 days', 'achievement', 'speed', 5, 'Uncommon', 40, true),
  ('Speed Demon', 'Completed 3 courses in under 10 days each', 'achievement', 'speed', 3, 'Rare', 75, true);

-- Comprehensive Badges
INSERT INTO badges (name, description, badge_type, criteria_type, criteria_value, rarity, points_reward, is_active)
VALUES 
  ('Versatile Learner', 'Completed courses in 5 different categories', 'achievement', 'category_diversity', 5, 'Rare', 100, true),
  ('Master Learner', 'Completed 10 courses', 'achievement', 'course_completion', 10, 'Epic', 200, true);

COMMIT;
