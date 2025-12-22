import type { Course } from '@/types';

// Helper function to map database course record to frontend Course type
export function mapDatabaseCourseToCourse(dbCourse: any): Course {
  // Handle instructor field - it can be either JSONB object or separate fields
  let instructor;
  if (dbCourse.instructor && typeof dbCourse.instructor === 'object') {
    // JSONB field exists
    instructor = dbCourse.instructor;
  } else {
    // Fallback to individual fields or defaults
    instructor = {
      id: dbCourse.instructor_id || '',
      name: dbCourse.instructor_name || 'Unknown Instructor'
    };
  }

  return {
    ...dbCourse,
    // Map database snake_case fields to camelCase for Course interface
    imageUrl: dbCourse.image_url,
    createdAt: dbCourse.created_at,
    studentCount: dbCourse.student_count || 0,
    ratingCount: dbCourse.rating_count || 0,
    totalRating: dbCourse.total_rating || 0,
    originalPrice: dbCourse.original_price,
    hasCertificate: dbCourse.has_certificate || false,
    certificateUrl: dbCourse.certificate_url,
    programOutcome: dbCourse.program_outcome,
    courseStructure: dbCourse.course_structure,
    lessonCount: dbCourse.lesson_count || 0,
    completedLessons: dbCourse.completed_lessons || 0,
    finalAssessmentId: dbCourse.final_assessment_id,
    instructor: instructor
  };
}

// Helper function to map multiple database course records
export function mapDatabaseCoursesToCourses(dbCourses: any[]): Course[] {
  return (dbCourses || []).map(mapDatabaseCourseToCourse);
}