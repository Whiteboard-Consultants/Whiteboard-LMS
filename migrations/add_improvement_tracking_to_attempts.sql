-- Add improvement tracking to test attempts
-- Allows tracking performance by section/topic for personalized suggestions

ALTER TABLE test_attempts 
ADD COLUMN IF NOT EXISTS section_scores JSONB,
ADD COLUMN IF NOT EXISTS weak_areas JSONB,
ADD COLUMN IF NOT EXISTS improvement_suggestions JSONB,
ADD COLUMN IF NOT EXISTS suggested_review_resources JSONB;

-- Column descriptions:
-- section_scores: { "section_id": { "score": 65, "total": 100, "correct": 65, "total_questions": 10 } }
-- weak_areas: ["Section 1: Math", "Topic: Geometry"] - areas where student scored below 70%
-- improvement_suggestions: [{ "area": "Geometry", "reason": "Score: 45%", "suggestion": "Focus on..." }]
-- suggested_review_resources: [{ "type": "lesson", "title": "...", "url": "..." }]

COMMENT ON COLUMN test_attempts.section_scores IS 'Performance breakdown by section/topic';
COMMENT ON COLUMN test_attempts.weak_areas IS 'Identified areas needing improvement';
COMMENT ON COLUMN test_attempts.improvement_suggestions IS 'Personalized suggestions for improvement';
COMMENT ON COLUMN test_attempts.suggested_review_resources IS 'Recommended resources for improvement';

-- Create index for querying attempts with weak areas
CREATE INDEX IF NOT EXISTS idx_test_attempts_weak_areas ON test_attempts USING GIN(weak_areas);
