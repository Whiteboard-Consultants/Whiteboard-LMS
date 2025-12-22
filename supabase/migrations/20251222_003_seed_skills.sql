-- Seed initial skills database
-- Run this after the main migration

BEGIN;

-- Technical Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('JavaScript', 'Core JavaScript programming language', 'Technical', 'Beginner'),
  ('TypeScript', 'TypeScript type-safe JavaScript', 'Technical', 'Intermediate'),
  ('React', 'React.js frontend framework', 'Technical', 'Intermediate'),
  ('Node.js', 'Node.js backend runtime', 'Technical', 'Intermediate'),
  ('SQL', 'SQL database querying', 'Technical', 'Beginner'),
  ('Database Design', 'Designing relational databases', 'Technical', 'Advanced'),
  ('API Development', 'Building REST and GraphQL APIs', 'Technical', 'Intermediate'),
  ('Cloud Deployment', 'Deploying applications to cloud', 'Technical', 'Intermediate'),
  ('DevOps', 'DevOps and infrastructure automation', 'Technical', 'Advanced'),
  ('Testing', 'Unit testing and test automation', 'Technical', 'Intermediate'),
  ('Git', 'Version control with Git', 'Technical', 'Beginner'),
  ('Docker', 'Containerization with Docker', 'Technical', 'Intermediate'),
  ('Kubernetes', 'Container orchestration', 'Technical', 'Advanced'),
  ('System Design', 'Large-scale system architecture', 'Technical', 'Advanced'),
  ('Security', 'Application security best practices', 'Technical', 'Advanced'),
  ('Machine Learning', 'Machine learning fundamentals', 'Technical', 'Advanced'),
  ('Python', 'Python programming language', 'Technical', 'Beginner'),
  ('Data Analysis', 'Data analysis and visualization', 'Technical', 'Intermediate');

-- Business & Professional Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('Project Management', 'Managing projects and teams', 'Business', 'Intermediate'),
  ('Agile Methodology', 'Agile and Scrum practices', 'Business', 'Intermediate'),
  ('Product Management', 'Product strategy and development', 'Business', 'Advanced'),
  ('Business Analysis', 'Analyzing business requirements', 'Business', 'Intermediate'),
  ('Leadership', 'Team leadership and management', 'Business', 'Advanced'),
  ('Communication', 'Effective communication skills', 'Business', 'Beginner'),
  ('Negotiation', 'Negotiation and conflict resolution', 'Business', 'Intermediate'),
  ('Strategic Thinking', 'Strategic planning and analysis', 'Business', 'Advanced'),
  ('Decision Making', 'Data-driven decision making', 'Business', 'Intermediate'),
  ('Critical Thinking', 'Critical analysis and problem solving', 'Business', 'Intermediate');

-- Language Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('English', 'English language proficiency', 'Language', 'Beginner'),
  ('IELTS', 'IELTS exam preparation', 'Language', 'Intermediate'),
  ('TOEFL', 'TOEFL exam preparation', 'Language', 'Intermediate'),
  ('Spanish', 'Spanish language proficiency', 'Language', 'Beginner'),
  ('French', 'French language proficiency', 'Language', 'Beginner'),
  ('German', 'German language proficiency', 'Language', 'Beginner'),
  ('Japanese', 'Japanese language proficiency', 'Language', 'Beginner'),
  ('Chinese', 'Chinese language proficiency', 'Language', 'Beginner');

-- Soft Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('Time Management', 'Managing time effectively', 'Soft Skills', 'Beginner'),
  ('Problem Solving', 'Solving complex problems', 'Soft Skills', 'Intermediate'),
  ('Creativity', 'Creative thinking and innovation', 'Soft Skills', 'Intermediate'),
  ('Teamwork', 'Collaborating with teams', 'Soft Skills', 'Beginner'),
  ('Presentation Skills', 'Public speaking and presentations', 'Soft Skills', 'Intermediate'),
  ('Emotional Intelligence', 'Understanding emotions in teams', 'Soft Skills', 'Intermediate'),
  ('Adaptability', 'Adapting to change and learning new skills', 'Soft Skills', 'Beginner'),
  ('Active Listening', 'Listening and understanding others', 'Soft Skills', 'Beginner'),
  ('Conflict Resolution', 'Resolving conflicts peacefully', 'Soft Skills', 'Intermediate'),
  ('Self Motivation', 'Self-motivation and discipline', 'Soft Skills', 'Beginner');

-- Test Preparation Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('GMAT', 'GMAT exam preparation', 'Test Prep', 'Advanced'),
  ('GRE', 'GRE exam preparation', 'Test Prep', 'Advanced'),
  ('LSAT', 'LSAT exam preparation', 'Test Prep', 'Advanced'),
  ('SAT', 'SAT exam preparation', 'Test Prep', 'Intermediate'),
  ('ACT', 'ACT exam preparation', 'Test Prep', 'Intermediate'),
  ('Quantitative Reasoning', 'Quantitative problem solving', 'Test Prep', 'Intermediate'),
  ('Verbal Reasoning', 'Verbal reasoning and comprehension', 'Test Prep', 'Intermediate'),
  ('Essay Writing', 'Academic essay writing', 'Test Prep', 'Intermediate');

-- Data Science Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('Statistics', 'Statistical analysis and concepts', 'Data Science', 'Intermediate'),
  ('Data Visualization', 'Creating data visualizations', 'Data Science', 'Intermediate'),
  ('Excel', 'Advanced Excel skills', 'Data Science', 'Beginner'),
  ('Tableau', 'Tableau data visualization', 'Data Science', 'Intermediate'),
  ('Power BI', 'Power BI analytics', 'Data Science', 'Intermediate'),
  ('SQL Analytics', 'SQL for data analysis', 'Data Science', 'Intermediate'),
  ('R Programming', 'R language for data science', 'Data Science', 'Intermediate'),
  ('Python Data Science', 'Python for data science (pandas, numpy)', 'Data Science', 'Intermediate');

-- Design Skills
INSERT INTO skills (name, description, category, difficulty_level)
VALUES 
  ('UI Design', 'User interface design', 'Design', 'Intermediate'),
  ('UX Design', 'User experience design', 'Design', 'Intermediate'),
  ('Figma', 'Figma design tool', 'Design', 'Beginner'),
  ('Adobe XD', 'Adobe XD design tool', 'Design', 'Beginner'),
  ('Graphic Design', 'Graphic design principles', 'Design', 'Intermediate'),
  ('Web Design', 'Web design principles', 'Design', 'Intermediate'),
  ('Design Thinking', 'Design thinking methodology', 'Design', 'Beginner'),
  ('Wireframing', 'Creating wireframes', 'Design', 'Beginner');

COMMIT;
