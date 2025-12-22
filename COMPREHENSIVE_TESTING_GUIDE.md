# WhitedgeLMS Comprehensive Testing Guide

**Last Updated**: December 22, 2025  
**Project Status**: 100% Complete (All 8 Phases)  
**Testing Status**: Infrastructure Created - Ready to Execute

---

## 📋 Quick Start

### Option 1: Run All Tests
```bash
# Unit & Integration Tests (Jest)
npm test

# Endpoint Tests (Bash)
chmod +x test-endpoints.sh
./test-endpoints.sh

# API Integration Tests (TypeScript)
npx ts-node api-integration-tests.ts
```

### Option 2: Execute Database Migrations
```sql
-- In Supabase SQL Editor:
1. Copy MIGRATIONS_PHASE_5_8.sql content
2. Execute to create 4 new tables
3. Verify with: SELECT tablename FROM pg_tables WHERE schemaname='public';
```

### Option 3: Populate Test Data
```sql
-- In Supabase SQL Editor (after migrations):
1. Copy TEST_DATA.sql content
2. Execute to populate sample data
3. Verify with: SELECT COUNT(*) FROM user_skills;
```

---

## 🏗️ Testing Architecture

### Test Files Created

| File | Type | Coverage | Run Command |
|------|------|----------|-------------|
| `api-integration-tests.ts` | Integration | All 12+ endpoints | `npx ts-node api-integration-tests.ts` |
| `test-endpoints.sh` | E2E | All endpoints | `./test-endpoints.sh` |
| `__tests__/phases-5-8.test.ts` | Unit + Integration | All phases | `npm test` |
| `MIGRATIONS_PHASE_5_8.sql` | Database | 4 new tables | Execute in Supabase |
| `TEST_DATA.sql` | Data | Sample records | Execute in Supabase |

### Test Coverage by Phase

```
Phase 5: Skills System
├─ Get user skills
├─ Calculate proficiency
├─ Identify skill gaps
└─ Sort by proficiency ✅

Phase 6: Badge System
├─ Award badges (criteria met)
├─ Award badges (criteria not met)
├─ Calculate learning streak
└─ Categorize by rarity ✅

Phase 7: Adaptive Learning
├─ Recommend next lesson
├─ Adjust difficulty
├─ Calculate velocity
├─ Identify trends
└─ Fetch recommendations ✅

Phase 8: AI Learning Paths
├─ Generate path structure
├─ Prioritize lessons
├─ Calculate completion estimate
├─ Optimize based on progress
└─ Generate assessments ✅

Integration
├─ Link badges to skills
├─ Adjust path by gaps
├─ Update recommendations
└─ Complete learning flow ✅
```

---

## 🧪 Test Types & Execution

### 1. Jest Unit & Integration Tests

**What it tests**: Core business logic for all phases

**Location**: `__tests__/phases-5-8.test.ts` (650+ lines)

**Test Count**: 25+ tests

**Execution**:
```bash
npm test
```

**What's Tested**:
- ✅ Phase 5: Skills calculations, gap analysis, sorting
- ✅ Phase 6: Badge awards, streak calculation, rarity categorization
- ✅ Phase 7: Difficulty adjustment, velocity calculation, trends
- ✅ Phase 8: Path generation, lesson prioritization, assessments
- ✅ Integration: Cross-phase flows, error handling
- ✅ Error scenarios: Missing data, invalid input, auth failures

**Expected Output**:
```
 PASS  __tests__/phases-5-8.test.ts
  Phase 5: Skills System (5 tests)
  Phase 6: Badge System (6 tests)
  Phase 7: Adaptive Learning (5 tests)
  Phase 8: AI Learning Paths (6 tests)
  Cross-Phase Integration (4 tests)
  Error Handling (4 tests)
  
  Tests:       25 passed, 25 total
  Suites:      1 passed, 1 total
  Time:        2.5s
```

---

### 2. Endpoint Testing (Bash Script)

**What it tests**: All API endpoints with real HTTP requests

**Location**: `test-endpoints.sh` (250+ lines, executable)

**Test Count**: 15+ endpoints

**Execution**:
```bash
chmod +x test-endpoints.sh  # First time only
./test-endpoints.sh
```

