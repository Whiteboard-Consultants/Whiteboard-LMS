-- Seed faq_section for published blog posts (run in Supabase SQL Editor)
-- Only updates posts where faq_section is null or empty []

UPDATE posts SET faq_section = '[
  {"question": "Is self-study enough to reach a high TOEFL score?", "answer": "Most self-study students struggle to reach competitive TOEFL scores without expert feedback, especially on Speaking and Writing. Structured online courses at Whiteboard Consultants Kolkata provide diagnostics, timed practice, and instructor review that typically improve scores faster."},
  {"question": "How much can a structured TOEFL course improve my score?", "answer": "Students in guided TOEFL programs often see improvements of 15–30+ points compared to self-study alone, depending on baseline level, practice consistency, and target university requirements."},
  {"question": "Are online TOEFL courses available from Kolkata?", "answer": "Yes. Whiteboard Consultants offers live and online TOEFL preparation with mock tests, essay feedback, and speaking practice — suitable for students across India preparing for US and global admissions."},
  {"question": "When should I enroll in a TOEFL course instead of studying alone?", "answer": "Enroll if your target score is 90+, you have less than three months before your test, speaking or writing is a weak area, or you have already self-studied without meaningful score gains."}
]'::jsonb, updated_at = NOW()
WHERE slug = 'online-toefl-prep-courses-beat-self-study-results'
  AND (faq_section IS NULL OR faq_section = '[]'::jsonb);

UPDATE posts SET faq_section = '[
  {"question": "How long is the IELTS intensive course at Whiteboard Consultants?", "answer": "Our intensive IELTS program runs approximately 8 weeks with live classes, section-wise drills, full mock tests, and personalized feedback to help students move toward band 7.0+ for study abroad admissions."},
  {"question": "Can I improve my IELTS band score in 8 weeks?", "answer": "Many students improve by 0.5–1.5 bands in 8 weeks with consistent attendance and practice. Starting band, study hours per week, and weak sections determine how much progress is realistic."},
  {"question": "Does the course cover all four IELTS sections?", "answer": "Yes. The curriculum covers Listening, Reading, Writing (Task 1 and Task 2), and Speaking with strategies tailored for UK, Ireland, Australia, and Canada university requirements."},
  {"question": "Is this IELTS course suitable for first-time test takers?", "answer": "Yes. The program includes foundation modules, diagnostic testing, and step-by-step guidance for students taking IELTS for the first time as well as those retaking the exam."}
]'::jsonb, updated_at = NOW()
WHERE slug = '8-week-ielts-intensive-course-success-stories'
  AND (faq_section IS NULL OR faq_section = '[]'::jsonb);

UPDATE posts SET faq_section = '[
  {"question": "Should Indian students take TOEFL or IELTS?", "answer": "Choose IELTS for UK, Ireland, Australia, and New Zealand applications. TOEFL is widely accepted in the USA and many Canadian programs. Whiteboard Consultants in Kolkata helps you pick the test that matches your destination and strengths."},
  {"question": "Which test is easier for Indian students?", "answer": "Neither test is universally easier. IELTS suits students comfortable with conversation-style speaking. TOEFL suits those who prefer integrated computer-based tasks. A diagnostic assessment is the best way to decide."},
  {"question": "Do universities accept both TOEFL and IELTS?", "answer": "Most international universities accept one or both tests, but requirements vary by country and program. Always verify the exact score requirement on your target university website before booking a test."},
  {"question": "Can Whiteboard Consultants coach for both TOEFL and IELTS?", "answer": "Yes. We offer preparation for both exams with separate batches, mock tests, and counselor guidance so you do not waste time preparing for the wrong test."}
]'::jsonb, updated_at = NOW()
WHERE slug = 'toefl-vs-ielts-complete-comparison-by-country'
  AND (faq_section IS NULL OR faq_section = '[]'::jsonb);

-- Additional slugs: run scripts/seed-blog-faq-sections.ts for the full set,
-- or extend this file with the remaining entries from src/lib/blog-default-faqs.ts
