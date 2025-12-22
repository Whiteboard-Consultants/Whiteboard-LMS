/**
 * WhitedgeLMS Integration Test Suite
 * Tests all major API endpoints and system functionality
 * Run with: npx ts-node api-integration-tests.ts
 */

import fetch from 'node-fetch';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_USER_ID = '734137fc-18c8-4b29-8503-c1075f92d570';
const ADMIN_USER_ID = '2a6a9e51-e874-4a3b-bc69-c8a2aa29e83c';

// Mock tokens for testing
const STUDENT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzQxMzdmYy0xOGM4LTRiMjktODUwMy1jMTA3NWY5MmQ1NzAiLCJpc3MiOiJodHRwczovL3Byb2plY3RzLmN1c3RvbS5zdXBhYmFzZS5jb20iLCJhdWQiOlsiYXV0aGVudGljYXRlZCIsInVwZGF0ZXMiXSwiaWF0IjoxNzAzMjU5NjAwLCJleHAiOjE3MDMyNjMyMDB9.test_token';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYTZhOWU1MS1lODc0LTRhM2ItYmM2OS1jOGEyYWEyOWU4M2MiLCJpc3MiOiJodHRwczovL3Byb2plY3RzLmN1c3RvbS5zdXBhYmFzZS5jb20iLCJhdWQiOlsiYXV0aGVudGljYXRlZCIsInVwZGF0ZXMiXSwiaWF0IjoxNzAzMjU5NjAwLCJleHAiOjE3MDMyNjMyMDB9.admin_token';

// Test result tracking
interface TestResult {
  name: string;
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  statusCode?: number;
  message?: string;
  duration?: number;
}

const results: TestResult[] = [];

// Helper function to make API calls
async function apiCall(
  endpoint: string,
  method: string = 'GET',
  token?: string,
  body?: any
): Promise<{ status: number; data: any; error?: any }> {
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    } as any);

    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = data;
    }

    return {
      status: response.status,
      data: parsedData,
    };
  } catch (error: any) {
    return {
      status: 0,
      data: null,
      error: error.message,
    };
  }
}