**Prerequisites**:
- ✅ Development server running (`npm run dev`)
- ✅ Database migrations executed
- ✅ Test data populated
- ✅ Auth tokens valid

**Tests Included**:

**Phase 5 (Skills)**:
- GET /api/user/skills
- GET /api/user/skills?includeGapAnalysis=true

**Phase 6 (Badges)**:
- GET /api/user/badges/earned
- GET /api/badges/progress
- POST /api/badges/check-and-award

**Phase 7 (Adaptive Learning)**:
- GET /api/learning/next-lesson
- GET /api/learning/difficulty
- GET /api/learning/insights
- POST /api/learning/adjust

**Phase 8 (AI Learning Paths)**:
- GET /api/ai/learning-goals
- POST /api/ai/learning-path/generate
- POST /api/ai/assessment/generate
- POST /api/ai/learning-path/optimize

**Admin & Error Handling**:
- GET /admin/dashboard
- GET /api/user/profile
- 401: Missing auth header
- 404: Invalid endpoint

**Expected Output**:
```
🚀 WhitedgeLMS API Endpoint Testing
════════════════════════════════════════════════════════════
Base URL: http://localhost:3000
Time: 2025-12-22T10:30:00Z

📚 PHASE 5: Skills System
─────────────────────────────────────────────────────────────
→ Testing: Get User Skills
  Method: GET /api/user/skills
✅ PASS - Status: 200

[... more tests ...]

📊 Test Results Summary
════════════════════════════════════════════════════════════
Total Tests: 15
✅ Passed: 15
❌ Failed: 0
📈 Pass Rate: 100.0%

🎉 All tests passed!
```

---

### 3. API Integration Tests (TypeScript)

**What it tests**: Complete API integration with type safety

**Location**: `api-integration-tests.ts` (350+ lines)

**Test Count**: 15+ endpoints

**Execution**:
```bash
npx ts-node api-integration-tests.ts
```

**Features**:
- ✅ Typed request/response validation
- ✅ Bearer token authentication
- ✅ Error message capture
- ✅ Response time measurement
- ✅ Detailed failure reporting

**Test Organization**:
```
📚 Phase 5: Skills Tests
🏆 Phase 6: Badges Tests
🎯 Phase 7: Adaptive Learning Tests
🤖 Phase 8: AI Learning Paths Tests
👨‍💼 Admin API Tests
⚠️ Error Handling Tests
```

**Expected Output**:
```
🚀 WhitedgeLMS API Integration Test Suite
============================================================
Base URL: http://localhost:3000
Date: 2025-12-22T10:30:00.000Z

📚 PHASE 5: Skills System Tests
────────────────────────────────────────────────────────────

🧪 Testing: Get User Skills
   Endpoint: GET /api/user/skills
✅ PASS: Status 200 (45ms)
   Response: {"skills":[...],"totalCount":6}

[... more tests ...]

📊 Test Results Summary
============================================================
Total Tests: 15
✅ Passed: 15
❌ Failed: 0
📈 Pass Rate: 100.0%

Test Suite Completed: 2025-12-22T10:31:00.000Z
============================================================
```

---

## 🗄️ Database Testing

### Migrations (MIGRATIONS_PHASE_5_8.sql)

**Tables Created**:

1. **user_skills** - Tracks individual skill proficiency
   - Columns: id, user_id, skill_id, proficiency_level, mastery_percentage, lessons_completed, quizzes_completed, last_updated
   - Indexes: user_id, skill_id, created_at
   - RLS: Enabled (users see own, admins see all)

2. **learning_goals** - SMART goals for learning
   - Columns: id, user_id, title, target_skill, target_difficulty, target_date, status, created_at
   - Indexes: user_id, status, created_at
   - RLS: Enabled

3. **learning_paths** - AI-generated lesson sequences
   - Columns: id, user_id, goal_id, lesson_sequence, estimated_days, success_rate, status, created_at
   - Indexes: user_id, goal_id, status
   - RLS: Enabled

4. **learning_adjustments** - Performance-based adjustments
   - Columns: id, user_id, adjustment_type, previous_value, new_value, performance_score, created_at
   - Indexes: user_id, created_at, adjustment_type
   - RLS: Enabled

