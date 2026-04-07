# RIASEC Career Assessment Tool - Integration Guide

## Overview
A complete RIASEC career assessment system for WhiteboardConsultant.com. Students can discover their career paths by taking a 30-question assessment, which generates personalized results emailed to both the student and admin.

## What's Been Built

### 1. **Database Schema**
- **Table**: `riasec_assessments`
- **Location**: `/migrations/create_riasec_assessments_table.sql`
- **Fields**: User info, RIASEC scores (R/I/A/S/E/C), profile results, responses, email tracking
- **Security**: Row-level security (RLS) enabled - users can only view their own assessments
- **Admin Access**: Admins can view all assessments for analytics

### 2. **RIASEC Data & Scoring**
- **File**: `/src/lib/riasec-data.ts`
- **Content**: 
  - 30 assessment questions across 10 categories
  - 6 RIASEC profiles with descriptions, strengths, and career examples
  - Scoring algorithm to calculate top 3 profiles
  - Profile details and color coding

### 3. **API Endpoints**

#### POST `/api/riasec/register`
**Purpose**: Register new user and create assessment record
**Request**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe"
}
```
**Response**:
```json
{
  "success": true,
  "user": { "id": "uuid", "email": "user@example.com" },
  "assessment": { "id": "assessment-uuid" },
  "session": { "access_token": "..." }
}
```

#### POST `/api/riasec/submit`
**Purpose**: Submit quiz responses, calculate scores, save results, and send emails
**Request**:
```json
{
  "assessmentId": "assessment-uuid",
  "responses": {
    "q1": "building_structures",
    "q2": "artistic_talents",
    ...
  }
}
```
**Response**:
```json
{
  "success": true,
  "assessment": { ...updated assessment },
  "results": {
    "scores": { "realistic": 20, "investigative": 15, ... },
    "topProfiles": ["realistic", "investigative", "artistic"],
    "profileDetails": [...]
  }
}
```

### 4. **Email Service**
- **File**: `/src/lib/riasec-email.ts`
- **Features**:
  - **Student Email**: Personalized results with profile details, strengths, career examples, and next steps
  - **Admin Email**: Summary with contact info, all scores, and assessment ID
  - Uses existing email transporter (SMTP2GO, Gmail OAuth2, or App Password)
  - Automatic email sending on assessment completion

### 5. **Frontend Components**

#### `RIASECAssessment` (Main Container)
- Orchestrates the entire flow: registration → quiz → results
- State management for user data and assessment state
- Location: `/src/components/riasec/RIASECAssessment.tsx`

#### `RIASECRegistration`
- User signup form with validation
- Fields: Full Name, Email, Password, Confirm Password
- Error handling and loading states
- Location: `/src/components/riasec/RIASECRegistration.tsx`

#### `RIASECQuiz`
- 30-question assessment with radio button options
- Progress tracking and navigation (Previous/Next)
- Validation to ensure all questions answered
- Location: `/src/components/riasec/RIASECQuiz.tsx`

#### `RIASECResults`
- Displays top 3 RIASEC profiles with color coding
- Full score breakdown with visual progress bars
- Share buttons (Copy, Share, Email)
- Next steps guidance
- Location: `/src/components/riasec/RIASECResults.tsx`

#### `RIASECModal`
- Wraps assessment in modal for inline embedding
- Backdrop with close button
- Location: `/src/components/riasec/RIASECModal.tsx`

#### `RIASECButton`
- Launches assessment in modal
- "Discover Your Career Path" button
- Location: `/src/components/riasec/RIASECButton.tsx`

## Integration Steps

### Step 1: Apply Database Migration
Run the migration to create the `riasec_assessments` table:
```bash
# Run via Supabase CLI or SQL editor
supabase db push
# OR execute the SQL directly in Supabase dashboard
```

### Step 2: Replace Career Solutions Page Button
On the career-solutions page, replace the "Explore All Programs" button with the RIASEC button:

**Before**:
```tsx
<button className="px-8 py-3">Explore All Programs</button>
```

**After**:
```tsx
'use client';

import { RIASECButton } from '@/components/riasec';

