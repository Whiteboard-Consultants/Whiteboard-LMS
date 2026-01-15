import type { Course } from '@/types';

// Helper function to map database course record to frontend Course type
export function mapDatabaseCourseToCourse(dbCourse: any, instructorData?: any): Course {
  // Handle instructor field - it can be either:
  // 1. JSONB object stored in instructor field
  // 2. JSONB stringified (in some Supabase query modes)
  // 3. Separate instructor_id and instructor_name fields
  // 4. Provided instructor data parameter
  let instructor;
  
  if (instructorData) {
    // Use provided instructor data (preferred method with lookup from users table)
    instructor = instructorData;
  } else if (dbCourse.instructor) {
    // Handle instructor field - could be object or string
    let instructorObj = dbCourse.instructor;
    
    // If it's a string, parse it
    if (typeof instructorObj === 'string') {
      try {
        instructorObj = JSON.parse(instructorObj);
      } catch (e) {
        instructorObj = null;
      }
    }
    
    // If we have a valid object with id/name, use it
    if (instructorObj && typeof instructorObj === 'object' && instructorObj.id) {
      instructor = {
        id: instructorObj.id,
        name: instructorObj.name || 'Unknown Instructor'
      };
    } else {
      // Fallback to individual fields
      instructor = {
        id: dbCourse.instructor_id || '',
        name: dbCourse.instructor_name || 'Unknown Instructor'
      };
    }
  } else {
    // Fallback to individual fields or defaults
    instructor = {
      id: dbCourse.instructor_id || '',
      name: dbCourse.instructor_name || 'Unknown Instructor'
    };
  }

  const { instructor: _instructorRaw, ...dbCourseWithoutInstructor } = dbCourse;

  return {
    ...dbCourseWithoutInstructor,
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
    // Use the properly formatted instructor object
    instructor: instructor
  } as any;
}

// Helper function to map multiple database course records
export function mapDatabaseCoursesToCourses(dbCourses: any[]): Course[] {
  return (dbCourses || []).map((course) => mapDatabaseCourseToCourse(course));
}