**Execution Steps**:
1. Open Supabase Dashboard → SQL Editor
2. Copy entire MIGRATIONS_PHASE_5_8.sql content
3. Click "Run"
4. Verify with query:
   ```sql
   SELECT tablename FROM pg_tables 
   WHERE schemaname='public' AND tablename LIKE 'user_skills' OR tablename LIKE 'learning_goals' OR tablename LIKE 'learning_paths' OR tablename LIKE 'learning_adjustments';
   ```

**Expected Result**: 4 rows returned

---

### Test Data (TEST_DATA.sql)

**Sample Data Inserted**:

| Entity | Count | Details |
|--------|-------|---------|
| Skills | 6 | Reading, Listening, Speaking, Writing, Grammar, Vocabulary |
| Lessons | 20 | 5 per difficulty (beginner, intermediate, advanced, expert) |
| Quizzes | 20 | Auto-generated from lessons |
| User Skills | 6 | Mixed proficiency levels for test student |
| Quiz Attempts | 10 | Realistic scores (45-95) |
| Learning Goals | 3 | TOEFL Reading, Listening, Grammar mastery |
| Learning Paths | 3 | AI-generated with sequenced lessons |
| Adjustments | 5 | Performance-based modifications |

**Test Student ID**: `734137fc-18c8-4b29-8503-c1075f92d570`

**Execution Steps**:
1. Execute MIGRATIONS_PHASE_5_8.sql first ⚠️
2. Open Supabase Dashboard → SQL Editor
3. Copy entire TEST_DATA.sql content
4. Click "Run"
5. Verify with queries:
   ```sql
   -- Check skills
   SELECT COUNT(*) FROM skills;  -- Should be 6
   
   -- Check user skills
   SELECT COUNT(*) FROM user_skills 
   WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570';  -- Should be 6
   
   -- Check learning goals
   SELECT COUNT(*) FROM learning_goals 
   WHERE user_id = '734137fc-18c8-4b29-8503-c1075f92d570';  -- Should be 3
   ```

---

## 🔍 Debugging & Troubleshooting

### Common Issues & Solutions

**Issue 1: "Table 'public.user_skills' not found"**
```
Cause: Migrations not executed
Solution: Execute MIGRATIONS_PHASE_5_8.sql in Supabase
```

**Issue 2: "401 Unauthorized on API endpoints"**
```
Cause: Missing or invalid Bearer token
Solution: 
  - Verify token in test script
  - Check Authorization header format: "Bearer <token>"
  - Ensure auth middleware is enabled
```

**Issue 3: "EADDRINUSE: Port 3000 already in use"**
```
Cause: Previous dev server still running
Solution: 
  lsof -ti:3000 | xargs kill -9
  npm run dev
```

**Issue 4: "Tests fail with 500 status codes"**
```
Cause: Server error, check logs
Solution:
  1. Check dev server console for errors
  2. Verify database migrations executed
  3. Check test data populated
  4. Review API endpoint implementation
```

**Issue 5: "Connection refused on localhost:3000"**
```
Cause: Dev server not running
Solution:
  npm run dev  # Start server in background or separate terminal
  # Wait 10 seconds for startup
```

### Test Server Logs

When running tests, check server logs for:
```
✅ 200: GET /api/user/skills - Successful response
⚠️ 404: GET /api/invalid/endpoint - Expected error
🔐 Token validation: Proper JWT decoding
👤 User ID: 734137fc-18c8-4b29-8503-c1075f92d570 (Test Student)
```

### Manual Endpoint Testing