export function CareerSolutionsSection() {
  return (
    <div className="...">
      <RIASECButton />
    </div>
  );
}
```

### Step 3: Verify Email Configuration
Ensure your email service is configured:
- Check `.env.local` for one of:
  - `SMTP_USER` + `SMTP_PASSWORD` (SMTP2GO)
  - `GMAIL_CLIENT_ID` + `GMAIL_REFRESH_TOKEN` (Gmail OAuth2)
  - `GMAIL_USER` + `GMAIL_APP_PASSWORD` (Gmail App Password)
- Set `ADMIN_EMAIL` to receive admin notifications

### Step 4: Test the Flow
1. Click the "Discover Your Career Path" button
2. Register with test credentials
3. Complete the 10-question assessment (converted to 10 questions from 30 for testing)
4. View results
5. Check email inbox for both student and admin emails

## File Structure
```
/src
  /components/riasec/
    ├── index.ts                    # Exports
    ├── RIASECAssessment.tsx        # Main container
    ├── RIASECRegistration.tsx      # Registration form
    ├── RIASECQuiz.tsx             # Quiz component
    ├── RIASECResults.tsx          # Results display
    ├── RIASECModal.tsx            # Modal wrapper
    └── RIASECButton.tsx           # Launch button
  /lib
    ├── riasec-data.ts            # Questions, profiles, scoring
    └── riasec-email.ts           # Email templates and sending
  /app/api/riasec/
    /register
      └── route.ts                # Registration endpoint
    └── /submit
        └── route.ts              # Assessment submission endpoint
/migrations
  └── create_riasec_assessments_table.sql  # Database schema
```

## Key Features

### Security
- User authentication via Supabase Auth
- Row-level security on database
- Admin-only access to analytics
- Passwords hashed and secure

### User Experience
- Progressive form with validation
- Clear progress indicators
- Responsive design
- Mobile-friendly
- Animated transitions

### Email Experience
- **Student Email**:
  - Personalized greeting
  - Profile explanation
  - Strengths and career paths
  - Score visualization
  - Next steps guidance
  
- **Admin Email**:
  - Student contact info
  - Assessment date and time
  - All RIASEC scores
  - Assessment ID for tracking
  - Notification for new enrollments

### Analytics Ready
- All responses stored in JSON format
- Timestamps captured
- Profile results indexed
- Easy to query for insights:
  - Most common profiles
  - Student engagement metrics
  - Conversion rates to enrollment

## Customization Options

### Change Number of Questions
Edit `/src/lib/riasec-data.ts` and modify the `riasecQuestions` array or the questions themselves.

### Customize Email Templates
Edit `/src/lib/riasec-email.ts`:
- Adjust colors, branding, HTML layout
- Change email subject lines
- Add company logo or links

### Modify Profile Descriptions
Edit `/src/lib/riasec-data.ts`:
- Update `riasecProfiles` descriptions
- Add more career examples
- Change colors

### Styling
- All components use Tailwind CSS
- Color scheme can be customized in components
- Responsive design built-in

## Analytics & Admin Dashboard

### Querying Results
```sql
-- Get all assessments
SELECT * FROM riasec_assessments ORDER BY created_at DESC;

-- Get most common primary profiles
SELECT primary_profile, COUNT(*) as count
FROM riasec_assessments
GROUP BY primary_profile
ORDER BY count DESC;

-- Conversion from assessment to enrollment
SELECT 
  ra.primary_profile,
  COUNT(DISTINCT ra.user_id) as assessed,
  COUNT(DISTINCT e.user_id) as enrolled
FROM riasec_assessments ra
LEFT JOIN enrollments e ON ra.user_id = e.user_id
GROUP BY ra.primary_profile;
```

### Admin Dashboard Integration
You can build an admin dashboard to:
- View all assessments with filters
- See score distributions
- Track email delivery status
- Export data for analysis
- View student engagement trends

## Testing Checklist

- [ ] Migration runs successfully
- [ ] Registration form validates correctly
- [ ] Quiz displays all 30 questions
- [ ] Quiz prevents submission without all answers
- [ ] Results page shows all 3 profiles
- [ ] Score bars animate correctly
- [ ] Student email sends with all details
- [ ] Admin email contains summary data
- [ ] Share/Copy buttons work
- [ ] Mobile responsive on phone screens
- [ ] Error handling works (invalid email, network errors)

## Support & Troubleshooting

### Common Issues

**"No email service configured"**
- Verify `ADMIN_EMAIL` is set in `.env.local`
- Check SMTP2GO/Gmail credentials are correct
- See `createTransporter` in `/src/lib/email-service.ts`

**"Assessment table doesn't exist"**
- Run the SQL migration from `/migrations/create_riasec_assessments_table.sql`
- Ensure RLS policies are enabled

**"400 Bad Request on registration"**
- Check CORS headers if frontend and API are different domains
- Verify Supabase service role key is valid
- Check form validation messages

## Next Steps

1. Apply the database migration
2. Update career-solutions page with the new button
3. Test the complete flow with test data
4. Configure email templates to match branding
5. Set up admin dashboard to view results
6. Monitor email delivery and success rates
7. Build analytics reports for insights

---

**Built**: April 2026
**Tech Stack**: Next.js, React, TypeScript, Tailwind CSS, Supabase, Nodemailer
