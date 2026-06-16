'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LandingHeader } from '@/components/landing/landing-header';
import { CourseLandingHero } from '@/components/landing/course-landing-hero';
import { CourseBenefitsSection } from '@/components/landing/course-benefits';
import { CourseFAQSection } from '@/components/landing/course-faq';
import { CourseLandingForm } from '@/components/landing/course-landing-form';

const COURSE_ID = '73f0185c-b5c2-4407-8ffe-17eb6a1350e7';

// Helper function to strip HTML tags
function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// Fallback data
const FALLBACK_COURSE_DATA = {
  id: COURSE_ID,
  title: 'Resume & Cover Letter Mastery 2026',
  subtitle: 'Mastering ATS, Quantification, and Professional Branding',
  description:
    'Transform your job search from frustration to success. Learn the exact strategies used by candidates landing interviews at top companies. Master ATS systems, quantify your achievements, and build a consistent professional brand across all platforms.',
  duration: '10 hours',
  students: 30,
  instructor: 'Navnit Alley',
  price: 549,
  rating: 0,
  reviews: 0,
};

async function getCourseData() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.log('Using fallback course data - missing Supabase credentials');
      return FALLBACK_COURSE_DATA;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', COURSE_ID)
      .maybeSingle();

    if (error) {
      console.log('Supabase error:', error.message);
      return FALLBACK_COURSE_DATA;
    }

    if (!course) {
      console.log('Course not found, using fallback data');
      return FALLBACK_COURSE_DATA;
    }

    console.log('📊 Raw course from DB:', {
      price: course.price,
      title: course.title,
      duration_hours: course.duration_hours,
      instructor_id: course.instructor_id,
    });

    // Count enrollments
    const { count: enrollmentCount = 0 } = await supabase
      .from('enrollments')
      .select('id', { count: 'exact', head: true })
      .eq('course_id', COURSE_ID);

    // Fetch instructor name if we have instructor_id
    let instructorName = 'Navnit Alley';
    if (course.instructor_id) {
      const { data: instructor } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', course.instructor_id)
        .maybeSingle();

      if (instructor) {
        instructorName = `${instructor.first_name} ${instructor.last_name}`;
      }
    }

    // Use price with better fallback logic
    const price = (course.price && course.price > 0) ? course.price : FALLBACK_COURSE_DATA.price;

    console.log('✅ Final courseData:', { price, instructorName, students: Math.max(enrollmentCount || 3, 30) });

    return {
      id: course.id,
      title: course.title || 'Resume & Cover Letter Mastery 2026',
      subtitle: 'Mastering ATS, Quantification, and Professional Branding',
      description: stripHtml(
        course.description ||
        'Transform your job search from frustration to success. Learn the exact strategies used by candidates landing interviews at top companies. Master ATS systems, quantify your achievements, and build a consistent professional brand across all platforms.'
      ),
      duration: `${course.duration_hours || '10'} hours`,
      students: Math.max(enrollmentCount || 3, 30),
      instructor: instructorName,
      price,
      rating: 0,
      reviews: 0,
    };
  } catch (error) {
    console.log('Error fetching course data:', error);
    return FALLBACK_COURSE_DATA;
  }
}

export default function ResumeMasteryLandingPage() {
  const [courseData, setCourseData] = useState(FALLBACK_COURSE_DATA);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCourseData().then((data) => {
      console.log('Course data loaded:', data);
      setCourseData(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleEnrollClick = () => {
    const formRef = document.getElementById('course-form-section');
    formRef?.scrollIntoView({ behavior: 'smooth' });
    window.setTimeout(() => {
      const firstInput = document.querySelector<HTMLInputElement>(
        '#course-form-section input'
      );
      firstInput?.focus({ preventScroll: true });
    }, 400);
  };

  return (
    <div className="w-full bg-white dark:bg-slate-dark min-h-screen">
      {/* Minimal Landing Header */}
      <LandingHeader />

      {/* Hero Section */}
      <CourseLandingHero
        courseTitle={courseData.title}
        courseDescription={courseData.description}
        courseDuration={courseData.duration}
        enrolledCount={courseData.students}
        instructorName={courseData.instructor}
        price={courseData.price}
        onEnrollClick={handleEnrollClick}
      />

      {/* Benefits Section */}
      <CourseBenefitsSection />

      {/* Curriculum Preview Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Course Curriculum
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-3xl mx-auto">
              A comprehensive path through modern resume and cover letter strategies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                module: 'Module 1',
                title: 'The Modern Resume Landscape',
                lessons: 3,
                duration: '2.5 hours',
                topics: [
                  'How ATS systems work (2024 updates)',
                  'Common resume mistakes that cost you interviews',
                  'formatting for both humans and machines',
                ],
              },
              {
                module: 'Module 2',
                title: 'Quantification Framework',
                lessons: 4,
                duration: '2.5 hours',
                topics: [
                  'Finding and measuring your impact',
                  'From generic bullets to metrics-driven achievements',
                  'Industry-specific quantification examples',
                ],
              },
              {
                module: 'Module 3',
                title: 'Professional Brand Alignment',
                lessons: 2,
                duration: '1.5 hours',
                topics: [
                  'Syncing resume, cover letter, and LinkedIn',
                  'Building consistent narrative across platforms',
                  'Personal brand positioning',
                ],
              },
              {
                module: 'Module 4',
                title: 'Cover Letters That Convert',
                lessons: 3,
                duration: '1.5 hours',
                topics: [
                  'Breaking from the template',
                  'Storytelling that sells',
                  'Addressing career gaps and transitions',
                ],
              },
            ].map((module, index) => (
              <div
                key={index}
                className="p-8 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md"
              >
                <div className="mb-4">
                  <span className="text-sm font-semibold text-primary dark:text-blue-300 uppercase">
                    {module.module}
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {module.title}
                  </h3>
                </div>

                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-200/50 dark:border-slate-700/50">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Lessons</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {module.lessons}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">Duration</div>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white">
                      {module.duration}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Topics Covered:</h4>
                  <ul className="space-y-2">
                    {module.topics.map((topic, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-slate-300">
                        <span className="text-primary font-bold mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-muted/20 dark:bg-slate-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Students Choose This Course
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                stat: '10 hours',
                description: 'Comprehensive Live Sessions with video content you can review anytime',
              },
              {
                stat: '2026 Updated',
                description: 'Latest ATS algorithms and job market strategies',
              },
              {
                stat: 'Lifetime Access',
                description: 'Keep the course materials forever',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {item.stat}
                </div>
                <p className="text-lg text-gray-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq-section" className="scroll-mt-16">
        <CourseFAQSection />
      </section>

      {/* Form Section */}
      <section
        id="course-form-section"
        className="py-20 bg-muted/20 dark:bg-slate-dark scroll-mt-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Job Search?
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              Tell us about your goals and we'll provide personalized guidance to help you succeed
            </p>
          </div>

          <CourseLandingForm
            courseId={courseData.id}
            courseName={courseData.title}
          />
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-primary dark:bg-[hsl(209,100%,29%)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Join Students Advancing Their Careers
          </h3>
          <p className="text-xl text-gray-100 mb-8 max-w-2xl mx-auto">
            Get started with the Resume & Cover Letter Mastery course today.
            Your dream job is closer than you think.
          </p>
          <button
            onClick={handleEnrollClick}
            className="px-8 py-4 bg-white hover:bg-gray-100 text-primary dark:text-slate-900 rounded-lg font-semibold text-lg transition-colors"
          >
            Enroll Now - Start Your Transformation
          </button>
        </div>
      </section>
    </div>
  );
}
