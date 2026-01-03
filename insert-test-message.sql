-- First, let's get the student user ID
SELECT id, name FROM users WHERE role = 'student' LIMIT 1;

-- Get a course
SELECT id, title FROM courses LIMIT 1;

-- Get an instructor
SELECT id, name FROM users WHERE role = 'instructor' LIMIT 1;
