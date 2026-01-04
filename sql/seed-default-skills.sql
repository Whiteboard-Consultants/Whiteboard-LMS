-- Seed default professional development skills
INSERT INTO skills (name, category, difficulty_level, description) VALUES
  ('LinkedIn Profile Optimization', 'Professional Development', 'beginner', 'Ability to optimize LinkedIn profile for professional visibility and opportunities'),
  ('Professional Branding', 'Professional Development', 'intermediate', 'Creating and maintaining a strong professional brand'),
  ('AI for Career Development', 'Technology', 'intermediate', 'Leveraging AI tools for career growth and job search'),
  ('Technical Communication', 'Communication', 'intermediate', 'Effectively communicating technical concepts to various audiences'),
  ('Interview Skills', 'Career Development', 'intermediate', 'Preparing for and succeeding in job interviews'),
  ('Resume Writing', 'Career Development', 'beginner', 'Creating compelling resumes that highlight achievements'),
  ('Networking', 'Professional Development', 'intermediate', 'Building and maintaining professional relationships'),
  ('Career Planning', 'Career Development', 'intermediate', 'Developing and executing a strategic career plan'),
  ('Public Speaking', 'Communication', 'intermediate', 'Delivering presentations and public speeches effectively'),
  ('Leadership Skills', 'Professional Development', 'advanced', 'Leading teams and driving organizational success')
ON CONFLICT (name) DO NOTHING;

-- Link LinkedIn Optimization with AI course to relevant skills
-- First, get the course ID for "LinkedIn Optimization with AI" 
WITH course_id AS (
  SELECT id FROM courses WHERE title = 'LinkedIn Optimization with AI' LIMIT 1
),
skill_ids AS (
  SELECT id, name FROM skills 
  WHERE name IN ('LinkedIn Profile Optimization', 'Professional Branding', 'AI for Career Development')
)
INSERT INTO course_skills (course_id, skill_id, proficiency_level, weight)
SELECT c.id, s.id, 'intermediate', 2
FROM course_id c, skill_ids s
ON CONFLICT (course_id, skill_id) DO NOTHING;