// Test runner
async function runTest(
  name: string,
  endpoint: string,
  method: string,
  token?: string,
  body?: any,
  expectedStatus: number | number[] = 200
): Promise<void> {
  const startTime = Date.now();
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   Endpoint: ${method} ${endpoint}`);

  const result = await apiCall(endpoint, method, token, body);
  const duration = Date.now() - startTime;

  const testResult: TestResult = {
    name,
    endpoint,
    method,
    status: 'PENDING',
    statusCode: result.status,
    duration,
  };

  const expectedStatuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];

  if (result.error) {
    testResult.status = 'FAIL';
    testResult.message = result.error;
    console.log(`   ❌ FAIL: ${result.error}`);
  } else if (expectedStatuses.includes(result.status)) {
    testResult.status = 'PASS';
    testResult.message = `Got expected status ${result.status}`;
    console.log(`   ✅ PASS: Status ${result.status} (${duration}ms)`);
  } else {
    testResult.status = 'FAIL';
    testResult.message = `Expected ${expectedStatuses.join(' or ')}, got ${result.status}`;
    console.log(`   ❌ FAIL: Expected ${expectedStatuses.join(' or ')}, got ${result.status}`);
  }

  if (result.data && typeof result.data === 'object') {
    console.log(`   Response:`, JSON.stringify(result.data, null, 2).slice(0, 200));
  }

  results.push(testResult);
}

// Test suite
async function runAllTests(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 WhitedgeLMS API Integration Test Suite');
  console.log('='.repeat(60));
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Date: ${new Date().toISOString()}`);

  // ============================================
  // PHASE 5: Skills Tests
  // ============================================
  console.log('\n\n📚 PHASE 5: Skills System Tests');
  console.log('-'.repeat(60));

  await runTest(
    'Get User Skills',
    '/api/user/skills',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Get Skills Dashboard Data',
    '/api/user/skills?includeGapAnalysis=true',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  // ============================================
  // PHASE 6: Badges Tests
  // ============================================
  console.log('\n\n🏆 PHASE 6: Badge System Tests');
  console.log('-'.repeat(60));

  await runTest(
    'Get Earned Badges',
    '/api/user/badges/earned',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Get Badge Progress',
    '/api/badges/progress',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Check and Award Badges',
    '/api/badges/check-and-award',
    'POST',
    STUDENT_TOKEN,
    {},
    200
  );

  // ============================================
  // PHASE 7: Adaptive Learning Tests
  // ============================================
  console.log('\n\n🎯 PHASE 7: Adaptive Learning Tests');
  console.log('-'.repeat(60));

  await runTest(
    'Get Next Recommended Lesson',
    '/api/learning/next-lesson',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Get Recommended Difficulty',
    '/api/learning/difficulty',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Get Learning Insights',
    '/api/learning/insights',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Adjust Learning Path',
    '/api/learning/adjust',
    'POST',
    STUDENT_TOKEN,
    {
      quizId: 'quiz_test_123',
      score: 85,
      totalScore: 100,
    },
    200
  );

  // ============================================
  // PHASE 8: AI Learning Paths Tests
  // ============================================
  console.log('\n\n🤖 PHASE 8: AI Learning Paths Tests');
  console.log('-'.repeat(60));

  const goalsResponse = await apiCall(
    '/api/ai/learning-goals',
    'GET',
    STUDENT_TOKEN
  );
  let goalId = 'goal_test_123'; // fallback
  if (goalsResponse.status === 200 && goalsResponse.data?.data?.goals?.length > 0) {
    goalId = goalsResponse.data.data.goals[0].id;
  }

  await runTest(
    'Get Learning Goals',
    '/api/ai/learning-goals',
    'GET',
    STUDENT_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Generate Learning Path',
    '/api/ai/learning-path/generate',
    'POST',
    STUDENT_TOKEN,
    {
      goalId: goalId,
    },
    [200, 404] // 200 if path generated, 404 if not enough lessons (acceptable)
  );

  await runTest(
    'Generate Assessment',
    '/api/ai/assessment/generate',
    'POST',
    STUDENT_TOKEN,
    {
      lessonId: 'lesson_test_123',
      difficulty: 'intermediate',
    },
    [200, 404] // 200 if assessment generated, 404 if lesson doesn't exist (acceptable)
  );

  await runTest(
    'Optimize Learning Path',
    '/api/ai/learning-path/optimize',
    'POST',
    STUDENT_TOKEN,
    {
      currentPath: ['lesson_1', 'lesson_2', 'lesson_3'],
    },
    [200, 404] // 200 if optimized, 404 if path invalid (acceptable)
  );

  // ============================================
  // Admin Tests
  // ============================================
  console.log('\n\n👨‍💼 Admin API Tests');
  console.log('-'.repeat(60));

  await runTest(
    'Get Admin Dashboard',
    '/admin/dashboard',
    'GET',
    ADMIN_TOKEN,
    undefined,
    200
  );

  await runTest(
    'Get User Profile (Admin)',
    '/api/user/profile',
    'GET',
    ADMIN_TOKEN,
    undefined,
    200
  );

  // ============================================
  // Error Handling Tests
  // ============================================
  console.log('\n\n⚠️  Error Handling Tests');
  console.log('-'.repeat(60));

  await runTest(
    'Missing Authorization Header',
    '/api/user/skills',
    'GET',
    undefined,
    undefined,
    401
  );

  await runTest(
    'Invalid Endpoint',
    '/api/invalid/endpoint',
    'GET',
    STUDENT_TOKEN,
    undefined,
    404
  );

  // ============================================
  // Results Summary
  // ============================================
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Test Results Summary');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const total = results.length;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Pass Rate: ${passRate}%`);

  // Detailed results
  console.log('\nDetailed Results:');
  console.log('-'.repeat(60));

  results.forEach((result) => {
    const statusIcon = result.status === 'PASS' ? '✅' : '❌';
    console.log(
      `${statusIcon} ${result.name.padEnd(35)} | ${result.method.padEnd(6)} | Status: ${result.statusCode || 'N/A'} | ${result.duration}ms`
    );
    if (result.message) {
      console.log(`   └─ ${result.message}`);
    }
  });

  // Failed tests details
  const failedTests = results.filter((r) => r.status === 'FAIL');
  if (failedTests.length > 0) {
    console.log('\nFailed Tests Details:');
    console.log('-'.repeat(60));
    failedTests.forEach((test) => {
      console.log(`\n${test.name}`);
      console.log(`  Endpoint: ${test.method} ${test.endpoint}`);
      console.log(`  Error: ${test.message}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Test Suite Completed: ${new Date().toISOString()}`);
  console.log('='.repeat(60) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Fatal error during testing:', error);
  process.exit(1);
});
