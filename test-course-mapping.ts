// Quick test script to verify course image mapping
import { getCourse, getCourses } from '../lib/supabase-data';

async function testCourseImageMapping() {
  console.log('Testing course image mapping...');
  
  // Test with the specific course ID that had image issues
  const courseId = 'c48f5246-0355-42bd-925c-6161d4984de7';
  
  try {
    const course = await getCourse(courseId);
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log('📋 Course Details:');
    console.log(`ID: ${course.id}`);
    console.log(`Title: ${course.title}`);
    console.log(`Database field (image_url): ${(course as any).image_url || 'undefined'}`);
    console.log(`Mapped field (imageUrl): ${course.imageUrl || 'undefined'}`);
    console.log(`Image URL validation: ${course.imageUrl && course.imageUrl.trim() !== '' ? '✅ PASS' : '❌ FAIL'}`);
    
    if (course.imageUrl) {
      console.log(`Image URL length: ${course.imageUrl.length}`);
      console.log(`Image URL starts with https: ${course.imageUrl.startsWith('https') ? '✅' : '❌'}`);
    }

    // Test a few more courses to ensure consistency
    console.log('\n🔍 Testing multiple courses...');
    const courses = await getCourses();
    const coursesWithImages = courses.filter(c => c.imageUrl && c.imageUrl.trim() !== '');
    const coursesWithoutImages = courses.filter(c => !c.imageUrl || c.imageUrl.trim() === '');
    
    console.log(`Total courses: ${courses.length}`);
    console.log(`Courses with images: ${coursesWithImages.length}`);
    console.log(`Courses without images: ${coursesWithoutImages.length}`);
    
    console.log('\n✅ Image mapping test completed!');
    
  } catch (error) {
    console.error('❌ Error testing course mapping:', error);
  }
}

// Run the test
testCourseImageMapping();