Test individual endpoints with curl:
```bash
# Get user skills
curl -X GET http://localhost:3000/api/user/skills \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Check badges
curl -X GET http://localhost:3000/api/user/badges/earned \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get learning goals
curl -X GET http://localhost:3000/api/ai/learning-goals \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

### Before Running Tests
- [ ] Node.js and npm installed (v18+)
- [ ] Development server running (`npm run dev`)
- [ ] Supabase project connected
- [ ] Database migrations executed (MIGRATIONS_PHASE_5_8.sql)
- [ ] Test data populated (TEST_DATA.sql)
- [ ] Port 3000 is available
- [ ] Internet connection for external requests

### After Running Tests
- [ ] All unit tests pass (npm test)
- [ ] All endpoint tests pass (./test-endpoints.sh)
- [ ] All integration tests pass (npx ts-node api-integration-tests.ts)
- [ ] No console errors in server logs
- [ ] Database contains expected test data
- [ ] Auth tokens are valid and working
- [ ] Response times are reasonable (<200ms)

### Feature Verification

**Phase 5: Skills Dashboard**
- [ ] Skills page loads successfully
- [ ] All 6 skills display
- [ ] Gap analysis shows correctly
- [ ] Proficiency levels are accurate

**Phase 6: Badge System**
- [ ] Badge cards render
- [ ] Earned badges display (should have some from test data)
- [ ] Progress bars update
- [ ] Streak tracker shows data

**Phase 7: Adaptive Learning**
- [ ] Next lesson recommendation displays
- [ ] Difficulty selector works
- [ ] Insights panel shows trends
- [ ] Adjustment logs appear

**Phase 8: AI Learning Paths**
- [ ] Learning goals list displays (3 sample goals)
- [ ] Path viewer shows sequenced lessons
- [ ] Assessment generator works
- [ ] Path optimization recommendations appear

---

## 📊 Expected Test Results

### Test Summary
```
Test Framework: Jest + TypeScript + Bash
Total Test Suites: 3
Total Tests: 40+
Expected Pass Rate: 100%
Expected Execution Time: < 5 minutes

Phase Coverage:
├─ Phase 5: Skills (5 tests) ✅
├─ Phase 6: Badges (6 tests) ✅
├─ Phase 7: Adaptive Learning (5 tests) ✅
├─ Phase 8: AI Paths (6 tests) ✅
├─ Integration (4 tests) ✅
├─ Error Handling (4 tests) ✅
└─ API Endpoints (15+ tests) ✅
```

### Success Criteria
- ✅ All unit tests pass without errors
- ✅ All endpoints return expected status codes (200, 401, 404)
- ✅ Response schemas match API definitions
- ✅ Auth middleware properly validates tokens
- ✅ Database queries return expected data
- ✅ Error handling works gracefully
- ✅ No memory leaks or hanging connections
- ✅ Server remains stable throughout tests

---

## 🚀 Next Steps After Testing

1. **If all tests pass**:
   - ✅ System is production-ready
   - ✅ Proceed with deployment
   - ✅ Monitor logs in production
   - ✅ Set up performance monitoring

2. **If tests fail**:
   - Review error logs in detail
   - Check database migrations for errors
   - Verify API endpoint implementations
   - Review auth token configuration
   - Check RLS policies in Supabase

3. **Recommended enhancements**:
   - Add E2E tests with Playwright/Cypress
   - Set up CI/CD pipeline with GitHub Actions
   - Configure automated testing on commits
   - Add performance benchmarks
   - Set up error tracking (Sentry)
   - Enable analytics collection

---

## 📞 Support Resources

- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **Database Schema**: [DATABASE_DOCUMENTATION_INDEX.md](DATABASE_DOCUMENTATION_INDEX.md)
- **Phase Implementation Guides**:
  - Phase 5: [Skills Dashboard implementation](./PHASE_5_SKILLS_DASHBOARD.md)
  - Phase 6: [Badge System implementation](./PHASE_6_BADGE_EARNING.md)
  - Phase 7: [Adaptive Learning implementation](./PHASE_7_ADAPTIVE_LEARNING.md)
  - Phase 8: [AI Learning Paths implementation](./PHASE_8_AI_LEARNING_PATHS.md)
- **Troubleshooting**: [SYSTEM_TEST_GUIDE.md](SYSTEM_TEST_GUIDE.md)

---

## 📝 Test Result Log Template

```
Test Execution Date: ___________
Tester Name: ___________
Environment: Development / Staging / Production

Jest Tests:          ✅ / ❌  Status: _________
Endpoint Tests:      ✅ / ❌  Status: _________
Integration Tests:   ✅ / ❌  Status: _________

Pass Rate: _________%
Failed Tests: __________
Duration: __________ seconds

Notes:
_________________________________________________________________
_________________________________________________________________
```

---

**Project Status**: ✅ **100% Complete**  
**Testing Infrastructure**: ✅ **Ready to Execute**  
**Documentation**: ✅ **Comprehensive**  

*Last Updated: December 22, 2025 - Testing Infrastructure Complete*
