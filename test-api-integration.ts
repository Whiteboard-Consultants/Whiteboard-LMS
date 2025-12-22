#!/usr/bin/env node

/**
 * Backend API Integration Tests
 * Tests the backend systems through HTTP API endpoints
 * Run with: npx ts-node test-api-integration.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  statusCode?: number;
  responseData?: any;
}

const results: TestResult[] = [];

async function testEndpoint(
  name: string,
  method: string,
  path: string,
  expectedStatus: number = 200,
  body?: any
): Promise<void> {
  try {
    const url = `${BASE_URL}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));

    if (response.status === expectedStatus) {
      results.push({
        name,
        status: 'PASS',
        message: `✅ ${response.status} ${response.statusText}`,
        statusCode: response.status,
        responseData: data
      });
      console.log(`✅ ${name} (${response.status})`);
    } else {
      results.push({
        name,
        status: 'FAIL',
        message: `Expected ${expectedStatus}, got ${response.status}`,
        statusCode: response.status,
        responseData: data
      });
      console.error(
        `❌ ${name}: Expected ${expectedStatus}, got ${response.status}`
      );
    }
  } catch (error: any) {
    results.push({
      name,
      status: 'FAIL',
      message: error.message
    });
    console.error(`❌ ${name}: ${error.message}`);
  }
}

async function runTests() {
  console.log('\n🧪 Backend API Integration Tests\n');
  console.log('='.repeat(60));

  // ===== API HEALTH CHECKS =====
  console.log('\n🏥 Health Checks\n');

  await testEndpoint(
    'Server is running',
    'GET',
    '/',
    200
  );

  // ===== SKILLS API =====
  console.log('\n🎯 Skills API Tests\n');

  await testEndpoint(
    'Skills endpoint exists',
    'GET',
    '/api/skills',
    200
  );

  // ===== BADGES API =====
  console.log('\n🏆 Badges API Tests\n');

  await testEndpoint(
    'Badges endpoint exists',
    'GET',
    '/api/badges',
    200
  );

  // ===== LESSONS API =====
  console.log('\n📚 Lessons API Tests\n');

  await testEndpoint(
    'Lessons endpoint exists',
    'GET',
    '/api/lessons',
    200
  );

  // ===== USER PROFILE API =====
  console.log('\n👤 User Profile API Tests\n');

  // This will fail without auth but let's check the endpoint exists
  await testEndpoint(
    'User profile endpoint exists',
    'GET',
    '/api/user/profile',
    401 // Should return 401 Unauthorized without token
  );

  // ===== DATABASE SETUP CHECK =====
  console.log('\n🔧 Database Setup Tests\n');

  await testEndpoint(
    'Database setup check endpoint',
    'GET',
    '/api/check-database-setup',
    200
  );

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  console.log(`✅ Passed:  ${passed}`);
  console.log(`❌ Failed:  ${failed}`);
  console.log(`📈 Total:   ${results.length}\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter(r => r.status === 'FAIL')
      .forEach(r => {
        console.log(`\n  ❌ ${r.name}`);
        console.log(`     ${r.message}`);
      });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📝 Detailed Results:\n');

  results.forEach(r => {
    console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}`);
    console.log(`   Status: ${r.statusCode || 'N/A'}`);
    console.log(`   Message: ${r.message}`);
    if (r.responseData && Object.keys(r.responseData).length > 0) {
      console.log(`   Data: ${JSON.stringify(r.responseData).substring(0, 100)}...`);
    }
    console.log();
  });

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
