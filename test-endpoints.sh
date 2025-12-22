#!/bin/bash

# WhitedgeLMS API Endpoint Testing Script
# Tests all Phase 5-8 endpoints with actual requests
# Usage: chmod +x test-endpoints.sh && ./test-endpoints.sh

set -e

# Configuration
BASE_URL="http://localhost:3000"
STUDENT_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3MzQxMzdmYy0xOGM4LTRiMjktODUwMy1jMTA3NWY5MmQ1NzAiLCJpc3MiOiJodHRwczovL3Byb2plY3RzLmN1c3RvbS5zdXBhYmFzZS5jb20iLCJhdWQiOlsiYXV0aGVudGljYXRlZCIsInVwZGF0ZXMiXSwiaWF0IjoxNzAzMjU5NjAwLCJleHAiOjE3MDMyNjMyMDB9.test_token"
ADMIN_TOKEN="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYTZhOWU1MS1lODc0LTRhM2ItYmM2OS1jOGEyYWEyOWU4M2MiLCJpc3MiOiJodHRwczovL3Byb2plY3RzLmN1c3RvbS5zdXBhYmFzZS5jb20iLCJhdWQiOlsiYXV0aGVudGljYXRlZCIsInVwZGF0ZXMiXSwiaWF0IjoxNzAzMjU5NjAwLCJleHAiOjE3MDMyNjMyMDB9.admin_token"

PASSED=0
FAILED=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local token="$4"
  local body="$5"
  local expected_status="${6:-200}"

  echo -e "\n${BLUE}→ Testing: ${name}${NC}"
  echo "  Method: ${method} ${endpoint}"

  local response
  local http_code

  if [ -z "$body" ]; then
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      -H "Authorization: $token" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" \
      -X "$method" \
      -H "Authorization: $token" \
      -H "Content-Type: application/json" \
      -d "$body" \
      "$BASE_URL$endpoint")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC} - Status: $http_code"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC} - Expected: $expected_status, Got: $http_code"
    ((FAILED++))
  fi

  # Show response preview (first 200 chars)
  if [ ! -z "$body" ]; then
    response_preview=$(echo "$body" | head -c 200)
    echo "  Response: $response_preview..."
  fi
}

echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🚀 WhitedgeLMS API Endpoint Testing${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo "Base URL: $BASE_URL"
echo "Time: $(date)"

# ============================================
# PHASE 5: Skills Tests
# ============================================
echo -e "\n${YELLOW}📚 PHASE 5: Skills System${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Get User Skills" \
  "GET" \
  "/api/user/skills" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Get Skills with Gap Analysis" \
  "GET" \
  "/api/user/skills?includeGapAnalysis=true" \
  "$STUDENT_TOKEN"

# ============================================
# PHASE 6: Badges Tests
# ============================================
echo -e "\n${YELLOW}🏆 PHASE 6: Badge System${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Get Earned Badges" \
  "GET" \
  "/api/user/badges/earned" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Get Badge Progress" \
  "GET" \
  "/api/badges/progress" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Check and Award Badges" \
  "POST" \
  "/api/badges/check-and-award" \
  "$STUDENT_TOKEN" \
  '{}'

# ============================================
# PHASE 7: Adaptive Learning Tests
# ============================================
echo -e "\n${YELLOW}🎯 PHASE 7: Adaptive Learning${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Get Next Recommended Lesson" \
  "GET" \
  "/api/learning/next-lesson" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Get Recommended Difficulty" \
  "GET" \
  "/api/learning/difficulty" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Get Learning Insights" \
  "GET" \
  "/api/learning/insights" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Adjust Learning Path" \
  "POST" \
  "/api/learning/adjust" \
  "$STUDENT_TOKEN" \
  '{"quizId":"quiz_test_123","score":85,"totalScore":100}'

# ============================================
# PHASE 8: AI Learning Paths Tests
# ============================================
echo -e "\n${YELLOW}🤖 PHASE 8: AI Learning Paths${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Get Learning Goals" \
  "GET" \
  "/api/ai/learning-goals" \
  "$STUDENT_TOKEN"

test_endpoint \
  "Generate Learning Path" \
  "POST" \
  "/api/ai/learning-path/generate" \
  "$STUDENT_TOKEN" \
  '{"goalId":"goal_test_123"}'

test_endpoint \
  "Generate Assessment" \
  "POST" \
  "/api/ai/assessment/generate" \
  "$STUDENT_TOKEN" \
  '{"lessonId":"lesson_test_123","difficulty":"intermediate"}'

test_endpoint \
  "Optimize Learning Path" \
  "POST" \
  "/api/ai/learning-path/optimize" \
  "$STUDENT_TOKEN" \
  '{"currentPath":["lesson_1","lesson_2","lesson_3"]}'

# ============================================
# Admin Tests
# ============================================
echo -e "\n${YELLOW}👨‍💼 Admin API${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Get Admin Dashboard" \
  "GET" \
  "/admin/dashboard" \
  "$ADMIN_TOKEN"

test_endpoint \
  "Get User Profile (Admin)" \
  "GET" \
  "/api/user/profile" \
  "$ADMIN_TOKEN"

# ============================================
# Error Handling Tests
# ============================================
echo -e "\n${YELLOW}⚠️  Error Handling${NC}"
echo "─────────────────────────────────────────────────────────────"

test_endpoint \
  "Missing Authorization Header" \
  "GET" \
  "/api/user/skills" \
  "" \
  "" \
  401

test_endpoint \
  "Invalid Endpoint" \
  "GET" \
  "/api/invalid/endpoint" \
  "$STUDENT_TOKEN" \
  "" \
  404

# ============================================
# Results Summary
# ============================================
echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"

TOTAL=$((PASSED + FAILED))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED/$TOTAL)*100}")

echo "Total Tests: $TOTAL"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo "📈 Pass Rate: $PASS_RATE%"

if [ "$FAILED" -eq 0 ]; then
  echo -e "\n${GREEN}🎉 All tests passed!${NC}\n"
  exit 0
else
  echo -e "\n${RED}⚠️  Some tests failed!${NC}\n"
  exit 1
fi
