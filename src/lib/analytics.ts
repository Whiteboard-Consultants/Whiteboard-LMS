// Google Analytics event tracking
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, any>
) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
}

// Common event tracking functions
export const AnalyticsEvents = {
  // User events
  userRegistration: (email?: string, role?: string) =>
    trackEvent('user_registration', {
      email,
      role,
      timestamp: new Date().toISOString(),
    }),
  
  userLogin: (role?: string) =>
    trackEvent('user_login', {
      role,
      timestamp: new Date().toISOString(),
    }),

  // Course events
  courseView: (courseId: string, courseName: string, instructorId?: string) =>
    trackEvent('course_view', {
      course_id: courseId,
      course_name: courseName,
      instructor_id: instructorId,
      timestamp: new Date().toISOString(),
    }),

  courseEnrolled: (courseId: string, courseName: string, amount: number) =>
    trackEvent('course_enrolled', {
      course_id: courseId,
      course_name: courseName,
      amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    }),

  // Payment events
  paymentInitiated: (courseId: string, amount: number) =>
    trackEvent('payment_initiated', {
      course_id: courseId,
      amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    }),

  paymentCompleted: (courseId: string, amount: number, orderId?: string) =>
    trackEvent('payment_completed', {
      course_id: courseId,
      amount,
      currency: 'INR',
      order_id: orderId,
      timestamp: new Date().toISOString(),
    }),

  paymentFailed: (courseId: string, amount: number, reason?: string) =>
    trackEvent('payment_failed', {
      course_id: courseId,
      amount,
      currency: 'INR',
      reason,
      timestamp: new Date().toISOString(),
    }),

  // Coupon events
  couponApplied: (couponCode: string, discountAmount: number) =>
    trackEvent('coupon_applied', {
      coupon_code: couponCode,
      discount_amount: discountAmount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    }),

  // Quiz/Test events
  testStarted: (testId: string, testName: string, courseId?: string) =>
    trackEvent('test_started', {
      test_id: testId,
      test_name: testName,
      course_id: courseId,
      timestamp: new Date().toISOString(),
    }),

  testCompleted: (testId: string, score: number, totalQuestions: number) =>
    trackEvent('test_completed', {
      test_id: testId,
      score,
      total_questions: totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
      timestamp: new Date().toISOString(),
    }),

  // Certificate events
  certificateDownloaded: (courseId: string, certificateId?: string) =>
    trackEvent('certificate_downloaded', {
      course_id: courseId,
      certificate_id: certificateId,
      timestamp: new Date().toISOString(),
    }),

  // Content events
  lessonViewed: (courseId: string, lessonId: string, lessonTitle?: string) =>
    trackEvent('lesson_viewed', {
      course_id: courseId,
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      timestamp: new Date().toISOString(),
    }),

  // Contact events
  contactFormSubmitted: (subject?: string, email?: string) =>
    trackEvent('contact_form_submitted', {
      subject,
      email,
      timestamp: new Date().toISOString(),
    }),
};
