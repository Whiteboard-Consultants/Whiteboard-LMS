# WhitedgeLMS System Test Guide

## ✅ Server Status

**Development Server**: Running on http://localhost:3000  
**Next.js**: 16.0.7 with Turbopack  
**Status**: Ready for testing

---

## 📊 System Status

### ✅ Working Features
- **Authentication**: JWT token validation working
- **Admin Dashboard**: 200 response, rendering correctly
- **Student Dashboard**: 200 response, compiling and rendering
- **User Profile API**: Successfully fetching user data
- **Supabase Integration**: Connected and responding

### ⚠️ Database Tables Status

**Missing Tables** (need to be created via Supabase migrations):
- `user_skills` - Skills tracking table
- `learning_goals` - Learning goals table (Phase 8)
- `learning_paths` - Generated paths table (Phase 8)

**Status**: Tables need to be created in Supabase database

---

## 🧪 How to Test

### 1. **Admin Dashboard**
```
URL: http://localhost:3000/admin/dashboard
Features:
- Admin authentication
- Dashboard navigation
- Create/manage courses
- View student data
```

### 2. **Student Dashboard**
```
URL: http://localhost:3000/student/dashboard
Features:
- Skills dashboard (requires user_skills table)
- Badge earning (requires user_badges table)
- Adaptive learning recommendations
- Progress tracking
```

### 3. **Skills Dashboard**
```
URL: http://localhost:3000/student/skills
Features:
- View skills with proficiency levels
- Gap analysis
- Skill visualization with charts
- Recommendations
Status: Returns 500 - needs user_skills table
```

### 4. **API Endpoints to Test**

#### User Profile
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/profile
```
Status: ✅ Working (200)

#### Skills (Requires Migration)
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/skills
```
Status: ❌ Missing table (500)

#### Adaptive Learning
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/learning/next-lesson
```
Status: ✅ Endpoint created (needs data)

#### AI Learning Paths
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/ai/learning-goals
```
Status: ✅ Endpoint created (needs migration)

#### Badge Checking
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/badges/check-and-award
```
Status: ✅ Endpoint created

---

## 🔧 Next Steps to Fully Activate System

### Step 1: Create Missing Database Tables
Execute these SQL migrations in Supabase:

```sql
-- Create user_skills table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_id UUID NOT NULL REFERENCES skills(id),
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  mastery_percentage NUMERIC DEFAULT 0,
  last_assessed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create learning_goals table
CREATE TABLE IF NOT EXISTS learning_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  goal_name TEXT NOT NULL,
  target_skills TEXT[] DEFAULT '{}',
  target_difficulty TEXT DEFAULT 'intermediate',
  timeline_weeks INTEGER,
  priority TEXT DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  goal_id UUID NOT NULL REFERENCES learning_goals(id),
  sequenced_lessons JSONB DEFAULT '[]',
  estimated_completion_days INTEGER,
  success_rate NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);
```

### Step 2: Test Features Sequentially

1. **Test Skills System**
   - Navigate to /student/skills
   - View skill cards, gap analysis, visualizations
   
2. **Test Badges**
   - Complete a quiz
   - Trigger badge check via API
   - See badge earned

3. **Test Adaptive Learning**
   - Get adaptive recommendations
   - Check difficulty adjustment
   
4. **Test AI Learning Paths**
   - Create learning goal
   - Generate AI path
   - View optimized sequence

### Step 3: Populate Test Data

```sql
-- Add test skills
INSERT INTO skills (name, category, description) VALUES
  ('Reading Comprehension', 'English', 'Understand and analyze written text'),
  ('Listening', 'English', 'Understand spoken English'),
  ('Writing', 'English', 'Compose clear written responses'),
  ('Grammar', 'English', 'Proper English grammar usage'),
  ('Vocabulary', 'English', 'Build and use vocabulary effectively');

-- Add test lessons
INSERT INTO lessons (title, difficulty, duration_minutes) VALUES
  ('Introduction to Reading', 'beginner', 30),
  ('Comprehension Strategies', 'intermediate', 45),
  ('Advanced Analysis', 'advanced', 60);
```

---

## 📈 Expected Behavior When Fully Configured

### Skills Dashboard
- ✅ Shows all student skills
- ✅ Displays proficiency levels (4-tier)
- ✅ Shows gap analysis
- ✅ Recommends improvement areas
- ✅ Visualizes progress

### Badges
- ✅ Tracks earned badges
- ✅ Shows progress toward badges
- ✅ Displays streak information
- ✅ Unlocks badges on achievement
- ✅ Shows rarity levels

### Adaptive Learning
- ✅ Analyzes performance
- ✅ Recommends next lesson
- ✅ Adjusts difficulty
- ✅ Provides insights
- ✅ Tracks trends

### AI Learning Paths
- ✅ Creates learning goals
- ✅ Generates curricula
- ✅ Creates assessments
- ✅ Optimizes paths
- ✅ Tracks progress

---

## 🐛 Troubleshooting

**Issue**: Port 3000 already in use
```bash
lsof -ti:3000 | xargs kill -9
npx next dev --port 3000
```

**Issue**: Database table not found
```bash
# Create the migration in Supabase
# See SQL above
```

**Issue**: Token validation errors
```bash
# Ensure you have valid authentication tokens
# Check .env.local for Supabase config
```

**Issue**: Component not rendering
```bash
# Check browser console for errors
# Verify useAuth hook is properly initialized
# Check network tab for API responses
```

---

## 📊 Monitoring

Monitor the dev server output for:
- ✅ Request status codes (200, 400, 500)
- ✅ Compilation times
- ✅ Rendering performance
- ✅ API token validation
- ✅ Database query results

Example successful request:
```
GET /api/user/profile 200 in 198ms (compile: 4ms, render: 194ms)
✅ User profile fetched successfully
```

---

## 🎯 Testing Checklist

- [ ] Server starts without errors
- [ ] Admin dashboard loads
- [ ] Student dashboard loads
- [ ] Skills dashboard loads (after migration)
- [ ] API endpoints respond
- [ ] Badge system triggers
- [ ] Adaptive recommendations work
- [ ] Learning path generation works
- [ ] Database migrations successful
- [ ] All tables created
- [ ] No TypeScript errors
- [ ] No runtime errors

---

## 📚 Files to Review

### Phase Documentation
- [PHASE_5_SKILLS_DASHBOARD.md](PHASE_5_SKILLS_DASHBOARD.md)
- [PHASE_6_BADGE_EARNING.md](PHASE_6_BADGE_EARNING.md)
- [PHASE_7_ADAPTIVE_LEARNING.md](PHASE_7_ADAPTIVE_LEARNING.md)
- [PHASE_8_AI_LEARNING_PATHS.md](PHASE_8_AI_LEARNING_PATHS.md)

### API Documentation
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### Project Status
- [PROGRESS_SUMMARY.md](PROGRESS_SUMMARY.md)
- [PROJECT_COMPLETION_REPORT.md](PROJECT_COMPLETION_REPORT.md)

---

**Status**: Server running and ready for testing!  
**Next**: Execute database migrations to activate all features
