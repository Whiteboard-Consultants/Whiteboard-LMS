#!/usr/bin/env node

/**
 * Comprehensive Backend Systems Functionality Test
 * Tests data retrieval and system functionality through API endpoints
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  category: string;
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testAPI(
  category: string,
  name: string,
  endpoint: string,
  expectedStatus: number = 200,
  validateFn?: (data: any) => boolean
): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();

    let success = response.status === expectedStatus;
    let message = '';

    if (response.status !== expectedStatus) {
      message = `Expected ${expectedStatus}, got ${response.status}`;
      success = false;
    } else if (validateFn) {
      success = validateFn(data);
      message = success ? 'Data validation passed' : 'Data validation failed';
    } else {
      message = `${response.status} ${response.statusText}`;
    }

    results.push({
      category,
      name,
      status: success ? 'PASS' : 'FAIL',
      message,
      details: data
    });

    console.log(`${success ? '✅' : '❌'} [${category}] ${name}`);
  } catch (error: any) {
    results.push({
      category,
      name,
      status: 'FAIL',
      message: error.message
    });
    console.error(`❌ [${category}] ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🔬 Comprehensive Backend Systems Functionality Test\n');
  console.log('='.repeat(70));

  // ===== API RESPONSES =====
  console.log('\n📡 API Response Tests\n');

  await testAPI(
    'API',
    'Skills endpoint returns valid data',
    '/api/skills',
    200,
    data => data.success === true && Array.isArray(data.data)
  );

  await testAPI(
    'API',
    'Badges endpoint returns valid data',
    '/api/badges',
    200,
    data => data.success === true && Array.isArray(data.data)
  );

  await testAPI(
    'API',
    'Lessons endpoint returns valid data',
    '/api/lessons',
    200,
    data => Array.isArray(data.lessons)
  );

  // ===== FUNCTIONALITY TESTS =====
  console.log('\n🔧 Functionality Tests\n');

  await testAPI(
    'Functionality',
    'Server is responsive',
    '/',
    200,
    data => data !== undefined
  );

  await testAPI(
    'Functionality',
    'Database connectivity verified',
    '/api/check-database-setup',
    200,
    data => data.success === true
  );

  // ===== ERROR HANDLING =====
  console.log('\n⚠️  Error Handling Tests\n');

  await testAPI(
    'Error Handling',
    'Unauthorized request properly rejected',
    '/api/user/profile',
    401,
    data => data.error !== undefined
  );

  await testAPI(
    'Error Handling',
    'Invalid endpoint returns 404',
    '/api/nonexistent-endpoint-12345',
    404
  );

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Test Summary\n');

  const categoryGroups: { [key: string]: TestResult[] } = {};
  results.forEach(r => {
    if (!categoryGroups[r.category]) {
      categoryGroups[r.category] = [];
    }
    categoryGroups[r.category].push(r);
  });

  let totalPassed = 0;
  let totalFailed = 0;

  Object.entries(categoryGroups).forEach(([category, tests]) => {
    const passed = tests.filter(t => t.status === 'PASS').length;
    const failed = tests.filter(t => t.status === 'FAIL').length;

    console.log(`${category}: ${passed}/${tests.length} passed`);
    totalPassed += passed;
    totalFailed += failed;
  });

  console.log(`\n📈 Overall: ${totalPassed}/${results.length} tests passed`);

  if (totalFailed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`  - [${r.category}] ${r.name}: ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(70));

  // ===== SYSTEM HEALTH =====
  console.log('\n🏥 System Health Report\n');

  const systemHealth = {
    'API Availability': totalFailed === 0 ? '✅ All endpoints responding' : '❌ Some endpoints failing',
    'Database Connectivity': results.find(r => r.name === 'Database connectivity verified')?.status === 'PASS' 
      ? '✅ Connected' 
      : '❌ Connection issues',
    'Error Handling': results.find(r => r.category === 'Error Handling')?.status === 'PASS' 
      ? '✅ Proper error responses' 
      : '⚠️  Error handling issues',
    'Overall Status': totalFailed === 0 ? '✅ HEALTHY' : '⚠️  ISSUES DETECTED'
  };

  Object.entries(systemHealth).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });

  console.log('\n' + '='.repeat(70) + '\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
